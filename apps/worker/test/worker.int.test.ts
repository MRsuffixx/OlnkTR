import { randomUUID } from "node:crypto";
import { pino } from "pino";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildDevWebhook, createWebhookIngestor } from "@olnktr/billing";
import { parseServerEnv } from "@olnktr/config/env";
import { and, eq, schema } from "@olnktr/db";
import { insertTestUser, uniqueSuffix } from "@olnktr/db/testing";
import { createWorkerContainer } from "../src/container";
import { createProcessors } from "../src/processors/index";
import { startRuntime, type WorkerRuntime } from "../src/runtime";

const env = parseServerEnv({
  ...process.env,
  REDIS_KEY_PREFIX: `olnktr-test-${uniqueSuffix()}`,
  WORKER_HEALTH_PORT: "3191",
});
const logger = pino({ level: "silent" });
const container = createWorkerContainer(env, logger);
const db = container.database.db;
let runtime: WorkerRuntime;

async function waitFor<T>(
  fn: () => Promise<T | null | undefined | false>,
  timeoutMs = 15_000,
): Promise<T> {
  const started = Date.now();
  for (;;) {
    const value = await fn();
    if (value) return value;
    if (Date.now() - started > timeoutMs) throw new Error("timed out waiting for condition");
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

beforeAll(async () => {
  runtime = await startRuntime(container, createProcessors(container));
});

afterAll(async () => {
  for (const queue of runtime.queues.values())
    await queue.obliterate({ force: true }).catch(() => undefined);
  await runtime.shutdown("test");
  await container.close();
});

describe("worker runtime (integration)", () => {
  it("exposes health and queue metrics", async () => {
    await waitFor(async () => container.workerRedis.status === "ready");
    const health = (await (
      await fetch(`http://127.0.0.1:${env.WORKER_HEALTH_PORT}/health`)
    ).json()) as { status: string; workers: unknown[] };
    expect(health.status).toBe("ok");
    expect(health.workers).toHaveLength(5);
    const queues = (await (
      await fetch(`http://127.0.0.1:${env.WORKER_HEALTH_PORT}/queues`)
    ).json()) as { queues: Record<string, unknown> };
    expect(Object.keys(queues.queues).sort()).toEqual([
      "analytics",
      "billing",
      "email",
      "maintenance",
      "media",
    ]);
  });

  it("registers repeatable maintenance schedulers", async () => {
    const schedulers = await runtime.queues.get("maintenance")!.getJobSchedulers();
    expect(schedulers.map((scheduler) => scheduler.key ?? scheduler.id)).toEqual(
      expect.arrayContaining(["schedule:subscription-lifecycle", "schedule:analytics-retention"]),
    );
  });

  it("processes billing webhooks from the queue exactly once", async () => {
    const user = await insertTestUser(db);
    const checkout = await container.billing.createCheckout({
      owner: { type: "user", userId: user.id },
      planKey: "pro",
      interval: "month",
      customer: { email: user.email, name: user.name },
      createdByUserId: user.id,
      clientIp: null,
      locale: "en",
    });
    const ingestor = createWebhookIngestor({
      db,
      providers: (await import("@olnktr/billing")).createProviderRegistryFromEnv(env),
      jobs: container.jobs,
      processor: container.billingProcessor,
      logger,
    });
    const webhook = buildDevWebhook(env.DEV_BILLING_WEBHOOK_SECRET!, {
      kind: "checkout.completed",
      checkoutSessionId: checkout.checkoutSessionId,
      status: "active",
      interval: "month",
      trialDays: 0,
      amount: 600,
      currency: "USD",
    });
    await ingestor.receive("dev", webhook.rawBody, webhook.headers);
    const subscription = await waitFor(async () => {
      const [row] = await db
        .select()
        .from(schema.subscriptions)
        .where(
          and(
            eq(schema.subscriptions.ownerUserId, user.id),
            eq(schema.subscriptions.status, "active"),
          ),
        );
      return row;
    });
    expect(subscription.provider).toBe("dev");
    const [event] = await db
      .select()
      .from(schema.billingEvents)
      .where(
        eq(
          schema.billingEvents.providerEventId,
          (JSON.parse(webhook.rawBody) as { id: string }).id,
        ),
      );
    expect(event?.status).toBe("processed");
  });

  it("aggregates analytics events from the queue", async () => {
    const user = await insertTestUser(db);
    const [profile] = await db
      .insert(schema.profiles)
      .values({
        ownerUserId: user.id,
        username: `wk-${uniqueSuffix()}`,
        displayName: "W",
        status: "published",
      })
      .returning();
    await container.jobs.enqueue("analytics", "ingest", {
      ingestId: randomUUID(),
      type: "profile.view",
      profileId: profile!.id,
      linkId: null,
      blockId: null,
      occurredAt: new Date().toISOString(),
      visitorHash: "f".repeat(32),
      referrerHost: null,
      deviceType: "desktop",
      browser: "firefox",
      os: "linux",
      country: "TR",
      utm: { source: null, medium: null, campaign: null, term: null, content: null },
    });
    const stats = await waitFor(async () => {
      const [row] = await db
        .select()
        .from(schema.analyticsDailyStats)
        .where(eq(schema.analyticsDailyStats.profileId, profile!.id));
      return row;
    });
    expect(stats.count).toBe(1);
  });

  it("delivers queued emails over SMTP", async () => {
    const to = `worker-${uniqueSuffix()}@test.olnk.tr`;
    await container.jobs.enqueue("email", "send", {
      to,
      template: "subscription-activated",
      locale: "tr",
      props: { planName: "Pro" },
    });
    const mailpit = `http://localhost:${process.env.MAILPIT_UI_PORT ?? 18025}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`;
    const found = await waitFor(async () => {
      const result = (await (await fetch(mailpit)).json()) as {
        messages_count: number;
        messages: { Subject: string }[];
      };
      return result.messages_count > 0 ? result.messages[0] : null;
    });
    expect(found.Subject).toContain("Pro");
  });

  it("runs maintenance jobs", async () => {
    const queue = runtime.queues.get("maintenance")!;
    const job = await queue.add("invitation-expiry", {});
    const result = await waitFor(async () => {
      const state = await job.getState();
      if (state === "failed")
        throw new Error(`maintenance job failed: ${(await queue.getJob(job.id!))?.failedReason}`);
      return state === "completed"
        ? ((await queue.getJob(job.id!))?.returnvalue as { expired: number })
        : null;
    });
    expect(typeof result.expired).toBe("number");
  });
});
