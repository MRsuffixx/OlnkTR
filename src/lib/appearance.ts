import { z } from "zod";

export const hexColor = z.string().regex(/^#[\dA-Fa-f]{6}$/);
const mediaUrl = z.union([
  z.literal(""),
  z
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
]);

export const appearanceSchema = z.object({
  background: z.object({
    mode: z.enum([
      "solid",
      "gradient",
      "image",
      "video",
      "particles",
      "motion",
    ]),
    solidColor: hexColor,
    gradient: z.object({
      type: z.enum(["linear", "radial"]),
      angle: z.number().int().min(0).max(360),
      stops: z
        .array(
          z.object({
            color: hexColor,
            position: z.number().int().min(0).max(100),
          }),
        )
        .min(2)
        .max(5),
    }),
    mediaUrl,
    overlayColor: hexColor,
    overlayOpacity: z.number().int().min(0).max(90),
    preset: z.enum([
      "sunrise",
      "mint",
      "paper",
      "aurora",
      "midnight",
      "mesh",
      "confetti",
      "custom",
    ]),
  }),
  buttons: z.object({
    shape: z.enum(["square", "rounded", "pill", "custom"]),
    radius: z.number().int().min(0).max(40),
    fill: z.enum(["solid", "outline", "shadow", "glass", "threeD"]),
    color: hexColor,
    textColor: hexColor,
    borderColor: hexColor,
    shadowColor: hexColor,
    height: z.number().int().min(44).max(84),
    spacing: z.number().int().min(6).max(30),
    hover: z.enum(["none", "lift", "grow", "glow", "tilt"]),
    press: z.enum(["none", "compress", "sink"]),
  }),
  typography: z.object({
    headingFont: z.enum([
      "Fraunces",
      "Manrope",
      "Space Grotesk",
      "Playfair Display",
      "DM Serif Display",
      "Bebas Neue",
    ]),
    bodyFont: z.enum([
      "Manrope",
      "Fraunces",
      "Inter",
      "Montserrat",
      "Lora",
      "Roboto Mono",
    ]),
    headingSize: z.number().int().min(22).max(54),
    bodySize: z.number().int().min(12).max(22),
    weight: z.union([
      z.literal(400),
      z.literal(500),
      z.literal(600),
      z.literal(700),
      z.literal(800),
    ]),
    letterSpacing: z.number().min(-1).max(6),
    color: hexColor,
  }),
  layout: z.object({
    avatarShape: z.enum(["circle", "rounded", "square", "squircle", "hexagon"]),
    avatarSize: z.number().int().min(64).max(160),
    avatarBorderWidth: z.number().int().min(0).max(10),
    avatarBorderColor: hexColor,
    bioPlacement: z.enum(["belowName", "aboveName", "hidden"]),
    alignment: z.enum(["left", "center"]),
    density: z.enum(["compact", "comfortable", "airy"]),
    contentWidth: z.number().int().min(320).max(860),
    socialPlacement: z.enum(["aboveBio", "belowBio", "belowLinks"]),
  }),
  effects: z.object({
    cursor: z.enum(["default", "dot", "ring", "heart", "star"]),
    cursorColor: hexColor,
    trail: z.enum(["none", "dots", "sparkles"]),
    clickRipple: z.boolean(),
    entrance: z.enum(["none", "fade", "slide", "stagger", "pop"]),
    staggerMs: z.number().int().min(0).max(300),
  }),
  advanced: z.object({
    removeBranding: z.boolean(),
    customCssEnabled: z.boolean(),
    detailedAnalytics: z.boolean(),
  }),
});

export type AppearanceSettings = z.infer<typeof appearanceSchema>;

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  background: {
    mode: "gradient",
    solidColor: "#F5F0DE",
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
    preset: "sunrise",
  },
  buttons: {
    shape: "rounded",
    radius: 18,
    fill: "shadow",
    color: "#17211B",
    textColor: "#FFFFFF",
    borderColor: "#17211B",
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
    color: "#17211B",
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

export function parseAppearance(value: unknown): AppearanceSettings {
  const parsed = appearanceSchema.safeParse(value);
  return parsed.success ? parsed.data : structuredClone(DEFAULT_APPEARANCE);
}

type BackgroundPresetDefinition = {
  mode: AppearanceSettings["background"]["mode"];
  color?: string;
  type?: AppearanceSettings["background"]["gradient"]["type"];
  angle?: number;
  stops?: AppearanceSettings["background"]["gradient"]["stops"];
};

export const BACKGROUND_PRESETS: Record<
  Exclude<AppearanceSettings["background"]["preset"], "custom">,
  BackgroundPresetDefinition
> = {
  sunrise: {
    mode: "gradient",
    type: "linear",
    angle: 145,
    stops: [
      { color: "#F5F0DE", position: 0 },
      { color: "#F8C95C", position: 100 },
    ],
  },
  mint: {
    mode: "gradient",
    type: "linear",
    angle: 155,
    stops: [
      { color: "#EAF7EA", position: 0 },
      { color: "#9DE5C1", position: 100 },
    ],
  },
  paper: { mode: "solid", color: "#F5F0DE" },
  aurora: {
    mode: "motion",
    type: "linear",
    angle: 125,
    stops: [
      { color: "#4CF0AE", position: 0 },
      { color: "#4A79FF", position: 52 },
      { color: "#B36BFF", position: 100 },
    ],
  },
  midnight: {
    mode: "gradient",
    type: "radial",
    angle: 180,
    stops: [
      { color: "#273552", position: 0 },
      { color: "#090F1F", position: 100 },
    ],
  },
  mesh: {
    mode: "motion",
    type: "radial",
    angle: 90,
    stops: [
      { color: "#FF8A66", position: 0 },
      { color: "#F7D563", position: 45 },
      { color: "#8EDBD1", position: 100 },
    ],
  },
  confetti: {
    mode: "particles",
    type: "linear",
    angle: 145,
    stops: [
      { color: "#FFF6DA", position: 0 },
      { color: "#F5C8FF", position: 100 },
    ],
  },
};

export function appearanceBackground(settings: AppearanceSettings) {
  const { background } = settings;
  if (background.mode === "solid")
    return { backgroundColor: background.solidColor };
  if (background.mode === "image")
    return {
      backgroundColor: background.solidColor,
      backgroundImage: `linear-gradient(${background.overlayColor}${Math.round(
        background.overlayOpacity * 2.55,
      )
        .toString(16)
        .padStart(2, "0")}, ${background.overlayColor}${Math.round(
        background.overlayOpacity * 2.55,
      )
        .toString(16)
        .padStart(
          2,
          "0",
        )}), url("${background.mediaUrl.replace(/["\\]/g, "")}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  const preset =
    background.preset === "custom"
      ? undefined
      : BACKGROUND_PRESETS[background.preset];
  const gradient = preset?.stops
    ? {
        type: preset.type ?? "linear",
        angle: preset.angle ?? 145,
        stops: preset.stops,
      }
    : background.gradient;
  const stops = gradient.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");
  return {
    backgroundImage:
      gradient.type === "radial"
        ? `radial-gradient(circle, ${stops})`
        : `linear-gradient(${gradient.angle}deg, ${stops})`,
  };
}
