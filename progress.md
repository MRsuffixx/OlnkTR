# progress.md — Dynamic Project Tracker

> Protected branch: `main`; feature branches follow `AGENTS.md` §7.6.
> This file is the canonical status board; update whenever features ship, the stack changes, or in-progress work starts/stops.

---

## 1. Current Status

### 1.1 Shipped and Working (Free Tier)

- Public profile at `olnk.tr/[username]` (RSC) with background, avatar, bio, links, and brand chip.
- Google OAuth and Nodemailer magic-link sign-in with Turkish, escaped text/HTML messages.
- Production-style Docker Compose stack with PostgreSQL 17, automatic migrations,
  standalone Next.js runtime, health checks, and a Mailpit development inbox.
- Username claim with `pg_advisory_xact_lock` + DB unique constraint as authority.
- Drag-and-drop link reorder via `@dnd-kit`.
- Per-link icons, enable/disable, and drag-and-drop ordering.
- Appearance studio with 8 tabs (background, buttons, typography, layout, effects, audio, counter, advanced).
- Click + view tracking with 30-minute view dedupe, daily buckets, and country recording (when `TRUSTED_IP_HEADER` is configured).
- Honest optional all-time/today visitor counter backed by real analytics buckets.
- Gesture-first Spotify and SoundCloud profile audio with accessible stop/mute controls.
- 30-day analytics dashboard with bar chart and per-link clicks.
- QR code generation at `/api/qr/[username]` (PNG, 1h cache + 24h SWR).
- Account deletion pipeline (`AccountDeletionJob` + cron + manual trigger).
- Maintenance cron (`/api/maintenance`) covering rate buckets, events, intents, challenges, assets, deletions, domain revalidations.
- Email normalisation single source of truth (`src/lib/email.ts`).
- Username normalisation and moderation (`src/lib/username.ts`, `src/config/username-policy.ts`).
- Accessibility suite: axe-core on `/`, `/login`, `/register`; redirect test on `/dashboard/billing`; 404 path.
- Admin control room under `/admin`: live database RBAC, user/workspace/account operations,
  unified subscriptions, revenue/platform charts, provider visibility, immutable audit, and
  trusted-shell role management.
- Full website builder dashboard with dedicated Profile, Content, Social, Design, and Music workspaces plus shared mobile, tablet, and desktop live previews.
- Appearance document v3 with explicit v1/v2 migration, semantic colour tokens, dedicated avatar settings, profile cards, layout templates, SEO/privacy settings, and a Free minimal preset.
- Reusable two-to-five-stop linear/radial gradient editor, approved font registry, image backgrounds, core card/avatar controls, and basic Bento/terminal layouts.
- Free avatar/background-image uploads with centralized 100 MB profile storage limits and binary container-signature verification.
- Public/preview background and identity parity through shared primitives; ambient effects activate through a lazy plugin registry.

### 1.2 Shipped and Working (Pro Tier)

- All Pro-only appearance paths (Crown icon + lock).
- Custom CSS via postcss-based `sanitizeCustomCss` scoped to `[data-olnk-profile]`.
- YouTube and Spotify embeds (`profileEmbedUrl`).
- Custom domains (up to 3 per user, 24h claim window, reclaim challenges).
- Larger S3-compatible media limits (up to 1 GB total, 200 MB background video, and 50 MB direct audio/image classes as configured in `PLAN_LIMITS`).
- Stripe subscriptions (automatic renewal).
- iyzico subscriptions (automatic, hosted HTML, identity required at checkout).
- PayTR (manual, iFrame, no card storage).
- Adyen Drop-in + recurring (CRON-driven via `/api/billing/renew`).
- 7 / 30 / 90-day analytics windows.
- Advanced analytics block (views, unique visitors, top countries, devices, sources).
- "Remove branding" toggle.
- Advanced billing UI: provider chooser, status card, cancel confirm, last 24 invoices.
- Direct profile-audio and entry-sound uploads, custom player skins, and loop controls.
- Independently toggleable lazy canvas/CRT effects with reduced-motion and hidden-tab safeguards.
- Whole-profile password protection with server-side content withholding, throttled scrypt verification, and versioned HttpOnly access cookies.
- Near-live distinct visitor counter and retro digital style.
- Full-profile Frost Glass, Midnight, Cyber Grid, and Retro Terminal presets with centrally enforced leaf-level entitlements.
- Bounded background media filters, card/avatar borders and shadows, responsive page spacing, and conflict-free avatar motion/hover controls.

### 1.3 Quality Gates (Green)

- `pnpm check` (ESLint + tsc, `--max-warnings=0`).
- `pnpm test` (Vitest unit, including payment provider fixtures, sanitizers, entitlement resolution).
- `pnpm audit --prod --audit-level high`.
- `pnpm build` (Next.js production build).
- `pnpm test:e2e` (Playwright Chromium + mobile-chromium, port 3100, with `RUN_DATABASE_E2E=1`).
- `docker compose up --build --wait` plus a real Auth.js → SMTP → callback/session
  smoke test against Mailpit.

---

## 2. In-Progress Tasks

> Items currently being worked on; promote to §1.1/1.2 once merged.

| Task                                 | Owner context | Notes                                                                                                                                                               |
| ------------------------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Live checkout result overlay**     | stabilisation | The `/dashboard/billing?checkout=…&intent=…` states already pass to `<BillingSettings/>`; refine the success / failure copy and link to the updated settings panel. |
| **PayTR local-mode pricing display** | stabilisation | `LOCAL_PRO_*_TRY` defaults to `12900` / `94900`; verify against the production PayTR dashboard before launch.                                                       |
| **Mobile profile editor**            | planning      | Editor is currently desktop-first; long-term goal is a feature-parity mobile experience.                                                                            |

---

## 3. Backlog / Roadmap

### 3.1 Reliability & Operations

- [ ] **Measured profile caching** — when traffic data justifies it, introduce a tagged profile read cache and mutation invalidation together; the current dynamic route reads Prisma state on each request.
- [ ] **Web vitals on the public profile** — track LCP/CLS as design-time telemetry (no SDK; manual sampling).
- [ ] **Background-job queue** — out-of-process worker (e.g. Inngest, BullMQ, or `pg-boss`) for high-volume recurring billing. Today, billing events are reconciled inside the HTTP request thread.
- [ ] **Replay endpoint for failed webhooks** — a UI button on `/dashboard/billing` that retries the most recent `WebhookEvent.status = FAILED` events.
- [ ] **Health check route** — `/api/health` returning DB + storage round-trip latencies.

### 3.2 Features

- [ ] **Subscription upgrade from `/dashboard`** — right now "Upgrade" always opens the provider chooser. Consider one-click upgrade for returning users.
- [ ] **Email change verification** — currently `emailNormalized` is updated on every sign-in; add a confirmation step.
- [ ] **Two-factor auth (TOTP)** — Auth.js core supports it; wiring it would lock the dashboard.
- [ ] **Username history audit trail** — log every `usernameChangedAt` flip into an immutable `UsernameHistory` table.
- [ ] **Bulk link import** — CSV/JSON upload that validates against `workspaceLinkInput`.
- [ ] **Theme marketplace** — shareable appearance presets by URL, opt-in.

### 3.3 Design

- [ ] **Replacement for Iowan Old Style** — the serif stack is constrained to Apple platforms; document the fall-back behaviour for Android/Linux.
- [ ] **Spacing tokens** — beyond the existing `spacing.density` choice, consider adding named tokens (`sm | md | lg`) to the appearance schema.
- [ ] **Dark mode for the dashboard** — the public profile already supports it via appearance; the dashboard does not.

### 3.4 Refactors (Technical Debt)

- [ ] **Reduce `workspace-editor.tsx` size** — about 1,000 lines; candidate splits: builder panels, `SortableLink`, save drain, and preview frame.
- [ ] **Reduce `appearance-editor.tsx` size** — about 1,700 lines; split category modules while retaining shared controls/registries.
- [ ] **`processBillingEvent` complexity** — 390 lines; consider extracting the per-event-type handlers into separate functions/tables.
- [ ] **Replace `console.*` logging with a tiny structured logger** — JSON output to stdout, available in Vercel logs.

---

## 4. Known Bugs

> Tracked and resolved via `.memory-bank/known_issues.md`. Add an entry there for every non-trivial fix.

| #   | Symptom                                                                                                                                                                                                 | Severity            | Status                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------ |
| 1   | PayTR `cancelSubscription` is intentionally a no-op; users must complete the term manually                                                                                                              | Behavioural         | Documented (see `src/server/payments/adapters/paytr.ts:186`) |
| 2   | Dark Reader extension causes hydration warnings on `<html>` and `<svg>`                                                                                                                                 | Cosmetic (dev only) | Documented (see `AGENTS.md §11`)                             |
| 3   | `next dev` shows `scroll-behavior: smooth` warning until we apply `data-scroll-behavior="smooth"` (the current `globals.css` `scroll-behavior: smooth` rule still triggers Next's router-level scanner) | Cosmetic            | Open — small fix in `globals.css` + `layout.tsx`             |
| 4   | Repository-wide `pnpm format:check` reports six pre-existing config/auth/policy files                                                                                                                   | CI hygiene          | Open — isolate as a mechanical formatting change             |

---

## 5. Change Log (recent)

### 2026-08-13 — Full builder themes, social accounts, Discord, and music visibility

- Promoted Social and Music into dedicated top-level builder workspaces instead of hiding audio
  behind the Design inspector.
- Added an additive `SocialAccount` model/migration, 27-platform registry, drag/drop ordering,
  labels, tooltips, platform/custom colors, and icon-only presentation.
- Added opt-in Discord status/activity/Spotify privacy controls and a cached, timeout-bounded
  public presence card with graceful provider failure behavior.
- Expanded the same versioned appearance engine from 5 to 17 working theme presets and added
  visual theme swatches.
- Exposed all previously missing appearance leaves except the document version and the gradient
  internals already owned by the reusable gradient editor.

### 2026-08-13 — Existing-product audit and builder registries

- Audited the real registration, username, dashboard save, public render, redirect, upload,
  analytics, domain, admin, and entitlement paths; recorded decisions in `PROJECT_AUDIT.md` and
  `docs/PROFILE_BUILDER.md`.
- Aligned the Free appearance baseline with the product direction and centralized all media/content
  limits.
- Added gradient/font/effect registries, shared profile background/identity primitives, and tablet
  preview.
- Hardened uploads with binary media signature verification; no database migration was required.
- Verification: `pnpm check`, 50 Vitest tests, production build, dependency audit, and 10 desktop/mobile Playwright checks pass; two DB-only E2E cases remain opt-in.

### 2026-08-13 — Advanced profile renderer parity

- Evolved `AppearanceSettings` to version 3 and added explicit version-2 migration; avatar geometry and interaction no longer leak into layout configuration.
- Added bounded background fit, position, blur, brightness, contrast, saturation, hue rotation, scale, and overlay controls rendered on an isolated layer.
- Added card border styles/hover effects, avatar border/shadow/animation/hover controls, responsive page padding, and vertical card placement.
- Added dashboard mobile/desktop preview switching and rendered display name plus `@username` consistently in preview and public profiles.
- Made full-profile presets deterministic so stale filters, layouts, and avatar animations cannot leak between themes.
- Verification: `pnpm check`, all 41 Vitest tests, and `pnpm build` pass.

### 2026-08-13 — Full website builder foundation

- Repositioned olnk.tr from a link-in-bio product to a Turkish-first full website builder; links remain one relational content type rather than defining the product boundary.
- Rebuilt the workspace as Profile, Content, and Design workspaces around one live preview, including mobile editor/preview switching.
- Introduced appearance document version 2 with semantic CSS colour tokens, profile-card surfaces, stack/compact/bento/terminal layouts, heading effects, full-theme presets, and explicit version-1 migration.
- Added SEO title/description/share-image controls and privacy switches for indexing, analytics ingestion, and share actions; server-enforced profile passwords remain relational.
- Persisted `Theme.settingsVersion = 2` on user and admin workspace saves without a destructive database migration.
- Verification: `pnpm check`, all 38 Vitest tests, and `pnpm build` pass. The repository-wide format gate still reports six pre-existing unrelated files.

### 2026-08-09 — Docker runtime and magic-link delivery repair

- Added a pinned Node/pnpm multi-stage Dockerfile, OpenSSL, non-root standalone
  runtime, BuildKit dependency cache, PostgreSQL/Mailpit Compose services, automatic
  migration ordering, and health checks.
- Repaired Auth.js email pre-verification and verified-callback authorization without
  reopening missing-id OAuth requests; existing suspended/banned/admin account checks
  remain in force and email requests are address-rate-limited.
- Added a Turkish escaped magic-link template, strict SMTP URL/pair validation, and
  `AUTH_URL` so container bind addresses cannot leak into emailed links.
- Pinned patched `fast-uri`, `ip-address`, and `nanoid` transitives after the current
  registry audit exposed five advisories; the production audit now reports zero.
- Verified clean install, Prisma generation/migrations, lint/typecheck, unit tests,
  formatting, production build, all 12 Playwright cases (including DB-backed coverage),
  container health, SMTP delivery, token consumption, user/session creation, and dashboard redirect.

### 2026-07-24 — Audio, ambient effects, profile gates, and honest counters

- Extended the versioned appearance document with backward-compatible `audio`, `socialProof`, and granular visual-effect paths; all leaves are centrally tiered.
- Added gesture-first Spotify/SoundCloud/direct-file playback, Pro entry sounds, one-tap stop/mute, and lazy provider scripts.
- Added mouse particles, Matrix rain, 3B tilt, CRT, glitch, and scanline effects as independent lazy chunks with reduced-motion and tab-visibility controls.
- Added a server-enforced Pro whole-profile gate; protected bio/theme/link data is not rendered before a throttled scrypt check, and `/go/[id]` re-verifies access.
- Added honest all-time/today/rolling-30-minute counters. Profile views dedupe the same visitor for the same 30-minute window.
- Fixed custom-domain public runtime routing for redirects, link/profile unlocks, counters, and QR; dashboard/auth paths remain closed.
- Applied `20260724233000_profile_extras` and a data-safe migration-history alignment for `UploadedAsset.updatedAt`; `prisma migrate dev` is back in sync.
- Added schema-evolution, entitlement fallback, and profile-token tests.

### 2026-07-24 — Admin control room and security refresh

- Added `USER`/`ADMIN` RBAC, account suspension/ban state, manual Pro grants, immutable audit
  events, invoice refund-operation flags, and migration `20260724120000_admin_control_room`.
- Added `/admin` user, billing, analytics, system, and audit sections with server-rendered
  protection plus typed confirmation for sensitive actions.
- Added `pnpm admin:role <email> --role ADMIN|USER`; no public role-management endpoint exists.
- Added distinct admin authentication/API/page rate limits and successful/denied audit events.
- Deliberately avoided user-session impersonation; troubleshooting is a public-profile preview.
- Upgraded Next.js/Auth.js and transitives to close all known audit findings; `pnpm audit --prod`
  reports zero vulnerabilities.
- Refreshed compatible runtime/tooling packages. ESLint 9.39.5 and TypeScript 6.0.3 remain the
  newest releases accepted by the official strict peer graph.
- Verification: Prisma generation, `pnpm check`, format, 25 unit tests, production build, and
  Playwright desktop/mobile access checks all pass.

### 2026-07-25 — External audit remediation

- Revalidated all 26 report findings against the current branch; the reported Critical/High
  admin crashes, impersonation issue, and Adyen bypass were stale or technically incorrect.
- Removed every predictable runtime HMAC fallback and made `AUTH_SECRET` mandatory in all
  environments.
- Made Auth.js reject sign-in callbacks without a server-issued user ID.
- Namespaced sanitized custom CSS keyframes and rewrote their animation references.
- Added explicit `private, no-store` to all tRPC transport responses.
- Replaced `start-database.sh` delimiter parsing with WHATWG URL parsing and added a non-mutating
  `--check-url` validation mode.
- Added Adyen Standard webhook and custom keyframe regression tests.
- Full command results and per-finding classifications are recorded in `AUDIT_REMEDIATION.md`.

### 2026-07-21 — Stabilization (HEAD `433f4fb`)

- **chore(config): use port 3100 and disable implicit dep installs** (`433f4fb`) — Playwright webserver switched from `pnpm dev` to `pnpm start`, port 3000 → 3100, webserver timeout 120 s → 180 s, `verifyDepsBeforeRun: false`.
- **refactor(dashboard): centralize session checks with `requireDashboardSession`** (`8914c2c`) — replaces 4 copies of the auth check.
- **test: make database e2e tests opt-in via env flag** (`c454dd3`) — `RUN_DATABASE_E2E=1` gates the 404 DB-backed assertion.
- **chore(deps): bump prisma to 7.9.0** (`a21724a`) — new ESM `prisma-client` generator; Playwright config updated.
- **refactor(error): use Next.js Link component for home navigation** (`40a9f29`).
- **fix(analytics): wrap chart and table siblings in Fragment** (`77682ac`).
- **test: add unit and integration tests for profile rendering and entitlements** (`d062b87`) — initial Vitest suite.
- **refactor(payments): extract webhook normalization helpers** (`31785bc`) — `normalizeAdyenNotification` and `createIyzicoWebhookSignature` become exported for tests.
- **chore(deps): add testing dependencies** (`a8d0faa`).
- **feat(profile): dynamic spacing, social icons, custom CSS preview** (`00372f2`).
- **docs: bump typescript to 6.0 and update prisma generation flow** (`3921b50`).
- **feat(profile): soft delete for links and shared rendering helpers** (`e2e0267`) — `ProfileLink.deletedAt` + `(userId, deletedAt, position)` index; `src/lib/profile-rendering.ts` is the new single source of truth shared by the page, preview, and unlock surfaces.
- **feat(workspace-editor): add save drain with validation and lift media callback** (`94363ca`).
- **feat(theme): migrate legacy theme columns to settings JSONB** (`88ea99f`) — migration `20260720231000_identity_security` backfills every existing `Theme` to the new schema.
- **feat(account): revision-based optimistic locking on profile updates** (`d29e2b1`) — `User.editorRevision`.
- **feat(account): implementation of account deletion process** (`37355c1`) — `processAccountDeletionJob` + asset cleanup.
- **feat(account): add account deletion request flow and async job model** (`ca7948c`).
- **feat: add domain reclaim challenge and expiry tracking** (`92d6091`).
- **feat(analytics): click/view tracking with dedupe, daily buckets, and asset lifecycle** (`9cc42b4`).
- **refactor: remove pro requirement for password-protected links** (`765334a`).
- **feat(links): enable password protection and scheduling for all users** (`64438bb`).
- **feat(security): harden link unlock endpoint with rate limiting** (`25a0d95`).
- **feat(auth): enhance user email handling and username claiming** (`05b49c0`).
- **refactor(username): extract claim logic into dedicated identity module** (`2fb86c4`).
- **feat: harden security headers and payment webhook handling** (`7ed59c3`).
- **fix(deps): eliminate production advisories and script install races** (`47af386`).
- **chore(pnpm): refresh auth peer metadata** (`2b89164`).
- **chore(pnpm): migrate auth.js nodemailer override to peerDependencyRules** (`0bcdf4f`).
- **build(deps): upgrade nodemailer to 9.0.3** (`03c82c3`).
- **chore(deps): upgrade to latest supported TypeScript** (`ded1459`).

### 2026-07-20 — Schema migrations

- `20260720231000_identity_security` — final, four-migration sequence complete.

Earlier migrations and feature commits are summarised in `errorsV2.md` (internal audit, 39 KB).

---

## 6. Verification Matrix (per-PR)

| Concern      | Command                                    |
| ------------ | ------------------------------------------ |
| Lint + types | `pnpm check`                               |
| Tests        | `pnpm test`                                |
| Audit        | `pnpm audit --prod --audit-level high`     |
| Build        | `pnpm build`                               |
| E2E (DB)     | `RUN_DATABASE_E2E=1 pnpm test:e2e`         |
| Format       | `pnpm format:check`                        |
| Migration    | `pnpm db:migrate:dev --name <descriptive>` |

See `AGENTS.md` §7 for the exact workflow.
