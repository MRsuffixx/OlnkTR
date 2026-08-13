import type { CSSProperties } from "react";
import { z } from "zod";

import { bodyFontSchema, headingFontSchema } from "~/config/font-registry";

export const APPEARANCE_SETTINGS_VERSION = 3;
export const hexColor = z.string().regex(/^#[\dA-Fa-f]{6}$/);

const mediaUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(2048)
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol)),
]);
const gradientStops = z
  .array(
    z.object({
      color: hexColor,
      position: z.number().int().min(0).max(100),
    }),
  )
  .min(2)
  .max(5)
  .transform((stops) =>
    [...stops].sort((left, right) => left.position - right.position),
  );

const defaultColors = {
  primary: "#F06432",
  secondary: "#F8C95C",
  accent: "#B9DDC7",
  background: "#F5F0DE",
  backgroundSecondary: "#F8C95C",
  surface: "#FDFCF7",
  surfaceHover: "#FFFFFF",
  card: "#FDFCF7",
  cardBorder: "#FFFFFF",
  textPrimary: "#17211B",
  textSecondary: "#36463D",
  textMuted: "#64726A",
  icon: "#17211B",
  link: "#17211B",
  linkHover: "#F06432",
  glow: "#F8C95C",
  shadow: "#17211B",
  particle: "#FFFFFF",
  username: "#17211B",
  badge: "#F8C95C",
  button: "#17211B",
  buttonText: "#FFFFFF",
} as const;

export const appearanceSchema = z.object({
  version: z
    .literal(APPEARANCE_SETTINGS_VERSION)
    .default(APPEARANCE_SETTINGS_VERSION),
  preset: z
    .enum([
      "custom",
      "frost",
      "midnight",
      "cyber",
      "terminal",
      "minimal",
      "neon",
      "pureBlack",
      "auroraGlow",
      "vaporwave",
      "spotify",
      "discord",
      "y2k",
      "brutal",
      "ocean",
      "sakura",
      "sunset",
      "developer",
    ])
    .default("custom"),
  colors: z
    .object({
      primary: hexColor,
      secondary: hexColor,
      accent: hexColor,
      background: hexColor,
      backgroundSecondary: hexColor,
      surface: hexColor,
      surfaceHover: hexColor,
      card: hexColor,
      cardBorder: hexColor,
      textPrimary: hexColor,
      textSecondary: hexColor,
      textMuted: hexColor,
      icon: hexColor,
      link: hexColor,
      linkHover: hexColor,
      glow: hexColor,
      shadow: hexColor,
      particle: hexColor,
      username: hexColor,
      badge: hexColor,
      button: hexColor,
      buttonText: hexColor,
    })
    .default(defaultColors),
  background: z.object({
    mode: z.enum([
      "solid",
      "gradient",
      "image",
      "video",
      "particles",
      "motion",
    ]),
    gradient: z.object({
      type: z.enum(["linear", "radial", "conic"]),
      angle: z.number().int().min(0).max(360),
      stops: gradientStops,
    }),
    mediaUrl,
    overlayColor: hexColor,
    overlayOpacity: z.number().int().min(0).max(90),
    fit: z.enum(["cover", "contain"]).default("cover"),
    position: z
      .enum(["center", "top", "bottom", "left", "right"])
      .default("center"),
    blur: z.number().int().min(0).max(24).default(0),
    brightness: z.number().int().min(50).max(150).default(100),
    contrast: z.number().int().min(50).max(150).default(100),
    saturation: z.number().int().min(0).max(200).default(100),
    hueRotate: z.number().int().min(0).max(360).default(0),
    scale: z.number().int().min(100).max(130).default(100),
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
  card: z
    .object({
      enabled: z.boolean(),
      opacity: z.number().int().min(0).max(100),
      blur: z.number().int().min(0).max(40),
      radius: z.number().int().min(0).max(48),
      borderWidth: z.number().int().min(0).max(6),
      borderStyle: z.enum(["solid", "dashed", "double"]).default("solid"),
      shadow: z.enum(["none", "soft", "hard", "glow"]),
      hover: z.enum(["none", "lift", "tilt", "glow"]).default("none"),
      padding: z.number().int().min(16).max(64),
    })
    .default({
      enabled: false,
      opacity: 72,
      blur: 18,
      radius: 32,
      borderWidth: 1,
      borderStyle: "solid",
      shadow: "soft",
      hover: "none",
      padding: 28,
    }),
  avatar: z
    .object({
      shape: z.enum(["circle", "rounded", "square", "squircle", "hexagon"]),
      size: z.number().int().min(64).max(180),
      borderWidth: z.number().int().min(0).max(10),
      borderStyle: z.enum(["solid", "dashed", "double"]),
      shadow: z.enum(["none", "soft", "hard", "glow"]),
      animation: z.enum(["none", "pulse", "float", "spin"]),
      hover: z.enum(["none", "zoom", "tilt", "glow"]),
    })
    .default({
      shape: "circle",
      size: 96,
      borderWidth: 3,
      borderStyle: "solid",
      shadow: "hard",
      animation: "none",
      hover: "none",
    }),
  buttons: z.object({
    shape: z.enum(["square", "rounded", "pill", "custom"]),
    radius: z.number().int().min(0).max(40),
    fill: z.enum(["solid", "outline", "shadow", "glass", "threeD"]),
    height: z.number().int().min(44).max(84),
    spacing: z.number().int().min(6).max(30),
    hover: z.enum(["none", "lift", "grow", "glow", "tilt"]),
    press: z.enum(["none", "compress", "sink"]),
  }),
  typography: z.object({
    headingFont: headingFontSchema,
    bodyFont: bodyFontSchema,
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
    headingEffect: z
      .enum(["none", "gradient", "glow", "shimmer"])
      .default("none"),
  }),
  layout: z.object({
    template: z
      .enum(["stack", "compact", "bento", "terminal"])
      .default("stack"),
    cardPosition: z.enum(["left", "center", "right"]).default("center"),
    bioPlacement: z.enum(["belowName", "aboveName", "hidden"]),
    alignment: z.enum(["left", "center", "right"]),
    mobileAlignment: z.enum(["left", "center", "right"]).default("center"),
    density: z.enum(["compact", "comfortable", "airy"]),
    contentWidth: z.number().int().min(320).max(860),
    pagePadding: z.number().int().min(16).max(80).default(28),
    mobilePagePadding: z.number().int().min(12).max(36).default(20),
    verticalAlign: z.enum(["top", "center", "bottom"]).default("top"),
    socialPlacement: z.enum(["aboveBio", "belowBio", "belowLinks"]),
  }),
  effects: z.object({
    cursor: z.enum(["default", "dot", "ring", "heart", "star"]),
    trail: z.enum(["none", "dots", "sparkles"]),
    clickRipple: z.boolean(),
    entrance: z.enum(["none", "fade", "slide", "stagger", "pop"]),
    staggerMs: z.number().int().min(0).max(300),
    mouseParticles: z.enum(["off", "subtle", "intense"]).default("off"),
    cardTilt: z.enum(["off", "links", "profile"]).default("off"),
    matrixRain: z.enum(["off", "subtle", "intense"]).default("off"),
    crtFilter: z.boolean().default(false),
    glitch: z.boolean().default(false),
    scanlines: z.boolean().default(false),
  }),
  audio: z
    .object({
      enabled: z.boolean(),
      source: z.enum(["none", "spotify", "soundcloud", "upload"]),
      sourceUrl: mediaUrl,
      title: z.string().trim().max(80),
      volume: z.number().int().min(0).max(100),
      loop: z.boolean(),
      skin: z.enum(["minimal", "glass", "retro"]),
      accentColor: hexColor,
      entryEnabled: z.boolean(),
      entryUrl: mediaUrl,
      entryVolume: z.number().int().min(0).max(100),
    })
    .default({
      enabled: false,
      source: "none",
      sourceUrl: "",
      title: "",
      volume: 70,
      loop: false,
      skin: "minimal",
      accentColor: "#F06432",
      entryEnabled: false,
      entryUrl: "",
      entryVolume: 65,
    }),
  socialProof: z
    .object({
      enabled: z.boolean(),
      metric: z.enum(["total", "today", "live"]),
      style: z.enum(["plain", "pill", "retro"]),
      label: z.string().trim().max(48),
    })
    .default({ enabled: false, metric: "total", style: "plain", label: "" }),
  seo: z
    .object({
      title: z.string().trim().max(70),
      description: z.string().trim().max(160),
      imageUrl: mediaUrl,
    })
    .default({ title: "", description: "", imageUrl: "" }),
  privacy: z
    .object({
      allowIndexing: z.boolean(),
      analyticsEnabled: z.boolean(),
      showShareActions: z.boolean(),
    })
    .default({
      allowIndexing: true,
      analyticsEnabled: true,
      showShareActions: true,
    }),
  advanced: z.object({
    removeBranding: z.boolean(),
    customCssEnabled: z.boolean(),
    detailedAnalytics: z.boolean(),
  }),
});

export type AppearanceSettings = z.infer<typeof appearanceSchema>;

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  version: APPEARANCE_SETTINGS_VERSION,
  preset: "custom",
  colors: { ...defaultColors },
  background: {
    mode: "gradient",
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
    fit: "cover",
    position: "center",
    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    scale: 100,
    preset: "sunrise",
  },
  card: {
    enabled: false,
    opacity: 72,
    blur: 18,
    radius: 32,
    borderWidth: 1,
    borderStyle: "solid",
    shadow: "soft",
    hover: "none",
    padding: 28,
  },
  avatar: {
    shape: "circle",
    size: 96,
    borderWidth: 3,
    borderStyle: "solid",
    shadow: "hard",
    animation: "none",
    hover: "none",
  },
  buttons: {
    shape: "rounded",
    radius: 18,
    fill: "shadow",
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
    headingEffect: "none",
  },
  layout: {
    template: "stack",
    cardPosition: "center",
    bioPlacement: "belowName",
    alignment: "center",
    mobileAlignment: "center",
    density: "comfortable",
    contentWidth: 620,
    pagePadding: 28,
    mobilePagePadding: 20,
    verticalAlign: "top",
    socialPlacement: "belowBio",
  },
  effects: {
    cursor: "default",
    trail: "none",
    clickRipple: false,
    entrance: "fade",
    staggerMs: 70,
    mouseParticles: "off",
    cardTilt: "off",
    matrixRain: "off",
    crtFilter: false,
    glitch: false,
    scanlines: false,
  },
  audio: {
    enabled: false,
    source: "none",
    sourceUrl: "",
    title: "",
    volume: 70,
    loop: false,
    skin: "minimal",
    accentColor: "#F06432",
    entryEnabled: false,
    entryUrl: "",
    entryVolume: 65,
  },
  socialProof: { enabled: false, metric: "total", style: "plain", label: "" },
  seo: { title: "", description: "", imageUrl: "" },
  privacy: {
    allowIndexing: true,
    analyticsEnabled: true,
    showShareActions: true,
  },
  advanced: {
    removeBranding: false,
    customCssEnabled: false,
    detailedAnalytics: false,
  },
};

const legacyV2AppearanceSchema = appearanceSchema
  .omit({ avatar: true })
  .extend({
    version: z.literal(2),
    layout: appearanceSchema.shape.layout.extend({
      avatarShape: z.enum([
        "circle",
        "rounded",
        "square",
        "squircle",
        "hexagon",
      ]),
      avatarSize: z.number().int().min(64).max(160),
      avatarBorderWidth: z.number().int().min(0).max(10),
    }),
  });

const legacyAppearanceSchema = z.object({
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
      stops: gradientStops,
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
    headingFont: appearanceSchema.shape.typography.shape.headingFont,
    bodyFont: appearanceSchema.shape.typography.shape.bodyFont,
    headingSize: z.number().int().min(22).max(54),
    bodySize: z.number().int().min(12).max(22),
    weight: appearanceSchema.shape.typography.shape.weight,
    letterSpacing: z.number().min(-1).max(6),
    color: hexColor,
  }),
  layout: z.object({
    avatarShape: z.enum(["circle", "rounded", "square", "squircle", "hexagon"]),
    avatarSize: z.number().int().min(64).max(160),
    avatarBorderWidth: z.number().int().min(0).max(10),
    avatarBorderColor: hexColor,
    bioPlacement: appearanceSchema.shape.layout.shape.bioPlacement,
    alignment: z.enum(["left", "center"]),
    density: appearanceSchema.shape.layout.shape.density,
    contentWidth: z.number().int().min(320).max(860),
    socialPlacement: appearanceSchema.shape.layout.shape.socialPlacement,
  }),
  effects: z.object({
    cursor: appearanceSchema.shape.effects.shape.cursor,
    cursorColor: hexColor,
    trail: appearanceSchema.shape.effects.shape.trail,
    clickRipple: z.boolean(),
    entrance: appearanceSchema.shape.effects.shape.entrance,
    staggerMs: z.number().int().min(0).max(300),
    mouseParticles: appearanceSchema.shape.effects.shape.mouseParticles,
    cardTilt: appearanceSchema.shape.effects.shape.cardTilt,
    matrixRain: appearanceSchema.shape.effects.shape.matrixRain,
    crtFilter: appearanceSchema.shape.effects.shape.crtFilter,
    glitch: appearanceSchema.shape.effects.shape.glitch,
    scanlines: appearanceSchema.shape.effects.shape.scanlines,
  }),
  audio: appearanceSchema.shape.audio,
  socialProof: appearanceSchema.shape.socialProof,
  advanced: appearanceSchema.shape.advanced,
});

function migrateLegacyAppearance(
  value: z.infer<typeof legacyAppearanceSchema>,
) {
  return appearanceSchema.parse({
    ...DEFAULT_APPEARANCE,
    colors: {
      ...DEFAULT_APPEARANCE.colors,
      background: value.background.solidColor,
      backgroundSecondary: value.background.gradient.stops.at(-1)?.color,
      textPrimary: value.typography.color,
      username: value.typography.color,
      button: value.buttons.color,
      buttonText: value.buttons.textColor,
      cardBorder: value.layout.avatarBorderColor,
      shadow: value.buttons.shadowColor,
      accent: value.effects.cursorColor,
    },
    background: value.background,
    buttons: {
      shape: value.buttons.shape,
      radius: value.buttons.radius,
      fill: value.buttons.fill,
      height: value.buttons.height,
      spacing: value.buttons.spacing,
      hover: value.buttons.hover,
      press: value.buttons.press,
    },
    typography: {
      headingFont: value.typography.headingFont,
      bodyFont: value.typography.bodyFont,
      headingSize: value.typography.headingSize,
      bodySize: value.typography.bodySize,
      weight: value.typography.weight,
      letterSpacing: value.typography.letterSpacing,
      headingEffect: "none",
    },
    avatar: {
      ...DEFAULT_APPEARANCE.avatar,
      shape: value.layout.avatarShape,
      size: value.layout.avatarSize,
      borderWidth: value.layout.avatarBorderWidth,
    },
    layout: value.layout,
    effects: {
      cursor: value.effects.cursor,
      trail: value.effects.trail,
      clickRipple: value.effects.clickRipple,
      entrance: value.effects.entrance,
      staggerMs: value.effects.staggerMs,
      mouseParticles: value.effects.mouseParticles,
      cardTilt: value.effects.cardTilt,
      matrixRain: value.effects.matrixRain,
      crtFilter: value.effects.crtFilter,
      glitch: value.effects.glitch,
      scanlines: value.effects.scanlines,
    },
    audio: value.audio,
    socialProof: value.socialProof,
    advanced: value.advanced,
  });
}

function migrateV2Appearance(value: z.infer<typeof legacyV2AppearanceSchema>) {
  return appearanceSchema.parse({
    ...value,
    version: APPEARANCE_SETTINGS_VERSION,
    avatar: {
      ...DEFAULT_APPEARANCE.avatar,
      shape: value.layout.avatarShape,
      size: value.layout.avatarSize,
      borderWidth: value.layout.avatarBorderWidth,
    },
    layout: value.layout,
  });
}

export function parseAppearance(value: unknown): AppearanceSettings {
  const declaredVersion =
    value && typeof value === "object"
      ? (value as Record<string, unknown>).version
      : undefined;
  if (declaredVersion === APPEARANCE_SETTINGS_VERSION) {
    const current = appearanceSchema.safeParse(value);
    return current.success ? current.data : structuredClone(DEFAULT_APPEARANCE);
  }
  if (declaredVersion === 2) {
    const legacyV2 = legacyV2AppearanceSchema.safeParse(value);
    return legacyV2.success
      ? migrateV2Appearance(legacyV2.data)
      : structuredClone(DEFAULT_APPEARANCE);
  }
  const legacy = legacyAppearanceSchema.safeParse(value);
  if (legacy.success) return migrateLegacyAppearance(legacy.data);
  const current = appearanceSchema.safeParse(value);
  return current.success ? current.data : structuredClone(DEFAULT_APPEARANCE);
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

export const PROFILE_PRESETS = {
  frost: {
    label: "Frost Glass",
    description: "Yumuşak cam ve ferah yüzey",
    tier: "pro",
  },
  midnight: {
    label: "Midnight",
    description: "Koyu, sakin ve odaklı",
    tier: "pro",
  },
  cyber: {
    label: "Cyber Grid",
    description: "Neon renkler ve dijital enerji",
    tier: "pro",
  },
  terminal: {
    label: "Retro Terminal",
    description: "Monospace ve CRT karakteri",
    tier: "free",
  },
  minimal: {
    label: "Minimal White",
    description: "Sessiz ve tipografi odaklı",
    tier: "free",
  },
  neon: {
    label: "Neon Purple",
    description: "Mor neon, koyu cam ve güçlü parlama",
    tier: "pro",
  },
  pureBlack: {
    label: "Pure Black",
    description: "OLED siyahı ve keskin beyaz tipografi",
    tier: "free",
  },
  auroraGlow: {
    label: "Aurora Glow",
    description: "Kuzey ışıkları ve yumuşak cam yüzeyler",
    tier: "pro",
  },
  vaporwave: {
    label: "Vaporwave",
    description: "Pembe, mor ve okyanus mavisi nostaljisi",
    tier: "pro",
  },
  spotify: {
    label: "Spotify Inspired",
    description: "Müzik odaklı yeşil ve koyu yüzeyler",
    tier: "free",
  },
  discord: {
    label: "Discord Inspired",
    description: "Topluluk profilleri için tanıdık koyu palet",
    tier: "free",
  },
  y2k: {
    label: "Y2K Chrome",
    description: "Parlak dijital renkler ve milenyum enerjisi",
    tier: "pro",
  },
  brutal: {
    label: "Bold Brutal",
    description: "Kalın kenarlık, sert gölge ve yüksek kontrast",
    tier: "free",
  },
  ocean: {
    label: "Deep Ocean",
    description: "Derin mavi, turkuaz ve sakin kontrast",
    tier: "free",
  },
  sakura: {
    label: "Sakura",
    description: "Yumuşak pembe tonlar ve zarif tipografi",
    tier: "free",
  },
  sunset: {
    label: "Sunset Pop",
    description: "Turuncu, mercan ve mor gün batımı",
    tier: "free",
  },
  developer: {
    label: "Developer Dark",
    description: "Kod, proje ve teknik portfolyolar için",
    tier: "free",
  },
} as const;

export type ProfilePresetId = keyof typeof PROFILE_PRESETS;

type ColorThemePreset = {
  colors: Partial<AppearanceSettings["colors"]>;
  stops: AppearanceSettings["background"]["gradient"]["stops"];
  angle: number;
  mode?: "gradient" | "motion";
  card?: Partial<AppearanceSettings["card"]>;
  buttons?: Partial<AppearanceSettings["buttons"]>;
  avatar?: Partial<AppearanceSettings["avatar"]>;
  typography?: Partial<AppearanceSettings["typography"]>;
  layout?: Partial<AppearanceSettings["layout"]>;
  effects?: Partial<AppearanceSettings["effects"]>;
};

const COLOR_THEME_PRESETS = {
  neon: {
    colors: {
      primary: "#B026FF",
      secondary: "#FF2BD6",
      accent: "#00F0FF",
      background: "#080111",
      backgroundSecondary: "#24003B",
      card: "#160724",
      cardBorder: "#B026FF",
      textPrimary: "#FFFFFF",
      textSecondary: "#E8C7FF",
      textMuted: "#A88AB8",
      username: "#F4D7FF",
      button: "#220637",
      buttonText: "#FFFFFF",
      glow: "#FF2BD6",
      shadow: "#00F0FF",
      particle: "#00F0FF",
    },
    angle: 135,
    mode: "motion",
    stops: [
      { color: "#080111", position: 0 },
      { color: "#3D065F", position: 52 },
      { color: "#071C33", position: 100 },
    ],
    card: { enabled: true, opacity: 68, blur: 20, shadow: "glow" },
    buttons: { fill: "outline", hover: "glow", shape: "pill" },
    typography: { headingFont: "Space Grotesk", headingEffect: "glow" },
    effects: { mouseParticles: "subtle" },
  },
  pureBlack: {
    colors: {
      primary: "#FFFFFF",
      secondary: "#A3A3A3",
      accent: "#FFFFFF",
      background: "#000000",
      backgroundSecondary: "#111111",
      card: "#050505",
      cardBorder: "#333333",
      textPrimary: "#FFFFFF",
      textSecondary: "#D4D4D4",
      textMuted: "#858585",
      username: "#FFFFFF",
      button: "#FFFFFF",
      buttonText: "#000000",
      glow: "#FFFFFF",
      shadow: "#000000",
    },
    angle: 180,
    stops: [
      { color: "#111111", position: 0 },
      { color: "#000000", position: 100 },
    ],
    card: { enabled: false },
    buttons: { fill: "solid", shape: "pill", hover: "grow" },
    typography: { headingFont: "Space Grotesk", bodyFont: "Inter" },
  },
  auroraGlow: {
    colors: {
      primary: "#56F2C3",
      secondary: "#7A8CFF",
      accent: "#D16BFF",
      background: "#06131A",
      backgroundSecondary: "#15284A",
      card: "#0B1B25",
      cardBorder: "#56F2C3",
      textPrimary: "#F2FFFB",
      textSecondary: "#C3EDE0",
      textMuted: "#86AFA4",
      username: "#A6FFE4",
      button: "#12362F",
      buttonText: "#F2FFFB",
      glow: "#56F2C3",
      particle: "#D16BFF",
    },
    angle: 125,
    mode: "motion",
    stops: [
      { color: "#06131A", position: 0 },
      { color: "#174F4B", position: 46 },
      { color: "#39285E", position: 100 },
    ],
    card: { enabled: true, opacity: 55, blur: 28, shadow: "soft" },
    buttons: { fill: "glass", shape: "rounded" },
    avatar: { shape: "squircle", shadow: "glow" },
    typography: { headingEffect: "gradient" },
  },
  vaporwave: {
    colors: {
      primary: "#FF71CE",
      secondary: "#B967FF",
      accent: "#01CDFE",
      background: "#14072A",
      backgroundSecondary: "#3B176A",
      card: "#261142",
      cardBorder: "#FF71CE",
      textPrimary: "#FFF5FF",
      textSecondary: "#F1CCFF",
      textMuted: "#B99BC8",
      username: "#FFFB96",
      button: "#6B2D8F",
      buttonText: "#FFFFFF",
      glow: "#01CDFE",
      particle: "#FFFB96",
    },
    angle: 145,
    mode: "motion",
    stops: [
      { color: "#14072A", position: 0 },
      { color: "#752C8C", position: 52 },
      { color: "#075985", position: 100 },
    ],
    card: { enabled: true, opacity: 70, blur: 14, shadow: "glow" },
    buttons: { fill: "threeD", shape: "custom", radius: 12 },
    typography: { headingFont: "Space Grotesk", headingEffect: "gradient" },
    effects: { scanlines: true },
  },
  spotify: {
    colors: {
      primary: "#1DB954",
      secondary: "#1ED760",
      accent: "#1DB954",
      background: "#090909",
      backgroundSecondary: "#202020",
      card: "#181818",
      cardBorder: "#353535",
      textPrimary: "#FFFFFF",
      textSecondary: "#D7D7D7",
      textMuted: "#A7A7A7",
      username: "#FFFFFF",
      button: "#1DB954",
      buttonText: "#000000",
      glow: "#1DB954",
    },
    angle: 155,
    stops: [
      { color: "#1E4930", position: 0 },
      { color: "#090909", position: 68 },
      { color: "#000000", position: 100 },
    ],
    card: { enabled: true, opacity: 82, blur: 12, radius: 24 },
    buttons: { fill: "solid", shape: "pill", hover: "grow" },
    typography: { headingFont: "Manrope", bodyFont: "Inter" },
  },
  discord: {
    colors: {
      primary: "#5865F2",
      secondary: "#23A55A",
      accent: "#5865F2",
      background: "#1E1F22",
      backgroundSecondary: "#2B2D31",
      card: "#2B2D31",
      cardBorder: "#3F4147",
      textPrimary: "#F2F3F5",
      textSecondary: "#DBDEE1",
      textMuted: "#949BA4",
      username: "#FFFFFF",
      button: "#5865F2",
      buttonText: "#FFFFFF",
      glow: "#5865F2",
    },
    angle: 145,
    stops: [
      { color: "#313338", position: 0 },
      { color: "#1E1F22", position: 100 },
    ],
    card: { enabled: true, opacity: 96, blur: 0, radius: 12 },
    buttons: { fill: "solid", shape: "rounded", radius: 8 },
    avatar: { shape: "circle", shadow: "soft" },
    typography: { headingFont: "Inter", bodyFont: "Inter" },
  },
  y2k: {
    colors: {
      primary: "#C8FF00",
      secondary: "#FF4FD8",
      accent: "#67E8F9",
      background: "#E7E5FF",
      backgroundSecondary: "#B4A7FF",
      card: "#F7F6FF",
      cardBorder: "#2D1E4F",
      textPrimary: "#20143D",
      textSecondary: "#4C3675",
      textMuted: "#745F93",
      username: "#6C22E8",
      button: "#C8FF00",
      buttonText: "#20143D",
      glow: "#FF4FD8",
    },
    angle: 130,
    stops: [
      { color: "#E7E5FF", position: 0 },
      { color: "#FFB8EC", position: 50 },
      { color: "#A5F3FC", position: 100 },
    ],
    card: { enabled: true, opacity: 78, blur: 18, shadow: "hard" },
    buttons: { fill: "threeD", shape: "pill", hover: "tilt" },
    avatar: { shape: "squircle", hover: "tilt" },
    typography: { headingFont: "Space Grotesk", headingEffect: "gradient" },
  },
  brutal: {
    colors: {
      primary: "#FF5C35",
      secondary: "#FFE600",
      accent: "#2B59FF",
      background: "#FFF3CA",
      backgroundSecondary: "#FFE600",
      card: "#FFFFFF",
      cardBorder: "#111111",
      textPrimary: "#111111",
      textSecondary: "#222222",
      textMuted: "#555555",
      username: "#111111",
      button: "#FF5C35",
      buttonText: "#111111",
      shadow: "#111111",
    },
    angle: 135,
    stops: [
      { color: "#FFF3CA", position: 0 },
      { color: "#FFE600", position: 100 },
    ],
    card: {
      enabled: true,
      opacity: 100,
      blur: 0,
      radius: 4,
      borderWidth: 3,
      shadow: "hard",
    },
    buttons: { fill: "threeD", shape: "square", hover: "lift" },
    avatar: { shape: "square", shadow: "hard" },
    typography: { headingFont: "Space Grotesk", bodyFont: "Manrope" },
  },
  ocean: {
    colors: {
      primary: "#22D3EE",
      secondary: "#38BDF8",
      accent: "#2DD4BF",
      background: "#031525",
      backgroundSecondary: "#063B5C",
      card: "#092D42",
      cardBorder: "#22D3EE",
      textPrimary: "#ECFEFF",
      textSecondary: "#BAE6FD",
      textMuted: "#7DD3FC",
      username: "#67E8F9",
      button: "#0E7490",
      buttonText: "#ECFEFF",
      glow: "#22D3EE",
    },
    angle: 165,
    stops: [
      { color: "#0E7490", position: 0 },
      { color: "#063B5C", position: 48 },
      { color: "#031525", position: 100 },
    ],
    card: { enabled: true, opacity: 66, blur: 18 },
    buttons: { fill: "glass", shape: "rounded" },
    typography: { headingEffect: "gradient" },
  },
  sakura: {
    colors: {
      primary: "#E85D8E",
      secondary: "#F5A9C7",
      accent: "#8C5A7C",
      background: "#FFF0F5",
      backgroundSecondary: "#FFD6E5",
      card: "#FFF9FB",
      cardBorder: "#F5A9C7",
      textPrimary: "#4E293A",
      textSecondary: "#714357",
      textMuted: "#9E7185",
      username: "#B73E6D",
      button: "#E85D8E",
      buttonText: "#FFFFFF",
      glow: "#F5A9C7",
    },
    angle: 145,
    stops: [
      { color: "#FFF0F5", position: 0 },
      { color: "#FFD6E5", position: 58 },
      { color: "#E9D5FF", position: 100 },
    ],
    card: { enabled: true, opacity: 76, blur: 14, radius: 36 },
    buttons: { fill: "glass", shape: "pill" },
    avatar: { shape: "circle", shadow: "soft" },
    typography: { headingFont: "Fraunces" },
  },
  sunset: {
    colors: {
      primary: "#FF6B35",
      secondary: "#FFB703",
      accent: "#8338EC",
      background: "#2B123C",
      backgroundSecondary: "#7A2E4D",
      card: "#3A1748",
      cardBorder: "#FF8C69",
      textPrimary: "#FFF7ED",
      textSecondary: "#FED7AA",
      textMuted: "#E2A88B",
      username: "#FFB703",
      button: "#FF6B35",
      buttonText: "#FFFFFF",
      glow: "#FFB703",
    },
    angle: 145,
    stops: [
      { color: "#FF6B35", position: 0 },
      { color: "#9D174D", position: 48 },
      { color: "#2B123C", position: 100 },
    ],
    card: { enabled: true, opacity: 64, blur: 18 },
    buttons: { fill: "solid", shape: "pill", hover: "lift" },
    typography: { headingEffect: "gradient" },
  },
  developer: {
    colors: {
      primary: "#58A6FF",
      secondary: "#3FB950",
      accent: "#D2A8FF",
      background: "#0D1117",
      backgroundSecondary: "#161B22",
      card: "#161B22",
      cardBorder: "#30363D",
      textPrimary: "#F0F6FC",
      textSecondary: "#C9D1D9",
      textMuted: "#8B949E",
      username: "#58A6FF",
      button: "#21262D",
      buttonText: "#F0F6FC",
      glow: "#58A6FF",
    },
    angle: 150,
    stops: [
      { color: "#161B22", position: 0 },
      { color: "#0D1117", position: 100 },
    ],
    card: { enabled: true, opacity: 98, blur: 0, radius: 10 },
    buttons: { fill: "outline", shape: "rounded", radius: 8 },
    avatar: { shape: "rounded", shadow: "none" },
    typography: { headingFont: "Space Grotesk", bodyFont: "Roboto Mono" },
    layout: { alignment: "left", mobileAlignment: "left" },
  },
} as const satisfies Record<
  Exclude<
    ProfilePresetId,
    "frost" | "midnight" | "cyber" | "terminal" | "minimal"
  >,
  ColorThemePreset
>;

export function applyAppearancePreset(
  current: AppearanceSettings,
  preset: ProfilePresetId,
): AppearanceSettings {
  const next = structuredClone(current);
  next.preset = preset;
  next.background = structuredClone(DEFAULT_APPEARANCE.background);
  next.card = structuredClone(DEFAULT_APPEARANCE.card);
  next.avatar = structuredClone(DEFAULT_APPEARANCE.avatar);
  next.buttons = structuredClone(DEFAULT_APPEARANCE.buttons);
  next.typography = structuredClone(DEFAULT_APPEARANCE.typography);
  next.layout = structuredClone(DEFAULT_APPEARANCE.layout);
  next.effects = structuredClone(DEFAULT_APPEARANCE.effects);
  if (preset in COLOR_THEME_PRESETS) {
    const definition: ColorThemePreset =
      COLOR_THEME_PRESETS[preset as keyof typeof COLOR_THEME_PRESETS];
    next.colors = { ...next.colors, ...definition.colors };
    next.background = {
      ...next.background,
      mode: definition.mode ?? "gradient",
      preset: "custom",
      gradient: {
        type: "linear",
        angle: definition.angle,
        stops: structuredClone(definition.stops),
      },
    };
    next.card = { ...next.card, ...(definition.card ?? {}) };
    next.buttons = { ...next.buttons, ...(definition.buttons ?? {}) };
    next.avatar = { ...next.avatar, ...(definition.avatar ?? {}) };
    next.typography = {
      ...next.typography,
      ...(definition.typography ?? {}),
    };
    next.layout = { ...next.layout, ...(definition.layout ?? {}) };
    next.effects = { ...next.effects, ...(definition.effects ?? {}) };
    return next;
  }
  if (preset === "frost") {
    next.colors = {
      ...DEFAULT_APPEARANCE.colors,
      background: "#DDEFE8",
      backgroundSecondary: "#F5F0DE",
    };
    next.background = {
      ...next.background,
      mode: "gradient",
      preset: "mint",
      gradient: {
        type: BACKGROUND_PRESETS.mint.type ?? "linear",
        angle: BACKGROUND_PRESETS.mint.angle ?? 155,
        stops: structuredClone(BACKGROUND_PRESETS.mint.stops!),
      },
    };
    next.card = {
      enabled: true,
      opacity: 58,
      blur: 24,
      radius: 32,
      borderWidth: 1,
      borderStyle: "solid",
      shadow: "soft",
      hover: "lift",
      padding: 28,
    };
    next.buttons = { ...next.buttons, fill: "glass", shape: "rounded" };
    next.avatar = { ...next.avatar, shape: "rounded", shadow: "soft" };
    next.typography = {
      ...next.typography,
      headingFont: "Fraunces",
      bodyFont: "Manrope",
      headingEffect: "none",
    };
    return next;
  }
  if (preset === "midnight") {
    next.colors = {
      ...next.colors,
      background: "#090F1F",
      backgroundSecondary: "#273552",
      card: "#121C32",
      cardBorder: "#33415F",
      textPrimary: "#F7FAFF",
      textSecondary: "#CFD8EB",
      textMuted: "#93A0BC",
      username: "#F7FAFF",
      button: "#EEF3FF",
      buttonText: "#090F1F",
      glow: "#6C8CFF",
      shadow: "#050812",
    };
    next.background = {
      ...next.background,
      mode: "gradient",
      preset: "midnight",
      gradient: {
        type: BACKGROUND_PRESETS.midnight.type ?? "radial",
        angle: BACKGROUND_PRESETS.midnight.angle ?? 180,
        stops: structuredClone(BACKGROUND_PRESETS.midnight.stops!),
      },
    };
    next.card = {
      ...next.card,
      enabled: true,
      opacity: 72,
      blur: 20,
      shadow: "soft",
    };
    next.buttons = { ...next.buttons, fill: "solid", shape: "pill" };
    next.avatar = { ...next.avatar, shadow: "soft" };
    return next;
  }
  if (preset === "cyber") {
    next.colors = {
      ...next.colors,
      primary: "#FF3CAC",
      secondary: "#00E5FF",
      accent: "#7CFF6B",
      background: "#05030D",
      backgroundSecondary: "#16102A",
      card: "#0D0920",
      cardBorder: "#00E5FF",
      textPrimary: "#F9F7FF",
      textSecondary: "#CFC7E8",
      textMuted: "#8E84AA",
      username: "#00E5FF",
      button: "#120B2B",
      buttonText: "#FFFFFF",
      glow: "#FF3CAC",
      shadow: "#00E5FF",
      particle: "#7CFF6B",
    };
    next.background = {
      ...next.background,
      mode: "motion",
      preset: "aurora",
      gradient: {
        type: "linear",
        angle: 135,
        stops: [
          { color: "#05030D", position: 0 },
          { color: "#241044", position: 52 },
          { color: "#003844", position: 100 },
        ],
      },
    };
    next.card = {
      enabled: true,
      opacity: 72,
      blur: 14,
      radius: 18,
      borderWidth: 1,
      borderStyle: "solid",
      shadow: "glow",
      hover: "glow",
      padding: 28,
    };
    next.buttons = {
      ...next.buttons,
      fill: "outline",
      shape: "custom",
      radius: 10,
      hover: "glow",
    };
    next.avatar = {
      ...next.avatar,
      shape: "squircle",
      shadow: "glow",
      hover: "glow",
    };
    next.typography = {
      ...next.typography,
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      headingEffect: "glow",
    };
    next.effects = {
      ...next.effects,
      scanlines: true,
      mouseParticles: "subtle",
    };
    return next;
  }
  if (preset === "terminal") {
    next.colors = {
      ...next.colors,
      primary: "#5CFF8A",
      secondary: "#B7FFCA",
      accent: "#5CFF8A",
      background: "#020805",
      backgroundSecondary: "#06130B",
      card: "#031009",
      cardBorder: "#2AD95B",
      textPrimary: "#B7FFCA",
      textSecondary: "#76D990",
      textMuted: "#4B9660",
      username: "#5CFF8A",
      button: "#06130B",
      buttonText: "#B7FFCA",
      glow: "#5CFF8A",
      shadow: "#010402",
      particle: "#5CFF8A",
    };
    next.background = { ...next.background, mode: "solid", preset: "custom" };
    next.card = {
      enabled: true,
      opacity: 90,
      blur: 0,
      radius: 8,
      borderWidth: 1,
      borderStyle: "solid",
      shadow: "hard",
      hover: "lift",
      padding: 24,
    };
    next.buttons = {
      ...next.buttons,
      fill: "outline",
      shape: "square",
      hover: "lift",
    };
    next.avatar = {
      ...next.avatar,
      shape: "square",
      shadow: "hard",
      borderStyle: "double",
    };
    next.typography = {
      ...next.typography,
      headingFont: "Manrope",
      bodyFont: "Roboto Mono",
      headingEffect: "glow",
    };
    next.layout.template = "terminal";
    return next;
  }
  next.colors = {
    ...DEFAULT_APPEARANCE.colors,
    background: "#FFFFFF",
    backgroundSecondary: "#F5F5F2",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardBorder: "#E4E5DF",
  };
  next.background = { ...next.background, mode: "solid", preset: "custom" };
  next.card = {
    enabled: false,
    opacity: 100,
    blur: 0,
    radius: 0,
    borderWidth: 0,
    borderStyle: "solid",
    shadow: "none",
    hover: "none",
    padding: 24,
  };
  next.buttons = {
    ...next.buttons,
    fill: "outline",
    shape: "pill",
    hover: "lift",
  };
  next.avatar = { ...next.avatar, shadow: "none" };
  next.typography = {
    ...next.typography,
    headingFont: "Manrope",
    bodyFont: "Manrope",
    headingEffect: "none",
  };
  next.effects = {
    ...next.effects,
    scanlines: false,
    crtFilter: false,
    mouseParticles: "off",
  };
  return next;
}

export function appearanceBackground(settings: AppearanceSettings) {
  const { background, colors } = settings;
  if (background.mode === "solid")
    return { backgroundColor: colors.background };
  if (background.mode === "image")
    return {
      backgroundColor: colors.background,
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
      backgroundSize: background.fit,
      backgroundPosition: background.position,
      backgroundRepeat: "no-repeat",
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
        : gradient.type === "conic"
          ? `conic-gradient(from ${gradient.angle}deg, ${stops})`
          : `linear-gradient(${gradient.angle}deg, ${stops})`,
  };
}

export function appearanceBackgroundEffects(
  settings: AppearanceSettings,
): CSSProperties {
  const background = settings.background;
  return {
    filter: `blur(${background.blur}px) brightness(${background.brightness}%) contrast(${background.contrast}%) saturate(${background.saturation}%) hue-rotate(${background.hueRotate}deg)`,
    transform: `scale(${background.scale / 100})`,
    transformOrigin: "center",
  };
}

export function appearanceVideoOverlay(settings: AppearanceSettings) {
  return {
    backgroundColor: settings.background.overlayColor,
    opacity: settings.background.overlayOpacity / 100,
  } satisfies CSSProperties;
}

export function appearanceCssVariables(settings: AppearanceSettings) {
  const colors = settings.colors;
  return {
    "--color-primary": colors.primary,
    "--color-secondary": colors.secondary,
    "--color-accent": colors.accent,
    "--color-background": colors.background,
    "--color-background-secondary": colors.backgroundSecondary,
    "--color-surface": colors.surface,
    "--color-surface-hover": colors.surfaceHover,
    "--color-card": colors.card,
    "--color-card-border": colors.cardBorder,
    "--color-text-primary": colors.textPrimary,
    "--color-text-secondary": colors.textSecondary,
    "--color-text-muted": colors.textMuted,
    "--color-icon": colors.icon,
    "--color-link": colors.link,
    "--color-link-hover": colors.linkHover,
    "--color-glow": colors.glow,
    "--color-shadow": colors.shadow,
    "--color-particle": colors.particle,
    "--color-username": colors.username,
    "--color-badge": colors.badge,
    "--color-button": colors.button,
    "--color-button-text": colors.buttonText,
  } as CSSProperties;
}

export function appearanceLayoutVariables(settings: AppearanceSettings) {
  return {
    "--olnk-page-padding": `${settings.layout.pagePadding}px`,
    "--olnk-mobile-page-padding": `${settings.layout.mobilePagePadding}px`,
  } as CSSProperties;
}

export function appearanceCardStyle(
  settings: AppearanceSettings,
): CSSProperties {
  if (!settings.card.enabled) return {};
  const { card, colors } = settings;
  const shadows = {
    none: "none",
    soft: `0 24px 70px color-mix(in srgb, ${colors.shadow} 24%, transparent)`,
    hard: `8px 10px 0 ${colors.shadow}`,
    glow: `0 0 40px color-mix(in srgb, ${colors.glow} 52%, transparent)`,
  };
  return {
    padding: card.padding,
    borderRadius: card.radius,
    border: `${card.borderWidth}px ${card.borderStyle} ${colors.cardBorder}`,
    background: `color-mix(in srgb, ${colors.card} ${card.opacity}%, transparent)`,
    backdropFilter: `blur(${card.blur}px)`,
    WebkitBackdropFilter: `blur(${card.blur}px)`,
    boxShadow: shadows[card.shadow],
  };
}
