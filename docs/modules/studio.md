# Creator Studio (profile editor)

The studio (`/[locale]/studio/[profileId]`) is the visual editor for a profile. It edits a
**draft document**; the public page changes only when the draft is **published**.

## Draft and publishing model

```
             saveDraft (autosave, revision N → N+1)          publish (revision N)
 studio ───────────────────────────────▶ profile_drafts ───────────────────────▶ profiles / blocks / links
   ▲                                         │   (validate, entitlements,          (what /{username},
   └───────── getState / discard ◀───────────┘    media ownership, one tx)           /go and REST read)
```

- **Document** (`ProfileDocument`, `@olnktr/validators/editor`): profile fields (name, bio,
  avatar, cover, SEO, visibility), theme selection + profile-level overrides, and the ordered
  blocks (each with config, visibility, optional appearance overrides and — for links — the
  link fields).
- **Saving is lenient**: drafts may be mid-edit (empty URL, no image yet). The schema bounds
  shape and size (≤ 200 blocks, ≤ 16 KB per block config, ≤ 512 KB per document).
- **Publishing is strict** (`EditorService.publish`): `validateProfileDocument` (the same
  validator the studio runs live), plan entitlements (premium theme, advanced customization,
  block types, links limit), media ownership, then materialization in **one transaction holding
  the profile row lock**. Existing link rows are updated in place, so `/go/{linkId}` URLs and
  click analytics stay stable. After publishing, the draft is rebuilt from the live rows so new
  blocks get their permanent ids.
- **Optimistic concurrency**: every save sends `expectedRevision`; a mismatch returns `CONFLICT`
  and the studio asks to _load latest_ or _keep mine_ (`expectedRevision: null`).
- **Live changes outside the studio** (REST API, old clients): the draft stores a fingerprint of
  the live content it started from; `liveChangedSinceDraft` warns before publishing over them.
- **Permissions**: viewers can open the studio read-only; editors can save drafts; only owners
  and admins (`profiles:publish`) can publish. Foreign profiles are `NOT_FOUND`.
- **Draft preview** (`/studio/{id}/preview`) renders the draft with the public renderer and
  requires a session with read access. "Copy preview link" shares that URL with teammates.

## Client architecture (`apps/web/src/modules/studio`)

| Area        | Files                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------- |
| State       | `store/store.ts` (external store, history with coalescing), `store/context.tsx` (selectors)   |
| Persistence | `store/persistence.tsx` (debounced autosave, retry/backoff, local backup, publish, conflicts) |
| Shell       | `shell/studio-app.tsx` (desktop/laptop/mobile layouts), `app-rail`, `toolbar`, `notices`      |
| Panels      | `panels/content-panel`, `outline` (dnd-kit), `add-block`, `settings-panel`, `sidebar`         |
| Inspector   | `inspector/inspector.tsx`, `block-fields.tsx` (descriptor-driven), `issues.tsx` (live checks) |
| Design      | `design/theme-gallery.tsx`, `theme-controls.tsx`, `use-theme.ts`                              |
| Preview     | `preview/canvas.tsx` (device frames, selection), `render-blocks.ts`                           |
| Renderer    | `modules/profile-renderer/*` — shared by the canvas, draft preview and public page            |

- State is read with `useStudio(selector)` (`useSyncExternalStore`), so a keystroke re-renders
  only components reading the changed slice; the canvas renders a `useDeferredValue` copy.
- Undo/redo keeps up to 100 document snapshots; rapid edits of one field form one step.
- Autosave runs 1.2 s after the last change; failures retry (2 s, 5 s, 15 s, 30 s) and a copy
  of the unsaved document is kept in `localStorage` and offered for recovery on the next visit.
- Statuses shown are derived from server responses only (saving, saved, not saved, edited
  elsewhere; publishing, published, publish failed).

## Responsive behaviour

| Width     | Layout                                                                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≥ 1280 px | Navigation rail · editor panel (300 px) · canvas · inspector (320 px)                                                                                                                       |
| 1024–1279 | Rail · panel · canvas; the inspector opens as a right-hand sheet                                                                                                                            |
| < 1024 px | Compact header (undo/redo/publish) · full-screen preview · bottom tabs (Content, Design, Settings, Preview); panels and the inspector open as bottom sheets with a "Back to preview" action |

Drag and drop works with pointer, touch (long press) and keyboard (space + arrows, announced);
every block also offers Move up / Move down.

## Keyboard shortcuts

`Ctrl/⌘ Z` undo · `Ctrl/⌘ Shift Z` redo · `Ctrl/⌘ S` save now · `Ctrl/⌘ K` add block ·
`Ctrl/⌘ Enter` open draft preview · `Ctrl/⌘ .` hide panels · `Ctrl/⌘ D` duplicate block ·
`Delete` remove block · `Alt 1/2/3` viewport · `Esc` select header · `?` help.
