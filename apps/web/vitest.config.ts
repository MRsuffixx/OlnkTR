import { unitTestConfig } from "@olnktr/config/vitest";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...unitTestConfig,
  resolve: { alias: { "~": new URL("./src", import.meta.url).pathname } },
});
