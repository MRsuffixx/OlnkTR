import { pino } from "pino";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, count, eq, schema } from "@olnktr/db";
import { createTestDatabase, insertTestUser } from "@olnktr/db/testing";
import { createInMemoryJobProducer } from "@olnktr/jobs";
import type { OwnerRef } from "@olnktr/types";
import {
  buildDevWebhook,
  createBillingEventProcessor,
  createBillingService,
  createDevPaymentProvider,
  createEntitlementService,
  createProviderRegistry,
  createWebhookIngestor,
  ownerWhere,
} from "../src/index";

const secret = "integration-dev-secret";
const logger = pino({ level: "silent" });
const handle = createTestDatabase();
const db = handle.db;

let now = new Date();
const clock = { now: () => now };
const jobs = createInMemoryJobProducer();
const providers = createProviderRegistry(
  [createDevPaymentProvider({ secret, appUrl: "http://localhost:3100" })],
  "dev",
);
const entitlements = createEntitlementService({ db, clock });
entitlements.registerUsageResolver("profiles.limit", async (owner, _scope, executor) => {
  const [row] = await executor
    .select({ n: count() })
    .from(schema.profiles)
    .where(ownerWhere(schema.profiles, owner));
  return row?.n ?? 0;
});
const billing = createBillingService({
  db,
  providers,
  entitlements,
  logger,
  appUrl: "http://localhost:3100",
  gracePeriodDays: 7,
  clock,
});
const processor = createBillingEventProcessor({
  db,
  providers,
  jobs,
  logger,
  appUrl: "http://localhost:3100",
  gracePeriodDays: 7,
  clock,
});
const ingestor = createWebhookIngestor({ db, providers, jobs, processor, logger });

async function deliver(data: Parameters<typeof buildDevWebhook>[1]) {
  const request = buildDevWebhook(secret, data);
  const ack = await ingestor.receive("dev", request.rawBody, request.headers);
  for (const job of jobs.take("billing")) {
    await processor.process((job.payload as { billingEventId: string }).billingEventId);
  }
  return { ack, request };
}

async function liveSubscription(owner: OwnerRef) {
  const rows = await db
    .select()
    .from(schema.subscriptions)
    .where(ownerWhere(schema.subscriptions, owner));
  return rows;
}

describe("billing pipeline (integration)", () => {
  let owner: OwnerRef;
  let email: string;

  beforeAll(async () => {
    const user = await insertTestUser(db);
    owner = { type: "user", userId: user.id };
    email = user.email;
  });

  afterAll(async () => {
    await handle.close();
  });

  it("lists configurable, database-backed plans", async () => {
    const plans = await billing.listPlans();
    expect(plans.map((plan) => plan.key)).toEqual(["free", "pro", "business"]);
    expect(plans.find((plan) => plan.key === "pro")?.prices.length).toBeGreaterThan(0);
  });

  it("resolves the default plan for owners without subscriptions", async () => {
    const resolution = await entitlements.resolve(owner);
    expect(resolution.planKey).toBe("free");
    expect(resolution.source).toBe("default");
    expect(resolution.entitlements["api.access"]).toBe(false);
    await expect(entitlements.assertEntitlement(owner, "api.access")).rejects.toMatchObject({
      code: "ENTITLEMENT_REQUIRED",
    });
    expect(await entitlements.getRemainingQuota(owner, "profiles.limit")).toEqual({
      key: "profiles.limit",
      limit: 1,
      used: 0,
      remaining: 1,
    });
  });

  let checkoutSessionId: string;

  it("does not activate anything when a checkout is merely created", async () => {
    const checkout = await billing.createCheckout({
      owner,
      planKey: "business",
      interval: "month",
      customer: { email, name: "Test" },
      createdByUserId: owner.type === "user" ? owner.userId : "",
      clientIp: null,
      locale: "en",
    });
    checkoutSessionId = checkout.checkoutSessionId;
    expect(checkout.url).toContain("/api/billing/dev/checkout");
    expect((await entitlements.resolve(owner)).planKey).toBe("free");
  });

  it("rejects underpayments", async () => {
    await deliver({
      kind: "checkout.completed",
      checkoutSessionId,
      status: "active",
      interval: "month",
      trialDays: 0,
      amount: 1,
      currency: "USD",
    });
    expect((await entitlements.resolve(owner)).planKey).toBe("free");
    const [checkout] = await db
      .select()
      .from(schema.checkoutSessions)
      .where(eq(schema.checkoutSessions.id, checkoutSessionId));
    expect(checkout?.status).toBe("failed");
  });

  it("activates a subscription only from a verified webhook, exactly once", async () => {
    const checkout = await billing.createCheckout({
      owner,
      planKey: "business",
      interval: "month",
      customer: { email, name: "Test" },
      createdByUserId: owner.type === "user" ? owner.userId : "",
      clientIp: null,
      locale: "en",
    });
    const { request } = await deliver({
      kind: "checkout.completed",
      checkoutSessionId: checkout.checkoutSessionId,
      status: "active",
      interval: "month",
      trialDays: 0,
      amount: 2400,
      currency: "USD",
    });

    const resolution = await entitlements.resolve(owner);
    expect(resolution.planKey).toBe("business");
    expect(resolution.entitlements["team.members.limit"]).toBe(10);

    // Duplicate delivery of the same provider event is acknowledged but not re-applied.
    const duplicate = await ingestor.receive("dev", request.rawBody, request.headers);
    expect(duplicate.duplicate).toBe(true);
    expect(jobs.take("billing")).toHaveLength(0);
    expect((await liveSubscription(owner)).filter((row) => row.status === "active")).toHaveLength(
      1,
    );
    const payments = await db
      .select()
      .from(schema.payments)
      .where(ownerWhere(schema.payments, owner));
    expect(payments.filter((payment) => payment.status === "succeeded")).toHaveLength(1);
    expect(
      jobs.take("email").map((job) => (job.payload as { template: string }).template),
    ).toContain("subscription-activated");
  });

  it("rejects webhooks with invalid signatures", async () => {
    const request = buildDevWebhook("wrong-secret-123456", {
      kind: "subscription.deleted",
      providerSubscriptionId: "x",
    });
    await expect(ingestor.receive("dev", request.rawBody, request.headers)).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("moves to past_due with a grace period on payment failure, then falls back after grace", async () => {
    const [subscription] = (await liveSubscription(owner)).filter((row) => row.status === "active");
    await deliver({
      kind: "payment.failed",
      providerSubscriptionId: subscription!.providerSubscriptionId!,
      amount: 2400,
      currency: "USD",
      reason: "insufficient funds",
    });
    const [updated] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscription!.id));
    expect(updated?.status).toBe("past_due");
    expect(updated?.gracePeriodEndsAt?.getTime()).toBeGreaterThan(now.getTime());

    const failedPayments = await db
      .select()
      .from(schema.payments)
      .where(and(ownerWhere(schema.payments, owner), eq(schema.payments.status, "failed")));
    expect(failedPayments.some((payment) => payment.failureMessage === "insufficient funds")).toBe(
      true,
    );
    expect(
      jobs.take("email").map((job) => (job.payload as { template: string }).template),
    ).toContain("payment-failed");

    // Within grace: still Business.
    expect((await entitlements.resolve(owner)).source).toBe("grace");
    // After grace: back to the default plan.
    now = new Date(now.getTime() + 8 * 86_400_000);
    expect((await entitlements.resolve(owner)).planKey).toBe("free");
    now = new Date();
  });

  it("recovers on successful payment and rejects stale out-of-order transitions", async () => {
    const [subscription] = (await liveSubscription(owner)).filter(
      (row) => row.status === "past_due",
    );
    const periodEnd = new Date(Date.now() + 30 * 86_400_000).toISOString();
    await deliver({
      kind: "payment.succeeded",
      providerSubscriptionId: subscription!.providerSubscriptionId!,
      amount: 2400,
      currency: "USD",
      periodEnd,
    });
    const [recovered] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscription!.id));
    expect(recovered?.status).toBe("active");
    expect(recovered?.gracePeriodEndsAt).toBeNull();

    await deliver({
      kind: "subscription.deleted",
      providerSubscriptionId: subscription!.providerSubscriptionId!,
    });
    const [ended] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscription!.id));
    expect(ended?.status).toBe("canceled");
    expect((await entitlements.resolve(owner)).planKey).toBe("free");

    // A late "payment succeeded" must not resurrect a canceled subscription.
    await deliver({
      kind: "payment.succeeded",
      providerSubscriptionId: subscription!.providerSubscriptionId!,
      amount: 2400,
      currency: "USD",
      periodEnd,
    });
    const [still] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscription!.id));
    expect(still?.status).toBe("canceled");
  });

  it("processes webhooks inline when the queue is unavailable", async () => {
    const user = await insertTestUser(db);
    const other: OwnerRef = { type: "user", userId: user.id };
    const checkout = await billing.createCheckout({
      owner: other,
      planKey: "pro",
      interval: "month",
      customer: { email: user.email, name: user.name },
      createdByUserId: user.id,
      clientIp: null,
      locale: "en",
    });
    const request = buildDevWebhook(secret, {
      kind: "checkout.completed",
      checkoutSessionId: checkout.checkoutSessionId,
      status: "trialing",
      interval: "month",
      trialDays: 14,
      amount: 600,
      currency: "USD",
    });
    jobs.failNext = true;
    await ingestor.receive("dev", request.rawBody, request.headers);
    const resolution = await entitlements.resolve(other);
    expect(resolution.planKey).toBe("pro");
    expect(resolution.source).toBe("trial");
    jobs.take();
  });

  it("applies admin overrides on top of the plan", async () => {
    const user = await insertTestUser(db);
    const subject: OwnerRef = { type: "user", userId: user.id };
    await db.insert(schema.entitlementOverrides).values({
      ownerUserId: user.id,
      entitlements: { "profiles.limit": 3 },
      reason: "support grant",
    });
    expect((await entitlements.resolve(subject)).entitlements["profiles.limit"]).toBe(3);
  });

  it("expires canceled subscriptions at period end via the lifecycle job", async () => {
    const user = await insertTestUser(db);
    const [plan] = await db.select().from(schema.plans).where(eq(schema.plans.key, "pro"));
    const [subscription] = await db
      .insert(schema.subscriptions)
      .values({
        ownerUserId: user.id,
        planId: plan!.id,
        status: "canceled",
        provider: "dev",
        currentPeriodEnd: new Date(Date.now() - 1000),
      })
      .returning();
    const result = await billing.runLifecycle();
    expect(result.expiredCanceled).toBeGreaterThanOrEqual(1);
    const [after] = await db
      .select()
      .from(schema.subscriptions)
      .where(eq(schema.subscriptions.id, subscription!.id));
    expect(after?.status).toBe("expired");
  });
});
