"use client";

import { useTranslations } from "next-intl";
import {
  memo,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@olnktr/ui";
import { ProfileView } from "~/modules/profile-renderer/profile-view";
import type { BlockFrame } from "~/modules/profile-renderer/types";
import { toRenderBlocks } from "./render-blocks";
import { useDraftTheme } from "../design/use-theme";
import { useIssues } from "../inspector/issues";
import { useStudio, useStudioActions } from "../store/context";
import type { Viewport } from "../store/store";

/**
 * Live preview canvas. Renders the *draft* through the same ProfileView as the
 * public page inside a device of the chosen width; the profile CSS uses
 * container queries, so each viewport lays out exactly like that device.
 */
export const DEVICES: Record<Viewport, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

const SelectableFrame: BlockFrame = memo(function SelectableFrame({ block, children }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const selected = useStudio(
    (state) => state.selection?.kind === "block" && state.selection.id === block.id,
  );
  const hidden = useStudio(
    (state) => state.doc.blocks.find((item) => item.id === block.id)?.isVisible === false,
  );
  const hasIssues = Boolean(useIssues().get(block.id)?.length);
  const name = t(`blocks.${block.type}.name`);
  return (
    <div
      className={cn("studio-frame relative", hidden && "opacity-45")}
      data-selected={selected || undefined}
    >
      {children}
      <button
        type="button"
        className={cn(
          "absolute -inset-1.5 z-10 rounded-[6px] outline-none",
          "hover:ring-1 hover:ring-primary/60 focus-visible:ring-2 focus-visible:ring-primary",
          selected && "ring-2 ring-primary",
          hasIssues && !selected && "ring-1 ring-danger/70 ring-dashed",
          hidden && "ring-1 ring-dashed ring-line-strong",
        )}
        aria-label={t("canvas.selectBlock", { name })}
        aria-pressed={selected}
        onClick={(event) => {
          event.stopPropagation();
          actions.select({ kind: "block", id: block.id }, { openInspector: true });
        }}
      />
      {selected || hidden ? (
        <span className="pointer-events-none absolute -top-5 left-0 z-20 rounded-sm bg-primary px-1.5 py-0.5 font-[var(--font-studio)] text-[10px] leading-none font-semibold text-primary-foreground">
          {hidden ? t("canvas.hiddenTag", { name }) : name}
        </span>
      ) : null}
    </div>
  );
});

function HeaderFrame({ children }: { children: ReactNode }) {
  const t = useTranslations("studio.canvas");
  const actions = useStudioActions();
  const selected = useStudio((state) => state.selection?.kind === "profile");
  return (
    <div className="relative">
      {children}
      <button
        type="button"
        className={cn(
          "absolute -inset-2 z-10 rounded-md outline-none hover:ring-1 hover:ring-primary/60 focus-visible:ring-2 focus-visible:ring-primary",
          selected && "ring-2 ring-primary",
        )}
        aria-label={t("selectProfile")}
        aria-pressed={selected}
        onClick={(event) => {
          event.stopPropagation();
          actions.select({ kind: "profile" }, { openInspector: true });
        }}
      />
    </div>
  );
}

export function PreviewCanvas({ interactive = true }: { interactive?: boolean }) {
  const t = useTranslations("studio.canvas");
  const actions = useStudioActions();
  const viewport = useStudio((state) => state.viewport);
  const liveDoc = useStudio((state) => state.doc);
  // Typing stays responsive on large profiles: the preview renders a deferred copy.
  const doc = useDeferredValue(liveDoc);
  const theme = useDraftTheme();
  const backgroundSelected = useStudio((state) => state.selection?.kind === "background");
  const container = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [host, setHost] = useState("localhost");

  useEffect(() => {
    setHost(window.location.hostname);
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const device = DEVICES[viewport];
  const pad = 32;
  const scale =
    size.width === 0
      ? 0
      : Math.min(
          1,
          (size.width - pad) / device.width,
          viewport === "mobile" ? (size.height - pad - 24) / device.height : 1,
        );
  const height =
    viewport === "mobile"
      ? device.height
      : Math.max(400, (size.height - pad - 24) / Math.max(scale, 0.1));
  const blocks = useMemo(() => toRenderBlocks(doc), [doc]);
  const profile = useMemo(
    () => ({
      id: "draft",
      displayName: doc.profile.displayName,
      bio: doc.profile.bio || null,
      avatarMediaId: doc.profile.avatarMediaId,
      coverMediaId: doc.profile.coverMediaId,
    }),
    [doc.profile],
  );

  return (
    <div
      ref={container}
      className="studio-canvas relative flex h-full min-h-0 w-full flex-col items-center overflow-hidden pt-4"
      data-testid="studio-canvas"
    >
      {scale > 0 ? (
        <>
          <div style={{ width: device.width * scale, height: height * scale }} className="shrink-0">
            <div
              className={cn(
                "origin-top-left overflow-hidden bg-white shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)]",
                viewport === "mobile"
                  ? "rounded-[44px] border-[10px] border-[#0d0e10]"
                  : "rounded-lg border border-line-strong",
                backgroundSelected && "ring-4 ring-primary/60",
              )}
              style={{ width: device.width, height, transform: `scale(${scale})` }}
            >
              <div
                className="h-full overflow-y-auto overscroll-contain"
                role="region"
                aria-label={t("previewLabel", { viewport: t(`viewport_${viewport}`) })}
                data-testid="preview-viewport"
                onClickCapture={(event) => {
                  // The canvas edits; links and forms inside it must not navigate.
                  if ((event.target as HTMLElement).closest("a")) event.preventDefault();
                }}
                onClick={() =>
                  interactive && actions.select({ kind: "background" }, { openInspector: true })
                }
              >
                <ProfileView
                  profile={profile}
                  blocks={blocks}
                  theme={theme}
                  mode="preview"
                  embedHost={host}
                  Frame={interactive ? SelectableFrame : undefined}
                  header={
                    interactive ? (content) => <HeaderFrame>{content}</HeaderFrame> : undefined
                  }
                />
              </div>
            </div>
          </div>
          <p className="mt-2 shrink-0 text-[11px] text-subtle tabular-nums" aria-live="polite">
            {t("dimensions", { width: device.width, scale: Math.round(scale * 100) })}
          </p>
        </>
      ) : null}
    </div>
  );
}
