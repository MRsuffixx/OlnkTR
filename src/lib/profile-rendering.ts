import type { AppearanceSettings } from "~/lib/appearance";
import type { LinkCustomization } from "~/lib/schemas";

export function profileFontFamily(
  font:
    | AppearanceSettings["typography"]["headingFont"]
    | AppearanceSettings["typography"]["bodyFont"]
    | LinkCustomization["fontFamily"],
) {
  const families: Record<string, string> = {
    Fraunces: "var(--font-fraunces), serif",
    Manrope: "var(--font-manrope), sans-serif",
    "Space Grotesk": "var(--font-space-grotesk), sans-serif",
    "Playfair Display": "var(--font-playfair), serif",
    "DM Serif Display": "var(--font-dm-serif), serif",
    "Bebas Neue": "var(--font-bebas), sans-serif",
    Inter: "var(--font-inter), sans-serif",
    Montserrat: "var(--font-montserrat), sans-serif",
    Lora: "var(--font-lora), serif",
    "Roboto Mono": "var(--font-roboto-mono), monospace",
  };
  return font === "inherit" ? undefined : families[font];
}

export function profileAvatarRadius(
  shape: AppearanceSettings["layout"]["avatarShape"],
) {
  if (shape === "circle") return "50%";
  if (shape === "square") return "4px";
  if (shape === "squircle") return "32%";
  if (shape === "hexagon") return "0";
  return "22%";
}

export function profileButtonStyle(
  settings: AppearanceSettings,
  custom: LinkCustomization,
): React.CSSProperties {
  const button = settings.buttons;
  const color = custom.buttonColor ?? button.color;
  const textColor = custom.textColor ?? button.textColor;
  const borderRadius =
    button.shape === "pill"
      ? 999
      : button.shape === "square"
        ? 5
        : button.shape === "custom"
          ? button.radius
          : 18;
  const style: React.CSSProperties = {
    minHeight: button.height,
    borderRadius,
    color: textColor,
    background: color,
    fontFamily:
      custom.fontFamily === "inherit"
        ? profileFontFamily(settings.typography.bodyFont)
        : profileFontFamily(custom.fontFamily),
    fontWeight: settings.typography.weight,
  };
  if (button.fill === "outline")
    return {
      ...style,
      background: "transparent",
      color: textColor,
      border: `2px solid ${button.borderColor}`,
    };
  if (button.fill === "glass")
    return {
      ...style,
      background: "rgba(255,255,255,.48)",
      border: "1px solid rgba(255,255,255,.65)",
      backdropFilter: "blur(14px)",
    };
  if (button.fill === "shadow")
    return { ...style, boxShadow: `4px 5px 0 ${button.shadowColor}` };
  if (button.fill === "threeD")
    return {
      ...style,
      boxShadow: `inset 0 -5px 0 rgba(0,0,0,.24), 0 6px 0 ${button.shadowColor}`,
    };
  return style;
}

export function profileDensity(
  density: AppearanceSettings["layout"]["density"],
) {
  if (density === "compact") return { profileGap: 12, linksTop: 20 };
  if (density === "airy") return { profileGap: 24, linksTop: 44 };
  return { profileGap: 18, linksTop: 32 };
}

export function profileEmbedUrl(type: "YOUTUBE" | "SPOTIFY", value: string) {
  try {
    const url = new URL(value);
    if (type === "YOUTUBE") {
      const id = url.hostname.includes("youtu.be")
        ? url.pathname.slice(1)
        : (url.searchParams.get("v") ??
          url.pathname.split("/").filter(Boolean).at(-1));
      return id && /^[\w-]{6,20}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length === 2
      ? `https://open.spotify.com/embed/${parts.join("/")}`
      : null;
  } catch {
    return null;
  }
}
