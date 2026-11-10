import { z } from "zod";
import { hexColorSchema, uuidSchema } from "../primitives";
import { THEME_FONT_KEYS } from "./fonts";

/**
 * Theme configuration v2 — a design-token document.
 *
 * Every value is an enum, a bounded number or a #RRGGBB color, so turning a
 * theme into CSS custom properties can never inject CSS, HTML or script.
 * Image backgrounds reference an owned media file by id (served from /media).
 *
 * Sections:
 *   colors      palette roles used by every block renderer
 *   typography  heading/body font keys and type metrics
 *   background  solid | gradient | image | pattern
 *   buttons     link/button treatment
 *   cards       treatment of card-like blocks (products, FAQ, embeds…)
 *   layout      width, alignment, rhythm and avatar
 *   effects     motion and decoration (all motion honours reduced-motion)
 */
export const THEME_SCHEMA_VERSION = 2;

const font = z.enum(THEME_FONT_KEYS);
const shadow = z.enum(["none", "soft", "medium", "hard"]);

export const themeColorsSchema = z
  .object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
    accent: hexColorSchema,
    background: hexColorSchema,
    surface: hexColorSchema,
    text: hexColorSchema,
    mutedText: hexColorSchema,
    border: hexColorSchema,
    link: hexColorSchema,
    button: hexColorSchema,
    buttonText: hexColorSchema,
  })
  .strict();

export const themeTypographySchema = z
  .object({
    headingFont: font,
    bodyFont: font,
    /** Body size in px. */
    baseSize: z.number().int().min(13).max(20),
    headingWeight: z.union([
      z.literal(400),
      z.literal(500),
      z.literal(600),
      z.literal(700),
      z.literal(800),
    ]),
    bodyWeight: z.union([z.literal(300), z.literal(400), z.literal(500)]),
    lineHeight: z.number().min(1.2).max(1.9),
    /** Letter spacing in em, applied to body text. */
    letterSpacing: z.number().min(-0.05).max(0.1),
    /** Letter spacing in em, applied to headings and the display name. */
    headingLetterSpacing: z.number().min(-0.08).max(0.15),
    headingCase: z.enum(["none", "uppercase"]),
  })
  .strict();

export const BACKGROUND_PATTERNS = ["dots", "grid", "diagonal", "waves", "checker"] as const;

export const themeBackgroundSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid") }).strict(),
  z
    .object({
      type: z.literal("gradient"),
      kind: z.enum(["linear", "radial"]),
      from: hexColorSchema,
      to: hexColorSchema,
      angle: z.number().int().min(0).max(360),
    })
    .strict(),
  z
    .object({
      type: z.literal("image"),
      mediaId: uuidSchema,
      overlay: hexColorSchema,
      /** Overlay opacity in percent. */
      overlayOpacity: z.number().int().min(0).max(90),
      blur: z.number().int().min(0).max(24),
    })
    .strict(),
  z
    .object({
      type: z.literal("pattern"),
      pattern: z.enum(BACKGROUND_PATTERNS),
      color: hexColorSchema,
      /** Pattern opacity in percent. */
      opacity: z.number().int().min(4).max(60),
      /** Tile size in px. */
      scale: z.number().int().min(8).max(64),
    })
    .strict(),
]);

export const themeButtonsSchema = z
  .object({
    variant: z.enum(["filled", "outline", "soft", "ghost"]),
    /** Corner radius in px; 999 renders a pill. */
    radius: z.number().int().min(0).max(999),
    size: z.enum(["sm", "md", "lg"]),
    borderWidth: z.number().int().min(0).max(4),
    shadow,
    hover: z.enum(["none", "lift", "grow", "tint"]),
    iconPlacement: z.enum(["start", "end", "none"]),
    textAlign: z.enum(["center", "start"]),
  })
  .strict();

export const themeCardsSchema = z
  .object({
    style: z.enum(["flat", "outlined", "elevated", "tinted", "glass"]),
    radius: z.number().int().min(0).max(40),
    borderWidth: z.number().int().min(0).max(4),
    shadow,
    padding: z.enum(["sm", "md", "lg"]),
    hover: z.enum(["none", "lift", "tint"]),
    /** Media placement in product and link cards. */
    layout: z.enum(["stacked", "inline"]),
  })
  .strict();

export const themeLayoutSchema = z
  .object({
    contentWidth: z.enum(["narrow", "regular", "wide"]),
    alignment: z.enum(["center", "start"]),
    /** Gap between blocks in px. */
    blockGap: z.number().int().min(4).max(40),
    /** Space between the header and the first block in px. */
    sectionGap: z.number().int().min(8).max(96),
    avatarSize: z.number().int().min(48).max(168),
    avatarShape: z.enum(["circle", "rounded", "square"]),
    density: z.enum(["compact", "comfortable", "spacious"]),
    header: z.enum(["classic", "cover", "minimal"]),
  })
  .strict();

export const themeEffectsSchema = z
  .object({
    /** One-time entrance animation of the profile content. */
    entrance: z.enum(["none", "fade", "rise"]),
    hoverTransitions: z.boolean(),
    backgroundEffect: z.enum(["none", "grain", "vignette", "glow"]),
    decoration: z.enum(["none", "frame", "rule"]),
  })
  .strict();

export const themeConfigV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    colors: themeColorsSchema,
    typography: themeTypographySchema,
    background: themeBackgroundSchema,
    buttons: themeButtonsSchema,
    cards: themeCardsSchema,
    layout: themeLayoutSchema,
    effects: themeEffectsSchema,
  })
  .strict();

export type ThemeConfig = z.infer<typeof themeConfigV2Schema>;
export type ThemeColors = ThemeConfig["colors"];
export type ThemeBackground = ThemeConfig["background"];

/** Sections that can be overridden; `background` is replaced as a whole. */
export const THEME_SECTIONS = [
  "colors",
  "typography",
  "background",
  "buttons",
  "cards",
  "layout",
  "effects",
] as const;
export type ThemeSection = (typeof THEME_SECTIONS)[number];

/**
 * Partial overrides layered on top of a base theme (profile- or theme-level).
 * Absent keys inherit from the layer below — resetting = deleting the key.
 */
export const themeOverridesSchema = z
  .object({
    colors: themeColorsSchema.partial().optional(),
    typography: themeTypographySchema.partial().optional(),
    background: themeBackgroundSchema.optional(),
    buttons: themeButtonsSchema.partial().optional(),
    cards: themeCardsSchema.partial().optional(),
    layout: themeLayoutSchema.partial().optional(),
    effects: themeEffectsSchema.partial().optional(),
  })
  .strict();

export type ThemeOverrides = z.infer<typeof themeOverridesSchema>;

/**
 * Overrides that require the `customization.advanced` entitlement to publish.
 * Free plans may recolor a theme and change solid/gradient backgrounds.
 */
export function advancedOverridePaths(overrides: ThemeOverrides): string[] {
  const paths: string[] = [];
  for (const section of ["typography", "buttons", "cards", "layout", "effects"] as const) {
    for (const key of Object.keys(overrides[section] ?? {})) paths.push(`${section}.${key}`);
  }
  const backgroundType = overrides.background?.type;
  if (backgroundType === "image" || backgroundType === "pattern") paths.push("background");
  return paths;
}

/**
 * Per-block appearance overrides (highest precedence). Only affects the block
 * it is attached to.
 */
export const blockAppearanceSchema = z
  .object({
    variant: z.enum(["filled", "outline", "soft", "ghost"]).optional(),
    background: hexColorSchema.optional(),
    text: hexColorSchema.optional(),
    radius: z.number().int().min(0).max(999).optional(),
    emphasis: z.enum(["default", "featured"]).optional(),
  })
  .strict();

export type BlockAppearance = z.infer<typeof blockAppearanceSchema>;
