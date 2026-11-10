import { randomUUID } from "node:crypto";
import { createDatabase, type Database, type DatabaseHandle } from "./client";
import { assertTestDatabaseUrl } from "./guards";
import { users } from "./schema/auth";

export { assertTestDatabaseUrl };

/** Connects to the isolated integration-test database (TEST_DATABASE_URL). */
export function createTestDatabase(): DatabaseHandle {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is not set — run `pnpm db:test:prepare` first");
  assertTestDatabaseUrl(url);
  return createDatabase({ url, maxConnections: 5, applicationName: "olnktr-test" });
}

/** Unique suffix for isolating test data (usernames, slugs, emails). */
export function uniqueSuffix(): string {
  return randomUUID().replaceAll("-", "").slice(0, 12);
}

export interface TestUserOverrides {
  name?: string;
  email?: string;
  role?: "user" | "support" | "admin";
  status?: "active" | "suspended" | "pending_deletion";
  emailVerified?: boolean;
}

/** Inserts a user row directly (bypassing auth flows) for service-level tests. */
export async function insertTestUser(db: Database, overrides: TestUserOverrides = {}) {
  const suffix = uniqueSuffix();
  const [user] = await db
    .insert(users)
    .values({
      name: overrides.name ?? `Test User ${suffix}`,
      email: overrides.email ?? `user-${suffix}@test.olnk.tr`,
      emailVerified: overrides.emailVerified ?? true,
      role: overrides.role ?? "user",
      status: overrides.status ?? "active",
    })
    .returning();
  if (!user) throw new Error("Failed to insert test user");
  return user;
}
