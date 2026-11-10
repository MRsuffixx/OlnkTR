import { test as base, expect, type Page } from "@playwright/test";

export { expect };

/**
 * Every test gets its own client IP (X-Forwarded-For), so per-IP rate limits
 * behave as they do behind a real proxy. The stack must run with TRUST_PROXY=true.
 */
export const test = base.extend<{ clientIp: string }>({
  clientIp: [
    async ({ context }, use) => {
      const ip = `10.${rand(255)}.${rand(255)}.${rand(254) + 1}`;
      await context.setExtraHTTPHeaders({ "x-forwarded-for": ip });
      await use(ip);
    },
    { auto: true },
  ],
});

function rand(max: number) {
  return Math.floor(Math.random() * max);
}

const MAILPIT = process.env.E2E_MAILPIT_URL ?? "http://localhost:18025";

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Polls Mailpit for the newest message to `to` and returns the first link matching `pattern`. */
export async function linkFromEmail(to: string, pattern: RegExp): Promise<string> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const search = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${to}`)}`);
    const result = (await search.json()) as { messages: { ID: string }[] };
    const latest = result.messages[0];
    if (latest) {
      const message = (await (await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`)).json()) as {
        Text: string;
      };
      const match = pattern.exec(message.Text);
      if (match) return match[0];
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email with ${pattern} for ${to}`);
}

/** Registers a user, verifies the email through the real link and ends up signed in on the dashboard. */
export async function registerAndVerify(page: Page, options: { locale?: "en" | "tr" } = {}) {
  const email = `e2e-${uid()}@test.olnk.tr`;
  const password = "e2e-password-123";
  const prefix = options.locale === "tr" ? "/tr" : "";
  await page.goto(`${prefix}/register`);
  await page.locator("#name").fill("E2E User");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.locator("button[type=submit]").click();
  await expect(page.locator("[data-slot=alert]")).toBeVisible();
  const verifyLink = await linkFromEmail(email, /https?:\/\/\S+\/api\/auth\/verify-email\S+/);
  await page.goto(verifyLink);
  await page.waitForURL(/\/dashboard/);
  return { email, password };
}
