# Profile Builder Architecture Guide

This guide is the extension contract for OLNK.TR's identity page, mini-site, and future
widget platform. It complements `ARCHITECTURE.md`, `SCHEMA.md`, and `AGENTS.md`.

## 1. Boundary rule

Use structured configuration for presentation and relational models for content.

| Belongs in appearance configuration     | Belongs in PostgreSQL                   |
| --------------------------------------- | --------------------------------------- |
| Colors, gradients, spacing, typography  | Links and social accounts               |
| Card/avatar geometry and visual effects | Sections and widgets                    |
| Layout mode and responsive preferences  | Badge definitions and assignments       |
| Entry/audio presentation preferences    | Integration connections and tokens      |
| SEO/privacy display preferences         | Themes, ownership, publication, reports |

Enforcement state such as password hashes, account status, ownership, moderation state,
and token secrets is never an appearance field.

## 2. Authoritative configuration lifecycle

`src/lib/appearance.ts` is the only source of truth for the appearance document.

```text
unknown database/client value
  -> parseAppearance()
  -> migrate old version when recognized
  -> validate bounds and reject unknown structure
  -> normalized AppearanceSettings
  -> resolveAppearanceForPlan()
  -> effective public settings
  -> safe render helpers and CSS variables
```

Defaults must come from `DEFAULT_APPEARANCE`. UI components must not invent alternative
fallbacks. A workspace save always persists `APPEARANCE_SETTINGS_VERSION`.

### Adding a customization field

1. Add the bounded Zod field and default in `src/lib/appearance.ts`.
2. Decide whether an older document needs an explicit migration.
3. Add the exact leaf path, fallback, tier, and optional Pro values to
   `src/config/feature-catalog.ts`.
4. Add or reuse an editor control. Do not write an ad-hoc unsafe parser.
5. Render through a shared helper/component used by public and preview surfaces.
6. Add validation, migration, entitlement, and rendering tests.
7. Update `SCHEMA.md`, this guide when the pattern changes, and `progress.md`.

If a field changes the meaning of persisted data, increment the document version. A new
optional field with a safe Zod default may remain in the current version only when its
meaning is fully backward compatible.

## 3. Semantic colors and gradients

Components consume semantic tokens from `appearance.colors` and
`appearanceCssVariables()`. They do not introduce another component-specific color JSON
shape. The required token set covers background, surfaces, card, text, icons, links,
glow/shadow, particles, username, badges, and buttons.

Gradients are stored as `{ type, angle, stops[] }`, never as canonical CSS strings. Stops
are bounded to two through five entries and normalized by position. The reusable editor is
`src/components/dashboard/gradient-editor.tsx`; safe CSS generation remains in
`appearanceBackground()`.

## 4. Font registry

Approved profile fonts live in `src/config/font-registry.ts`. The registry owns IDs,
labels, CSS families, category, and tier. Appearance and link schemas import its Zod enums;
the editor imports its ordered options; the renderer resolves families through the same
registry.

### Adding a font

1. Confirm licensing and Turkish glyph coverage.
2. Add the font ID to the appropriate heading/body tuple.
3. Add one registry definition and its CSS variable.
4. Configure the loader in `src/app/layout.tsx`; non-default fonts use `preload: false`.
5. Add the ID to the intended plan through its registry tier.
6. Test schema acceptance and `profileFontFamily()` output.

Arbitrary `.ttf`/`.otf` uploads are not supported.

## 5. Layout and renderer pipeline

The public surface is composed rather than duplicated per theme:

```text
PublicProfilePage
  -> ProfileBackground
  -> ProfileEffects / ProfileAmbientEffects
  -> profile surface and share tools
  -> ProfileIdentity
  -> link/content renderer
  -> ProfileAudioPlayer
```

The dashboard preview uses the same background, identity, appearance, and profile-style
helpers. Preview-only editing affordances wrap these primitives instead of copying their
visual calculations.

### Adding a layout

1. Add the typed layout ID and default/migration implications to appearance.
2. Add its entitlement policy.
3. Express the layout through shared primitives and data attributes, not a duplicated page.
4. Define phone, tablet, desktop, and ultrawide behavior.
5. Verify keyboard order remains semantic even when visual placement changes.
6. Add public/preview rendering tests and mobile Playwright coverage.

Desktop/mobile settings use inheritance. A missing mobile override resolves to the safe
base/default rather than requiring the user to configure the profile twice.

## 6. Effect registry

Runtime effect plugins are registered in
`src/components/profile/effects/effect-registry.tsx`. A plugin declares:

- stable ID and Turkish label;
- the appearance feature paths that enable it;
- performance-cost class;
- an `enabled` predicate;
- a lazy renderer accepting the shared effect context.

`FEATURE_CATALOG` remains the plan-policy authority. Each plugin is isolated by an error
boundary, and expensive implementations must respect reduced motion, pointer capability,
visibility state, and an explicit particle/frame budget.

### Adding an effect

1. Add bounded settings and defaults to appearance.
2. Add every leaf to the feature catalog.
3. Implement a lazy client renderer with cleanup for every listener/frame/object.
4. Register it once; do not add another public-page conditional.
5. Provide a static/no-op reduced-motion behavior.
6. Test entitlement downgrade and activation.

## 7. Plan entitlements and limits

Visual leaf policy lives in `FEATURE_CATALOG`. Non-appearance capabilities live in
`CAPABILITY_CATALOG`. Numeric/storage/content limits live in
`src/config/plan-limits.ts`.

### Adding a plan-gated feature

1. Add a stable capability or appearance path.
2. Define Free behavior and deterministic fallback before Pro behavior.
3. Enforce on the server; UI locks are explanatory only.
4. Add an entitlement test for Free and Pro.
5. Keep security, privacy, account protection, deletion, and accessibility outside paid
   gates.

Do not read `subscription.plan` inside arbitrary components. Resolve entitlement through
the central server helpers and send only the capability state needed by the client.

## 8. Media system

Uploads use presigned PUTs and an `UploadedAsset` lifecycle. The server validates purpose,
plan capability, quota, exact size, metadata MIME, and binary container signature before
marking an object ready. Object keys are randomized and owner-prefixed. SVG and executable
formats are not accepted.

New media purposes require:

- an `AssetPurpose` enum migration;
- a plan-limit entry;
- accepted MIME and signature handling;
- finalization and cleanup behavior;
- reference tracking so unused objects become `DELETE_PENDING`;
- dimensions/duration/processing state when the media is not safely renderable as-is.

## 9. Relational sections

The first section migration should use an owner-scoped ordered model similar to:

```text
ProfileSection
  id (client-safe UUID)
  userId
  title, icon
  position
  enabled
  layout kind
  bounded visual settings JSON
  createdAt, updatedAt, deletedAt
```

Section settings may describe its surface/layout, but child content remains relational.
The save procedure must verify unique IDs, owner scope, contiguous deterministic ordering,
Free/Pro section limits, and optimistic `editorRevision`.

## 10. Widget registry and model

A widget is a versioned content entity with a discriminated configuration schema. The
registry contract should contain:

```text
type
version
configuration schema and defaults
supported grid sizes by plan
renderer
editor
capability key
permission/integration requirements
server data loader
cache and timeout policy
```

The relational widget row owns user, section, ordering, enabled/moderation state, size, and
validated configuration JSON. Every widget type parses configuration through its own Zod
schema. Unknown versions fail closed to an unavailable widget card; they never crash the
whole public profile.

Initial widgets should be local-data types (text, image, clock, quote, visitor count) before
external integrations. Fake presence, music, or analytics data is forbidden.

## 11. Bento placement

Bento positions must be deterministic records, not an index-modulo rendering trick.
Persist a bounded grid tuple such as column, row, width, and height per viewport. Validate:

- allowed sizes for the plan;
- positive bounds and column count;
- unique element IDs;
- no overlaps;
- stable compaction/order;
- mobile inheritance or explicit mobile placement.

Use dnd-kit pointer, touch, and keyboard sensors. Visual dragging may be optimistic, but
the server remains the final layout validator.

## 12. Themes and sharing

A theme is a versioned appearance snapshot without account-private data. A relational
theme record owns author, visibility, category, preview asset, compatible appearance
version, publication/moderation state, timestamps, and share code.

### Adding/importing a theme

1. Parse through the current appearance migration boundary.
2. Strip identity, links, socials, integration IDs/tokens, asset ownership URLs that are
   not explicitly public theme assets, analytics, domains, and passwords.
3. Resolve plan-incompatible leaves without destroying the stored source theme.
4. Use a collision-resistant share code with a unique database index.
5. Record ownership and moderation state; never trust an author ID from imported JSON.

Built-in presets use `applyAppearancePreset()` and the same document renderer. They do not
create a second theme engine.

## 13. Integrations

Provider tokens remain server-side in a dedicated connection model with encrypted secret
material, expiry, scopes, and refresh state. Widget renderers request normalized cached
data from a provider adapter; they do not call provider APIs from the public browser.

Each adapter defines timeouts, cache lifetime, stale fallback, privacy switches, revocation,
and error normalization. A provider outage hides/degrades only that widget.

## 14. Editor state and reset behavior

The editor keeps a local typed draft, a dirty/saving/error/conflict state, and batched save
behavior. Slider movement must not produce one mutation per pointer event. Category reset
copies defaults only for that appearance group. Full visual reset copies
`DEFAULT_APPEARANCE` and leaves links, identity, analytics, domains, integrations, and
account data untouched.

Future undo/redo can snapshot or patch the local appearance draft because content identity
and persistence are separated. Server revision conflicts still require a deliberate merge
or refresh.

## 15. Performance and accessibility budgets

- Public profile content is server-rendered and usable before optional effect/player code.
- Dashboard packages never enter the public profile bundle.
- Effects use transform/opacity/canvas, bounded object counts, reduced motion, and hidden-tab
  suspension.
- External provider data uses server caching, timeout, and stale fallback.
- Buttons, dialogs, drag handles, and controls remain keyboard reachable and labelled.
- User-selected low contrast may produce a warning; the dashboard itself must remain
  accessible.

Every shipped builder phase runs `pnpm check`, unit tests, production build, and relevant
Playwright coverage. Database phases additionally require a new migration and generated
client verification.
