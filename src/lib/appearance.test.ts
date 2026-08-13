import { describe, expect, it } from "vitest";

import {
  APPEARANCE_SETTINGS_VERSION,
  applyAppearancePreset,
  DEFAULT_APPEARANCE,
  parseAppearance,
} from "~/lib/appearance";

describe("appearance schema evolution", () => {
  it("migrates a version 1 theme without losing user choices", () => {
    const legacy = {
      background: {
        mode: "solid",
        solidColor: "#123456",
        gradient: {
          type: "linear",
          angle: 145,
          stops: [
            { color: "#F5F0DE", position: 0 },
            { color: "#F8C95C", position: 100 },
          ],
        },
        mediaUrl: "",
        overlayColor: "#17211B",
        overlayOpacity: 18,
        preset: "custom",
      },
      buttons: {
        shape: "rounded",
        radius: 18,
        fill: "outline",
        color: "#AA0000",
        textColor: "#123456",
        borderColor: "#654321",
        shadowColor: "#F06432",
        height: 58,
        spacing: 12,
        hover: "lift",
        press: "compress",
      },
      typography: {
        headingFont: "Fraunces",
        bodyFont: "Manrope",
        headingSize: 30,
        bodySize: 15,
        weight: 700,
        letterSpacing: 0,
        color: "#112233",
      },
      layout: {
        avatarShape: "circle",
        avatarSize: 96,
        avatarBorderWidth: 3,
        avatarBorderColor: "#FFFFFF",
        bioPlacement: "belowName",
        alignment: "center",
        density: "comfortable",
        contentWidth: 620,
        socialPlacement: "belowBio",
      },
      effects: {
        cursor: "default",
        cursorColor: "#F06432",
        trail: "none",
        clickRipple: false,
        entrance: "fade",
        staggerMs: 70,
      },
      advanced: {
        removeBranding: false,
        customCssEnabled: false,
        detailedAnalytics: false,
      },
    };

    const parsed = parseAppearance(legacy);
    expect(parsed.version).toBe(APPEARANCE_SETTINGS_VERSION);
    expect(parsed.colors.background).toBe("#123456");
    expect(parsed.colors.button).toBe("#AA0000");
    expect(parsed.colors.textPrimary).toBe("#112233");
    expect(parsed.audio).toEqual(DEFAULT_APPEARANCE.audio);
    expect(parsed.socialProof).toEqual(DEFAULT_APPEARANCE.socialProof);
    expect(parsed.effects.matrixRain).toBe("off");
    expect(parsed.effects.crtFilter).toBe(false);
  });

  it("applies full presets without mutating the source document", () => {
    const source = structuredClone(DEFAULT_APPEARANCE);
    const themed = applyAppearancePreset(source, "terminal");

    expect(source.preset).toBe("custom");
    expect(themed.preset).toBe("terminal");
    expect(themed.layout.template).toBe("terminal");
    expect(themed.card.enabled).toBe(true);
  });
});
