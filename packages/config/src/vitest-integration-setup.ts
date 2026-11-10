/**
 * Integration-test environment bootstrap: loads the repository `.env` (without
 * overriding variables already set, e.g. by CI) and then points every
 * connection string at the isolated *test* resources so no test can touch the
 * development database or Redis database.
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rootEnv = fileURLToPath(new URL("../../../.env", import.meta.url));
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const testDb = process.env.TEST_DATABASE_URL;
if (!testDb) throw new Error("TEST_DATABASE_URL must be set for integration tests");
if (!new URL(testDb).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL must point to a database whose name ends with _test");
}

Object.assign(process.env, {
  NODE_ENV: "test",
  LOG_LEVEL: process.env.TEST_LOG_LEVEL ?? "silent",
  DATABASE_URL: testDb,
  DATABASE_MIGRATION_URL: process.env.TEST_DATABASE_MIGRATION_URL ?? testDb,
  REDIS_URL: process.env.TEST_REDIS_URL ?? "redis://localhost:63799/15",
  REDIS_KEY_PREFIX: "olnktr-test",
});
