import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against an already running stack (web + worker +
 * infrastructure). Locally: `pnpm test:e2e` (or the Docker variant in
 * docs/development/testing.md). CI starts the stack before running them.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
    locale: "en-US",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
