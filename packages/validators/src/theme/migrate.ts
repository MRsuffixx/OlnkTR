import { z } from "zod";
import { themeConfigV1Schema, type ThemeConfigV1 } from "./legacy-v1";
import {
  themeConfigV2Schema,
  themeOverridesSchema,
  type ThemeConfig,
  type ThemeOverrides,
} from "./schema";

/**
 * Theme config migrations. Stored configs keep the version they were written
 * with; reads upgrade them step by step to the current version. Never edit a
 * shipped migration — add the next one.
 */
const V1_FONTS: Record<
  ThemeConfigV1["typography"]["fontFamily"],
  ThemeConfig["typography"]["bodyFont"]
> = {
  system: "system",
  sans: "inter",
  serif: "newsreader",
  mono: "jetbrains-mono",
  rounded: "manrope",
};

const V1_RADIUS = { square: 0, rounded: 12, pill: 999 } as const;
const V1_WIDTH = { sm: "narrow", md: "regular", lg: "wide" } as const;

export function migrateThemeV1ToV2(v1: ThemeConfigV1): ThemeConfig {
  const font = V1_FONTS[v1.typography.fontFamily];
  return {
    schemaVersion: 2,
    colors: {
      primary: v1.colors.accent,
      secondary: v1.colors.surface,
      accent: v1.colors.accent,
      background: v1.colors.background,
      surface: v1.colors.surface,
      text: v1.colors.text,
      mutedText: v1.colors.mutedText,
      border: v1.colors.border,
      link: v1.colors.accent,
      button: v1.colors.accent,
      buttonText: v1.colors.accentText,
    },
    typography: {
      headingFont: font,
      bodyFont: font,
      baseSize: 16,
      headingWeight: 700,
      bodyWeight: 400,
      lineHeight: 1.5,
      letterSpacing: 0,
      headingLetterSpacing: -0.01,
      headingCase: "none",
    },
    background:
      v1.background.type === "gradient"
        ? {
            type: "gradient",
            kind: "linear",
            from: v1.background.from,
            to: v1.background.to,
            angle: v1.background.angle,
          }
        : { type: "solid" },
    buttons: {
      variant: v1.buttons.variant,
      radius: V1_RADIUS[v1.buttons.shape],
      size: "md",
      borderWidth: v1.buttons.variant === "outline" ? 2 : 0,
      shadow: v1.buttons.shadow ? "soft" : "none",
      hover: "lift",
      iconPlacement: "start",
      textAlign: "center",
    },
    cards: {
      style: "outlined",
      radius: Math.min(V1_RADIUS[v1.buttons.shape], 24),
      borderWidth: 1,
      shadow: "none",
      padding: "md",
      hover: "none",
      layout: "stacked",
    },
    layout: {
      contentWidth: V1_WIDTH[v1.layout.maxWidth],
      alignment: "center",
      blockGap: 12,
      sectionGap: 32,
      avatarSize: 96,
      avatarShape: v1.layout.avatarShape,
      density: "comfortable",
      header: "classic",
    },
    effects: {
      entrance: "none",
      hoverTransitions: true,
      backgroundEffect: "none",
      decoration: "none",
    },
  };
}

/** Accepts any stored theme version and returns the current version. */
export const storedThemeConfigSchema = z
  .union([themeConfigV2Schema, themeConfigV1Schema])
  .transform((config): ThemeConfig =>
    config.schemaVersion === 1 ? migrateThemeV1ToV2(config) : config,
  );

export function parseStoredThemeConfig(value: unknown) {
  return storedThemeConfigSchema.safeParse(value);
}

/** Parses overrides, dropping invalid sections instead of failing the whole document. */
export function parseThemeOverrides(value: unknown): ThemeOverrides {
  const strict = themeOverridesSchema.safeParse(value);
  if (strict.success) return strict.data;
  if (!value || typeof value !== "object") return {};
  const result: ThemeOverrides = {};
  for (const [key, section] of Object.entries(value as Record<string, unknown>)) {
    const parsed = themeOverridesSchema.safeParse({ [key]: section });
    if (parsed.success) Object.assign(result, parsed.data);
  }
  return result;
}
