import type { CSSProperties } from "react";
import { THEME_FONTS, type ThemeConfig, type ThemeFontKey } from "@olnktr/validators/theme";
import { THEME_FONT_VARIABLES } from "~/styles/fonts";

/**
 * Converts a validated theme into CSS custom properties and data attributes
 * consumed by `profile.css`. Every input is an enum, a bounded number, a
 * #RRGGBB color or a UUID (validated by Zod), so nothing here can inject CSS.
 */
const CONTENT_WIDTH = { narrow: 420, regular: 540, wide: 720 } as const;

function fontStack(key: ThemeFontKey): string {
  const fallback = THEME_FONTS[key].fallback;
  return key === "system" ? fallback : `var(${THEME_FONT_VARIABLES[key]}), ${fallback}`;
}

function mix(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

function backgroundImage(theme: ThemeConfig): { image: string; size: string } {
  const bg = theme.background;
  switch (bg.type) {
    case "solid":
      return { image: "none", size: "auto" };
    case "gradient":
      return {
        image:
          bg.kind === "radial"
            ? `radial-gradient(120% 80% at 50% 0%, ${bg.from}, ${bg.to})`
            : `linear-gradient(${bg.angle}deg, ${bg.from}, ${bg.to})`,
        size: "cover",
      };
    case "image":
      return { image: `url("/media/${bg.mediaId}")`, size: "cover" };
    case "pattern": {
      const color = mix(bg.color, bg.opacity);
      const s = bg.scale;
      const patterns: Record<typeof bg.pattern, string> = {
        dots: `radial-gradient(${color} 1.2px, transparent 1.6px)`,
        grid: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
        diagonal: `repeating-linear-gradient(45deg, ${color} 0 1px, transparent 1px ${Math.max(4, s / 2)}px)`,
        waves: `radial-gradient(circle at 50% 100%, transparent ${s * 0.35}px, ${color} ${s * 0.35}px ${s * 0.35 + 1.5}px, transparent ${s * 0.35 + 1.5}px)`,
        checker: `conic-gradient(${color} 25%, transparent 0 50%, ${color} 0 75%, transparent 0)`,
      };
      return { image: patterns[bg.pattern], size: `${s}px ${s}px` };
    }
  }
}

export function themeVariables(theme: ThemeConfig): CSSProperties {
  const { colors, typography, buttons, cards, layout, background } = theme;
  const bg = backgroundImage(theme);
  return {
    "--op-bg": colors.background,
    "--op-bg-image": bg.image,
    "--op-bg-size": bg.size,
    "--op-overlay": background.type === "image" ? background.overlay : "transparent",
    "--op-overlay-opacity": background.type === "image" ? background.overlayOpacity / 100 : 0,
    "--op-bg-blur": background.type === "image" ? `${background.blur}px` : "0px",
    "--op-surface": colors.surface,
    "--op-text": colors.text,
    "--op-muted": colors.mutedText,
    "--op-border": colors.border,
    "--op-primary": colors.primary,
    "--op-secondary": colors.secondary,
    "--op-accent": colors.accent,
    "--op-link": colors.link,
    "--op-btn-bg": colors.button,
    "--op-btn-fg": colors.buttonText,
    "--op-btn-radius": `${buttons.radius}px`,
    "--op-btn-border-w": `${buttons.borderWidth}px`,
    "--op-card-radius": `${cards.radius}px`,
    "--op-card-border-w": `${cards.borderWidth}px`,
    "--op-heading-font": fontStack(typography.headingFont),
    "--op-body-font": fontStack(typography.bodyFont),
    "--op-base-size": `${typography.baseSize}px`,
    "--op-heading-weight": typography.headingWeight,
    "--op-body-weight": typography.bodyWeight,
    "--op-line-height": typography.lineHeight,
    "--op-tracking": `${typography.letterSpacing}em`,
    "--op-heading-tracking": `${typography.headingLetterSpacing}em`,
    "--op-heading-case": typography.headingCase,
    "--op-block-gap": `${layout.blockGap}px`,
    "--op-section-gap": `${layout.sectionGap}px`,
    "--op-avatar-size": `${layout.avatarSize}px`,
    "--op-content-width": `${CONTENT_WIDTH[layout.contentWidth]}px`,
  } as CSSProperties;
}

/** Data attributes selecting enum-driven rules in profile.css. */
export function themeAttributes(theme: ThemeConfig): Record<`data-${string}`, string> {
  const { buttons, cards, layout, effects, background } = theme;
  return {
    "data-bg": background.type,
    "data-btn-variant": buttons.variant,
    "data-btn-size": buttons.size,
    "data-btn-shadow": buttons.shadow,
    "data-btn-hover": buttons.hover,
    "data-btn-align": buttons.textAlign,
    "data-btn-icon": buttons.iconPlacement,
    "data-card-style": cards.style,
    "data-card-shadow": cards.shadow,
    "data-card-padding": cards.padding,
    "data-card-hover": cards.hover,
    "data-card-layout": cards.layout,
    "data-align": layout.alignment,
    "data-density": layout.density,
    "data-header": layout.header,
    "data-avatar": layout.avatarShape,
    "data-entrance": effects.entrance,
    "data-transitions": effects.hoverTransitions ? "on" : "off",
    "data-effect": effects.backgroundEffect,
    "data-decoration": effects.decoration,
  };
}
