"use client";

import {
  ChevronDown,
  CircleAlert,
  Cloud,
  CloudOff,
  Eye,
  LoaderCircle,
  Lock,
  Monitor,
  Palette,
  Redo2,
  Rocket,
  Share,
  Smartphone,
  Tablet,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@olnktr/ui";
import { useThemeCatalog } from "../design/use-theme";
import { useIssueCount, useIssues } from "../inspector/issues";
import { publicPath } from "../panels/settings-panel";
import { useStudio, useStudioActions } from "../store/context";
import { usePersistence } from "../store/persistence";
import type { Viewport } from "../store/store";
import { ProfileSwitcherDialog } from "./profile-switcher";

export const isMac = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const mod = () => (isMac() ? "⌘" : "Ctrl");

function ToolButton({
  label,
  shortcut,
  icon: Icon,
  onClick,
  disabled,
  pressed,
}: {
  label: string;
  shortcut?: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
          className={cn(pressed && "bg-accent text-foreground")}
        >
          <Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {shortcut ? <span className="ml-2 text-muted-foreground">{shortcut}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

/** Save status: always reflects the last server response, never an assumption. */
export function SaveStatus({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("studio.status");
  const save = useStudio((state) => state.save);
  const persistence = usePersistence();
  const config = {
    saved: { icon: Cloud, label: t("saved"), tone: "text-muted-foreground" },
    unsaved: { icon: Cloud, label: t("unsaved"), tone: "text-warn" },
    saving: { icon: LoaderCircle, label: t("saving"), tone: "text-muted-foreground" },
    error: { icon: CloudOff, label: t("error"), tone: "text-danger" },
    conflict: { icon: CircleAlert, label: t("conflict"), tone: "text-danger" },
  }[save.status];
  const Icon = config.icon;
  return (
    <div
      className={cn("flex items-center gap-1.5 text-xs", config.tone)}
      role="status"
      aria-live="polite"
      data-testid="save-status"
      data-status={save.status}
    >
      <Icon
        className={cn("size-3.5 shrink-0", save.status === "saving" && "animate-spin")}
        aria-hidden="true"
      />
      <span className={cn(compact && "sr-only")}>{config.label}</span>
      {save.status === "error" ? (
        <button
          type="button"
          className="underline underline-offset-2"
          onClick={() => void persistence.saveNow()}
        >
          {t("retry")}
        </button>
      ) : null}
    </div>
  );
}

export function ViewportSwitch() {
  const t = useTranslations("studio.toolbar");
  const viewport = useStudio((state) => state.viewport);
  const actions = useStudioActions();
  const items: { value: Viewport; icon: LucideIcon; key: string }[] = [
    { value: "desktop", icon: Monitor, key: "1" },
    { value: "tablet", icon: Tablet, key: "2" },
    { value: "mobile", icon: Smartphone, key: "3" },
  ];
  return (
    <div
      role="group"
      aria-label={t("viewport")}
      className="flex items-center rounded-md border border-line p-0.5"
    >
      {items.map((item) => (
        <ToolButton
          key={item.value}
          label={t(`viewport_${item.value}`)}
          shortcut={`Alt+${item.key}`}
          icon={item.icon}
          pressed={viewport === item.value}
          onClick={() => actions.setViewport(item.value)}
        />
      ))}
    </div>
  );
}

function ThemeQuickSelect() {
  const t = useTranslations("studio.toolbar");
  const actions = useStudioActions();
  const catalog = useThemeCatalog();
  const themeId = useStudio((state) => state.doc.theme.themeId);
  const current =
    catalog.data?.find((theme) => theme.id === themeId) ??
    catalog.data?.find((theme) => theme.key === "minimal");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5" aria-label={t("theme")}>
          <Palette data-icon="inline-start" aria-hidden="true" />
          <span className="max-w-28 truncate">{current?.name ?? t("theme")}</span>
          <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("theme")}</DropdownMenuLabel>
        <DropdownMenuGroup>
          {(catalog.data ?? []).slice(0, 12).map((theme) => (
            <DropdownMenuItem
              key={theme.id}
              onSelect={() =>
                actions.update((doc) => void (doc.theme = { themeId: theme.id, overrides: {} }))
              }
            >
              <span
                className="size-4 shrink-0 rounded-full border border-line"
                style={{
                  background: `linear-gradient(135deg, ${theme.config.colors.background} 50%, ${theme.config.colors.button} 50%)`,
                }}
                aria-hidden="true"
              />
              <span className="flex-1 truncate">{theme.name}</span>
              {theme.locked ? <Lock className="text-warn" aria-hidden="true" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => actions.setTab("design", "themes")}>
          {t("allThemes")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Publish control. Distinguishes "nothing to publish", unpublished changes,
 * publishing, published and failed — each state comes from the server.
 */
export function PublishButton({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("studio.publish");
  const persistence = usePersistence();
  const actions = useStudioActions();
  const publish = useStudio((state) => state.publish);
  const saveStatus = useStudio((state) => state.save.status);
  const hasChanges = useStudio(
    (state) => state.server.hasUnpublishedChanges || state.save.status !== "saved",
  );
  const isLive = useStudio((state) => state.server.profile.status === "published");
  const canPublish = useStudio((state) => state.server.canPublish);
  const blockers = useStudio((state) => state.server.blockers);
  const issueCount = useIssueCount();
  const issues = useIssues();
  const [open, setOpen] = useState(false);
  const blocked = issueCount > 0 || blockers.length > 0;
  const upToDate = !hasChanges && isLive;
  const label =
    publish.status === "publishing"
      ? t("publishing")
      : publish.status === "failed"
        ? t("failed")
        : upToDate
          ? t("published")
          : t("publish");

  const onPublish = () => {
    if (blocked) return setOpen(true);
    void persistence.publish();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          onClick={(event) => {
            event.preventDefault();
            onPublish();
          }}
          disabled={
            !canPublish ||
            publish.status === "publishing" ||
            saveStatus === "conflict" ||
            (upToDate && publish.status !== "failed")
          }
          variant={publish.status === "failed" ? "destructive" : "default"}
          data-testid="publish-button"
          data-state-label={publish.status}
          className="min-w-24"
          aria-label={compact ? label : undefined}
        >
          {publish.status === "publishing" ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden="true" />
          ) : (
            <Rocket data-icon="inline-start" aria-hidden="true" />
          )}
          {compact ? null : label}
          {!compact && hasChanges && isLive && publish.status === "idle" ? (
            <span className="size-1.5 rounded-full bg-warn" aria-label={t("unpublishedChanges")} />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-line p-3">
          <p className="text-sm font-semibold">{t("blockedTitle")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{t("blockedDescription")}</p>
        </div>
        <ul className="max-h-72 overflow-y-auto p-1">
          {[...issues.entries()].map(([target, list]) => (
            <li key={target}>
              <button
                type="button"
                className="flex w-full items-start gap-2 rounded-md p-2 text-left text-xs hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => {
                  setOpen(false);
                  actions.select(
                    target === "profile" ? { kind: "profile" } : { kind: "block", id: target },
                    { openInspector: true },
                  );
                }}
              >
                <CircleAlert className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden="true" />
                <span>
                  {t("issueCount", {
                    count: list.length,
                    target: target === "profile" ? t("profile") : t("block"),
                  })}
                </span>
              </button>
            </li>
          ))}
          {blockers.map((blocker, index) => (
            <li key={`${blocker.code}-${index}`} className="flex items-start gap-2 p-2 text-xs">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden="true" />
              <span>
                {t(`blocker_${blocker.code}`)}
                {blocker.detail ? (
                  <span className="block text-muted-foreground">{blocker.detail}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
        {blockers.some((blocker) => blocker.entitlement) ? (
          <div className="border-t border-line p-3">
            <Button asChild size="sm" className="w-full">
              <a href="/settings/billing" target="_blank" rel="noopener">
                {t("upgrade")}
              </a>
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

export function StudioToolbar() {
  const t = useTranslations("studio.toolbar");
  const locale = useLocale();
  const actions = useStudioActions();
  const canUndo = useStudio((state) => state.canUndo);
  const canRedo = useStudio((state) => state.canRedo);
  const displayName = useStudio(
    (state) => state.doc.profile.displayName || state.server.profile.displayName,
  );
  const username = useStudio((state) => state.server.profile.username);
  const profileId = useStudio((state) => state.profileId);
  const isLive = useStudio((state) => state.server.profile.status === "published");
  const [switcher, setSwitcher] = useState(false);
  const previewHref = `${locale === "tr" ? "/tr" : ""}/studio/${profileId}/preview`;

  return (
    <header className="flex h-13 shrink-0 items-center gap-2 border-b border-line bg-rail px-3">
      <button
        type="button"
        onClick={() => setSwitcher(true)}
        className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={t("switchProfile")}
      >
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold" data-testid="studio-profile-name">
            {displayName}
          </span>
          <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <span
              className={cn("size-1.5 rounded-full", isLive ? "bg-ok" : "bg-subtle")}
              aria-hidden="true"
            />
            <span translate="no">olnk.tr{publicPath(locale, username).replace(/^\/tr/, "")}</span>
          </span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>
      <div className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
      <SaveStatus />
      <div className="mx-1 h-6 w-px bg-line" aria-hidden="true" />
      <ToolButton
        label={t("undo")}
        shortcut={`${mod()}+Z`}
        icon={Undo2}
        onClick={actions.undo}
        disabled={!canUndo}
      />
      <ToolButton
        label={t("redo")}
        shortcut={`${mod()}+Shift+Z`}
        icon={Redo2}
        onClick={actions.redo}
        disabled={!canRedo}
      />
      <div className="flex flex-1 items-center justify-center gap-2">
        <ViewportSwitch />
        <ThemeQuickSelect />
      </div>
      <ToolButton
        label={t("sharePreview")}
        icon={Share}
        onClick={() =>
          navigator.clipboard.writeText(`${window.location.origin}${previewHref}`).then(
            () => toast.success(t("previewCopied"), { description: t("previewCopiedHint") }),
            () => toast.error(t("copyFailed")),
          )
        }
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild type="button" variant="outline" size="sm">
            <a href={previewHref} target="_blank" rel="noopener" data-testid="preview-draft">
              <Eye data-icon="inline-start" aria-hidden="true" />
              {t("preview")}
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("previewHint")}</TooltipContent>
      </Tooltip>
      <PublishButton />
      <ProfileSwitcherDialog open={switcher} onOpenChange={setSwitcher} />
    </header>
  );
}
