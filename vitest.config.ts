import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/olnk_test";
process.env.AUTH_SECRET ??= "vitest-only-auth-secret-at-least-32-characters";
Object.assign(process.env, { NODE_ENV: "test" });

export default defineConfig({
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    restoreMocks: true,
    clearMocks: true,
  },
});
