"use client";

import { useTranslations } from "next-intl";
import { lazy, Suspense, useEffect, useRef } from "react";
import { Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from "@olnktr/ui";
import { useStudio, useStudioActions } from "../store/context";
import type { PanelTab } from "../store/store";
import { PanelSection } from "../ui/controls";
import { ContentPanel } from "./content-panel";

// Design and settings are heavier and not needed for the first paint.
const ThemeGallery = lazy(() =>
  import("../design/theme-gallery").then((module) => ({ default: module.ThemeGallery })),
);
const ThemeControls = lazy(() =>
  import("../design/theme-controls").then((module) => ({ default: module.ThemeControls })),
);
const SettingsPanel = lazy(() =>
  import("./settings-panel").then((module) => ({ default: module.SettingsPanel })),
);

const DESIGN_SECTIONS = [
  "themes",
  "colors",
  "typography",
  "background",
  "buttons",
  "cards",
  "layout",
  "effects",
] as const;

function PanelFallback() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-8 w-2/3" />
    </div>
  );
}

/** Left editor panel: Content / Design / Settings with section navigation. */
export function EditorSidebar({ tabs = true }: { tabs?: boolean }) {
  const t = useTranslations("studio");
  const tab = useStudio((state) => state.tab);
  const actions = useStudioActions();
  return (
    <Tabs
      value={tab}
      onValueChange={(value) => actions.setTab(value as PanelTab)}
      className="flex min-h-0 flex-1 flex-col gap-0"
    >
      {tabs ? (
        <div className="border-b border-line px-3 py-2">
          <TabsList className="grid h-8 w-full grid-cols-3">
            <TabsTrigger value="content" className="text-xs">
              {t("tabs.content")}
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs">
              {t("tabs.design")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              {t("tabs.settings")}
            </TabsTrigger>
          </TabsList>
        </div>
      ) : null}
      <TabsContent value="content" className="min-h-0 flex-1 overflow-y-auto pt-3">
        <ContentPanel />
      </TabsContent>
      <TabsContent value="design" className="min-h-0 flex-1 overflow-y-auto">
        <DesignPanel />
      </TabsContent>
      <TabsContent value="settings" className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<PanelFallback />}>
          <SettingsPanel />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}

function DesignPanel() {
  const t = useTranslations("studio.design");
  const section = useStudio((state) => (state.tab === "design" ? state.section : null));
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!section) return;
    container.current?.querySelector(`#design-${section}`)?.scrollIntoView({ block: "start" });
  }, [section]);
  return (
    <div ref={container}>
      <nav
        aria-label={t("sectionsLabel")}
        className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-line bg-panel px-3 py-2"
      >
        {DESIGN_SECTIONS.map((item) => (
          <a
            key={item}
            href={`#design-${item}`}
            onClick={(event) => {
              event.preventDefault();
              container.current
                ?.querySelector(`#design-${item}`)
                ?.scrollIntoView({ block: "start", behavior: "smooth" });
            }}
            className="h-7 shrink-0 rounded-full px-2.5 text-xs leading-7 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {t(`sections.${item}`)}
          </a>
        ))}
      </nav>
      <Suspense fallback={<PanelFallback />}>
        <PanelSection title={t("sections.themes")} id="design-themes">
          <div className="-mx-4">
            <ThemeGallery />
          </div>
        </PanelSection>
        <ThemeControls
          sections={["colors", "typography", "background", "buttons", "cards", "layout", "effects"]}
        />
      </Suspense>
    </div>
  );
}
