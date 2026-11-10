"use client";

import { History, Info, TriangleAlert } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@olnktr/ui";
import { profileDocumentSchema } from "@olnktr/validators";
import { useStudio, useStudioActions, useStudioStore } from "../store/context";
import { backupKey, readBackup, usePersistence, type LocalBackup } from "../store/persistence";

function Notice({
  tone,
  icon: Icon,
  children,
}: {
  tone: "info" | "warn";
  icon: typeof Info;
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={
        tone === "warn"
          ? "flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-warn/30 bg-warn/10 px-4 py-2 text-xs"
          : "flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line bg-raised px-4 py-2 text-xs"
      }
    >
      <Icon
        className={tone === "warn" ? "size-4 text-warn" : "size-4 text-muted-foreground"}
        aria-hidden="true"
      />
      {children}
    </div>
  );
}

/** Banners for recovery, read-only access and content changed outside the studio. */
export function StudioNotices() {
  const t = useTranslations("studio.notices");
  const locale = useLocale();
  const store = useStudioStore();
  const actions = useStudioActions();
  const persistence = usePersistence();
  const canEdit = useStudio((state) => state.server.canEdit);
  const liveChanged = useStudio((state) => state.server.liveChangedSinceDraft);
  const [backup, setBackup] = useState<LocalBackup | null>(null);

  useEffect(() => {
    const found = readBackup(store.getState().profileId);
    if (!found) return;
    const parsed = profileDocumentSchema.safeParse(found.doc);
    if (parsed.success && JSON.stringify(parsed.data) !== store.getState().savedJson)
      setBackup({ ...found, doc: parsed.data });
    else window.localStorage.removeItem(backupKey(store.getState().profileId));
  }, [store]);

  const format = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });
  return (
    <>
      {backup ? (
        <Notice tone="warn" icon={History}>
          <span className="flex-1">{t("recovery", { date: format.format(backup.savedAt) })}</span>
          <Button
            size="xs"
            onClick={() => {
              actions.update((doc) => Object.assign(doc, backup.doc));
              setBackup(null);
            }}
          >
            {t("restore")}
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              window.localStorage.removeItem(backupKey(store.getState().profileId));
              setBackup(null);
            }}
          >
            {t("dismiss")}
          </Button>
        </Notice>
      ) : null}
      {!canEdit ? (
        <Notice tone="info" icon={Info}>
          <span>{t("readOnly")}</span>
        </Notice>
      ) : null}
      {liveChanged ? (
        <Notice tone="warn" icon={TriangleAlert}>
          <span className="flex-1">{t("liveChanged")}</span>
          <Button size="xs" variant="ghost" onClick={() => void persistence.discardDraft()}>
            {t("useLive")}
          </Button>
        </Notice>
      ) : null}
      <ConflictDialog />
    </>
  );
}

function ConflictDialog() {
  const t = useTranslations("studio.notices");
  const conflict = useStudio((state) => state.save.status === "conflict");
  const persistence = usePersistence();
  return (
    <AlertDialog open={conflict}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("conflictTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("conflictDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => void persistence.reloadLatest()}>
            {t("loadLatest")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => void persistence.overwriteWithMine()}>
            {t("keepMine")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
