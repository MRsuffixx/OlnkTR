"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  Layers,
  Paintbrush,
  Redo2,
  SlidersHorizontal,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  Button,
  cn,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  Toaster,
  TooltipProvider,
} from "@olnktr/ui";
import { Link } from "~/i18n/navigation";
import { useTRPC } from "~/lib/trpc/client";
import { Inspector } from "../inspector/inspector";
import { IssuesProvider } from "../inspector/issues";
import { AddBlockDialog } from "../panels/add-block";
import { EditorSidebar } from "../panels/sidebar";
import { PreviewCanvas } from "../preview/canvas";
import { StudioProvider, useStudio, useStudioActions, type StudioTheme } from "../store/context";
import { StudioPersistence } from "../store/persistence";
import type { EditorServerState, PanelTab } from "../store/store";
import { AccountMenu, AppRail } from "./app-rail";
import { StudioChromeProvider } from "./chrome";
import { StudioNotices } from "./notices";
import { ShortcutsDialog, useStudioShortcuts } from "./shortcuts";
import { PublishButton, SaveStatus, StudioToolbar } from "./toolbar";

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => true,
  );
}

export interface StudioUser {
  email: string;
  name: string;
}

/** Client entry of the Creator Studio. */
export function StudioApp({
  initial,
  themes,
  user,
}: {
  initial: EditorServerState;
  themes: StudioTheme[];
  user: StudioUser;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  // Seed the theme catalogue fetched on the server so the first paint is complete.
  useState(() =>
    queryClient.setQueryData(
      trpc.themes.list.queryKey({ organizationId: initial.profile.organizationId }),
      themes,
    ),
  );
  return (
    <StudioProvider initial={initial}>
      <StudioChromeProvider>
        {(colorMode) => (
          <div
            className="studio-root fixed inset-0 flex bg-background text-foreground"
            data-studio-theme={colorMode}
          >
            <TooltipProvider delayDuration={300}>
              <StudioPersistence>
                <IssuesProvider>
                  <StudioLayout user={user} />
                </IssuesProvider>
              </StudioPersistence>
            </TooltipProvider>
            <Toaster theme={colorMode} position="bottom-center" closeButton />
          </div>
        )}
      </StudioChromeProvider>
    </StudioProvider>
  );
}

function StudioLayout({ user }: { user: StudioUser }) {
  const t = useTranslations("studio");
  const [adding, setAdding] = useState(false);
  const onAddBlock = useCallback(() => setAdding(true), []);
  const shortcutOptions = useMemo(() => ({ onAddBlock }), [onAddBlock]);
  useStudioShortcuts(shortcutOptions);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1280px)");
  const focusMode = useStudio((state) => state.focusMode);
  const mobileSheet = useStudio((state) => state.mobileSheet);
  const actions = useStudioActions();

  return (
    <>
      <a
        href="#studio-canvas"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        {t("skipToCanvas")}
      </a>
      {isDesktop ? <AppRail user={user} /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        {isDesktop ? <StudioToolbar /> : <MobileHeader user={user} />}
        <StudioNotices />
        <div className="flex min-h-0 flex-1">
          {isDesktop && !focusMode ? (
            <aside
              aria-label={t("panelLabel")}
              className="flex w-[300px] shrink-0 flex-col border-r border-line bg-panel"
            >
              <EditorSidebar />
            </aside>
          ) : null}
          <main id="studio-canvas" className="min-w-0 flex-1" aria-label={t("canvasLabel")}>
            <PreviewCanvas />
          </main>
          {isWide && !focusMode ? (
            <aside
              aria-label={t("inspectorLabel")}
              className="flex w-[320px] shrink-0 flex-col overflow-y-auto border-l border-line bg-panel"
              data-testid="inspector"
            >
              <Inspector />
            </aside>
          ) : null}
        </div>
        {isDesktop ? null : <MobileTabBar />}
      </div>

      {/* Below 1280px the inspector is a sheet: from the right on laptops, from the bottom on phones. */}
      <Sheet
        open={!isWide && mobileSheet === "inspector"}
        onOpenChange={(open) => !open && actions.setMobileSheet(null)}
      >
        <SheetContent
          side={isDesktop ? "right" : "bottom"}
          className={cn("overflow-y-auto", isDesktop ? "w-[360px]" : "h-[88dvh]")}
          closeLabel={t("actions.close")}
          data-testid="inspector"
          // Move focus to the sheet itself (announced via its title) rather than the first icon button.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement).focus();
          }}
        >
          <SheetTitle className="sr-only">{t("inspectorLabel")}</SheetTitle>
          <SheetDescription className="sr-only">{t("inspectorDescription")}</SheetDescription>
          <div className="pt-8">
            <Inspector />
          </div>
          {!isDesktop ? (
            <div className="sticky bottom-0 mt-auto border-t border-line bg-background p-3">
              <Button type="button" className="w-full" onClick={() => actions.setMobileSheet(null)}>
                <Eye data-icon="inline-start" aria-hidden="true" />
                {t("mobile.backToPreview")}
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {!isDesktop ? (
        <Sheet
          open={mobileSheet === "content" || mobileSheet === "design" || mobileSheet === "settings"}
          onOpenChange={(open) => !open && actions.setMobileSheet(null)}
        >
          <SheetContent
            side="bottom"
            className="h-[88dvh]"
            closeLabel={t("actions.close")}
            data-testid="mobile-panel"
          >
            <SheetTitle className="px-4 pt-3 pb-2">
              {mobileSheet === "content" || mobileSheet === "design" || mobileSheet === "settings"
                ? t(`tabs.${mobileSheet}`)
                : ""}
            </SheetTitle>
            <SheetDescription className="sr-only">{t("panelLabel")}</SheetDescription>
            <div className="flex min-h-0 flex-1 flex-col">
              <EditorSidebar tabs={false} />
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

      <AddBlockDialog open={adding} onOpenChange={setAdding} />
      <ShortcutsDialog />
    </>
  );
}

function MobileHeader({ user }: { user: StudioUser }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const canUndo = useStudio((state) => state.canUndo);
  const canRedo = useStudio((state) => state.canRedo);
  const name = useStudio(
    (state) => state.doc.profile.displayName || state.server.profile.displayName,
  );
  return (
    <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line bg-rail px-2">
      <Button asChild variant="ghost" size="icon" aria-label={t("mobile.back")}>
        <Link href="/dashboard">
          <ArrowLeft aria-hidden="true" />
        </Link>
      </Button>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-semibold" data-testid="studio-profile-name">
          {name}
        </span>
        <SaveStatus />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={actions.undo}
        disabled={!canUndo}
        aria-label={t("toolbar.undo")}
      >
        <Undo2 aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={actions.redo}
        disabled={!canRedo}
        aria-label={t("toolbar.redo")}
      >
        <Redo2 aria-hidden="true" />
      </Button>
      <PublishButton compact />
      <AccountMenu user={user} side="bottom" />
    </header>
  );
}

/** Bottom navigation: three editing contexts plus device preview. */
function MobileTabBar() {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const sheet = useStudio((state) => state.mobileSheet);
  const items: { tab: PanelTab; icon: LucideIcon }[] = [
    { tab: "content", icon: Layers },
    { tab: "design", icon: Paintbrush },
    { tab: "settings", icon: SlidersHorizontal },
  ];
  return (
    <nav
      aria-label={t("mobile.tabsLabel")}
      className="flex shrink-0 items-stretch border-t border-line bg-rail pb-[env(safe-area-inset-bottom)]"
    >
      {items.map(({ tab, icon: Icon }) => (
        <button
          key={tab}
          type="button"
          aria-pressed={sheet === tab}
          onClick={() => {
            actions.setTab(tab);
            actions.setMobileSheet(tab);
          }}
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground aria-pressed:text-foreground focus-visible:bg-accent focus-visible:outline-none"
        >
          <Icon className="size-5" aria-hidden="true" />
          {t(`tabs.${tab}`)}
        </button>
      ))}
      <button
        type="button"
        aria-pressed={sheet === null}
        onClick={() => {
          actions.setMobileSheet(null);
          actions.setViewport("mobile");
        }}
        className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] text-muted-foreground aria-pressed:text-foreground focus-visible:bg-accent focus-visible:outline-none"
      >
        <Eye className="size-5" aria-hidden="true" />
        {t("mobile.preview")}
      </button>
    </nav>
  );
}
