import { describe, expect, it } from "vitest";

import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import { hasProAccess, resolveAppearanceForPlan } from "~/server/entitlements";

const now = new Date("2026-07-20T12:00:00.000Z");

describe("subscription entitlements", () => {
  it.each(["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"] as const)(
    "requires a future period end for %s",
    (status) => {
      expect(
        hasProAccess(
          {
            plan: "PRO",
            status,
            currentPeriodEnd: new Date("2026-07-20T12:00:01.000Z"),
          },
          now,
        ),
      ).toBe(true);
      expect(
        hasProAccess({ plan: "PRO", status, currentPeriodEnd: null }, now),
      ).toBe(false);
      expect(
        hasProAccess(
          {
            plan: "PRO",
            status,
            currentPeriodEnd: new Date("2026-07-20T11:59:59.000Z"),
          },
          now,
        ),
      ).toBe(false);
    },
  );

  it("fails closed for unpaid and incomplete states", () => {
    for (const status of [
      "INCOMPLETE",
      "UNPAID",
      "EXPIRED",
      "REFUNDED",
    ] as const) {
      expect(
        hasProAccess(
          {
            plan: "PRO",
            status,
            currentPeriodEnd: new Date("2027-01-01T00:00:00.000Z"),
          },
          now,
        ),
      ).toBe(false);
    }
  });

  it("keeps Pro settings stored but applies deterministic Free fallbacks", () => {
    const stored = structuredClone(DEFAULT_APPEARANCE);
    stored.background.mode = "video";
    stored.background.mediaUrl = "https://cdn.example.test/background.mp4";
    stored.effects.cursor = "star";
    stored.advanced.removeBranding = true;

    const resolved = resolveAppearanceForPlan(stored, false);
    expect(resolved.raw.background.mode).toBe("video");
    expect(resolved.effective.background.mode).toBe("gradient");
    expect(resolved.effective.background.mediaUrl).toBe("");
    expect(resolved.effective.effects.cursor).toBe("default");
    expect(resolved.effective.advanced.removeBranding).toBe(false);
    expect(resolved.lockedPaths).toContain("background.mode");
  });
});
