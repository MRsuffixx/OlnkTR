import { expect, registerAndVerify, test } from "./helpers";

test.describe("authentication", () => {
  test("registers, verifies email, signs out and signs back in", async ({ page }) => {
    const { email, password } = await registerAndVerify(page);
    await expect(page.getByTestId("current-user")).toHaveText(email);

    await page.getByRole("button", { name: "Sign out" }).click();
    await page.waitForURL(/\/login$/);

    await page.locator("#email").fill(email);
    await page.locator("#password").fill("wrong-password-1");
    await page.locator("button[type=submit]").click();
    await expect(page.locator("[data-slot=alert]")).toContainText("Invalid email or password");

    await page.locator("#password").fill(password);
    await page.locator("button[type=submit]").click();
    await page.waitForURL(/\/dashboard$/);
  });

  test("blocks sign-in before the email address is verified", async ({ page }) => {
    const email = `unverified-${Date.now()}@test.olnk.tr`;
    await page.goto("/register");
    await page.locator("#name").fill("Pending");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("e2e-password-123");
    await page.locator("button[type=submit]").click();
    await expect(page.locator("[data-slot=alert]")).toBeVisible();
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("e2e-password-123");
    await page.locator("button[type=submit]").click();
    await expect(page.locator("[data-slot=alert]")).toContainText("verify your email");
  });

  test("never redirects to external sites after login", async ({ page }) => {
    const { email, password } = await registerAndVerify(page);
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/login?next=//evil.example");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.locator("button[type=submit]").click();
    await page.waitForURL(
      (url) => url.host.startsWith("localhost") && url.pathname === "/dashboard",
    );
  });
});
