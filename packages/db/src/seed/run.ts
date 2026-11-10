import { createDatabase } from "../client";
import { seed } from "./seed";

const url = process.env.DATABASE_MIGRATION_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const handle = createDatabase({ url, maxConnections: 1, applicationName: "olnktr-seed" });
try {
  console.warn("[seed]", JSON.stringify(await seed(handle.db)));
} finally {
  await handle.close();
}
