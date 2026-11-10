"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "~/lib/trpc/client";
import { resolveDraftTheme, useStudio } from "../store/context";

/** Theme catalogue for the profile owner (system presets + custom themes). */
export function useThemeCatalog() {
  const trpc = useTRPC();
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  return useQuery({ ...trpc.themes.list.queryOptions({ organizationId }), staleTime: 60_000 });
}

/** The draft's effective theme (base + profile overrides), memoised per change. */
export function useDraftTheme() {
  const themes = useThemeCatalog().data;
  const themeId = useStudio((state) => state.doc.theme.themeId);
  const overrides = useStudio((state) => state.doc.theme.overrides);
  return useMemo(() => resolveDraftTheme(themes, themeId, overrides), [themes, themeId, overrides]);
}
