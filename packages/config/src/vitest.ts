import { fileURLToPath } from "node:url";

/**
 * Shared Vitest presets. Unit tests (`*.test.ts`) never touch external services;
 * integration tests (`*.int.test.ts`) run serially against the isolated test
 * database / Redis database configured in `.env.test`.
 */
export const unitTestConfig = {
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["**/*.int.test.ts", "**/node_modules/**", "**/e2e/**"],
    environment: "node" as const,
  },
};

const integrationSetup = fileURLToPath(new URL("./vitest-integration-setup.ts", import.meta.url));

export const integrationTestConfig = {
  test: {
    setupFiles: [integrationSetup],
    include: ["src/**/*.int.test.ts", "test/**/*.int.test.ts"],
    environment: "node" as const,
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
};
