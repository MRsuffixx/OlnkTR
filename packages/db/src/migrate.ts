/**
 * Applies pending migrations (and optionally the idempotent seed).
 *
 *   tsx src/migrate.ts            # DATABASE_MIGRATION_URL ?? DATABASE_URL
 *   tsx src/migrate.ts --test     # TEST_DATABASE_MIGRATION_URL (must target a *_test database)
 *   tsx src/migrate.ts --seed     # also seed plans, themes and settings
 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabase } from "./client";
import { assertTestDatabaseUrl } from "./guards";
import { seed } from "./seed/seed";

function resolveMigrationsFolder(): string {
  if (process.env.MIGRATIONS_DIR) return process.env.MIGRATIONS_DIR;
  const candidates = ["../migrations", "./migrations"].map((relative) =>
    fileURLToPath(new URL(relative, import.meta.url)),
  );
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error(`Migrations folder not found (looked in ${candidates.join(", ")})`);
  return found;
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const isTest = args.has("--test");
  const url = isTest
    ? (process.env.TEST_DATABASE_MIGRATION_URL ?? process.env.TEST_DATABASE_URL)
    : (process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL);
  if (!url) throw new Error("No database URL configured for migrations");
  if (isTest) assertTestDatabaseUrl(url);

  const handle = createDatabase({ url, maxConnections: 1, applicationName: "olnktr-migrate" });
  try {
    const migrationsFolder = resolveMigrationsFolder();
    await migrate(handle.db, { migrationsFolder });
    console.warn(`[migrate] migrations applied from ${migrationsFolder}`);
    if (args.has("--seed")) {
      const result = await seed(handle.db);
      console.warn(`[migrate] seed complete: ${JSON.stringify(result)}`);
    }
  } finally {
    await handle.close();
  }
}

main().catch((error: unknown) => {
  console.error("[migrate] failed", error);
  process.exit(1);
});
