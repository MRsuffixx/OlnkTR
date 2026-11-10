"use client";

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Lock, MousePointer2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import {
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@olnktr/ui";
import type { DocumentBlock } from "@olnktr/validators";
import { blockRegistry } from "@olnktr/validators/blocks";
import { BLOCK_EDITORS } from "../blocks/catalog";
import { duplicateBlock, moveBlock } from "../blocks/operations";
import { useDeleteBlock } from "../blocks/use-delete-block";
import { MediaField } from "../media/media-picker";
import { useStudio, useStudioActions } from "../store/context";
import { ThemeControls } from "../design/theme-controls";
import { useDraftTheme } from "../design/use-theme";
import { ColorInput, FieldRow, inputClass, Segmented } from "../ui/controls";
import { BlockField } from "./block-fields";
import { useFieldError } from "./issues";

/** Right-hand inspector: shows only the settings of the selected element. */
export function Inspector() {
  const selection = useStudio((state) => state.selection);
  const block = useStudio((state) =>
    state.selection?.kind === "block"
      ? state.doc.blocks.find((item) => item.id === (state.selection as { id: string }).id)
      : undefined,
  );
  if (selection?.kind === "block" && block) return <BlockInspector block={block} />;
  if (selection?.kind === "background") return <BackgroundInspector />;
  if (selection?.kind === "profile") return <ProfileInspector />;
  return <EmptyInspector />;
}

function InspectorHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 border-b border-line px-4 py-3">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold" id="inspector-title">
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}

function EmptyInspector() {
  const t = useTranslations("studio.inspector");
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <MousePointer2 className="size-5 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium">{t("emptyTitle")}</p>
      <p className="text-sm text-muted-foreground">{t("emptyDescription")}</p>
    </div>
  );
}

function BlockInspector({ block }: { block: DocumentBlock }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const editor = BLOCK_EDITORS[block.type];
  const allowed = useStudio((state) => state.server.entitlements.blockTypes);
  const index = useStudio((state) => state.doc.blocks.findIndex((item) => item.id === block.id));
  const count = useStudio((state) => state.doc.blocks.length);
  const locked = !(allowed.includes("*") || allowed.includes(block.type));
  const definition = blockRegistry.get(block.type);
  const name = t(`blocks.${block.type}.name`);
  const deleteBlock = useDeleteBlock();

  return (
    <section aria-labelledby="inspector-title" className="flex min-h-0 flex-col">
      <InspectorHeader title={name} subtitle={t(`blocks.${block.type}.description`)}>
        <div className="flex items-center">
          <IconAction
            label={block.isVisible ? t("actions.hide") : t("actions.show")}
            onClick={() =>
              actions.update((doc) => {
                const draft = doc.blocks.find((item) => item.id === block.id);
                if (draft) draft.isVisible = !draft.isVisible;
              })
            }
          >
            {block.isVisible ? <Eye aria-hidden="true" /> : <EyeOff aria-hidden="true" />}
          </IconAction>
          <IconAction
            label={t("actions.moveUp")}
            disabled={index <= 0}
            onClick={() => actions.update((doc) => moveBlock(doc, block.id, -1))}
          >
            <ArrowUp aria-hidden="true" />
          </IconAction>
          <IconAction
            label={t("actions.moveDown")}
            disabled={index >= count - 1}
            onClick={() => actions.update((doc) => moveBlock(doc, block.id, 1))}
          >
            <ArrowDown aria-hidden="true" />
          </IconAction>
          <IconAction
            label={t("actions.duplicate")}
            onClick={() => {
              let copyId: string | null = null;
              actions.update((doc) => {
                copyId = duplicateBlock(doc, block.id);
              });
              if (copyId) actions.select({ kind: "block", id: copyId });
            }}
          >
            <Copy aria-hidden="true" />
          </IconAction>
          <IconAction label={t("actions.delete")} onClick={() => deleteBlock(block.id)}>
            <Trash2 aria-hidden="true" />
          </IconAction>
        </div>
      </InspectorHeader>
      <div className="flex flex-col gap-4 px-4 py-4">
        {locked ? (
          <div className="flex gap-2 rounded-md border border-warn/40 bg-warn/10 p-3 text-xs">
            <Lock className="mt-0.5 size-3.5 shrink-0 text-warn" aria-hidden="true" />
            <p>{t("inspector.lockedBlock")}</p>
          </div>
        ) : null}
        {!block.isVisible ? (
          <p className="rounded-md bg-raised px-3 py-2 text-xs text-muted-foreground">
            {t("inspector.hiddenBlock")}
          </p>
        ) : null}
        {editor
          ? editor.fields.map((field) => (
              <BlockField key={field.name} block={block} field={field} />
            ))
          : null}
      </div>
      {editor?.appearance ? <AppearanceSection block={block} /> : null}
      {editor?.advanced?.length ? (
        <Collapsible className="border-t border-line">
          <CollapsibleTrigger className="w-full px-4 py-3 text-left text-[13px] font-semibold hover:bg-accent/50 focus-visible:bg-accent focus-visible:outline-none">
            {t("inspector.advanced")}
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-4 px-4 pb-4">
            {editor.advanced.map((field) => (
              <BlockField key={field.name} block={block} field={field} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ) : null}
      <p className="mt-auto px-4 py-3 text-[11px] text-subtle">
        {t("inspector.blockVersion", { type: block.type, version: definition?.version ?? 1 })}
      </p>
    </section>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** Block-level overrides (highest precedence in the theme inheritance model). */
function AppearanceSection({ block }: { block: DocumentBlock }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const appearance = block.appearance ?? {};
  const theme = useDraftTheme();
  const set = (
    key: keyof NonNullable<DocumentBlock["appearance"]>,
    value: unknown,
    coalesce = false,
  ) =>
    actions.update(
      (doc) => {
        const draft = doc.blocks.find((item) => item.id === block.id);
        if (!draft) return;
        const next = { ...(draft.appearance ?? {}) } as Record<string, unknown>;
        if (value === undefined) delete next[key];
        else next[key] = value;
        if (Object.keys(next).length) draft.appearance = next;
        else delete draft.appearance;
      },
      coalesce ? { coalesce: `${block.id}:appearance:${key}` } : {},
    );
  const reset = t("actions.resetToTheme");
  return (
    <div className="flex flex-col gap-4 border-t border-line px-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">{t("inspector.appearance")}</h3>
        {Object.keys(appearance).length ? (
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() =>
              actions.update((doc) => {
                const draft = doc.blocks.find((item) => item.id === block.id);
                if (draft) delete draft.appearance;
              })
            }
          >
            {t("actions.resetAll")}
          </Button>
        ) : null}
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{t("inspector.appearanceHint")}</p>
      <FieldRow
        label={t("fields.emphasis")}
        overridden={appearance.emphasis !== undefined}
        onReset={() => set("emphasis", undefined)}
        resetLabel={reset}
      >
        <Segmented
          label={t("fields.emphasis")}
          value={appearance.emphasis ?? "default"}
          options={[
            { value: "default", label: t("options.emphasisDefault") },
            { value: "featured", label: t("options.emphasisFeatured") },
          ]}
          onChange={(value) => set("emphasis", value === "default" ? undefined : value)}
        />
      </FieldRow>
      <FieldRow
        label={t("fields.variant")}
        overridden={appearance.variant !== undefined}
        onReset={() => set("variant", undefined)}
        resetLabel={reset}
      >
        <Segmented
          label={t("fields.variant")}
          value={appearance.variant}
          options={(["filled", "outline", "soft", "ghost"] as const).map((value) => ({
            value,
            label: t(`options.variant_${value}`),
          }))}
          onChange={(value) => set("variant", value)}
        />
      </FieldRow>
      <AppearanceColor
        label={t("fields.buttonColor")}
        value={appearance.background}
        inherited={theme.colors.button}
        onChange={(value) => set("background", value, true)}
        onReset={() => set("background", undefined)}
        reset={reset}
      />
      <AppearanceColor
        label={t("fields.buttonTextColor")}
        value={appearance.text}
        inherited={theme.colors.buttonText}
        onChange={(value) => set("text", value, true)}
        onReset={() => set("text", undefined)}
        reset={reset}
      />
    </div>
  );
}

function AppearanceColor({
  label,
  value,
  inherited,
  onChange,
  onReset,
  reset,
}: {
  label: string;
  value: string | undefined;
  inherited: string;
  onChange: (value: string) => void;
  onReset: () => void;
  reset: string;
}) {
  const id = useId();
  return (
    <FieldRow
      label={label}
      htmlFor={id}
      overridden={value !== undefined}
      onReset={onReset}
      resetLabel={reset}
    >
      <ColorInput id={id} label={label} value={value ?? inherited} onChange={onChange} />
    </FieldRow>
  );
}

function ProfileInspector() {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const profile = useStudio((state) => state.doc.profile);
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const fieldError = useFieldError();
  const nameId = useId();
  const bioId = useId();
  const set = (key: "displayName" | "bio", value: string) =>
    actions.update((doc) => void (doc.profile[key] = value), { coalesce: `profile:${key}` });
  return (
    <section aria-labelledby="inspector-title">
      <InspectorHeader
        title={t("inspector.profileTitle")}
        subtitle={t("inspector.profileSubtitle")}
      />
      <div className="flex flex-col gap-4 px-4 py-4">
        <FieldRow
          label={t("fields.displayName")}
          htmlFor={nameId}
          error={fieldError("profile", "displayName")}
        >
          <input
            id={nameId}
            className={inputClass}
            maxLength={80}
            value={profile.displayName}
            aria-invalid={Boolean(fieldError("profile", "displayName"))}
            onChange={(event) => set("displayName", event.target.value)}
          />
        </FieldRow>
        <FieldRow label={t("fields.bio")} htmlFor={bioId} hint={`${profile.bio.length}/500`}>
          <textarea
            id={bioId}
            className={cn(inputClass, "h-auto min-h-24 py-2")}
            maxLength={500}
            value={profile.bio}
            onChange={(event) => set("bio", event.target.value)}
          />
        </FieldRow>
        <FieldRow label={t("fields.avatar")}>
          <MediaField
            label={t("fields.avatar")}
            value={profile.avatarMediaId}
            organizationId={organizationId}
            purpose="avatar"
            onChange={(mediaId) =>
              actions.update((doc) => void (doc.profile.avatarMediaId = mediaId))
            }
          />
        </FieldRow>
        <FieldRow label={t("fields.cover")} hint={t("hints.cover")}>
          <MediaField
            label={t("fields.cover")}
            value={profile.coverMediaId}
            organizationId={organizationId}
            purpose="cover"
            onChange={(mediaId) =>
              actions.update((doc) => void (doc.profile.coverMediaId = mediaId))
            }
          />
        </FieldRow>
      </div>
      <div className="border-t border-line">
        <ThemeControls sections={["layout"]} compact />
      </div>
    </section>
  );
}

function BackgroundInspector() {
  const t = useTranslations("studio");
  return (
    <section aria-labelledby="inspector-title">
      <InspectorHeader
        title={t("inspector.backgroundTitle")}
        subtitle={t("inspector.backgroundSubtitle")}
      >
        <Badge variant="secondary">{t("design.title")}</Badge>
      </InspectorHeader>
      <ThemeControls sections={["background", "effects"]} compact />
    </section>
  );
}
