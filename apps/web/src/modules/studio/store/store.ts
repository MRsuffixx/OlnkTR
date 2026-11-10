import type { DocumentIssue, ProfileDocument } from "@olnktr/validators";
import type { AppRouterOutputs } from "~/lib/trpc/types";

/**
 * Studio state container.
 *
 * A tiny external store (subscribe/getState) read through
 * `useSyncExternalStore` with selectors, so a keystroke in one field only
 * re-renders the components that read the changed slice. The document is
 * updated immutably; history keeps previous documents for undo/redo and
 * coalesces rapid edits of the same field into one step.
 */
export type EditorServerState = AppRouterOutputs["editor"]["state"];
export type Selection =
  { kind: "profile" } | { kind: "background" } | { kind: "block"; id: string } | null;
export type Viewport = "desktop" | "tablet" | "mobile";
export type PanelTab = "content" | "design" | "settings";
export type SaveStatus = "saved" | "unsaved" | "saving" | "error" | "conflict";
export type PublishStatus = "idle" | "publishing" | "published" | "failed";
export type MobileSheet = PanelTab | "inspector" | null;

export interface StudioState {
  profileId: string;
  doc: ProfileDocument;
  /** Server revision the current document is based on. */
  revision: number;
  /** Serialized document as last confirmed by the server. */
  savedJson: string;
  save: { status: SaveStatus; error: string | null; lastSavedAt: number | null };
  publish: { status: PublishStatus; error: string | null };
  server: Omit<EditorServerState, "document" | "revision">;
  selection: Selection;
  viewport: Viewport;
  tab: PanelTab;
  section: string | null;
  mobileSheet: MobileSheet;
  focusMode: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 700;

export function createStudioStore(initial: EditorServerState) {
  const { document, revision, ...server } = initial;
  let state: StudioState = {
    profileId: initial.profile.id,
    doc: document,
    revision,
    savedJson: JSON.stringify(document),
    save: { status: "saved", error: null, lastSavedAt: null },
    publish: { status: "idle", error: null },
    server,
    selection: { kind: "profile" },
    viewport: "mobile",
    tab: "content",
    section: null,
    mobileSheet: null,
    focusMode: false,
    canUndo: false,
    canRedo: false,
  };
  const listeners = new Set<() => void>();
  let past: ProfileDocument[] = [];
  let future: ProfileDocument[] = [];
  let lastCoalesce: { key: string; at: number } | null = null;

  function set(patch: Partial<StudioState>) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  }

  function dirtyStatus(doc: ProfileDocument): SaveStatus {
    if (state.save.status === "conflict") return "conflict";
    return JSON.stringify(doc) === state.savedJson ? "saved" : "unsaved";
  }

  function commitDoc(doc: ProfileDocument) {
    set({
      doc,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      save: { ...state.save, status: dirtyStatus(doc), error: null },
      publish:
        state.publish.status === "published" ? { status: "idle", error: null } : state.publish,
    });
  }

  const actions = {
    /**
     * Applies an edit. `recipe` receives a mutable copy of the document.
     * Edits sharing a `coalesce` key within 700ms form a single undo step.
     */
    update: (recipe: (draft: ProfileDocument) => void, options: { coalesce?: string } = {}) => {
      if (!state.server.canEdit) return;
      const next = structuredClone(state.doc);
      recipe(next);
      const now = Date.now();
      const coalesce =
        options.coalesce &&
        lastCoalesce?.key === options.coalesce &&
        now - lastCoalesce.at < COALESCE_MS;
      if (!coalesce) {
        past = [...past.slice(-(HISTORY_LIMIT - 1)), state.doc];
      }
      lastCoalesce = options.coalesce ? { key: options.coalesce, at: now } : null;
      future = [];
      commitDoc(next);
    },
    undo: () => {
      const previous = past.at(-1);
      if (!previous) return;
      past = past.slice(0, -1);
      future = [state.doc, ...future];
      lastCoalesce = null;
      commitDoc(previous);
      actions.repairSelection();
    },
    redo: () => {
      const next = future[0];
      if (!next) return;
      future = future.slice(1);
      past = [...past, state.doc];
      lastCoalesce = null;
      commitDoc(next);
      actions.repairSelection();
    },
    /** Drops a block selection whose block no longer exists (after undo/redo/delete). */
    repairSelection: () => {
      const selection = state.selection;
      if (
        selection?.kind === "block" &&
        !state.doc.blocks.some((block) => block.id === selection.id)
      )
        set({ selection: { kind: "profile" } });
    },
    select: (selection: Selection, options: { openInspector?: boolean } = {}) => {
      set({
        selection,
        mobileSheet: options.openInspector ? "inspector" : state.mobileSheet,
      });
    },
    setViewport: (viewport: Viewport) => {
      set({ viewport });
    },
    setTab: (tab: PanelTab, section: string | null = null) => {
      set({ tab, section, focusMode: false });
    },
    setMobileSheet: (mobileSheet: MobileSheet) => {
      set({ mobileSheet });
    },
    toggleFocusMode: () => {
      set({ focusMode: !state.focusMode });
    },
    markSaving: () => {
      set({ save: { ...state.save, status: "saving", error: null } });
    },
    markSaved: (
      savedDoc: ProfileDocument,
      result: {
        revision: number;
        hasUnpublishedChanges: boolean;
        issues: DocumentIssue[];
        blockers: StudioState["server"]["blockers"];
      },
    ) => {
      const savedJson = JSON.stringify(savedDoc);
      set({
        revision: result.revision,
        savedJson,
        save: {
          status: JSON.stringify(state.doc) === savedJson ? "saved" : "unsaved",
          error: null,
          lastSavedAt: Date.now(),
        },
        server: {
          ...state.server,
          hasUnpublishedChanges: result.hasUnpublishedChanges,
          issues: result.issues,
          blockers: result.blockers,
        },
      });
    },
    markSaveError: (error: string) => {
      set({ save: { ...state.save, status: "error", error } });
    },
    markConflict: (serverRevision: number | null) => {
      set({
        save: { ...state.save, status: "conflict", error: String(serverRevision ?? "") },
      });
    },
    /** Replaces everything with a fresh server state (initial load, publish, reload, discard). */
    replaceFromServer: (next: EditorServerState, options: { keepHistory?: boolean } = {}) => {
      const { document: doc, revision: nextRevision, ...nextServer } = next;
      // Keep the selection on the block at the same position (ids change after publish).
      const selection = state.selection;
      let nextSelection: Selection = selection;
      if (selection?.kind === "block") {
        const index = state.doc.blocks.findIndex((block) => block.id === selection.id);
        const replacement = doc.blocks[index];
        nextSelection = replacement ? { kind: "block", id: replacement.id } : { kind: "profile" };
      }
      if (!options.keepHistory) {
        past = [];
        future = [];
      }
      lastCoalesce = null;
      set({
        doc,
        revision: nextRevision,
        savedJson: JSON.stringify(doc),
        server: nextServer,
        selection: nextSelection,
        save: { status: "saved", error: null, lastSavedAt: Date.now() },
        canUndo: past.length > 0,
        canRedo: future.length > 0,
      });
    },
    setPublish: (publish: StudioState["publish"]) => {
      set({ publish });
    },
  };

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    actions,
  };
}

export type StudioStore = ReturnType<typeof createStudioStore>;
export type StudioActions = StudioStore["actions"];
