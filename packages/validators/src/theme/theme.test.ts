import { describe, expect, it } from "vitest";
import { DEFAULT_THEME_CONFIG as V1_DEFAULT_LIKE } from "./presets";
import {
  advancedOverridePaths,
  applyThemeOverrides,
  findThemePreset,
  parseThemeOverrides,
  resetThemeOverride,
  resolveBlockAppearance,
  setThemeOverride,
  storedThemeConfigSchema,
  THEME_EXPORT_FORMAT,
  THEME_PRESETS,
  themeConfigSchema,
  themeExportSchema,
} from "./index";

const v1 = {
  schemaVersion: 1,
  colors: {
    background: "#ffffff",
    surface: "#f4f4f5",
    text: "#18181b",
    mutedText: "#52525b",
    accent: "#2563eb",
    accentText: "#ffffff",
    border: "#e4e4e7",
  },
  background: { type: "gradient", from: "#000000", to: "#ffffff", angle: 90 },
  typography: { fontFamily: "serif" },
  buttons: { shape: "pill", variant: "outline", shadow: true },
  layout: { maxWidth: "lg", avatarShape: "rounded" },
};

describe("theme presets", () => {
  it("ships ten valid, uniquely keyed presets", () => {
    expect(THEME_PRESETS).toHaveLength(10);
    expect(new Set(THEME_PRESETS.map((preset) => preset.key)).size).toBe(10);
    for (const preset of THEME_PRESETS) {
      expect(themeConfigSchema.safeParse(preset.config).success, preset.key).toBe(true);
    }
  });

  it("differ in more than color (type, shape, background and layout signature)", () => {
    const signatures = THEME_PRESETS.map((preset) => {
      const { typography, buttons, background, layout, cards } = preset.config;
      return [
        typography.headingFont,
        buttons.variant,
        buttons.radius,
        background.type,
        layout.alignment,
        cards.style,
      ].join("|");
    });
    expect(new Set(signatures).size).toBe(THEME_PRESETS.length);
  });

  it("uses Minimal as the default theme", () => {
    expect(findThemePreset("minimal")?.config).toEqual(V1_DEFAULT_LIKE);
  });
});

describe("theme versioning", () => {
  it("migrates stored v1 configs to v2", () => {
    const parsed = storedThemeConfigSchema.parse(v1);
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.buttons).toMatchObject({ variant: "outline", radius: 999, shadow: "soft" });
    expect(parsed.background).toEqual({
      type: "gradient",
      kind: "linear",
      from: "#000000",
      to: "#ffffff",
      angle: 90,
    });
    expect(parsed.typography.bodyFont).toBe("newsreader");
    expect(parsed.layout.contentWidth).toBe("wide");
    expect(themeConfigSchema.safeParse(parsed).success).toBe(true);
  });

  it("rejects CSS injection and unknown keys", () => {
    const evil = structuredClone(findThemePreset("minimal")!.config) as unknown as {
      colors: { text: string };
    };
    evil.colors.text = "red;} body{display:none";
    expect(storedThemeConfigSchema.safeParse(evil).success).toBe(false);
    expect(
      themeConfigSchema.safeParse({ ...findThemePreset("minimal")!.config, script: "x" }).success,
    ).toBe(false);
  });
});

describe("theme inheritance", () => {
  const base = findThemePreset("minimal")!.config;

  it("applies later layers key by key and replaces backgrounds whole", () => {
    const profile = setThemeOverride({}, "colors", "button", "#ff0000");
    const resolved = applyThemeOverrides(base, profile, {
      background: { type: "pattern", pattern: "dots", color: "#000000", opacity: 10, scale: 16 },
    });
    expect(resolved.colors.button).toBe("#ff0000");
    expect(resolved.colors.text).toBe(base.colors.text);
    expect(resolved.background.type).toBe("pattern");
    expect(base.colors.button).not.toBe("#ff0000");
  });

  it("restores the inherited value when an override is reset", () => {
    let overrides = setThemeOverride({}, "buttons", "radius", 0);
    overrides = setThemeOverride(overrides, "buttons", "size", "lg");
    overrides = resetThemeOverride(overrides, "buttons", "radius");
    const resolved = applyThemeOverrides(base, overrides);
    expect(resolved.buttons.radius).toBe(base.buttons.radius);
    expect(resolved.buttons.size).toBe("lg");
    expect(resetThemeOverride(overrides, "buttons", "size")).toEqual({});
  });

  it("gives block appearance the highest precedence", () => {
    const resolved = resolveBlockAppearance(base, { background: "#00ff00", emphasis: "featured" });
    expect(resolved).toMatchObject({ background: "#00ff00", featured: true });
    expect(resolved.variant).toBe(base.buttons.variant);
  });

  it("flags only advanced overrides for the customization entitlement", () => {
    expect(advancedOverridePaths({ colors: { text: "#000000" } })).toEqual([]);
    expect(
      advancedOverridePaths({
        typography: { headingFont: "syne" },
        background: {
          type: "image",
          mediaId: "8d7f3c52-1a0e-4c55-9a51-111111111111",
          overlay: "#000000",
          overlayOpacity: 20,
          blur: 0,
        },
      }),
    ).toEqual(["typography.headingFont", "background"]);
  });

  it("drops invalid override sections instead of failing the whole document", () => {
    expect(
      parseThemeOverrides({ colors: { text: "#111111" }, buttons: { radius: "huge" } }),
    ).toEqual({ colors: { text: "#111111" } });
  });
});

describe("theme import/export", () => {
  it("round-trips and migrates older exports", () => {
    const file = { format: THEME_EXPORT_FORMAT, name: "Mine", config: v1 };
    const parsed = themeExportSchema.parse(file);
    expect(parsed.config.schemaVersion).toBe(2);
  });

  it("rejects files with extra data", () => {
    const file = { format: THEME_EXPORT_FORMAT, name: "x", config: v1, html: "<script>" };
    expect(themeExportSchema.safeParse(file).success).toBe(false);
  });
});
