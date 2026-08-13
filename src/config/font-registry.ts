import { z } from "zod";

export const HEADING_FONT_IDS = [
  "Fraunces",
  "Manrope",
  "Space Grotesk",
  "Playfair Display",
  "DM Serif Display",
  "Bebas Neue",
] as const;

export const BODY_FONT_IDS = [
  "Manrope",
  "Fraunces",
  "Inter",
  "Montserrat",
  "Lora",
  "Roboto Mono",
] as const;

export const PROFILE_FONT_IDS = [
  "Fraunces",
  "Manrope",
  "Space Grotesk",
  "Playfair Display",
  "DM Serif Display",
  "Bebas Neue",
  "Inter",
  "Montserrat",
  "Lora",
  "Roboto Mono",
] as const;

export const LINK_FONT_IDS = ["inherit", ...BODY_FONT_IDS] as const;

export const headingFontSchema = z.enum(HEADING_FONT_IDS);
export const bodyFontSchema = z.enum(BODY_FONT_IDS);
export const linkFontSchema = z.enum(LINK_FONT_IDS);

export type ProfileFontId = (typeof PROFILE_FONT_IDS)[number];

type FontDefinition = {
  label: string;
  family: string;
  category: "sans" | "serif" | "display" | "mono";
  tier: "free" | "pro";
};

export const FONT_REGISTRY = {
  Fraunces: {
    label: "Fraunces",
    family: "var(--font-fraunces), serif",
    category: "serif",
    tier: "free",
  },
  Manrope: {
    label: "Manrope",
    family: "var(--font-manrope), sans-serif",
    category: "sans",
    tier: "free",
  },
  "Space Grotesk": {
    label: "Space Grotesk",
    family: "var(--font-space-grotesk), sans-serif",
    category: "display",
    tier: "pro",
  },
  "Playfair Display": {
    label: "Playfair Display",
    family: "var(--font-playfair), serif",
    category: "serif",
    tier: "pro",
  },
  "DM Serif Display": {
    label: "DM Serif Display",
    family: "var(--font-dm-serif), serif",
    category: "display",
    tier: "pro",
  },
  "Bebas Neue": {
    label: "Bebas Neue",
    family: "var(--font-bebas), sans-serif",
    category: "display",
    tier: "pro",
  },
  Inter: {
    label: "Inter",
    family: "var(--font-inter), sans-serif",
    category: "sans",
    tier: "free",
  },
  Montserrat: {
    label: "Montserrat",
    family: "var(--font-montserrat), sans-serif",
    category: "sans",
    tier: "pro",
  },
  Lora: {
    label: "Lora",
    family: "var(--font-lora), serif",
    category: "serif",
    tier: "pro",
  },
  "Roboto Mono": {
    label: "Roboto Mono",
    family: "var(--font-roboto-mono), monospace",
    category: "mono",
    tier: "free",
  },
} as const satisfies Record<ProfileFontId, FontDefinition>;

export const PRO_HEADING_FONT_IDS = HEADING_FONT_IDS.filter(
  (id) => FONT_REGISTRY[id].tier === "pro",
);

export const PRO_BODY_FONT_IDS = BODY_FONT_IDS.filter(
  (id) => FONT_REGISTRY[id].tier === "pro",
);

export function fontFamilyFor(id: ProfileFontId) {
  return FONT_REGISTRY[id].family;
}
