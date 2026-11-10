import type { CSSProperties } from "react";
import type { ThemeConfig } from "@olnktr/validators/theme";

const FONTS: Record<ThemeConfig["typography"]["fontFamily"], string> = {
  system: "ui-sans-serif, system-ui, sans-serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  serif: "ui-serif, Georgia, serif",
  mono: "ui-monospace, SFMono-Regular, monospace",
  rounded: "ui-rounded, 'SF Pro Rounded', system-ui, sans-serif",
};

/**
 * Converts a validated theme config into CSS custom properties. All values are
 * enums or #RRGGBB colors (validated by Zod), so no CSS can be injected.
 */
export function themeStyle(theme: ThemeConfig): CSSProperties {
  const background =
    theme.background.type === "gradient"
      ? `linear-gradient(${theme.background.angle}deg, ${theme.background.from}, ${theme.background.to})`
      : theme.colors.background;
  return {
    "--profile-bg": background,
    "--profile-surface": theme.colors.surface,
    "--profile-text": theme.colors.text,
    "--profile-muted": theme.colors.mutedText,
    "--profile-accent": theme.colors.accent,
    "--profile-accent-text": theme.colors.accentText,
    "--profile-border": theme.colors.border,
    "--profile-font": FONTS[theme.typography.fontFamily],
  } as CSSProperties;
}

export const BUTTON_SHAPE: Record<ThemeConfig["buttons"]["shape"], string> = {
  square: "rounded-none",
  rounded: "rounded-lg",
  pill: "rounded-full",
};
export const MAX_WIDTH: Record<ThemeConfig["layout"]["maxWidth"], string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};
export const AVATAR_SHAPE: Record<ThemeConfig["layout"]["avatarShape"], string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-none",
};
