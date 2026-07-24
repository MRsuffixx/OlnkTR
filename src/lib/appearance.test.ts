import { describe, expect, it } from "vitest";

import {
  DEFAULT_APPEARANCE,
  parseAppearance,
  type AppearanceSettings,
} from "~/lib/appearance";

describe("appearance schema evolution", () => {
  it("fills new Part 5 settings without resetting an older theme", () => {
    const legacy = structuredClone(
      DEFAULT_APPEARANCE,
    ) as Omit<AppearanceSettings, "audio" | "socialProof" | "effects"> & {
      audio?: AppearanceSettings["audio"];
      socialProof?: AppearanceSettings["socialProof"];
      effects: Partial<AppearanceSettings["effects"]>;
    };
    legacy.background.solidColor = "#123456";
    delete legacy.audio;
    delete legacy.socialProof;
    delete legacy.effects.mouseParticles;
    delete legacy.effects.cardTilt;
    delete legacy.effects.matrixRain;
    delete legacy.effects.crtFilter;
    delete legacy.effects.glitch;
    delete legacy.effects.scanlines;

    const parsed = parseAppearance(legacy);
    expect(parsed.background.solidColor).toBe("#123456");
    expect(parsed.audio).toEqual(DEFAULT_APPEARANCE.audio);
    expect(parsed.socialProof).toEqual(DEFAULT_APPEARANCE.socialProof);
    expect(parsed.effects.matrixRain).toBe("off");
    expect(parsed.effects.crtFilter).toBe(false);
  });
});
