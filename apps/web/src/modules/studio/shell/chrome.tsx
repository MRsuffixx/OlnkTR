"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Studio chrome state that is not part of the document: color mode, the
 * profile switcher and the shortcuts/help dialog.
 */
export type ColorMode = "dark" | "light";
const COLOR_MODE_KEY = "olnktr:studio:color-mode";

interface Chrome {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  profilesWorkspace: string | null | undefined;
  openProfiles: (organizationId: string | null) => void;
  closeProfiles: () => void;
  shortcutsOpen: boolean;
  openShortcuts: () => void;
  setShortcutsOpen: (open: boolean) => void;
}

const ChromeContext = createContext<Chrome | null>(null);

export function useStudioChrome(): Chrome {
  const chrome = use(ChromeContext);
  if (!chrome) throw new Error("useStudioChrome must be used inside <StudioChromeProvider>");
  return chrome;
}

function readColorMode(): ColorMode {
  try {
    return window.localStorage.getItem(COLOR_MODE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function StudioChromeProvider({
  children,
}: {
  children: (colorMode: ColorMode) => ReactNode;
}) {
  // Server and first client render agree on "dark"; the stored preference applies after mount.
  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  useEffect(() => setColorMode(readColorMode()), []);
  const [profilesWorkspace, setProfilesWorkspace] = useState<string | null | undefined>(undefined);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const toggleColorMode = useCallback(() => {
    setColorMode((mode) => {
      const next = mode === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(COLOR_MODE_KEY, next);
      } catch {
        // Preference is a convenience; ignore storage failures.
      }
      return next;
    });
  }, []);
  const value = useMemo<Chrome>(
    () => ({
      colorMode,
      toggleColorMode,
      profilesWorkspace,
      openProfiles: (organizationId) => setProfilesWorkspace(organizationId),
      closeProfiles: () => setProfilesWorkspace(undefined),
      shortcutsOpen,
      openShortcuts: () => setShortcutsOpen(true),
      setShortcutsOpen,
    }),
    [colorMode, toggleColorMode, profilesWorkspace, shortcutsOpen],
  );
  return <ChromeContext value={value}>{children(colorMode)}</ChromeContext>;
}
