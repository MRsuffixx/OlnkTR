# OLNK.TR Existing Product Audit

> Audit date: 2026-08-13  
> Scope: repository structure, runtime architecture, data model, trust boundaries,
> public rendering, dashboard editing, operations, and the profile-builder migration.

## 1. Executive conclusion

OLNK.TR is a production-oriented Next.js application, not a prototype and not a
greenfield codebase. Its authentication, identity, billing, analytics, custom-domain,
storage, administration, and link-routing systems are reusable. Replacing Prisma,
PostgreSQL, Auth.js, tRPC, or the public `/{username}` route would add migration risk
without improving the profile-builder foundation.

The correct evolution path is additive:

- keep `User` as the current profile identity owner and `ProfileLink` as queryable content;
- keep appearance-heavy preferences in a bounded, versioned, Zod-validated document;
- add future socials, badges, sections, widgets, integrations, and themes as relational
  models instead of expanding `Theme.settings` into an opaque profile document;
- centralize plan policy in feature and limit catalogs;
- split the public renderer into shared primitives used by the live preview;
- preserve legacy `Theme` columns until a measured compatibility migration can remove them.

The current appearance document is version 3 and already migrates version-1 and
version-2 data in memory. No destructive database migration is required for the
Phase 1-2 work completed in this pass.

## 2. Repository and runtime inventory

| Area            | Current implementation                                          | Audit conclusion                        |
| --------------- | --------------------------------------------------------------- | --------------------------------------- |
| Runtime         | Node 22.13 target, ESM                                          | Keep                                    |
| Package manager | pnpm 11.9 with a locked workspace                               | Keep                                    |
| Web framework   | Next.js 16 App Router, React 19                                 | Keep                                    |
| Language        | TypeScript strict, no unchecked indexed access                  | Keep as a hard gate                     |
| Database        | PostgreSQL 17 in Compose                                        | Keep                                    |
| ORM             | Prisma 7 ESM client through `src/server/db.ts`                  | Keep singleton boundary                 |
| API             | tRPC 11 + Zod 4 + superjson                                     | Keep for dashboard/application APIs     |
| Authentication  | Auth.js v5 database sessions, Google and email magic links      | Keep                                    |
| Styling         | Tailwind 4 tokens plus structured per-profile CSS variables     | Extend                                  |
| Drag and drop   | dnd-kit sortable links with keyboard sensor                     | Reuse for sections/Bento                |
| Object storage  | S3-compatible presigned uploads                                 | Extend with processing metadata         |
| Billing         | Stripe, iyzico, PayTR, and Adyen adapter registry               | Unrelated; preserve                     |
| Tests           | Vitest, Playwright, axe-core                                    | Extend around registries and migrations |
| Deployment      | Standalone Next image, migration container, PostgreSQL, Mailpit | Preserve                                |

The tracked source surface is small enough to audit directly. The application uses the
App Router only. There is no second API server, hidden worker package, Redux-style store,
or alternate database client.

## 3. Actual user and profile lifecycle

### 3.1 User creation

1. `/register` submits a bounded JSON request to `/api/register/intent`.
2. The route validates email and username with Zod, rate-limits client/email/username,
   and stores a 15-minute `AuthIntent` plus an HttpOnly `olnk-signup-intent` cookie.
3. Auth.js creates the user through the custom Prisma adapter. Email is normalized into
   both `email` and unique `emailNormalized`.
4. `events.createUser` upserts a one-to-one `Theme` row.
5. `events.signIn` updates activity timestamps, ensures the theme again, and attempts to
   consume the signup intent.

### 3.2 Username ownership and profile creation

There is no separate `Profile` row today. A public profile exists when a publishable
`User` has a username. `claimUsername()` validates policy, takes a PostgreSQL advisory
transaction lock, checks the signup intent when supplied, writes normalized identity,
and relies on the unique database constraint as the final race authority. A failed
reservation sends the account through `/onboarding` without deleting the user.

This model is safe to retain while the product has one public identity page per user.
Multiple profiles per account would require a later additive `Profile` owner model and
an explicit data migration; it should not be smuggled into appearance JSON.

### 3.3 Dashboard load and save

`requireDashboardSession()` reloads live account state and redirects unauthenticated,
suspended/banned, or un-onboarded accounts. `workspace.get` returns identity, links,
legacy theme compatibility fields, raw appearance, plan-resolved appearance, locked
paths, and `editorRevision`.

`WorkspaceEditor` holds a local draft, batches saves, and sends the last known revision.
`workspace.save` validates the entire input with `workspaceInput`, merges only permitted
appearance leaves for the account plan, sanitizes legacy custom CSS, and performs one
transaction that:

- compare-and-increments `User.editorRevision`;
- updates display identity;
- upserts the `Theme` with appearance version 3;
- deterministically upserts links by client UUID and array position;
- soft-deletes missing links;
- marks unreferenced ready assets for asynchronous deletion.

The compare-and-increment prevents a stale browser tab from silently overwriting a newer
profile draft.

### 3.4 Public username resolution and rendering

`/{username}` normalizes the route parameter, queries the unique
`User.usernameNormalized` index, and includes theme, entitlement, and ordered active
links. Account publication state is checked before rendering. Profile passwords are
verified before protected content is returned.

The renderer resolves plan fallbacks on the server, filters scheduled links, emits safe
metadata and escaped JSON-LD, then composes background, identity, effects, audio, visitor
proof, links, share controls, and branding. The public route remains unchanged.

### 3.5 Link storage, ordering, and redirects

`ProfileLink` is relational, soft-deletable, owner-scoped, and indexed by
`(userId, deletedAt, position)`. The dashboard array order is the canonical contiguous
position. User URLs accept only `http:` and `https:`. `/go/{id}` repeats publication,
schedule, profile-password, and link-password checks before scheduling analytics with
`after()` and returning a 302.

There is no client-only link rule that can bypass the server redirect boundary.

## 4. Current profile content model

### Relational content already present

- Identity: `User.name`, `username`, `bio`, `image`.
- Links: `ProfileLink` with ordering, scheduling, password state, embed type, and bounded
  per-link customization.
- Social accounts: owner-scoped `SocialAccount` rows with platform-registry IDs, deterministic
  ordering, soft deletion, presentation metadata, and validated provider privacy settings.
- Assets: `UploadedAsset` lifecycle records.
- Domains, analytics, subscriptions, sessions, and audit records are separate models.

### Content models not yet present

- sections;
- widgets;
- badge definitions and assignments;
- reusable/published themes;
- integration connections beyond Auth.js accounts;
- reports and moderation cases.

These missing concepts must become queryable owner-scoped models. They must not be added
to `Theme.settings` or one generic `content` JSON array. Initial model boundaries are
specified in `docs/PROFILE_BUILDER.md`.

## 5. Customization architecture

`Theme` contains legacy scalar columns and the authoritative structured `settings`
document. Legacy columns are still written for compatibility, but new visual behavior
belongs in `AppearanceSettings`.

Appearance version 3 has bounded groups for semantic colors, background, card, avatar,
buttons, typography, layout, effects, audio, social proof, SEO, privacy, and advanced
compatibility features. `parseAppearance()` is the only tolerant read boundary. It
migrates older documents and returns cloned defaults when untrusted data is unusable.
`workspaceInput` is the strict write boundary and rejects unknown or out-of-range input.

Every appearance leaf has an entry in `FEATURE_CATALOG`. Free downgrade resolution keeps
the stored Pro choice but produces a deterministic effective document. Product limits
such as storage and future section/widget counts live in `PLAN_LIMITS` rather than UI or
router magic numbers.

This pass also introduced:

- a reusable multi-stop gradient editor;
- an approved font registry shared by validation, entitlement policy, editor options, and
  CSS-family rendering;
- an effect plugin registry with lazy renderers and per-plugin failure isolation;
- shared background and identity render primitives for public/preview parity;
- mobile, tablet, and desktop preview modes.

## 6. Authentication, authorization, and administration

Auth.js uses database sessions. Protected tRPC procedures reload the current account on
every operation, reject unavailable accounts, and update activity. Admin RSC pages use
`requireAdminSession()` and admin RPC calls independently use `adminProcedure`; a stale
session role cannot retain admin access after the database role changes.

Sensitive admin mutations require a reason and typed confirmation and write immutable
`AdminAuditLog` snapshots. Billing provider secrets and payment identifiers remain
server-only. The admin area currently manages users, account status, usernames,
workspaces, manual Pro grants, subscriptions, invoices, platform analytics, provider
visibility, and audit logs. Theme/badge/report/moderation administration depends on the
future relational models and is intentionally not represented by empty screens.

## 7. Upload and media path

The browser requests a short-lived presigned PUT. The server selects a randomized,
owner-prefixed object key and reserves an `UploadedAsset` row under a transaction and
quota lock. Finalization verifies owner, pending state, exact object size, object metadata
MIME, and now the file container signature read from object bytes. Executable text
renamed as a PNG is rejected and scheduled for deletion. SVG is not accepted.

Plan limits are centralized. Free retains useful avatar and background-image uploads;
video, direct audio, and entry-sound uploads remain Pro. Remaining media work for later
phases is decoding/processing to persist width, height, duration, frame count, and derived
safe variants. External HTTPS image URLs are still supported for compatibility; a future
media proxy should reduce third-party tracking and broken-resource risk.

## 8. Analytics, jobs, caching, and performance

Views and clicks are written after the response path. Raw IP addresses are not stored;
the trusted client address and user agent become an HMAC visitor hash. Bots, duplicate
windows, and abusive rates are filtered. Raw events expire after 90 days while daily
buckets support long-lived counts.

`/api/maintenance` is bearer-protected and handles bounded batches for retention,
expired intents, rate buckets, asset deletion, account deletion, and domain revalidation.
Recurring Adyen billing has a separate bearer-protected route. There is no external job
queue yet.

Public profile data is read directly through Prisma. React `cache()` deduplicates the
profile lookup within a render request; it is not a persistent profile cache. QR responses
have explicit HTTP caching. At larger scale, candidate optimizations are a tagged profile
read cache, cached custom-domain resolution, queued analytics ingestion, and reduced
contention on daily aggregation rows. They should be measured before introduction.

Public pages do not import dashboard drag/drop or editor code. Optional profile effects
and provider players are lazy or conditional. Non-default font preloading is disabled so
profiles do not preload the entire approved font library.

## 9. Security review

| Risk                         | Current control                                                      | Result / remaining work |
| ---------------------------- | -------------------------------------------------------------------- | ----------------------- |
| Stored XSS                   | Plain bio, no user HTML; scoped CSS sanitizer; escaped JSON-LD       | Controlled              |
| Unsafe URL schemes           | Zod restricts links and media to HTTP(S)                             | Controlled              |
| Open redirects               | Redirect target must be an owner-scoped stored safe link             | Controlled              |
| IDOR                         | Protected mutations filter by session owner; admin has separate RBAC | Controlled              |
| Username races               | Advisory lock plus unique normalized index                           | Controlled              |
| Host-header profile takeover | Canonical/preview allowlist plus verified domain lookup              | Controlled              |
| Password bypass              | Server gate repeated in public render and redirect route             | Controlled              |
| Upload spoofing              | Size, metadata MIME, and binary signature validation                 | Fixed in this pass      |
| Dangerous SVG                | SVG is not in the accepted MIME registry                             | Controlled              |
| Unsafe embeds                | HTTPS provider host/path allowlists plus sandboxed iframes and CSP   | Controlled              |
| Webhook forgery/replay       | Provider signatures, raw body, idempotency keys, event ordering      | Controlled              |
| Analytics privacy            | No raw IP persistence, bounded retention, profile opt-out            | Controlled              |
| External media tracking      | Direct HTTPS media remains possible                                  | Medium residual         |
| Arbitrary CSS                | Existing Pro compatibility feature is bounded and sanitized          | Freeze; do not expand   |
| Account hardening            | Suspension, deletion, rate limits exist; 2FA/passkeys do not         | Future security work    |

No critical authentication, IDOR, redirect, or stored-XSS defect was found in the traced
paths. The concrete upload trust gap found during the audit was fixed rather than only
documented.

## 10. Reuse, refactor, and retirement decisions

### Reuse

- Auth.js session and provider configuration;
- username claim transaction;
- Prisma data ownership and soft-delete conventions;
- tRPC procedures and Zod error formatting;
- centralized entitlements and manual grants;
- dnd-kit sensors and optimistic revision model;
- S3 abstraction, analytics ingestion, payment adapters, domain verification, and admin
  audit infrastructure.

### Refactor progressively

- split the remaining public link/share surface into renderer primitives;
- split the 1,735-line appearance editor into category modules using shared controls;
- split the 997-line workspace editor into profile/content/design panels;
- add relational social, section, widget, badge, and theme models in separate migrations;
- add registry contracts before adding many effects/widgets/integrations;
- add media processing metadata and moderation state before accepting broader formats.

### Retire only after migration evidence

- legacy `Theme.background*`, button, text, accent, and font scalar columns;
- duplicated legacy theme input once all supported clients use appearance version 3+;
- broad custom CSS as a product direction. Existing sanitized profiles require a
  compatibility policy before removal.

## 11. Safe implementation order

1. Complete shared renderer/editor primitives and keep Phase 1-2 gates green.
2. Add relational badges, then sections and a versioned widget registry; socials are now
   relational and shipped.
3. Add deterministic Bento placement with keyboard-accessible drag/drop and overlap
   validation.
4. Add reusable theme records/import codes after private-field stripping is proven.
5. Add provider integrations only through server-side connection and cache boundaries.
6. Add advanced Pro rules/effects after public performance budgets are measured.

This order preserves existing users and public URLs while creating the platform needed
for a full website builder rather than a second, incompatible application.
