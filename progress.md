# progress.md — Dynamic Project Tracker

> Branch: `codex/stabilize-upgrades-fixes` · HEAD: `433f4fb`
> Updated against the 30-commit history through `433f4fb`.
> This file is the canonical status board; update whenever features ship, the stack changes, or in-progress work starts/stops.

---

## 1. Current Status

### 1.1 Shipped and Working (Free Tier)
- Public profile at `olnk.tr/[username]` (RSC) with background, avatar, bio, links, and brand chip.
- Google OAuth and Nodemailer magic-link sign-in.
- Username claim with `pg_advisory_xact_lock` + DB unique constraint as authority.
- Drag-and-drop link reorder via `@dnd-kit`.
- Per-link icon, embed type, scheduling, password protection (all users).
- Appearance studio with 6 tabs (background, buttons, typography, layout, effects, advanced).
- Click + view tracking with dedupe keys, daily buckets, and country recording (when `TRUSTED_IP_HEADER` is configured).
- 30-day analytics dashboard with bar chart and per-link clicks.
- QR code generation at `/api/qr/[username]` (PNG, 1h cache + 24h SWR).
- Custom domain add/verify via DNS TXT (`_olnk.<domain>`).
- Reclaim flow for previously owned domains.
- Account deletion pipeline (`AccountDeletionJob` + cron + manual trigger).
- Maintenance cron (`/api/maintenance`) covering rate buckets, events, intents, challenges, assets, deletions, domain revalidations.
- Email normalisation single source of truth (`src/lib/email.ts`).
- Username normalisation and moderation (`src/lib/username.ts`, `src/config/username-policy.ts`).
- Accessibility suite: axe-core on `/`, `/login`, `/register`; redirect test on `/dashboard/billing`; 404 path.

### 1.2 Shipped and Working (Pro Tier)
- All Pro-only appearance paths (Crown icon + lock).
- Custom CSS via postcss-based `sanitizeCustomCss` scoped to `[data-olnk-profile]`.
- YouTube and Spotify embeds (`profileEmbedUrl`).
- Custom domains (up to 3 per user, 24h claim window, reclaim challenges).
- File uploads to S3-compatible storage (`createUpload` + `finalizeUpload`, 10 MB free / 250 MB Pro quota).
- Stripe subscriptions (automatic renewal).
- iyzico subscriptions (automatic, hosted HTML, identity required at checkout).
- PayTR (manual, iFrame, no card storage).
- Adyen Drop-in + recurring (CRON-driven via `/api/billing/renew`).
- 7 / 30 / 90-day analytics windows.
- Advanced analytics block (views, unique visitors, top countries, devices, sources).
- "Remove branding" toggle.
- Advanced billing UI: provider chooser, status card, cancel confirm, last 24 invoices.

### 1.3 Quality Gates (Green)
- `pnpm check` (ESLint + tsc, `--max-warnings=0`).
- `pnpm test` (Vitest unit, including payment provider fixtures, sanitizers, entitlement resolution).
- `pnpm audit --prod --audit-level high`.
- `pnpm build` (Next.js production build).
- `pnpm test:e2e` (Playwright Chromium + mobile-chromium, port 3100, with `RUN_DATABASE_E2E=1`).

---

## 2. In-Progress Tasks

> Items currently being worked on; promote to §1.1/1.2 once merged.

| Task | Owner context | Notes |
|---|---|---|
| **Public profile cache invalidation** (known gap) | stabilisation | Add `revalidateTag` after `workspace.save` + `account.updateProfile` so the editor's preview matches the live page without re-deploying. |
| **Live checkout result overlay** | stabilisation | The `/dashboard/billing?checkout=…&intent=…` states already pass to `<BillingSettings/>`; refine the success / failure copy and link to the updated settings panel. |
| **PayTR local-mode pricing display** | stabilisation | `LOCAL_PRO_*_TRY` defaults to `12900` / `94900`; verify against the production PayTR dashboard before launch. |
| **Mobile profile editor** | planning | Editor is currently desktop-first; long-term goal is a feature-parity mobile experience. |

---

## 3. Backlog / Roadmap

### 3.1 Reliability & Operations
- [ ] **Cache invalidation on edit** — `revalidateTag('profile:<username>')` in `workspace.save` and after `account.updateProfile` (which changes `image` / `name` / `bio`).
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
- [ ] **Reduce `workspace-editor.tsx` size** — 829 lines; candidate splits: `SortableLink`, `drainLoop`, `revokeHelpers`.
- [ ] **Reduce `appearance-editor.tsx` size** — 897 lines; candidate splits: per-tab files under `appearance-editor/<tab>.tsx`.
- [ ] **`processBillingEvent` complexity** — 390 lines; consider extracting the per-event-type handlers into separate functions/tables.
- [ ] **Replace `console.*` logging with a tiny structured logger** — JSON output to stdout, available in Vercel logs.

---

## 4. Known Bugs

> Tracked and resolved via `.memory-bank/known_issues.md`. Add an entry there for every non-trivial fix.

| # | Symptom | Severity | Status |
|---|---|---|---|
| 1 | Editor preview may diverge from public page (no explicit cache invalidation) | Medium | Open — see Backlog §3.1 |
| 2 | PayTR `cancelSubscription` is intentionally a no-op; users must complete the term manually | Behavioural | Documented (see `src/server/payments/adapters/paytr.ts:186`) |
| 3 | Dark Reader extension causes hydration warnings on `<html>` and `<svg>` | Cosmetic (dev only) | Documented (see `AGENTS.md §11`) |
| 4 | `next dev` shows `scroll-behavior: smooth` warning until we apply `data-scroll-behavior="smooth"` (the current `globals.css` `scroll-behavior: smooth` rule still triggers Next's router-level scanner) | Cosmetic | Open — small fix in `globals.css` + `layout.tsx` |

---

## 5. Change Log (recent)

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

| Concern | Command |
|---|---|
| Lint + types | `pnpm check` |
| Tests | `pnpm test` |
| Audit | `pnpm audit --prod --audit-level high` |
| Build | `pnpm build` |
| E2E (DB) | `RUN_DATABASE_E2E=1 pnpm test:e2e` |
| Format | `pnpm format:check` |
| Migration | `pnpm db:migrate:dev --name <descriptive>` |

See `AGENTS.md` §7 for the exact workflow.
