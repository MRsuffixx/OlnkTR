import { pino } from "pino";
import {
  createBillingService,
  createDevPaymentProvider,
  createEntitlementService,
  createProviderRegistry,
} from "@olnktr/billing";
import { schema } from "@olnktr/db";
import {
  createTestDatabase,
  insertTestUser,
  uniqueSuffix,
  type TestUserOverrides,
} from "@olnktr/db/testing";
import { createInMemoryJobProducer } from "@olnktr/jobs";
import { createInMemoryObjectStorage } from "@olnktr/storage";
import type { ApiKeyScope } from "@olnktr/validators";
import type { UserActor } from "@olnktr/types";
import { createCore } from "../src/index";

/** Builds a fully wired core against the isolated test database with in-memory adapters. */
export function createHarness() {
  const handle = createTestDatabase();
  const db = handle.db;
  const logger = pino({ level: "silent" });
  const clock = { now: () => new Date() };
  const jobs = createInMemoryJobProducer();
  const storage = createInMemoryObjectStorage();
  const providers = createProviderRegistry(
    [createDevPaymentProvider({ secret: "test-secret-123456", appUrl: "http://localhost:3100" })],
    "dev",
  );
  const entitlements = createEntitlementService({ db, clock });
  const billing = createBillingService({
    db,
    providers,
    entitlements,
    logger,
    appUrl: "http://localhost:3100",
    gracePeriodDays: 7,
    clock,
  });
  const core = createCore({
    db,
    jobs,
    storage,
    logger,
    clock,
    entitlements,
    billing,
    providers,
    config: {
      appUrl: "http://localhost:3100",
      accountDeletionGraceDays: 30,
      mediaMaxUploadBytes: 5 * 1024 * 1024,
    },
  });

  async function user(overrides: TestUserOverrides = {}): Promise<UserActor & { email: string }> {
    const row = await insertTestUser(db, overrides);
    return {
      type: "user",
      userId: row.id,
      platformRole: row.role as UserActor["platformRole"],
      email: row.email,
    };
  }

  /** Grants entitlements through the real admin override mechanism (as a system grant). */
  async function grant(
    subject: { userId?: string; organizationId?: string },
    entitlements: Record<string, unknown>,
  ) {
    await db.insert(schema.entitlementOverrides).values({
      ownerUserId: subject.userId ?? null,
      ownerOrganizationId: subject.organizationId ?? null,
      entitlements,
      reason: "test grant",
    });
  }

  async function profileFor(actor: UserActor, organizationId?: string) {
    return core.profiles.create(actor, {
      username: `p-${uniqueSuffix()}`,
      displayName: "Test Profile",
      organizationId,
    });
  }

  async function apiKeyFor(actor: UserActor, scopes: ApiKeyScope[], organizationId?: string) {
    const created = await core.apiKeys.create(actor, { name: "test", scopes, organizationId });
    const authenticated = await core.apiKeys.authenticate(created.key);
    if (!authenticated) throw new Error("API key failed to authenticate");
    return { ...created, actor: authenticated.actor };
  }

  return { handle, db, core, jobs, storage, user, grant, profileFor, apiKeyFor, uniqueSuffix };
}

export type Harness = ReturnType<typeof createHarness>;

/** 1x1 transparent PNG. */
export const PNG_BYTES = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64",
  ),
);
