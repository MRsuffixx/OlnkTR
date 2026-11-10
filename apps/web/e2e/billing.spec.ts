import { expect, registerAndVerify, test } from "./helpers";

test.describe("billing (dev payment provider)", () => {
  test("activates a plan only after the provider webhook is processed", async ({ page }) => {
    await registerAndVerify(page);
    await page.goto("/settings/billing");
    await expect(page.getByTestId("current-plan")).toHaveText("free");

    await page.getByTestId("choose-business").click();
    await page.waitForURL(/\/api\/billing\/dev\/checkout/);
    await page.getByRole("button", { name: "Simulate successful payment" }).click();
    await page.waitForURL(/\/settings\/billing\?checkout=success/);

    await expect(async () => {
      await page.reload();
      await expect(page.getByTestId("current-plan")).toHaveText("business");
    }).toPass({ timeout: 30_000 });
  });

  test("keeps the free plan when the payment is declined", async ({ page }) => {
    await registerAndVerify(page);
    await page.goto("/settings/billing");
    await page.getByTestId("choose-pro").click();
    await page.waitForURL(/\/api\/billing\/dev\/checkout/);
    await page.getByRole("button", { name: "Simulate declined payment" }).click();
    await page.waitForURL(/\/settings\/billing\?checkout=canceled/);
    await page.reload();
    await expect(page.getByTestId("current-plan")).toHaveText("free");
  });
});
