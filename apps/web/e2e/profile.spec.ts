import { expect, registerAndVerify, test, uid } from "./helpers";

test.describe("profiles, links and analytics", () => {
  test("creates, publishes and visits a profile; clicks are tracked", async ({ page, context }) => {
    await registerAndVerify(page);
    const username = `e2e-${uid()}`;

    await page.locator("#username").fill(username);
    await expect(page.getByTestId("username-hint")).toHaveText("Available");
    await page.locator("#displayName").fill("E2E Profile");
    await page.getByRole("button", { name: "Create", exact: true }).click();
    await page.waitForURL(/\/dashboard\/profiles\//);

    // Links are edited in the studio as a draft; nothing is public until it is published.
    const profileId = page.url().split("/").pop()!;
    await page.goto(`/studio/${profileId}`);
    await page.getByTestId("add-link").click();
    await page.getByTestId("inspector").getByLabel("Title", { exact: true }).fill("Example");
    await page
      .getByTestId("inspector")
      .getByLabel("URL", { exact: true })
      .fill("https://example.com/");
    await expect(page.getByTestId("save-status").first()).toHaveAttribute("data-status", "saved", {
      timeout: 15_000,
    });

    // Unpublished profiles are not public.
    const hidden = await context.request.get(`/${username}`);
    expect(hidden.status()).toBe(404);

    await page.getByTestId("publish-button").click();
    await expect(page.getByTestId("publish-button")).toHaveText(/Published/, { timeout: 20_000 });

    const visitor = await context.browser()!.newPage();
    await visitor.goto(`/${username}`);
    await expect(visitor.getByTestId("public-profile")).toContainText("E2E Profile");
    const link = visitor.getByTestId("public-profile").getByRole("link", { name: "Example" });
    await expect(link).toHaveAttribute("href", /^\/go\//);

    const redirect = await visitor.request.get((await link.getAttribute("href"))!, {
      maxRedirects: 0,
    });
    expect(redirect.status()).toBe(302);
    expect(redirect.headers()["location"]).toBe("https://example.com/");

    // The worker aggregates the view and click asynchronously.
    await page.goto(`/dashboard/profiles/${profileId}`);
    await expect(async () => {
      await page.reload();
      await expect(page.getByTestId("analytics-clicks")).toHaveText("1");
    }).toPass({ timeout: 30_000 });
  });

  test("enforces the free plan profile limit", async ({ page }) => {
    await registerAndVerify(page);
    for (const attempt of [1, 2]) {
      await page.goto("/dashboard");
      await page.locator("#username").fill(`limit-${uid()}`);
      await page.locator("#displayName").fill(`Profile ${attempt}`);
      await page.getByRole("button", { name: "Create", exact: true }).click();
      if (attempt === 1) await page.waitForURL(/\/dashboard\/profiles\//);
    }
    await expect(page.locator("[data-slot=alert]")).toContainText("plan limit");
  });
});
