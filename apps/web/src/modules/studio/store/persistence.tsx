"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { createContext, use, useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { toast } from "sonner";
import type { ProfileDocument } from "@olnktr/validators";
import { useTRPC } from "~/lib/trpc/client";
import { useStudioStore } from "./context";

/**
 * Draft persistence: debounced autosave with optimistic concurrency, retry
 * with backoff, a local backup for crash/offline recovery, and publishing.
 * Status is always derived from real server responses — nothing is reported
 * as saved or published before the server confirms it.
 */
const AUTOSAVE_DELAY_MS = 1200;
const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000];

export function backupKey(profileId: string) {
  return `olnktr:studio:backup:${profileId}`;
}

export interface LocalBackup {
  revision: number;
  savedAt: number;
  doc: ProfileDocument;
}

export function readBackup(profileId: string): LocalBackup | null {
  try {
    const raw = window.localStorage.getItem(backupKey(profileId));
    return raw ? (JSON.parse(raw) as LocalBackup) : null;
  } catch {
    return null;
  }
}

function writeBackup(profileId: string, backup: LocalBackup | null) {
  try {
    if (backup) window.localStorage.setItem(backupKey(profileId), JSON.stringify(backup));
    else window.localStorage.removeItem(backupKey(profileId));
  } catch {
    // Storage can be unavailable (private mode, quota); autosave still works.
  }
}

interface ErrorLike {
  message?: string;
  data?: {
    appCode?: string | null;
    code?: string;
    details?: Record<string, unknown> | null;
  } | null;
}

export function errorCode(error: unknown): string | null {
  const data = (error as ErrorLike | null)?.data;
  return data?.appCode ?? data?.code ?? null;
}

export function errorDetails(error: unknown): Record<string, unknown> | null {
  return (error as ErrorLike | null)?.data?.details ?? null;
}

export interface PersistenceController {
  saveNow: () => Promise<boolean>;
  publish: () => Promise<void>;
  reloadLatest: () => Promise<void>;
  overwriteWithMine: () => Promise<void>;
  discardDraft: () => Promise<void>;
}

const PersistenceContext = createContext<PersistenceController | null>(null);

export function usePersistence(): PersistenceController {
  const controller = use(PersistenceContext);
  if (!controller) throw new Error("usePersistence must be used inside <StudioPersistence>");
  return controller;
}

export function StudioPersistence({ children }: { children: ReactNode }) {
  const t = useTranslations("studio.status");
  const trpc = useTRPC();
  const store = useStudioStore();
  const saveMutation = useMutation(trpc.editor.saveDraft.mutationOptions());
  const publishMutation = useMutation(trpc.editor.publish.mutationOptions());
  const discardMutation = useMutation(trpc.editor.discard.mutationOptions());
  const queryClient = useQueryClient();
  const inFlight = useRef<Promise<boolean> | null>(null);
  const timer = useRef<number | null>(null);
  const retry = useRef(0);

  const save = useCallback(
    async (force = false): Promise<boolean> => {
      if (inFlight.current) {
        await inFlight.current;
      }
      const state = store.getState();
      if (!state.server.canEdit) return false;
      if (state.save.status === "conflict" && !force) return false;
      const doc = state.doc;
      if (!force && JSON.stringify(doc) === state.savedJson) return true;
      store.actions.markSaving();
      const run = (async () => {
        try {
          const result = await saveMutation.mutateAsync({
            profileId: state.profileId,
            document: doc,
            expectedRevision: force ? null : state.revision,
          });
          retry.current = 0;
          store.actions.markSaved(doc, result);
          if (JSON.stringify(store.getState().doc) === JSON.stringify(doc))
            writeBackup(state.profileId, null);
          return true;
        } catch (error) {
          const code = errorCode(error);
          if (code === "CONFLICT") {
            const revision = errorDetails(error)?.revision;
            store.actions.markConflict(typeof revision === "number" ? revision : null);
            return false;
          }
          store.actions.markSaveError(
            code === "UNAUTHORIZED" ? t("errorSession") : t("errorNetwork"),
          );
          const delay = RETRY_DELAYS_MS[Math.min(retry.current, RETRY_DELAYS_MS.length - 1)]!;
          retry.current += 1;
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => void save(), delay);
          return false;
        } finally {
          inFlight.current = null;
        }
      })();
      inFlight.current = run;
      const saved = await run;
      // Edits made while the request was in flight get their own save.
      const after = store.getState();
      if (saved && after.save.status === "unsaved") schedule();
      return saved;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, t],
  );

  const schedule = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void save(), AUTOSAVE_DELAY_MS);
  }, [save]);

  // Autosave + local backup on every document change.
  useEffect(() => {
    let previousDoc = store.getState().doc;
    let backupTimer: number | null = null;
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      if (state.doc === previousDoc) return;
      previousDoc = state.doc;
      if (state.save.status === "unsaved") {
        schedule();
        if (backupTimer) window.clearTimeout(backupTimer);
        backupTimer = window.setTimeout(() => {
          const latest = store.getState();
          if (latest.save.status !== "saved")
            writeBackup(latest.profileId, {
              revision: latest.revision,
              savedAt: Date.now(),
              doc: latest.doc,
            });
        }, 400);
      }
    });
    return () => {
      unsubscribe();
      if (backupTimer) window.clearTimeout(backupTimer);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [store, schedule]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const status = store.getState().save.status;
      if (status !== "saved") event.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [store]);

  const controller = useMemo<PersistenceController>(
    () => ({
      saveNow: () => save(),
      async publish() {
        const state = store.getState();
        if (state.publish.status === "publishing") return;
        store.actions.setPublish({ status: "publishing", error: null });
        const saved = await save();
        if (!saved) {
          store.actions.setPublish({ status: "failed", error: "save" });
          return;
        }
        try {
          const next = await publishMutation.mutateAsync({
            profileId: state.profileId,
            expectedRevision: store.getState().revision,
          });
          store.actions.replaceFromServer(next, { keepHistory: false });
          store.actions.setPublish({ status: "published", error: null });
          writeBackup(state.profileId, null);
          toast.success(t("publishedToast"));
        } catch (error) {
          const code = errorCode(error);
          store.actions.setPublish({ status: "failed", error: code ?? "generic" });
          if (code === "CONFLICT") store.actions.markConflict(null);
        }
      },
      async reloadLatest() {
        const fresh = await queryClient.fetchQuery({
          ...trpc.editor.state.queryOptions({ profileId: store.getState().profileId }),
          staleTime: 0,
        });
        store.actions.replaceFromServer(fresh);
        writeBackup(store.getState().profileId, null);
      },
      async overwriteWithMine() {
        await save(true);
      },
      async discardDraft() {
        const next = await discardMutation.mutateAsync({ profileId: store.getState().profileId });
        store.actions.replaceFromServer(next);
        writeBackup(next.profile.id, null);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [save, store, t],
  );

  return <PersistenceContext value={controller}>{children}</PersistenceContext>;
}
