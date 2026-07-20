import type { WorkspaceInput } from "~/lib/schemas";

export const DEFAULT_THEME: WorkspaceInput["theme"] = {
  backgroundType: "GRADIENT",
  backgroundValue: "linear-gradient(145deg, #F5F0DE 0%, #F8C95C 100%)",
  buttonStyle: "SHADOW",
  buttonShape: "ROUNDED",
  buttonColor: "#17211B",
  textColor: "#17211B",
  accentColor: "#F06432",
  fontFamily: "FRIENDLY",
  showBranding: true,
};

export function getBackgroundStyle(theme: WorkspaceInput["theme"]) {
  if (theme.backgroundType === "IMAGE") {
    if (!theme.backgroundValue) return { backgroundColor: "#F5F0DE" };
    return {
      backgroundColor: "#F5F0DE",
      backgroundImage: `linear-gradient(rgba(16, 25, 20, .18), rgba(16, 25, 20, .18)), url("${theme.backgroundValue.replace(/["\\]/g, "")}")`,
      backgroundPosition: "center",
      backgroundSize: "cover",
    };
  }

  if (theme.backgroundType === "GRADIENT") {
    return { backgroundImage: theme.backgroundValue };
  }

  return { backgroundColor: theme.backgroundValue };
}

export function faviconForUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=64`;
  } catch {
    return null;
  }
}
