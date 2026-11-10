/**
 * Curated font catalogue for profile themes. Themes reference fonts by key
 * only; the web app maps each key to a self-hosted font (next/font) so
 * profiles never load third-party font CSS. Every family supports Latin
 * Extended (Turkish characters).
 */
export const THEME_FONTS = {
  system: { label: "System", category: "sans", fallback: "ui-sans-serif, system-ui, sans-serif" },
  inter: { label: "Inter", category: "sans", fallback: "ui-sans-serif, system-ui, sans-serif" },
  manrope: { label: "Manrope", category: "sans", fallback: "ui-sans-serif, system-ui, sans-serif" },
  "dm-sans": {
    label: "DM Sans",
    category: "sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  "space-grotesk": {
    label: "Space Grotesk",
    category: "sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  bricolage: {
    label: "Bricolage Grotesque",
    category: "display",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  syne: { label: "Syne", category: "display", fallback: "ui-sans-serif, system-ui, sans-serif" },
  unbounded: {
    label: "Unbounded",
    category: "display",
    fallback: "ui-sans-serif, system-ui, sans-serif",
  },
  fraunces: { label: "Fraunces", category: "serif", fallback: "ui-serif, Georgia, serif" },
  playfair: { label: "Playfair Display", category: "serif", fallback: "ui-serif, Georgia, serif" },
  cormorant: {
    label: "Cormorant Garamond",
    category: "serif",
    fallback: "ui-serif, Georgia, serif",
  },
  newsreader: { label: "Newsreader", category: "serif", fallback: "ui-serif, Georgia, serif" },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    category: "mono",
    fallback: "ui-monospace, SFMono-Regular, monospace",
  },
} as const satisfies Record<
  string,
  { label: string; category: "sans" | "serif" | "display" | "mono"; fallback: string }
>;

export type ThemeFontKey = keyof typeof THEME_FONTS;
export const THEME_FONT_KEYS = Object.keys(THEME_FONTS) as [ThemeFontKey, ...ThemeFontKey[]];
