"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  CircleAlert,
  Copy,
  Ellipsis,
  EyeOff,
  GripVertical,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@olnktr/ui";
import type { DocumentBlock } from "@olnktr/validators";
import { BLOCK_EDITORS } from "../blocks/catalog";
import { duplicateBlock, moveBlock, reorderBlocks } from "../blocks/operations";
import { useDeleteBlock } from "../blocks/use-delete-block";
import { useIssues } from "../inspector/issues";
import { useStudio, useStudioActions } from "../store/context";

/**
 * Layout structure: the ordered block list. Reordering works by pointer drag,
 * touch drag (long-press), keyboard drag (space + arrows, announced to screen
 * readers) and explicit move up/down actions.
 */
export function BlockOutline({ filter, onAdd }: { filter: string; onAdd: () => void }) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const blocks = useStudio((state) => state.doc.blocks);
  const canEdit = useStudio((state) => state.server.canEdit);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const needle = filter.trim().toLocaleLowerCase();
  const visible = useMemo(
    () =>
      needle
        ? blocks.filter((block) => {
            const editor = BLOCK_EDITORS[block.type];
            const summary = editor?.summary(block.config, block.link) ?? "";
            return `${t(`blocks.${block.type}.name`)} ${summary}`
              .toLocaleLowerCase()
              .includes(needle);
          })
        : blocks,
    [blocks, needle, t],
  );
  const nameOf = (id: string | number) => {
    const index = blocks.findIndex((block) => block.id === id);
    const block = blocks[index];
    return block ? `${t(`blocks.${block.type}.name`)} ${index + 1}` : "";
  };
  const position = (id: string | number | undefined) =>
    blocks.findIndex((block) => block.id === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => t("dnd.picked", { name: nameOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t("dnd.over", { name: nameOf(active.id), position: position(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over
        ? t("dnd.dropped", { name: nameOf(active.id), position: position(over.id) })
        : t("dnd.cancelled"),
    onDragCancel: () => t("dnd.cancelled"),
  };

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    actions.update((doc) => reorderBlocks(doc, String(active.id), String(over.id)));
  }

  if (blocks.length === 0) {
    return (
      <div className="mx-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong px-4 py-8 text-center">
        <p className="text-sm font-medium">{t("outline.emptyTitle")}</p>
        <p className="text-sm text-muted-foreground">{t("outline.emptyDescription")}</p>
        <Button type="button" size="sm" onClick={onAdd} disabled={!canEdit}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          {t("outline.addFirst")}
        </Button>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: { draggable: t("dnd.instructions") },
      }}
    >
      <SortableContext
        items={visible.map((block) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol
          className="flex flex-col gap-0.5 px-2"
          aria-label={t("outline.label")}
          data-testid="block-outline"
        >
          {visible.map((block) => (
            <OutlineRow
              key={block.id}
              block={block}
              index={blocks.indexOf(block)}
              count={blocks.length}
              draggable={canEdit && !needle}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

const OutlineRow = memo(function OutlineRow({
  block,
  index,
  count,
  draggable,
}: {
  block: DocumentBlock;
  index: number;
  count: number;
  draggable: boolean;
}) {
  const t = useTranslations("studio");
  const actions = useStudioActions();
  const selected = useStudio(
    (state) => state.selection?.kind === "block" && state.selection.id === block.id,
  );
  const allowed = useStudio((state) => state.server.entitlements.blockTypes);
  const issues = useIssues().get(block.id);
  const deleteBlock = useDeleteBlock();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    disabled: !draggable,
  });
  const editor = BLOCK_EDITORS[block.type];
  const Icon = editor?.icon;
  const locked = !(allowed.includes("*") || allowed.includes(block.type));
  const name = t(`blocks.${block.type}.name`);
  const summary = editor?.summary(block.config, block.link) || t("outline.untitled");

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative flex items-center gap-1 rounded-md pr-1 text-sm",
        selected ? "bg-accent" : "hover:bg-accent/60",
        isDragging && "z-10 bg-raised shadow-lg ring-1 ring-line-strong",
      )}
      data-testid="outline-row"
      data-block-type={block.type}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={t("dnd.handle", { name })}
        aria-roledescription={t("dnd.roleDescription")}
        disabled={!draggable}
        className="flex h-10 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-subtle hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:cursor-grabbing disabled:cursor-default disabled:opacity-40"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => actions.select({ kind: "block", id: block.id }, { openInspector: true })}
        aria-current={selected ? "true" : undefined}
        className="flex min-w-0 flex-1 items-center gap-2.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded border border-line bg-panel">
          {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={cn(
              "truncate text-[13px] font-medium",
              !block.isVisible && "text-muted-foreground line-through decoration-subtle",
            )}
          >
            {name}
          </span>
          <span className="truncate text-xs text-muted-foreground">{summary}</span>
        </span>
        {issues?.length ? (
          <CircleAlert
            className="size-4 shrink-0 text-danger"
            aria-label={t("outline.hasIssues", { count: issues.length })}
          />
        ) : null}
        {locked ? (
          <Lock className="size-3.5 shrink-0 text-warn" aria-label={t("outline.locked")} />
        ) : null}
        {!block.isVisible ? (
          <EyeOff
            className="size-3.5 shrink-0 text-muted-foreground"
            aria-label={t("outline.hidden")}
          />
        ) : null}
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t("outline.actionsFor", { name })}
            className="opacity-70 group-hover:opacity-100"
          >
            <Ellipsis aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={index === 0}
              onSelect={() => actions.update((doc) => moveBlock(doc, block.id, -1))}
            >
              <ArrowUp aria-hidden="true" />
              {t("actions.moveUp")}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === count - 1}
              onSelect={() => actions.update((doc) => moveBlock(doc, block.id, 1))}
            >
              <ArrowDown aria-hidden="true" />
              {t("actions.moveDown")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() =>
                actions.update((doc) => {
                  const draft = doc.blocks.find((item) => item.id === block.id);
                  if (draft) draft.isVisible = !draft.isVisible;
                })
              }
            >
              <EyeOff aria-hidden="true" />
              {block.isVisible ? t("actions.hide") : t("actions.show")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                let copyId: string | null = null;
                actions.update((doc) => void (copyId = duplicateBlock(doc, block.id)));
                if (copyId) actions.select({ kind: "block", id: copyId });
              }}
            >
              <Copy aria-hidden="true" />
              {t("actions.duplicate")}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => deleteBlock(block.id)}>
            <Trash2 aria-hidden="true" />
            {t("actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  );
});
