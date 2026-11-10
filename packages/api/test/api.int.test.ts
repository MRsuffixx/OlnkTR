import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parseServerEnv } from "@olnktr/config/env";
import { eq, schema } from "@olnktr/db";
import { insertTestUser, uniqueSuffix } from "@olnktr/db/testing";
import { buildDevWebhook } from "@olnktr/billing";
import type { UserActor } from "@olnktr/types";
import {
  createContainer,
  createCaller,
  createHttpHandlers,
  createRestApi,
  type TrpcContext,
} from "../src/index";

const env = parseServerEnv(process.env);
const container = createContainer(env);
const rest = createRestApi(container);
const http = createHttpHandlers(container);
const db = container.database.db;

afterAll(() => container.close());

async function newUser(overrides: Parameters<typeof insertTestUser>[1] = {}) {
  const row = await insertTestUser(db, overrides);
  const actor: UserActor = {
    type: "user",
    userId: row.id,
    platformRole: row.role as UserActor["platformRole"],
  };
  return { row, actor };
}

function callerFor(user: Awaited<ReturnType<typeof newUser>> | null) {
  const ctx: TrpcContext = {
    container,
    headers: new Headers(),
    session: user
      ? {
          user: { ...user.row, role: user.actor.platformRole },
          sessionId: "test",
          actor: user.actor,
        }
      : null,
    requestId: "test-request-id",
    clientIp: null,
    locale: "en",
  };
  return createCaller(ctx);
}

function api(path: string, init: RequestInit & { key?: string } = {}) {
  const headers = new Headers(init.headers);
  if (init.key) headers.set("authorization", `Bearer ${init.key}`);
  return rest.handle(
    new Request(`http://localhost/api/v1${path}`, { ...init, headers }),
    path.split("?")[0]!,
  );
}

describe("REST API v1", () => {
  let owner: Awaited<ReturnType<typeof newUser>>;
  let key: string;
  let readKey: string;
  let profileId: string;

  beforeAll(async () => {
    owner = await newUser();
    await db.insert(schema.entitlementOverrides).values({
      ownerUserId: owner.row.id,
      entitlements: { "api.access": true, "api.requests_per_minute": 5, "profiles.limit": 3 },
      reason: "test",
    });
    key = (
      await container.core.apiKeys.create(owner.actor, {
        name: "full",
        scopes: ["profiles:read", "profiles:write", "links:read", "links:write", "analytics:read"],
      })
    ).key;
    readKey = (
      await container.core.apiKeys.create(owner.actor, { name: "read", scopes: ["profiles:read"] })
    ).key;
  });

  it("serves an unauthenticated health endpoint", async () => {
    const response = await api("/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ data: { status: "ok", version: "v1" } });
    expect(response.headers.get("api-version")).toBe("1");
  });

  it("returns consistent error envelopes for missing or invalid keys", async () => {
    const missing = await api("/profiles");
    expect(missing.status).toBe(401);
    const body = (await missing.json()) as { error: { code: string; requestId: string } };
    expect(body.error.code).toBe("UNAUTHORIZED");
    expect(body.error.requestId).toBeTruthy();
    expect((await api("/profiles", { key: `olnk_aaaaaaaaaaaa_${"b".repeat(43)}` })).status).toBe(
      401,
    );
    expect((await api("/nope", { key })).status).toBe(404);
  });

  it("creates and reads resources with a scoped key", async () => {
    const created = await api("/profiles", {
      method: "POST",
      key,
      body: JSON.stringify({ username: `rest-${uniqueSuffix()}`, displayName: "REST" }),
    });
    expect(created.status).toBe(201);
    profileId = ((await created.json()) as { data: { id: string } }).data.id;
    const link = await api("/links", {
      method: "POST",
      key,
      body: JSON.stringify({ profileId, title: "Docs", url: "https://docs.example" }),
    });
    expect(link.status).toBe(201);
    const list = await api(`/links?profileId=${profileId}`, { key });
    expect(((await list.json()) as { data: unknown[] }).data).toHaveLength(1);
  });

  it("validates input and reports field errors", async () => {
    const response = await api("/links", {
      method: "POST",
      key,
      body: JSON.stringify({ profileId, title: "", url: "javascript:alert(1)" }),
    });
    expect(response.status).toBe(422);
    const body = (await response.json()) as {
      error: { code: string; details: { issues: unknown[] } };
    };
    expect(body.error.code).toBe("VALIDATION_FAILED");
    expect(body.error.details.issues.length).toBeGreaterThan(0);
  });

  it("enforces key scopes", async () => {
    expect((await api(`/profiles/${profileId}`, { key: readKey })).status).toBe(200);
    expect((await api(`/profiles/${profileId}`, { method: "DELETE", key: readKey })).status).toBe(
      403,
    );
  });

  it("prevents cross-tenant access through the API", async () => {
    const other = await newUser();
    const foreign = await container.core.profiles.create(other.actor, {
      username: `foreign-${uniqueSuffix()}`,
      displayName: "F",
    });
    expect((await api(`/profiles/${foreign.id}`, { key: readKey })).status).toBe(404);
  });

  it("rate limits per key according to the plan and tracks usage", async () => {
    let limited: Response | null = null;
    for (let attempt = 0; attempt < 10 && !limited; attempt++) {
      const response = await api("/profiles", { key: readKey });
      if (response.status === 429) limited = response;
    }
    expect(limited).not.toBeNull();
    expect(Number(limited!.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(limited!.headers.get("ratelimit-limit")).toBe("5");
    await new Promise((resolve) => setTimeout(resolve, 100));
    const usage = await db.select().from(schema.apiUsageDaily);
    expect(usage.some((row) => row.requestCount > 0)).toBe(true);
  });

  it("accepts public analytics events and rejects invalid ones", async () => {
    await container.core.profiles.setPublished(owner.actor, profileId, true);
    const ok = await api("/analytics/events", {
      method: "POST",
      headers: {
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      },
      body: JSON.stringify({ type: "profile.view", profileId }),
    });
    expect(ok.status).toBe(202);
    expect(await ok.json()).toEqual({ data: { accepted: true } });
    const bot = await api("/analytics/events", {
      method: "POST",
      headers: { "user-agent": "curl/8.0" },
      body: JSON.stringify({ type: "profile.view", profileId }),
    });
    expect(await bot.json()).toEqual({ data: { accepted: false } });
    const invalid = await api("/analytics/events", {
      method: "POST",
      body: JSON.stringify({ type: "profile.view", profileId, ip: "1.2.3.4" }),
    });
    expect(invalid.status).toBe(422);
  });
});

describe("tRPC procedures", () => {
  it("rejects anonymous callers on protected procedures", async () => {
    await expect(callerFor(null).profiles.list({})).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(callerFor(null).billing.plans()).resolves.toHaveLength(3);
  });

  it("maps domain errors to protocol errors", async () => {
    const user = await newUser();
    const caller = callerFor(user);
    await caller.profiles.create({ username: `t-${uniqueSuffix()}`, displayName: "One" });
    await expect(
      caller.profiles.create({ username: `t-${uniqueSuffix()}`, displayName: "Two" }),
    ).rejects.toMatchObject({
      code: "PAYMENT_REQUIRED",
    });
  });

  it("verifies organization membership in organizationProcedure", async () => {
    const owner = await newUser();
    const outsider = await newUser();
    const org = await callerFor(owner).organizations.create({
      name: "Team",
      slug: `t-${uniqueSuffix()}`,
    });
    await expect(
      callerFor(owner).organizations.members({ organizationId: org.id }),
    ).resolves.toMatchObject({ members: [expect.any(Object)] });
    await expect(
      callerFor(outsider).organizations.members({ organizationId: org.id }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("restricts admin procedures to platform staff", async () => {
    const regular = await newUser();
    const admin = await newUser({ role: "admin" });
    await expect(callerFor(regular).admin.users.list({ limit: 5 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(callerFor(admin).admin.users.list({ limit: 5 })).resolves.toMatchObject({
      items: expect.any(Array),
    });
  });

  it("validates inputs with shared Zod schemas", async () => {
    const user = await newUser();
    await expect(
      callerFor(user).profiles.create({ username: "admin", displayName: "x" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("HTTP handlers", () => {
  it("reports liveness and readiness", async () => {
    expect(http.live().status).toBe(200);
    const ready = await http.ready();
    expect(ready.status).toBe(200);
    expect(await ready.json()).toMatchObject({
      status: "ok",
      checks: { database: { ok: true }, redis: { ok: true }, storage: { ok: true } },
    });
  });

  it("rejects forged webhooks and accepts signed ones end-to-end", async () => {
    const forged = buildDevWebhook("not-the-real-secret", {
      kind: "subscription.deleted",
      providerSubscriptionId: "x",
    });
    expect(
      (
        await http.billingWebhook(
          new Request("http://localhost/api/webhooks/billing/dev", {
            method: "POST",
            body: forged.rawBody,
            headers: forged.headers,
          }),
          "dev",
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await http.billingWebhook(
          new Request("http://localhost/x", { method: "POST", body: "{}" }),
          "unknown",
        )
      ).status,
    ).toBe(404);

    const user = await newUser();
    const checkout = await callerFor(user).billing.checkout({ planKey: "pro", interval: "month" });
    const signed = buildDevWebhook(env.DEV_BILLING_WEBHOOK_SECRET!, {
      kind: "checkout.completed",
      checkoutSessionId: checkout.checkoutSessionId,
      status: "active",
      interval: "month",
      trialDays: 0,
      amount: 600,
      currency: "USD",
    });
    const response = await http.billingWebhook(
      new Request("http://localhost/api/webhooks/billing/dev", {
        method: "POST",
        body: signed.rawBody,
        headers: signed.headers,
      }),
      "dev",
    );
    expect(response.status).toBe(200);
    // The event is now in the inbox; the worker (or this inline call) applies it exactly once.
    const [event] = await db
      .select()
      .from(schema.billingEvents)
      .where(eq(schema.billingEvents.provider, "dev"))
      .orderBy(schema.billingEvents.receivedAt);
    expect(event).toBeDefined();
  });

  it("redirects tracked links only for public, active links", async () => {
    const user = await newUser();
    const profile = await container.core.profiles.create(user.actor, {
      username: `go-${uniqueSuffix()}`,
      displayName: "Go",
    });
    const link = await container.core.links.create(user.actor, {
      profileId: profile.id,
      title: "x",
      url: "https://example.com/target",
    });
    expect((await http.linkRedirect(new Request("http://localhost/go"), link.id)).status).toBe(404);
    await container.core.profiles.setPublished(user.actor, profile.id, true);
    const response = await http.linkRedirect(
      new Request("http://localhost/go", {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15",
        },
      }),
      link.id,
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/target");
    expect((await http.linkRedirect(new Request("http://localhost/go"), "not-a-uuid")).status).toBe(
      404,
    );
  });

  it("rejects cross-site dev checkout submissions", async () => {
    const response = await http.devCheckoutSubmit(
      new Request("http://localhost/api/billing/dev/checkout", {
        method: "POST",
        headers: { origin: "https://evil.example" },
        body: new FormData(),
      }),
    );
    expect(response.status).toBe(403);
  });
});
