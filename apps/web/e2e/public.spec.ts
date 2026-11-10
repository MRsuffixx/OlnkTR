import { expect, test } from "./helpers";

test.describe("public pages", () => {
  test("renders the landing page in English and Turkish", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toHaveText("One link for everything you share");
    await page.goto("/tr");
    await expect(page.locator("h1")).toHaveText("Paylaştığın her şey için tek bağlantı");
    await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  });

  test("sends security headers with a per-request CSP nonce", async ({ page }) => {
    const first = await page.request.get("/");
    const second = await page.request.get("/");
    const csp = first.headers()["content-security-policy"]!;
    expect(csp).toContain("'strict-dynamic'");
    expect(csp).not.toEqual(second.headers()["content-security-policy"]);
    expect(first.headers()["x-frame-options"]).toBe("DENY");
    expect(first.headers()["x-request-id"]).toBeTruthy();
  });

  test("returns 404 for unknown profiles and redirects anonymous dashboard visits", async ({
    page,
  }) => {
    const response = await page.goto("/no-such-profile-xyz");
    expect(response?.status()).toBe(404);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
