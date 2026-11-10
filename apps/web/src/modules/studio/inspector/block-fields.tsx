"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { Button, cn } from "@olnktr/ui";
import type { DocumentBlock } from "@olnktr/validators";
import { SOCIAL_PLATFORMS, socialProfileUrl, type SocialPlatform } from "@olnktr/validators/blocks";
import { SOCIAL_LABELS, SocialIcon } from "~/modules/profile-renderer/social-icons";
import { CURRENCY_OPTIONS, type FieldDescriptor } from "../blocks/catalog";
import { readField, writeField } from "../blocks/operations";
import { MediaField } from "../media/media-picker";
import { useStudio, useStudioActions } from "../store/context";
import { FieldRow, inputClass, Segmented, SwitchRow } from "../ui/controls";
import { useFieldError } from "./issues";

/** Renders one descriptor-driven field of a block and writes edits to the draft. */
export function BlockField({ block, field }: { block: DocumentBlock; field: FieldDescriptor }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const organizationId = useStudio((state) => state.server.profile.organizationId);
  const fieldError = useFieldError();
  const id = useId();
  const target = "target" in field ? field.target : undefined;
  const path = `${target ?? "config"}.${field.name}`;
  const error = fieldError(block.id, path);
  const value = readField(block, target, field.name);
  const label = t(`fields.${field.name}`);
  const set = (next: unknown, coalesce = true) =>
    actions.update(
      (doc) => {
        const draft = doc.blocks.find((item) => item.id === block.id);
        if (draft) writeField(draft, target, field.name, next);
      },
      coalesce ? { coalesce: `${block.id}:${path}` } : {},
    );

  switch (field.kind) {
    case "text":
    case "url":
      return (
        <FieldRow label={label} htmlFor={id} error={error}>
          <input
            id={id}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            maxLength={field.kind === "text" ? field.max : 2048}
            placeholder={field.placeholder}
            inputMode={field.kind === "url" ? "url" : undefined}
            autoComplete="off"
            spellCheck={field.kind === "url" ? false : undefined}
            type={field.kind === "url" ? "url" : "text"}
            aria-invalid={Boolean(error)}
            onChange={(event) => set(event.target.value)}
          />
        </FieldRow>
      );
    case "textarea":
      return (
        <FieldRow
          label={label}
          htmlFor={id}
          error={error}
          hint={field.formatting ? t("hints.formatting") : undefined}
        >
          <textarea
            id={id}
            className={cn(inputClass, "h-auto min-h-24 py-2 leading-relaxed")}
            rows={field.rows ?? 4}
            maxLength={field.max}
            value={typeof value === "string" ? value : ""}
            aria-invalid={Boolean(error)}
            onChange={(event) => set(event.target.value)}
          />
        </FieldRow>
      );
    case "segmented":
      return (
        <FieldRow label={label} error={error}>
          <Segmented
            label={label}
            value={value as string | number | undefined}
            options={field.options.map((option) => ({
              value: option.value,
              label: t(`options.${option.label}`),
            }))}
            onChange={(next) => set(next, false)}
          />
        </FieldRow>
      );
    case "select":
      return (
        <FieldRow label={label} htmlFor={id} error={error}>
          <select
            id={id}
            className={inputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => set(event.target.value, false)}
          >
            {field.options.map((option) => (
              <option key={String(option.value)} value={option.value}>
                {SOCIAL_LABELS[option.value as SocialPlatform] ?? t(`options.${option.label}`)}
              </option>
            ))}
          </select>
        </FieldRow>
      );
    case "switch": {
      const defaultOn =
        field.name === "trackClicks" ||
        field.name === "isActive" ||
        field.name === "openInNewTab" ||
        field.name === "muted" ||
        field.name === "showMap";
      return (
        <SwitchRow
          label={label}
          hint={field.hint ? t(`hints.${field.name}`) : undefined}
          checked={
            typeof value === "boolean"
              ? value
              : field.name === "openInNewTab" && target === "link"
                ? false
                : defaultOn
          }
          onChange={(checked) => set(checked, false)}
        />
      );
    }
    case "number":
      return (
        <FieldRow
          label={label}
          htmlFor={id}
          error={error}
          overridden={field.optional && typeof value === "number"}
          onReset={field.optional ? () => set(undefined, false) : undefined}
          resetLabel={t("actions.resetField")}
        >
          <div className="flex items-center gap-2">
            <input
              id={id}
              type="number"
              className={inputClass}
              min={field.min}
              max={field.max}
              step={field.step ?? 1}
              value={typeof value === "number" ? value : ""}
              onChange={(event) =>
                set(event.target.value === "" ? undefined : Number(event.target.value))
              }
            />
            {field.unit ? (
              <span className="text-xs text-muted-foreground">{field.unit}</span>
            ) : null}
          </div>
        </FieldRow>
      );
    case "media":
      return (
        <FieldRow label={label} error={error}>
          <MediaField
            label={label}
            value={typeof value === "string" ? value : null}
            organizationId={organizationId}
            purpose={field.purpose}
            onChange={(mediaId) => set(mediaId ?? undefined, false)}
          />
        </FieldRow>
      );
    case "datetime":
      return (
        <FieldRow
          label={label}
          htmlFor={id}
          error={error}
          overridden={typeof value === "string" && value !== ""}
          onReset={() => set(target === "link" ? null : undefined, false)}
          resetLabel={t("actions.clear")}
        >
          <input
            id={id}
            type="datetime-local"
            className={inputClass}
            value={toLocalInput(value)}
            onChange={(event) =>
              set(
                event.target.value
                  ? new Date(event.target.value).toISOString()
                  : target === "link"
                    ? null
                    : undefined,
                false,
              )
            }
          />
        </FieldRow>
      );
    case "price":
      return <PriceField block={block} label={label} error={error} />;
    case "embed":
      return <EmbedField block={block} field={field} label={label} error={error} />;
    case "socials":
      return <SocialsField block={block} />;
    case "faq":
      return <FaqField block={block} />;
    case "gallery":
      return <GalleryField block={block} organizationId={organizationId} />;
  }
}

function toLocalInput(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function useBlockUpdater(blockId: string) {
  const actions = useStudioActions();
  return (recipe: (block: DocumentBlock) => void, coalesce?: string) =>
    actions.update(
      (doc) => {
        const draft = doc.blocks.find((item) => item.id === blockId);
        if (draft) recipe(draft);
      },
      coalesce ? { coalesce: `${blockId}:${coalesce}` } : {},
    );
}

function PriceField({
  block,
  label,
  error,
}: {
  block: DocumentBlock;
  label: string;
  error: string | null;
}) {
  const t = useTranslations("studio");
  const update = useBlockUpdater(block.id);
  const id = useId();
  const minor = block.config.priceMinor;
  return (
    <FieldRow label={label} htmlFor={id} error={error}>
      <div className="flex gap-2">
        <input
          id={id}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          className={inputClass}
          value={typeof minor === "number" ? minor / 100 : ""}
          onChange={(event) =>
            update((draft) => {
              if (event.target.value === "") delete draft.config.priceMinor;
              else draft.config.priceMinor = Math.round(Number(event.target.value) * 100);
            }, "price")
          }
        />
        <select
          aria-label={t("fields.currency")}
          className={cn(inputClass, "w-24")}
          value={typeof block.config.currency === "string" ? block.config.currency : "TRY"}
          onChange={(event) => update((draft) => void (draft.config.currency = event.target.value))}
        >
          {CURRENCY_OPTIONS.map((currency) => (
            <option key={currency}>{currency}</option>
          ))}
        </select>
      </div>
    </FieldRow>
  );
}

function EmbedField({
  block,
  field,
  label,
  error,
}: {
  block: DocumentBlock;
  field: Extract<FieldDescriptor, { kind: "embed" }>;
  label: string;
  error: string | null;
}) {
  const t = useTranslations("studio");
  const update = useBlockUpdater(block.id);
  const id = useId();
  const [text, setText] = useState(() => field.display(block.config));
  const [unrecognised, setUnrecognised] = useState(false);
  return (
    <FieldRow
      label={t("fields.embedUrl")}
      htmlFor={id}
      error={unrecognised ? t("issues.embedUnrecognised") : error}
      hint={t("hints.embedUrl")}
    >
      <input
        id={id}
        className={inputClass}
        value={text}
        aria-describedby={`${id}-label`}
        aria-invalid={unrecognised || Boolean(error)}
        placeholder={label}
        onChange={(event) => {
          setText(event.target.value);
          const parsed = field.parse(event.target.value);
          setUnrecognised(Boolean(event.target.value) && !parsed);
          if (parsed) update((draft) => Object.assign(draft.config, parsed), "embed");
        }}
      />
    </FieldRow>
  );
}

function ListControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const t = useTranslations("studio.actions");
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={index === 0}
        onClick={() => onMove(-1)}
        aria-label={t("moveUp")}
      >
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
        aria-label={t("moveDown")}
      >
        <ArrowDown aria-hidden="true" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={onRemove}
        aria-label={t("remove")}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

function moveItem<T>(items: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= items.length) return;
  const [item] = items.splice(index, 1);
  items.splice(target, 0, item!);
}

type SocialItem = { platform: SocialPlatform; url: string };

function SocialsField({ block }: { block: DocumentBlock }) {
  const t = useTranslations("studio");
  const update = useBlockUpdater(block.id);
  const fieldError = useFieldError();
  const items = (Array.isArray(block.config.items) ? block.config.items : []) as SocialItem[];
  const [platform, setPlatform] = useState<SocialPlatform>("instagram");
  const [handle, setHandle] = useState("");
  const [invalid, setInvalid] = useState(false);
  const add = () => {
    const url = socialProfileUrl(platform, handle);
    if (!url) return setInvalid(true);
    setInvalid(false);
    setHandle("");
    update((draft) => {
      const list = (Array.isArray(draft.config.items) ? draft.config.items : []) as SocialItem[];
      draft.config.items = [...list, { platform, url }];
    });
  };
  return (
    <FieldRow label={t("fields.items")} error={fieldError(block.id, "config.items")}>
      <ul className="flex flex-col gap-1.5">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2 rounded-md border border-line bg-raised/50 py-1 pr-1 pl-2"
          >
            <SocialIcon platform={item.platform} className="size-4 shrink-0" />
            <input
              aria-label={SOCIAL_LABELS[item.platform]}
              className={cn(inputClass, "h-8 border-0 px-1")}
              value={item.url}
              onChange={(event) =>
                update((draft) => {
                  (draft.config.items as SocialItem[])[index]!.url = event.target.value;
                }, `social-${index}`)
              }
            />
            <ListControls
              index={index}
              count={items.length}
              onMove={(delta) =>
                update((draft) => moveItem(draft.config.items as SocialItem[], index, delta))
              }
              onRemove={() =>
                update((draft) => {
                  (draft.config.items as SocialItem[]).splice(index, 1);
                })
              }
            />
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <select
          aria-label={t("fields.platform")}
          className={cn(inputClass, "w-32")}
          value={platform}
          onChange={(event) => setPlatform(event.target.value as SocialPlatform)}
        >
          {SOCIAL_PLATFORMS.map((value) => (
            <option key={value} value={value}>
              {SOCIAL_LABELS[value]}
            </option>
          ))}
        </select>
        <input
          aria-label={t("fields.handleOrUrl")}
          placeholder={t("fields.handleOrUrl")}
          autoComplete="off"
          spellCheck={false}
          className={inputClass}
          value={handle}
          aria-invalid={invalid}
          onChange={(event) => setHandle(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={add}
          aria-label={t("actions.addSocial")}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
      {invalid ? (
        <p className="text-xs text-danger" role="alert">
          {t("issues.socialHandle")}
        </p>
      ) : null}
    </FieldRow>
  );
}

type FaqItem = { question: string; answer: string };

function FaqField({ block }: { block: DocumentBlock }) {
  const t = useTranslations("studio");
  const update = useBlockUpdater(block.id);
  const fieldError = useFieldError();
  const items = (Array.isArray(block.config.items) ? block.config.items : []) as FaqItem[];
  return (
    <FieldRow label={t("fields.questions")} error={fieldError(block.id, "config.items")}>
      <ol className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex flex-col gap-1.5 rounded-md border border-line p-2">
            <div className="flex items-center gap-1">
              <input
                aria-label={t("fields.question")}
                placeholder={t("fields.question")}
                className={cn(inputClass, "h-8")}
                value={item.question}
                onChange={(event) =>
                  update(
                    (draft) =>
                      void ((draft.config.items as FaqItem[])[index]!.question =
                        event.target.value),
                    `q-${index}`,
                  )
                }
              />
              <ListControls
                index={index}
                count={items.length}
                onMove={(delta) =>
                  update((draft) => moveItem(draft.config.items as FaqItem[], index, delta))
                }
                onRemove={() =>
                  update((draft) => void (draft.config.items as FaqItem[]).splice(index, 1))
                }
              />
            </div>
            <textarea
              aria-label={t("fields.answer")}
              placeholder={t("fields.answer")}
              className={cn(inputClass, "h-auto min-h-16 py-1.5")}
              value={item.answer}
              onChange={(event) =>
                update(
                  (draft) =>
                    void ((draft.config.items as FaqItem[])[index]!.answer = event.target.value),
                  `a-${index}`,
                )
              }
            />
          </li>
        ))}
      </ol>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={items.length >= 20}
        onClick={() =>
          update((draft) => {
            draft.config.items = [
              ...((draft.config.items as FaqItem[] | undefined) ?? []),
              { question: "", answer: "" },
            ];
          })
        }
      >
        <Plus data-icon="inline-start" aria-hidden="true" />
        {t("actions.addQuestion")}
      </Button>
    </FieldRow>
  );
}

type GalleryItem = { mediaId: string; alt: string };

function GalleryField({
  block,
  organizationId,
}: {
  block: DocumentBlock;
  organizationId: string | null;
}) {
  const t = useTranslations("studio");
  const update = useBlockUpdater(block.id);
  const fieldError = useFieldError();
  const items = (Array.isArray(block.config.items) ? block.config.items : []) as GalleryItem[];
  return (
    <FieldRow label={t("fields.images")} error={fieldError(block.id, "config.items")}>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={`${item.mediaId}-${index}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${item.mediaId}`}
              alt=""
              className="size-10 shrink-0 rounded object-cover"
            />
            <input
              aria-label={t("fields.alt")}
              placeholder={t("fields.alt")}
              className={cn(inputClass, "h-8")}
              value={item.alt}
              onChange={(event) =>
                update(
                  (draft) =>
                    void ((draft.config.items as GalleryItem[])[index]!.alt = event.target.value),
                  `alt-${index}`,
                )
              }
            />
            <ListControls
              index={index}
              count={items.length}
              onMove={(delta) =>
                update((draft) => moveItem(draft.config.items as GalleryItem[], index, delta))
              }
              onRemove={() =>
                update((draft) => void (draft.config.items as GalleryItem[]).splice(index, 1))
              }
            />
          </li>
        ))}
      </ul>
      {items.length < 12 ? (
        <MediaField
          label={t("fields.images")}
          value={null}
          organizationId={organizationId}
          purpose="block_image"
          onChange={(mediaId) =>
            mediaId &&
            update((draft) => {
              draft.config.items = [
                ...((draft.config.items as GalleryItem[] | undefined) ?? []),
                { mediaId, alt: "" },
              ];
            })
          }
        />
      ) : null}
    </FieldRow>
  );
}
