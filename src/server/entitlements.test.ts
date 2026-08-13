import { describe, expect, it } from "vitest";

import { FEATURE_CATALOG } from "~/config/feature-catalog";
import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import { hasProAccess, resolveAppearanceForPlan } from "~/server/entitlements";

const now = new Date("2026-07-20T12:00:00.000Z");

function appearanceLeafPaths(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    appearanceLeafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("subscription entitlements", () => {
  it("assigns a tier and fallback policy to every appearance property", () => {
    expect(Object.keys(FEATURE_CATALOG).sort()).toEqual(
      appearanceLeafPaths(DEFAULT_APPEARANCE).sort(),
    );
  });

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

  it("honors only active, unrevoked manual grants", () => {
    const active = {
      startsAt: new Date("2026-07-19T12:00:00.000Z"),
      expiresAt: new Date("2026-07-21T12:00:00.000Z"),
      revokedAt: null,
    };
    expect(hasProAccess(null, active, now)).toBe(true);
    expect(hasProAccess(null, { ...active, expiresAt: now }, now)).toBe(false);
    expect(hasProAccess(null, { ...active, revokedAt: new Date() }, now)).toBe(
      false,
    );
    expect(
      hasProAccess(
        null,
        { ...active, startsAt: new Date("2026-07-21T12:00:00.000Z") },
        now,
      ),
    ).toBe(false);
  });

  it("keeps Pro settings stored but applies deterministic Free fallbacks", () => {
    const stored = structuredClone(DEFAULT_APPEARANCE);
    stored.background.mode = "video";
    stored.background.mediaUrl = "https://cdn.example.test/background.mp4";
    stored.effects.cursor = "star";
    stored.effects.matrixRain = "intense";
    stored.audio.source = "upload";
    stored.audio.sourceUrl = "https://cdn.example.test/profile.mp3";
    stored.audio.entryEnabled = true;
    stored.audio.entryUrl = "https://cdn.example.test/entry.mp3";
    stored.socialProof.metric = "live";
    stored.socialProof.style = "retro";
    stored.advanced.removeBranding = true;

    const resolved = resolveAppearanceForPlan(stored, false);
    expect(resolved.raw.background.mode).toBe("video");
    expect(resolved.effective.background.mode).toBe("gradient");
    // The same media URL may back a Free image background, while the Pro video
    // mode itself is downgraded deterministically.
    expect(resolved.effective.background.mediaUrl).toBe(
      "https://cdn.example.test/background.mp4",
    );
    expect(resolved.effective.effects.cursor).toBe("default");
    expect(resolved.effective.effects.matrixRain).toBe("off");
    expect(resolved.effective.audio.source).toBe("none");
    expect(resolved.effective.audio.sourceUrl).toBe(
      "https://cdn.example.test/profile.mp3",
    );
    expect(resolved.effective.audio.entryEnabled).toBe(false);
    expect(resolved.effective.audio.entryUrl).toBe("");
    expect(resolved.effective.socialProof.metric).toBe("total");
    expect(resolved.effective.socialProof.style).toBe("plain");
    expect(resolved.effective.advanced.removeBranding).toBe(false);
    expect(resolved.lockedPaths).toContain("background.mode");
  });

  it("keeps the core creative controls useful on Free", () => {
    const stored = structuredClone(DEFAULT_APPEARANCE);
    stored.background.gradient.type = "radial";
    stored.background.gradient.angle = 42;
    stored.background.gradient.stops = [
      { color: "#112233", position: 0 },
      { color: "#445566", position: 45 },
      { color: "#778899", position: 100 },
    ];
    stored.background.preset = "custom";
    stored.layout.template = "bento";
    stored.layout.mobileAlignment = "left";
    stored.avatar.size = 132;

    const resolved = resolveAppearanceForPlan(stored, false);
    expect(resolved.effective.background.gradient.type).toBe("radial");
    expect(resolved.effective.background.gradient.stops).toHaveLength(3);
    expect(resolved.effective.background.preset).toBe("custom");
    expect(resolved.effective.layout.template).toBe("bento");
    expect(resolved.effective.layout.mobileAlignment).toBe("left");
    expect(resolved.effective.avatar.size).toBe(132);
  });
});
