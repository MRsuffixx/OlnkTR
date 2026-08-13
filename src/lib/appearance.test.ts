import { describe, expect, it } from "vitest";

import {
  APPEARANCE_SETTINGS_VERSION,
  applyAppearancePreset,
  appearanceBackgroundEffects,
  DEFAULT_APPEARANCE,
  parseAppearance,
  PROFILE_PRESETS,
} from "~/lib/appearance";

describe("appearance schema evolution", () => {
  it("gives a new or unreadable profile an isolated default document", () => {
    const first = parseAppearance(undefined);
    first.colors.primary = "#000000";

    expect(parseAppearance({ broken: true })).toEqual(DEFAULT_APPEARANCE);
    expect(parseAppearance(undefined).colors.primary).toBe(
      DEFAULT_APPEARANCE.colors.primary,
    );
  });

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

  it("migrates version 2 avatar fields into their own group", () => {
    const version2 = structuredClone(DEFAULT_APPEARANCE) as unknown as Record<
      string,
      unknown
    >;
    version2.version = 2;
    delete version2.avatar;
    const layout = version2.layout as Record<string, unknown>;
    layout.avatarShape = "hexagon";
    layout.avatarSize = 144;
    layout.avatarBorderWidth = 6;
    delete layout.pagePadding;
    delete layout.mobilePagePadding;
    delete layout.verticalAlign;
    const background = version2.background as Record<string, unknown>;
    delete background.blur;
    delete background.brightness;
    delete background.contrast;
    delete background.saturation;
    delete background.hueRotate;
    delete background.scale;
    delete background.fit;
    delete background.position;
    const card = version2.card as Record<string, unknown>;
    delete card.borderStyle;
    delete card.hover;

    const parsed = parseAppearance(version2);
    expect(parsed.version).toBe(APPEARANCE_SETTINGS_VERSION);
    expect(parsed.avatar.shape).toBe("hexagon");
    expect(parsed.avatar.size).toBe(144);
    expect(parsed.avatar.borderWidth).toBe(6);
    expect(parsed.layout).not.toHaveProperty("avatarShape");
    expect(parsed.background.brightness).toBe(100);
    expect(parsed.card.borderStyle).toBe("solid");
  });

  it("composes bounded background filters into one render style", () => {
    const appearance = structuredClone(DEFAULT_APPEARANCE);
    appearance.background.blur = 8;
    appearance.background.brightness = 86;
    appearance.background.hueRotate = 45;
    appearance.background.scale = 112;

    const style = appearanceBackgroundEffects(appearance);
    expect(style.filter).toContain("blur(8px)");
    expect(style.filter).toContain("brightness(86%)");
    expect(style.filter).toContain("hue-rotate(45deg)");
    expect(style.transform).toBe("scale(1.12)");
  });

  it("normalizes gradient stop order before generating CSS", () => {
    const input = structuredClone(DEFAULT_APPEARANCE);
    input.background.gradient.stops = [
      { color: "#333333", position: 100 },
      { color: "#111111", position: 0 },
      { color: "#222222", position: 50 },
    ];

    expect(
      parseAppearance(input).background.gradient.stops.map(
        (stop) => stop.position,
      ),
    ).toEqual([0, 50, 100]);
  });

  it("applies full presets without mutating the source document", () => {
    const source = structuredClone(DEFAULT_APPEARANCE);
    source.background.blur = 19;
    source.avatar.animation = "spin";
    const themed = applyAppearancePreset(source, "terminal");

    expect(source.preset).toBe("custom");
    expect(themed.preset).toBe("terminal");
    expect(themed.layout.template).toBe("terminal");
    expect(themed.card.enabled).toBe(true);
    expect(themed.background.blur).toBe(0);
    expect(themed.avatar.animation).toBe("none");
  });

  it("keeps every catalog theme compatible with the authoritative schema", () => {
    expect(Object.keys(PROFILE_PRESETS).length).toBeGreaterThanOrEqual(17);
    for (const preset of Object.keys(PROFILE_PRESETS)) {
      const themed = applyAppearancePreset(
        DEFAULT_APPEARANCE,
        preset as keyof typeof PROFILE_PRESETS,
      );
      expect(parseAppearance(themed).preset).toBe(preset);
    }
  });
});
