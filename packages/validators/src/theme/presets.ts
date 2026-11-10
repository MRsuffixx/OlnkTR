import type { ThemeConfig } from "./schema";

/**
 * System theme presets. Each preset is a complete v2 config plus catalogue
 * metadata. `pnpm db:seed` syncs them into `themes`/`theme_versions`: new keys
 * are inserted and a changed config becomes a new immutable version, so
 * profiles pinned to an older version keep rendering unchanged.
 *
 * Presets differ in typography, shape language, density, card treatment and
 * background — not only in color.
 */
export const THEME_CATEGORIES = ["minimal", "editorial", "bold", "dark", "business"] as const;
export type ThemeCategory = (typeof THEME_CATEGORIES)[number];

export interface ThemePreset {
  key: string;
  name: string;
  description: string;
  category: ThemeCategory;
  author: string;
  isPremium: boolean;
  config: ThemeConfig;
}

type DeepPartialConfig = {
  [S in Exclude<keyof ThemeConfig, "schemaVersion">]?: Partial<ThemeConfig[S]>;
};

const MINIMAL: ThemeConfig = {
  schemaVersion: 2,
  colors: {
    primary: "#16181d",
    secondary: "#eef0f3",
    accent: "#2f6fed",
    background: "#ffffff",
    surface: "#f4f5f7",
    text: "#16181d",
    mutedText: "#5b616e",
    border: "#e2e5ea",
    link: "#2f6fed",
    button: "#16181d",
    buttonText: "#ffffff",
  },
  typography: {
    headingFont: "inter",
    bodyFont: "inter",
    baseSize: 16,
    headingWeight: 600,
    bodyWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    headingLetterSpacing: -0.02,
    headingCase: "none",
  },
  background: { type: "solid" },
  buttons: {
    variant: "filled",
    radius: 10,
    size: "md",
    borderWidth: 0,
    shadow: "none",
    hover: "tint",
    iconPlacement: "start",
    textAlign: "center",
  },
  cards: {
    style: "outlined",
    radius: 12,
    borderWidth: 1,
    shadow: "none",
    padding: "md",
    hover: "none",
    layout: "stacked",
  },
  layout: {
    contentWidth: "regular",
    alignment: "center",
    blockGap: 10,
    sectionGap: 28,
    avatarSize: 88,
    avatarShape: "circle",
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

function derive(
  overrides: DeepPartialConfig & { background?: ThemeConfig["background"] },
): ThemeConfig {
  return {
    schemaVersion: 2,
    colors: { ...MINIMAL.colors, ...overrides.colors },
    typography: { ...MINIMAL.typography, ...overrides.typography },
    background:
      (overrides.background) ?? MINIMAL.background,
    buttons: { ...MINIMAL.buttons, ...overrides.buttons },
    cards: { ...MINIMAL.cards, ...overrides.cards },
    layout: { ...MINIMAL.layout, ...overrides.layout },
    effects: { ...MINIMAL.effects, ...overrides.effects },
  };
}

export const THEME_PRESETS: readonly ThemePreset[] = [
  {
    key: "minimal",
    name: "Minimal",
    description: "Quiet, neutral and fast to read. Lets your links do the talking.",
    category: "minimal",
    author: "OlnkTR",
    isPremium: false,
    config: MINIMAL,
  },
  {
    key: "editorial",
    name: "Editorial",
    description: "A left-aligned reading column with a serif voice and ruled links.",
    category: "editorial",
    author: "OlnkTR",
    isPremium: false,
    config: derive({
      colors: {
        primary: "#1d1b18",
        secondary: "#ecebe6",
        accent: "#9e2a1c",
        background: "#f6f6f2",
        surface: "#ecebe6",
        text: "#1d1b18",
        mutedText: "#5f5a52",
        border: "#cfccc3",
        link: "#9e2a1c",
        button: "#1d1b18",
        buttonText: "#f6f6f2",
      },
      typography: {
        headingFont: "newsreader",
        bodyFont: "newsreader",
        baseSize: 17,
        headingWeight: 500,
        lineHeight: 1.65,
        headingLetterSpacing: -0.01,
      },
      buttons: {
        variant: "ghost",
        radius: 0,
        borderWidth: 1,
        hover: "tint",
        iconPlacement: "end",
        textAlign: "start",
      },
      cards: { style: "flat", radius: 0, borderWidth: 0, padding: "sm" },
      layout: {
        alignment: "start",
        blockGap: 0,
        sectionGap: 40,
        avatarSize: 64,
        avatarShape: "square",
        header: "minimal",
      },
      effects: { decoration: "rule" },
    }),
  },
  {
    key: "creator",
    name: "Creator",
    description: "Loud yellow, chunky pills and hard shadows for personalities that pop.",
    category: "bold",
    author: "OlnkTR",
    isPremium: false,
    config: derive({
      colors: {
        primary: "#141414",
        secondary: "#fff3b0",
        accent: "#ff5c39",
        background: "#ffe14d",
        surface: "#fff7cc",
        text: "#141414",
        mutedText: "#3d3a2c",
        border: "#141414",
        link: "#141414",
        button: "#141414",
        buttonText: "#ffe14d",
      },
      typography: {
        headingFont: "bricolage",
        bodyFont: "dm-sans",
        headingWeight: 800,
        bodyWeight: 500,
        headingLetterSpacing: -0.03,
      },
      buttons: { radius: 999, size: "lg", borderWidth: 2, shadow: "hard", hover: "lift" },
      cards: { style: "elevated", radius: 20, borderWidth: 2, shadow: "hard", hover: "lift" },
      layout: { blockGap: 14, avatarSize: 112, sectionGap: 24 },
      effects: { entrance: "rise" },
    }),
  },
  {
    key: "professional",
    name: "Professional",
    description: "Crisp cover header, compact rhythm and a trustworthy blue.",
    category: "business",
    author: "OlnkTR",
    isPremium: false,
    config: derive({
      colors: {
        primary: "#0f1b2d",
        secondary: "#e8edf6",
        accent: "#1f4ed8",
        background: "#f3f5f9",
        surface: "#ffffff",
        text: "#0f1b2d",
        mutedText: "#4f5d75",
        border: "#d9dfea",
        link: "#1f4ed8",
        button: "#1f4ed8",
        buttonText: "#ffffff",
      },
      typography: { headingFont: "manrope", bodyFont: "manrope", headingWeight: 700, baseSize: 15 },
      buttons: { radius: 8, size: "md", shadow: "soft", hover: "lift" },
      cards: { style: "elevated", radius: 10, borderWidth: 0, shadow: "soft" },
      layout: { density: "compact", blockGap: 8, header: "cover", avatarSize: 96 },
    }),
  },
  {
    key: "glass",
    name: "Glass",
    description: "Frosted panels floating on a deep ink glow.",
    category: "dark",
    author: "OlnkTR",
    isPremium: true,
    config: derive({
      colors: {
        primary: "#ffffff",
        secondary: "#2b3566",
        accent: "#8fb4ff",
        background: "#0f1733",
        surface: "#1c2550",
        text: "#f4f6ff",
        mutedText: "#b6bfdf",
        border: "#3a4682",
        link: "#8fb4ff",
        button: "#ffffff",
        buttonText: "#0f1733",
      },
      typography: {
        headingFont: "manrope",
        bodyFont: "inter",
        headingWeight: 500,
        headingLetterSpacing: -0.01,
      },
      background: { type: "gradient", kind: "radial", from: "#3a3f9e", to: "#0b1027", angle: 180 },
      buttons: { variant: "soft", radius: 16, borderWidth: 1, hover: "grow" },
      cards: { style: "glass", radius: 20, borderWidth: 1 },
      layout: { avatarSize: 100 },
      effects: { backgroundEffect: "glow", entrance: "fade" },
    }),
  },
  {
    key: "gradient",
    name: "Gradient",
    description: "A deep teal wash with soft white pills.",
    category: "bold",
    author: "OlnkTR",
    isPremium: false,
    config: derive({
      colors: {
        primary: "#ffffff",
        secondary: "#bfe6e1",
        accent: "#ffd166",
        background: "#0f4c5c",
        surface: "#16606f",
        text: "#ffffff",
        mutedText: "#cfeae6",
        border: "#4c97a0",
        link: "#ffd166",
        button: "#ffffff",
        buttonText: "#0f4c5c",
      },
      typography: { headingFont: "dm-sans", bodyFont: "dm-sans", headingWeight: 700 },
      background: { type: "gradient", kind: "linear", from: "#0f4c5c", to: "#3fa7a0", angle: 160 },
      buttons: { radius: 999, shadow: "medium", hover: "lift" },
      cards: { style: "tinted", radius: 18, borderWidth: 0 },
    }),
  },
  {
    key: "neon",
    name: "Neon",
    description: "Outlined cyan on a magenta grid — built for the night.",
    category: "dark",
    author: "OlnkTR",
    isPremium: true,
    config: derive({
      colors: {
        primary: "#00f0ff",
        secondary: "#1b1030",
        accent: "#ff2bd6",
        background: "#0b0814",
        surface: "#150f24",
        text: "#f4f1ff",
        mutedText: "#b7aed6",
        border: "#3d2b66",
        link: "#00f0ff",
        button: "#00f0ff",
        buttonText: "#0b0814",
      },
      typography: {
        headingFont: "unbounded",
        bodyFont: "space-grotesk",
        headingWeight: 700,
        headingCase: "uppercase",
        headingLetterSpacing: 0.04,
        baseSize: 15,
      },
      background: { type: "pattern", pattern: "grid", color: "#ff2bd6", opacity: 14, scale: 28 },
      buttons: { variant: "outline", radius: 6, borderWidth: 2, hover: "tint", size: "lg" },
      cards: { style: "outlined", radius: 6, borderWidth: 2 },
      effects: { backgroundEffect: "glow", entrance: "fade" },
    }),
  },
  {
    key: "gaming",
    name: "Gaming",
    description: "Sharp corners, heavy caps and an ember-orange call to action.",
    category: "dark",
    author: "OlnkTR",
    isPremium: true,
    config: derive({
      colors: {
        primary: "#ff7a1a",
        secondary: "#23252f",
        accent: "#ff7a1a",
        background: "#14151b",
        surface: "#1d1f27",
        text: "#f2f3f5",
        mutedText: "#a3a7b3",
        border: "#33363f",
        link: "#ff9a4d",
        button: "#ff7a1a",
        buttonText: "#14151b",
      },
      typography: {
        headingFont: "syne",
        bodyFont: "space-grotesk",
        headingWeight: 800,
        headingCase: "uppercase",
        headingLetterSpacing: 0.02,
        bodyWeight: 500,
      },
      background: { type: "pattern", pattern: "diagonal", color: "#ff7a1a", opacity: 6, scale: 14 },
      buttons: {
        radius: 2,
        size: "lg",
        shadow: "hard",
        hover: "lift",
        textAlign: "start",
        iconPlacement: "end",
      },
      cards: { style: "outlined", radius: 2, borderWidth: 2, hover: "lift" },
      layout: { header: "cover", avatarShape: "square", avatarSize: 104 },
      effects: { backgroundEffect: "vignette" },
    }),
  },
  {
    key: "portfolio",
    name: "Portfolio",
    description: "Wide, left-aligned and generous — a calm frame for your work.",
    category: "minimal",
    author: "OlnkTR",
    isPremium: false,
    config: derive({
      colors: {
        primary: "#111214",
        secondary: "#f0f0ee",
        accent: "#111214",
        background: "#fdfdfc",
        surface: "#f2f2f0",
        text: "#111214",
        mutedText: "#696b70",
        border: "#dcdcd8",
        link: "#111214",
        button: "#111214",
        buttonText: "#fdfdfc",
      },
      typography: {
        headingFont: "space-grotesk",
        bodyFont: "inter",
        headingWeight: 500,
        headingLetterSpacing: -0.03,
        lineHeight: 1.6,
      },
      buttons: {
        variant: "ghost",
        radius: 0,
        borderWidth: 1,
        textAlign: "start",
        iconPlacement: "end",
        hover: "tint",
      },
      cards: { style: "flat", radius: 0, borderWidth: 0, layout: "inline", padding: "sm" },
      layout: {
        contentWidth: "wide",
        alignment: "start",
        header: "minimal",
        avatarShape: "square",
        avatarSize: 56,
        density: "spacious",
        blockGap: 6,
        sectionGap: 48,
      },
    }),
  },
  {
    key: "elegant",
    name: "Elegant",
    description: "Espresso and brass, set in Cormorant with a fine frame.",
    category: "editorial",
    author: "OlnkTR",
    isPremium: true,
    config: derive({
      colors: {
        primary: "#c9a96e",
        secondary: "#3a332e",
        accent: "#c9a96e",
        background: "#2a2522",
        surface: "#332d29",
        text: "#efe6da",
        mutedText: "#b9ab98",
        border: "#5a4e43",
        link: "#d9bf8c",
        button: "#c9a96e",
        buttonText: "#2a2522",
      },
      typography: {
        headingFont: "cormorant",
        bodyFont: "newsreader",
        headingWeight: 500,
        headingLetterSpacing: 0.06,
        headingCase: "uppercase",
        lineHeight: 1.6,
        baseSize: 16,
      },
      buttons: { variant: "outline", radius: 2, borderWidth: 1, hover: "tint" },
      cards: { style: "outlined", radius: 2, borderWidth: 1 },
      layout: { avatarSize: 120, sectionGap: 36, blockGap: 12 },
      effects: { decoration: "frame", entrance: "fade" },
    }),
  },
];

/** The fallback theme for profiles without a theme. */
export const DEFAULT_THEME_KEY = "minimal";
export const DEFAULT_THEME_CONFIG: ThemeConfig = MINIMAL;

export function findThemePreset(key: string | null | undefined): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.key === key);
}
