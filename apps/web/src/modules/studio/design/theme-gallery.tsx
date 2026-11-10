"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  Ellipsis,
  Lock,
  RotateCcw,
  Save,
  Search,
  Star,
  Upload,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "@olnktr/ui";
import {
  isEmptyOverrides,
  THEME_CATEGORIES,
  THEME_EXPORT_FORMAT,
  themeExportSchema,
  type ThemeConfig,
} from "@olnktr/validators/theme";
import { useTRPC } from "~/lib/trpc/client";
import { themeAttributes, themeVariables } from "~/modules/profile-renderer/theme-vars";
import "~/modules/profile-renderer/profile.css";
import type { StudioTheme } from "../store/context";
import { useStudio, useStudioActions, useStudioStore } from "../store/context";
import { errorCode } from "../store/persistence";
import { inputClass } from "../ui/controls";
import { useDraftTheme, useThemeCatalog } from "./use-theme";

type Filter = "all" | "favorites" | "custom" | (typeof THEME_CATEGORIES)[number];

/** Miniature profile rendered with the real profile CSS, so thumbnails never drift from reality. */
export const ThemeThumbnail = memo(function ThemeThumbnail({
  config,
  name,
}: {
  config: ThemeConfig;
  name: string;
}) {
  return (
    <div className="pointer-events-none relative h-40 overflow-hidden" aria-hidden="true">
      <div
        className="op-root absolute top-0 left-0 w-[224px] origin-top-left scale-[0.58]"
        style={{ ...themeVariables(config), minHeight: 280 }}
        {...themeAttributes({ ...config, effects: { ...config.effects, entrance: "none" } })}
      >
        <div className="op-main" style={{ paddingTop: 30, paddingBottom: 12, paddingInline: 18 }}>
          <div className="op-header">
            <div className="op-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
              {name.slice(0, 1)}
            </div>
            <div className="op-header-text">
              <p className="op-name" style={{ fontSize: 17 }}>
                {name}
              </p>
            </div>
          </div>
          <div className="op-blocks" style={{ marginTop: 14 }}>
            {[0, 1, 2].map((index) => (
              <div key={index}>
                <span
                  className="op-button"
                  data-variant={config.buttons.variant}
                  style={{ minHeight: 34, padding: "6px 12px", fontSize: 12 }}
                >
                  <span className="op-button-label" style={{ paddingInline: 0 }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: `${70 - index * 15}%`,
                        height: 7,
                        borderRadius: 4,
                        background: "currentColor",
                        opacity: 0.55,
                      }}
                    />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

export function ThemeGallery() {
  const t = useTranslations("studio.themes");
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const store = useStudioStore();
  const actions = useStudioActions();
  const catalog = useThemeCatalog();
  const currentId = useStudio((state) => state.doc.theme.themeId);
  const hasOverrides = useStudio((state) => !isEmptyOverrides(state.doc.theme.overrides));
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const effective = useDraftTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [saveOpen, setSaveOpen] = useState(false);
  const importInput = useRef<HTMLInputElement>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: trpc.themes.list.queryKey() });
  const onError = (error: unknown) =>
    toast.error(
      errorCode(error) === "ENTITLEMENT_REQUIRED" ? t("needsAdvanced") : t("actionFailed"),
      {
        action:
          errorCode(error) === "ENTITLEMENT_REQUIRED"
            ? {
                label: t("upgrade"),
                onClick: () => window.open("/settings/billing", "_blank", "noopener"),
              }
            : undefined,
      },
    );
  const favorite = useMutation(
    trpc.themes.setFavorite.mutationOptions({ onSuccess: invalidate, onError }),
  );
  const duplicate = useMutation(
    trpc.themes.duplicate.mutationOptions({
      onSuccess: (theme) => {
        void invalidate();
        toast.success(t("duplicated", { name: theme.name }));
      },
      onError,
    }),
  );
  const archive = useMutation(
    trpc.themes.archive.mutationOptions({ onSuccess: invalidate, onError }),
  );
  const importTheme = useMutation(
    trpc.themes.import.mutationOptions({
      onSuccess: (theme) => {
        void invalidate();
        toast.success(t("imported", { name: theme.name }));
      },
      onError,
    }),
  );

  const themes = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return (catalog.data ?? []).filter((theme) => {
      if (
        needle &&
        !`${theme.name} ${theme.description ?? ""}`.toLocaleLowerCase().includes(needle)
      )
        return false;
      if (filter === "all") return true;
      if (filter === "favorites") return theme.isFavorite;
      if (filter === "custom") return theme.isCustom;
      return theme.category === filter;
    });
  }, [catalog.data, query, filter]);

  function apply(theme: StudioTheme) {
    if (theme.id === store.getState().doc.theme.themeId && !hasOverrides) return;
    actions.update((doc) => {
      doc.theme = { themeId: theme.id, overrides: {} };
    });
    toast(t("applied", { name: theme.name }), {
      description: hasOverrides ? t("appliedResetHint") : undefined,
      action: { label: t("undo"), onClick: () => actions.undo() },
    });
  }

  function exportTheme(name: string, config: ThemeConfig) {
    const file = { format: THEME_EXPORT_FORMAT, name, config };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "theme"}.olnktr-theme.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function onImport(files: FileList | null) {
    const file = files?.[0];
    if (importInput.current) importInput.current.value = "";
    if (!file) return;
    if (file.size > 64 * 1024) return toast.error(t("importInvalid"));
    try {
      const parsed = themeExportSchema.safeParse(JSON.parse(await file.text()));
      if (!parsed.success) return toast.error(t("importInvalid"));
      importTheme.mutate({ organizationId, file: { ...parsed.data, format: THEME_EXPORT_FORMAT } });
    } catch {
      toast.error(t("importInvalid"));
    }
  }

  const filters: Filter[] = ["all", "favorites", ...THEME_CATEGORIES, "custom"];
  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-subtle"
          aria-hidden="true"
        />
        <input
          className={cn(inputClass, "pl-8")}
          placeholder={t("search")}
          aria-label={t("search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div
        className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
        role="group"
        aria-label={t("categories")}
      >
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
            className="h-7 shrink-0 rounded-full border border-line px-3 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:border-foreground/40 aria-pressed:bg-accent aria-pressed:text-foreground"
          >
            {t(`category.${item}`)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => setSaveOpen(true)}>
          <Save data-icon="inline-start" aria-hidden="true" />
          {t("saveCustom")}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => importInput.current?.click()}
        >
          <Upload data-icon="inline-start" aria-hidden="true" />
          {t("import")}
        </Button>
        <input
          ref={importInput}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          tabIndex={-1}
          aria-label={t("import")}
          onChange={(event) => void onImport(event.target.files)}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => exportTheme(t("myTheme"), effective)}
        >
          <Download data-icon="inline-start" aria-hidden="true" />
          {t("exportCurrent")}
        </Button>
        {hasOverrides ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => actions.update((doc) => void (doc.theme.overrides = {}))}
          >
            <RotateCcw data-icon="inline-start" aria-hidden="true" />
            {t("resetCustomization")}
          </Button>
        ) : null}
      </div>
      {catalog.isPending ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-48 rounded-lg" />
          ))}
        </div>
      ) : themes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong p-6 text-center text-sm text-muted-foreground">
          {filter === "favorites" ? t("emptyFavorites") : t("emptySearch")}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2" aria-label={t("title")}>
          {themes.map((theme) => {
            const active = theme.id === currentId;
            return (
              <li key={theme.id} className="relative">
                <button
                  type="button"
                  onClick={() => apply(theme)}
                  aria-pressed={active}
                  data-testid={`theme-${theme.key ?? theme.id}`}
                  className={cn(
                    "block w-full overflow-hidden rounded-lg border border-line text-left transition-colors hover:border-line-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    active && "border-primary ring-1 ring-primary",
                  )}
                >
                  <ThemeThumbnail config={theme.config} name={theme.name} />
                  <span className="flex items-center gap-1.5 border-t border-line bg-panel px-2.5 py-2">
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">
                      {theme.name}
                    </span>
                    {active ? (
                      <Check className="size-3.5 text-primary" aria-label={t("current")} />
                    ) : null}
                    {theme.isPremium ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "h-5 gap-1 px-1.5 text-[10px]",
                          theme.locked && "border-warn/50 text-warn",
                        )}
                      >
                        {theme.locked ? <Lock className="size-2.5" aria-hidden="true" /> : null}
                        {t("premium")}
                      </Badge>
                    ) : null}
                  </span>
                </button>
                <div className="absolute top-1.5 right-1.5 flex gap-1">
                  <button
                    type="button"
                    aria-pressed={theme.isFavorite}
                    aria-label={
                      theme.isFavorite
                        ? t("unfavorite", { name: theme.name })
                        : t("favorite", { name: theme.name })
                    }
                    onClick={() =>
                      favorite.mutate({ themeId: theme.id, favorite: !theme.isFavorite })
                    }
                    className="inline-flex size-7 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <Star
                      className={cn("size-3.5", theme.isFavorite && "fill-current")}
                      aria-hidden="true"
                    />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={t("moreActions", { name: theme.name })}
                        className="inline-flex size-7 items-center justify-center rounded-md bg-black/45 text-white backdrop-blur hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        <Ellipsis className="size-3.5" aria-hidden="true" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => apply(theme)}>
                          {t("apply")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => duplicate.mutate({ themeId: theme.id, organizationId })}
                        >
                          {t("duplicate")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => exportTheme(theme.name, theme.config)}>
                          {t("export")}
                        </DropdownMenuItem>
                        {theme.isCustom ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => archive.mutate({ themeId: theme.id })}
                          >
                            {t("delete")}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <SaveThemeDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        onSaved={invalidate}
        onError={onError}
      />
    </div>
  );
}

function SaveThemeDialog({
  open,
  onOpenChange,
  onSaved,
  onError,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<unknown>;
  onError: (error: unknown) => void;
}) {
  const t = useTranslations("studio.themes");
  const trpc = useTRPC();
  const store = useStudioStore();
  const actions = useStudioActions();
  const [name, setName] = useState("");
  const save = useMutation(trpc.themes.saveFromProfile.mutationOptions());
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeLabel={t("cancel")}>
        <form
          className="flex flex-col gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const state = store.getState();
            try {
              const theme = await save.mutateAsync({
                profileId: state.profileId,
                name: name.trim(),
                baseThemeId: state.doc.theme.themeId,
                overrides: state.doc.theme.overrides,
              });
              await onSaved();
              actions.update((doc) => void (doc.theme = { themeId: theme.id, overrides: {} }));
              toast.success(t("saved", { name: theme.name }));
              setName("");
              onOpenChange(false);
            } catch (error) {
              onError(error);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{t("saveCustomTitle")}</DialogTitle>
            <DialogDescription>{t("saveCustomDescription")}</DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {t("themeName")}
            <input
              className={inputClass}
              required
              maxLength={60}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!name.trim() || save.isPending}>
              {t("saveTheme")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
