"use client";

import { createContext, use, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  applyThemeOverrides,
  DEFAULT_THEME_CONFIG,
  DEFAULT_THEME_KEY,
} from "@olnktr/validators/theme";
import type { AppRouterOutputs } from "~/lib/trpc/types";
import {
  createStudioStore,
  type EditorServerState,
  type StudioState,
  type StudioStore,
} from "./store";

export type StudioTheme = AppRouterOutputs["themes"]["list"][number];

const StoreContext = createContext<StudioStore | null>(null);

/** Provider: the only place that knows how studio state is stored. */
export function StudioProvider({
  initial,
  children,
}: {
  initial: EditorServerState;
  children: ReactNode;
}) {
  const [store] = useState(() => createStudioStore(initial));
  return <StoreContext value={store}>{children}</StoreContext>;
}

export function useStudioStore(): StudioStore {
  const store = use(StoreContext);
  if (!store) throw new Error("useStudioStore must be used inside <StudioProvider>");
  return store;
}

/** Subscribes to a slice of studio state. Return primitives or stable references. */
export function useStudio<T>(selector: (state: StudioState) => T): T {
  const store = useStudioStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

export function useStudioActions() {
  return useStudioStore().actions;
}

/** Effective theme: base theme (from the catalogue) + the draft's profile overrides. */
export function resolveDraftTheme(
  themes: StudioTheme[] | undefined,
  themeId: string | null,
  overrides: StudioState["doc"]["theme"]["overrides"],
) {
  const base =
    themes?.find((theme) => theme.id === themeId)?.config ??
    themes?.find((theme) => theme.key === DEFAULT_THEME_KEY)?.config ??
    DEFAULT_THEME_CONFIG;
  return applyThemeOverrides(base, overrides);
}
