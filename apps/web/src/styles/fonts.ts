import {
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  JetBrains_Mono,
  Manrope,
  Newsreader,
  Playfair_Display,
  Schibsted_Grotesk,
  Space_Grotesk,
  Syne,
  Unbounded,
} from "next/font/google";
import type { ThemeFontKey } from "@olnktr/validators/theme";

// next/font requires literal option objects in every call.
/**
 * Self-hosted fonts (next/font downloads them at build time, so profiles never
 * request third-party font CSS). Each family only defines a CSS variable; the
 * browser downloads a font file only when a theme actually uses that family.
 * `preload: false` keeps unused families off the critical path.
 */

/** Studio UI typeface. */
const studio = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-studio",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-inter",
});
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-manrope",
});
const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-dm-sans",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-space-grotesk",
});
const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-bricolage",
});
const syne = Syne({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-syne",
});
const unbounded = Unbounded({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-unbounded",
});
const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});
const playfair = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-newsreader",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
  variable: "--font-jetbrains-mono",
});

export const fontVariables = [
  studio,
  inter,
  manrope,
  dmSans,
  spaceGrotesk,
  bricolage,
  syne,
  unbounded,
  fraunces,
  playfair,
  cormorant,
  newsreader,
  jetbrains,
]
  .map((font) => font.variable)
  .join(" ");

/** CSS variable holding each theme font key's self-hosted family. */
export const THEME_FONT_VARIABLES: Record<Exclude<ThemeFontKey, "system">, string> = {
  inter: "--font-inter",
  manrope: "--font-manrope",
  "dm-sans": "--font-dm-sans",
  "space-grotesk": "--font-space-grotesk",
  bricolage: "--font-bricolage",
  syne: "--font-syne",
  unbounded: "--font-unbounded",
  fraunces: "--font-fraunces",
  playfair: "--font-playfair",
  cormorant: "--font-cormorant",
  newsreader: "--font-newsreader",
  "jetbrains-mono": "--font-jetbrains-mono",
};
