import { describe, expect, it } from "vitest";
import {
  analyticsEventInputSchema,
  createLinkInputSchema,
  defaultEntitlements,
  entitlementSetSchema,
  getUsernameProblem,
  mergeEntitlements,
  normalizeUsername,
  publicHttpUrlSchema,
  safeRedirectPath,
  usernameSchema,
} from "./index";
import { mergeEntitlements as merge2 } from "./entitlements";
import { DEFAULT_THEME_CONFIG, themeConfigSchema } from "./theme";

describe("usernames", () => {
  it("normalizes consistently", () => {
    expect(normalizeUsername("  Berat.Dev ")).toBe("berat.dev");
    expect(usernameSchema.parse("Berat_Dev")).toBe("berat_dev");
  });

  it.each([
    ["ab", "too_short"],
    ["a".repeat(31), "too_long"],
    ["bad name", "invalid_characters"],
    ["-dash", "invalid_characters"],
    ["double..dot", "invalid_characters"],
    ["şule", "invalid_characters"],
    ["admin", "reserved"],
    ["dashboard", "reserved"],
    ["login", "reserved"],
  ])("rejects %s (%s)", (value, problem) => {
    expect(getUsernameProblem(normalizeUsername(value))).toBe(problem);
    expect(usernameSchema.safeParse(value).success).toBe(false);
  });

  it("treats the Turkish dotted capital I as invalid instead of colliding", () => {
    expect(usernameSchema.safeParse("İstanbul").success).toBe(false);
  });
});

describe("URLs", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,hi",
    "http://localhost:3000",
    "http://127.0.0.1/admin",
    "http://192.168.1.1",
    "https://user:pass@example.com",
    "ftp://example.com",
  ])("rejects %s", (url) => {
    expect(publicHttpUrlSchema.safeParse(url).success).toBe(false);
  });

  it("accepts public http(s) URLs", () => {
    expect(publicHttpUrlSchema.parse("https://olnk.tr/path?q=1")).toBe("https://olnk.tr/path?q=1");
  });

  it.each([
    ["/dashboard", "/dashboard"],
    ["/tr/settings?x=1", "/tr/settings?x=1"],
    ["//evil.com", "/"],
    ["https://evil.com", "/"],
    ["/\\evil.com", "/"],
    [undefined, "/"],
  ])("validates redirect %s", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });
});

describe("links", () => {
  it("rejects schedules that end before they start", () => {
    const result = createLinkInputSchema.safeParse({
      profileId: "8d8ac610-566d-4ef0-9c22-186b2a5ed793",
      title: "x",
      url: "https://example.com",
      startsAt: "2026-02-01",
      endsAt: "2026-01-01",
    });
    expect(result.success).toBe(false);
  });
});

describe("entitlements", () => {
  it("merges layers over restrictive defaults", () => {
    const merged = mergeEntitlements(
      { "profiles.limit": 5 },
      { "profiles.limit": null, "api.access": true },
    );
    expect(merged["profiles.limit"]).toBeNull();
    expect(merged["api.access"]).toBe(true);
    expect(merged["themes.premium"]).toBe(false);
    expect(merge2()).toEqual(defaultEntitlements());
  });

  it("rejects unknown keys and invalid values", () => {
    expect(entitlementSetSchema.safeParse({ "unknown.key": 1 }).success).toBe(false);
    expect(entitlementSetSchema.safeParse({ "profiles.limit": -1 }).success).toBe(false);
  });
});

describe("analytics events", () => {
  const profileId = "8d8ac610-566d-4ef0-9c22-186b2a5ed793";
  it("requires linkId for clicks", () => {
    expect(analyticsEventInputSchema.safeParse({ type: "link.click", profileId }).success).toBe(
      false,
    );
  });
  it("rejects unknown fields", () => {
    expect(
      analyticsEventInputSchema.safeParse({ type: "profile.view", profileId, ip: "1.2.3.4" })
        .success,
    ).toBe(false);
  });
});

describe("themes", () => {
  it("validates the default theme and rejects CSS injection", () => {
    expect(themeConfigSchema.parse(DEFAULT_THEME_CONFIG)).toEqual(DEFAULT_THEME_CONFIG);
    const evil = structuredClone(DEFAULT_THEME_CONFIG) as { colors: { text: string } };
    evil.colors.text = "red;}body{display:none";
    expect(themeConfigSchema.safeParse(evil).success).toBe(false);
  });
});
