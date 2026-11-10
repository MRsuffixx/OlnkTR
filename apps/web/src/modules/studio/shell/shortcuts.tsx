"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@olnktr/ui";
import { duplicateBlock } from "../blocks/operations";
import { useDeleteBlock } from "../blocks/use-delete-block";
import { useStudioActions, useStudioStore } from "../store/context";
import { usePersistence } from "../store/persistence";
import { useStudioChrome } from "./chrome";
import { mod } from "./toolbar";

function isTyping(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  if (!element) return false;
  return element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName);
}

/** Global editor shortcuts. Text editing keeps native undo inside inputs. */
export function useStudioShortcuts(options: { onAddBlock: () => void }) {
  const store = useStudioStore();
  const actions = useStudioActions();
  const persistence = usePersistence();
  const chrome = useStudioChrome();
  const deleteBlock = useDeleteBlock();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();
      if (meta && key === "s") {
        event.preventDefault();
        void persistence.saveNow();
        return;
      }
      if (meta && key === "k") {
        event.preventDefault();
        options.onAddBlock();
        return;
      }
      if (meta && event.key === "Enter") {
        event.preventDefault();
        window.open(`${window.location.pathname.replace(/\/$/, "")}/preview`, "_blank", "noopener");
        return;
      }
      if (event.altKey && ["1", "2", "3"].includes(event.key)) {
        event.preventDefault();
        actions.setViewport(
          event.key === "1" ? "desktop" : event.key === "2" ? "tablet" : "mobile",
        );
        return;
      }
      if (isTyping(event.target)) return;
      if (meta && key === "z") {
        event.preventDefault();
        if (event.shiftKey) actions.redo();
        else actions.undo();
        return;
      }
      if (meta && key === "y") {
        event.preventDefault();
        actions.redo();
        return;
      }
      if (meta && key === ".") {
        event.preventDefault();
        actions.toggleFocusMode();
        return;
      }
      const selection = store.getState().selection;
      if (selection?.kind === "block" && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        deleteBlock(selection.id);
        return;
      }
      if (selection?.kind === "block" && meta && key === "d") {
        event.preventDefault();
        let copyId: string | null = null;
        actions.update((doc) => void (copyId = duplicateBlock(doc, selection.id)));
        if (copyId) actions.select({ kind: "block", id: copyId });
        return;
      }
      if (event.key === "Escape" && selection?.kind !== "profile") {
        actions.select({ kind: "profile" });
        return;
      }
      if (event.key === "?") chrome.openShortcuts();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [store, actions, persistence, chrome, options, deleteBlock]);
}

export function ShortcutsDialog() {
  const t = useTranslations("studio.shortcuts");
  const chrome = useStudioChrome();
  const m = mod();
  const rows: [string, string][] = [
    [`${m} Z`, t("undo")],
    [`${m} ⇧ Z`, t("redo")],
    [`${m} S`, t("save")],
    [`${m} K`, t("addBlock")],
    [`${m} ↵`, t("preview")],
    [`${m} .`, t("focus")],
    [`${m} D`, t("duplicate")],
    ["⌫", t("delete")],
    ["Alt 1 / 2 / 3", t("viewports")],
    ["Esc", t("deselect")],
    ["?", t("help")],
  ];
  return (
    <Dialog open={chrome.shortcutsOpen} onOpenChange={chrome.setShortcutsOpen}>
      <DialogContent closeLabel={t("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {rows.map(([keys, label]) => (
            <div key={label} className="contents">
              <dt>
                <kbd className="rounded border border-line bg-raised px-1.5 py-0.5 text-xs">
                  {keys}
                </kbd>
              </dt>
              <dd className="text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-2 border-t border-line pt-4 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <BookOpen className="size-4" aria-hidden="true" />
            {t("guideTitle")}
          </p>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-foreground">
            <li>{t("guideDrafts")}</li>
            <li>{t("guideThemes")}</li>
            <li>{t("guideBlocks")}</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
