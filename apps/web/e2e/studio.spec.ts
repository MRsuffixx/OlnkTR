import type { Page } from "@playwright/test";
import { expect, registerAndVerify, test, uid } from "./helpers";

/**
 * Creator Studio workflows against a running stack: drafts, autosave,
 * reordering, theming, undo/redo, preview, publishing, validation, plan
 * restrictions, recovery, access control, i18n and responsive layouts.
 */
const SHOTS = process.env.SHOTS_DIR;

async function createProfileAndOpenStudio(
  page: Page,
  name = "Studio Tester",
  locale: "en" | "tr" = "en",
) {
  await registerAndVerify(page, { locale });
  const username = `studio-${uid()}`;
  await page.locator("#username").fill(username);
  await page.locator("#displayName").fill(name);
  await page.locator("form button[type=submit]").first().click();
  await page.waitForURL(/\/dashboard\/profiles\//);
  const profileId = page.url().split("/").pop()!;
  await page.goto(`${locale === "tr" ? "/tr" : ""}/studio/${profileId}`);
  await expect(page.getByTestId("studio-canvas")).toBeVisible();
  return { username, profileId };
}

const saved = (page: Page) =>
  expect(page.getByTestId("save-status").first()).toHaveAttribute("data-status", "saved", {
    timeout: 15_000,
  });

const preview = (page: Page) => page.getByTestId("preview-viewport");

async function addLink(page: Page, title: string, url: string) {
  await page.getByTestId("add-link").click();
  const inspector = page.getByTestId("inspector");
  await inspector.getByLabel("Title", { exact: true }).fill(title);
  await inspector.getByLabel("URL", { exact: true }).fill(url);
}

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("creator studio", () => {
  test("edits a draft, reorders, themes, previews and publishes it", async ({ page, context }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { username, profileId } = await createProfileAndOpenStudio(page, "Ada Lovelace");

    // Add a link and a heading; the preview reflects the draft immediately.
    await addLink(page, "Portfolio", "https://example.com/work");
    await expect(preview(page)).toContainText("Portfolio");
    await page.getByTestId("add-block").click();
    await page.getByPlaceholder("Search blocks…").fill("Heading");
    await page
      .getByRole("option", { name: /Heading/ })
      .first()
      .click();
    await page.getByTestId("inspector").getByLabel("Text", { exact: true }).fill("Selected work");
    await expect(preview(page)).toContainText("Selected work");
    await saved(page);

    // Keyboard reordering: move the heading above the link.
    const rows = page.getByTestId("outline-row");
    await expect(rows).toHaveCount(2);
    await rows
      .nth(1)
      .getByRole("button", { name: /Reorder Heading/ })
      .focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Space");
    await expect(rows.first()).toHaveAttribute("data-block-type", "heading");

    // Design: background, typography (advanced) and a different theme.
    await page.getByRole("tab", { name: "Design" }).click();
    await page.getByTestId("theme-editorial").click();
    await expect(page.getByTestId("theme-editorial")).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Background", exact: true }).click();
    await page.locator("#design-background").getByRole("radio", { name: "Gradient" }).click();
    await expect(preview(page).locator(".op-root")).toHaveAttribute("data-bg", "gradient");
    await page.getByRole("button", { name: /^Typography/ }).click();
    await page.getByLabel("Heading font").selectOption("fraunces");
    await expect(preview(page).locator(".op-root")).toHaveCSS(
      "--op-heading-font",
      /--font-fraunces/,
    );

    // Undo / redo (outside text inputs).
    await page.locator("body").click({ position: { x: 5, y: 890 } });
    await page.keyboard.press("Control+z");
    await expect(preview(page).locator(".op-root")).not.toHaveCSS(
      "--op-heading-font",
      /--font-fraunces/,
    );
    await page.keyboard.press("Control+Shift+z");
    await expect(preview(page).locator(".op-root")).toHaveCSS(
      "--op-heading-font",
      /--font-fraunces/,
    );
    await saved(page);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/studio-desktop-design.png` });

    // Drafts persist across reloads.
    await page.reload();
    await expect(preview(page)).toContainText("Selected work");
    await expect(page.getByTestId("outline-row").first()).toHaveAttribute(
      "data-block-type",
      "heading",
    );
    await page.getByRole("tab", { name: "Design" }).click();
    await expect(page.getByTestId("theme-editorial")).toHaveAttribute("aria-pressed", "true");

    // Not public before publishing; the draft preview page shows the draft.
    expect((await context.request.get(`/${username}`)).status()).toBe(404);
    const draft = await context.newPage();
    await draft.goto(`/studio/${profileId}/preview`);
    await expect(draft.getByRole("status")).toContainText("Draft preview");
    await expect(draft.getByTestId("public-profile")).toContainText("Selected work");
    await draft.close();

    // Publish (Editorial is free; Fraunces needs advanced customization → blocked first).
    await page.getByTestId("publish-button").click();
    await expect(page.getByText("Fix these before publishing")).toBeVisible();
    await expect(page.getByText("Advanced customization needs a paid plan:")).toBeVisible();
    await page.keyboard.press("Escape");
    await page
      .locator("#design-typography")
      .getByRole("button", { name: "Reset to theme" })
      .first()
      .click();
    await saved(page);
    await page.getByTestId("publish-button").click();
    await expect(page.getByTestId("publish-button")).toHaveText(/Published/, { timeout: 20_000 });

    const visitor = await context.browser()!.newPage();
    await visitor.goto(`/${username}`);
    const profile = visitor.getByTestId("public-profile");
    await expect(profile).toContainText("Ada Lovelace");
    await expect(profile.locator("h2")).toHaveText("Selected work");
    await expect(profile.getByRole("link", { name: "Portfolio" })).toHaveAttribute(
      "href",
      /^\/go\//,
    );
    await expect(visitor.locator(".op-root")).toHaveAttribute("data-bg", "gradient");

    // Edits after publishing stay private until the next publish.
    await page.getByRole("tab", { name: "Content" }).click();
    await page
      .getByRole("button", { name: /Ada Lovelace/ })
      .first()
      .click();
    await page.getByTestId("inspector").getByLabel("Display name").fill("Ada Draft");
    await saved(page);
    await expect(page.getByTestId("publish-button")).toHaveText(/Publish/);
    await visitor.reload();
    await expect(visitor.getByTestId("public-profile")).toContainText("Ada Lovelace");
    await visitor.close();
  });

  test("shows validation errors and blocks publishing until they are fixed", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await createProfileAndOpenStudio(page);
    await addLink(page, "Broken", "not-a-url");
    await expect(page.getByTestId("inspector").getByText("Enter a full web address")).toBeVisible();
    await expect(
      page
        .getByTestId("outline-row")
        .first()
        .getByLabel(/problem/),
    ).toBeVisible();
    await saved(page);
    await page.getByTestId("publish-button").click();
    await expect(page.getByText("Fix these before publishing")).toBeVisible();
    // Each issue in the publish checklist jumps to the block that needs attention.
    await page.getByRole("button", { name: /field needs attention in the block/ }).click();
    await page
      .getByTestId("inspector")
      .getByLabel("URL", { exact: true })
      .fill("https://example.com");
    await saved(page);
    await page.getByTestId("publish-button").click();
    await expect(page.getByTestId("publish-button")).toHaveText(/Published/, { timeout: 20_000 });
  });

  test("lets free plans try premium themes and blocks but not publish them", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await createProfileAndOpenStudio(page);
    await page.getByRole("tab", { name: "Design" }).click();
    await page.getByTestId("theme-neon").click();
    await expect(preview(page).locator(".op-root")).toHaveAttribute("data-bg", "pattern");
    await saved(page);
    await page.getByTestId("publish-button").click();
    await expect(page.getByText("This theme is part of a paid plan.")).toBeVisible();
    await expect(page.getByRole("link", { name: "See plans" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
  });

  test("recovers unsaved changes after a failed save", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await createProfileAndOpenStudio(page);
    await page.route(/\/api\/trpc\/[^?]*editor\.saveDraft/, (route) => route.abort());
    await addLink(page, "Offline edit", "https://example.com/offline");
    await expect(page.getByTestId("save-status").first()).toHaveAttribute("data-status", "error", {
      timeout: 15_000,
    });
    await expect(page.getByTestId("save-status").first()).toContainText("Not saved");
    await page.unrouteAll({ behavior: "ignoreErrors" });
    page.on("dialog", (dialog) => void dialog.accept());
    await page.reload();
    await expect(page.getByText(/Unsaved changes from .* were found on this device/)).toBeVisible();
    await expect(preview(page)).not.toContainText("Offline edit");
    await page.getByRole("button", { name: "Restore" }).click();
    await expect(preview(page)).toContainText("Offline edit");
    await saved(page);
  });

  test("hides other users' studios", async ({ page, browser }) => {
    const { profileId } = await createProfileAndOpenStudio(page);
    const stranger = await browser.newContext({
      extraHTTPHeaders: { "x-forwarded-for": `10.9.${Math.floor(Math.random() * 250)}.7` },
    });
    const other = await stranger.newPage();
    await registerAndVerify(other);
    const response = await other.goto(`/studio/${profileId}`);
    expect(response?.status()).toBe(404);
    expect((await other.goto(`/studio/${profileId}/preview`))?.status()).toBe(404);
    await stranger.close();
  });

  test("works on mobile with bottom sheets and touch-sized controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await createProfileAndOpenStudio(page, "Mobile Maker");
    await expect(page.getByRole("navigation", { name: "Editor sections" })).toBeVisible();
    await page.getByRole("button", { name: "Content", exact: true }).click();
    await page.getByTestId("mobile-panel").getByTestId("add-link").click();
    const inspector = page.getByTestId("inspector");
    await inspector.getByLabel("Title", { exact: true }).fill("Mobile link");
    await inspector.getByLabel("URL", { exact: true }).fill("https://example.com/m");
    await inspector.getByRole("button", { name: "Back to preview" }).click();
    await expect(preview(page)).toContainText("Mobile link");
    // Move up/down alternatives to drag and drop are reachable.
    await page.getByRole("button", { name: "Edit Link" }).click();
    await expect(inspector.getByRole("button", { name: "Move up" })).toBeVisible();
    await inspector.getByRole("button", { name: "Back to preview" }).click();

    // Theme customization on mobile.
    await page.getByRole("button", { name: "Design", exact: true }).click();
    const panel = page.getByTestId("mobile-panel");
    await panel.getByLabel("Background", { exact: true }).last().fill("#123456");
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(preview(page).locator(".op-root")).toHaveCSS(
      "background-color",
      "rgb(18, 52, 86)",
    );
    await saved(page);
    await noHorizontalOverflow(page);
    const box = await page.getByRole("button", { name: "Content", exact: true }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/studio-mobile-390.png` });
  });

  test("is translated into Turkish and survives long strings", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await createProfileAndOpenStudio(page, "Çağrı Öztürk İçerik Üreticisi", "tr");
    await expect(page.getByRole("button", { name: "İçerik", exact: true })).toBeVisible();
    await expect(page.getByTestId("publish-button")).toHaveAccessibleName("Yayınla");
    await noHorizontalOverflow(page);
  });

  test("keeps the editor usable at every target viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await createProfileAndOpenStudio(page);
    await addLink(
      page,
      "A link with a fairly long title to test wrapping in tight layouts",
      "https://example.com",
    );
    await saved(page);
    for (const [width, height] of [
      [320, 640],
      [375, 812],
      [390, 844],
      [430, 932],
      [768, 1024],
      [1024, 768],
      [1280, 800],
      [1440, 900],
      [1920, 1080],
    ] as const) {
      await page.setViewportSize({ width, height });
      await expect(page.getByTestId("publish-button")).toBeVisible();
      await expect(preview(page)).toBeVisible();
      await noHorizontalOverflow(page);
      if (width >= 1280) await expect(page.getByTestId("inspector")).toBeVisible();
      if (SHOTS) await page.screenshot({ path: `${SHOTS}/studio-${width}.png` });
    }
  });
});
