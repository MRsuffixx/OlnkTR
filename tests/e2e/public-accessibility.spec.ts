import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/login", "/register"] as const) {
  test(`${path} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator("main")).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.filter((violation) =>
        ["serious", "critical"].includes(violation.impact ?? ""),
      ),
    ).toEqual([]);
  });
}

test("private billing route redirects unauthenticated visitors", async ({
  page,
}) => {
  await page.goto("/dashboard/billing?checkout=return&intent=untrusted", {
    waitUntil: "domcontentloaded",
  });
  await expect(page).toHaveURL(/\/login$/);
});

test("unknown public profile uses the product 404", async ({ page }) => {
  test.skip(
    process.env.RUN_DATABASE_E2E !== "1",
    "Requires a migrated PostgreSQL test database.",
  );
  const response = await page.goto("/this-profile-does-not-exist-404");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Bu adres henüz kimsenin değil.")).toBeVisible();
});
