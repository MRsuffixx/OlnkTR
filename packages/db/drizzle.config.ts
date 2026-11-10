import { defineConfig } from "drizzle-kit";

const url =
  process.env.DATABASE_MIGRATION_URL ??
  process.env.DATABASE_URL ??
  "postgres://olnktr_migrator:olnktr_migrator_dev_password@localhost:54329/olnktr";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  casing: "snake_case",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
