# `.memory-bank/decision_log.md` — Architectural Decisions

> Capture every non-obvious choice that future agents will question. Keep entries short, dated, and reference the file:line where the decision lives.

---

## ADR-001 — Prisma 7 ESM `prisma-client` generator

**Date:** 2026-07-20
**Status:** Accepted
**Context:** The `prisma-client-js` generator is deprecated. We adopted the new `prisma-client` ESM generator to align with the project's TS `verbatimModuleSyntax` and to simplify the import surface.

**Decision:** Use the `prisma-client` generator (output to `../generated/prisma`); `import` the client from `generated/prisma/client` (see `src/server/db.ts:4`). Do **not** import from `@prisma/client` (see `AGENTS.md` §5).

**Consequences:**
- Editor/agent pipelines must run `pnpm db:generate` whenever `prisma/schema.prisma` changes.
- The `generated/` directory is gitignored in production but checked in here for offline static analysis (see `errorsV2.md`).
- The CI matrix must include `pnpm db:generate` before any check that touches the client (`src/server/db.ts`, all routers, all server modules).

---

## ADR-002 — `database` session strategy (not JWT)

**Date:** 2026-07-20
**Status:** Accepted
**Context:** The product pages are heavy RSC reads; we want immediate session revocation when users change their email or delete their account.

**Decision:** Use `strategy: "database"` (see `src/server/auth/config.ts:153`) and store sessions in `Session`. JWT mode is explicitly rejected because it complicates revocation and the `event.signIn` callback already needs DB access.

**Consequences:**
- Every authenticated request hits Postgres once for `getSessionAndUser()`.
- The Prisma adapter must be configured to look up `Session` by `sessionToken` uniquely, which it does.
- The dashboard layout relies on `requireDashboardSession()` and `auth()` (cached via `react.cache`); the cost of an extra DB read per request is acceptable for our scale.

---

## ADR-003 — Custom CSS via PostCSS sanitiser (not DOMPurify)

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Pro users can paste arbitrary CSS. We need to allow creative customisation while preventing clickjacking, data exfiltration via `url()`, and global selector abuse.

**Decision:** `sanitizeCustomCss` (`src/server/security/custom-css.ts`) runs every selector through PostCSS and prepends `[data-olnk-profile]` to the rightmost compound. It rejects `@import`, `url(...)`, global selectors (`*`, `html`, `body`), and CSS-escape back-slashes (`\\`).

**Consequences:**
- The CSS is always embedded via `<style>` server-side — never `dangerouslySetInnerHTML` with user input.
- The CSP `style-src 'self' 'unsafe-inline'` accepts our scoped inline output.
- Tests in `src/server/security/custom-css.test.ts` lock the behaviour (reject obfuscation, reject `url()`, scope survivors).

---

## ADR-004 — Optimistic locking on `User.editorRevision`

**Date:** 2026-07-20 (`d29e2b1`)
**Status:** Accepted
**Context:** A user can edit the workspace from multiple tabs. We needed a hard rule for "another tab won".

**Decision:** Every successful `workspace.save` and `account.updateProfile` increments `User.editorRevision`; the client sends the previous value and the server rejects with `CONFLICT` on mismatch. The dashboard surfaces a "taslağı korumak için sayfayı yenile" prompt (see `src/components/dashboard/workspace-editor.tsx`).

**Consequences:**
- Multi-tab editing is safe; the winning tab stays, the losing tab gets clear copy.
- Refresh is the resolution path; no merge UI is required.
- 3 routers share the pattern (`workspace.save`, `account.updateProfile`).

---

## ADR-005 — Appearance as a Zod schema, not free-form JSON

**Date:** 2026-07-20 (`88ea99f`, `e2e0267`)
**Status:** Accepted
**Context:** Pre-v0.2 the theme was six columns (`backgroundType`, `buttonStyle`, etc.) scattered across the row. New Pro-only appearance features added slowly and inconsistently.

**Decision:** All appearance lives under `Theme.settings` (Json) and is validated by `appearanceSchema` in `src/lib/appearance.ts`. `resolveAppearanceForPlan(stored, hasPro)` falls back to safe defaults for Pro paths when the user is free. The `FEATURE_CATALOG` in `src/config/feature-catalog.ts` is the single source of truth for path → tier mapping.

**Consequences:**
- Migrating legacy columns to JSON was a one-time, multi-step backfill (migration `20260720231000_identity_security`).
- The editor preview, the public page, and the unlock screen all reuse the same `parseAppearance()`.
- Adding a new appearance field is one PR touching `appearance.ts`, `feature-catalog.ts`, and the editor tab.

---

## ADR-006 — Soft-delete on `ProfileLink.deletedAt` (not cascade)

**Date:** 2026-07-20 (`e2e0267`)
**Status:** Accepted
**Context:** Users often "delete" a link by accident. Pure cascade is destructive; pure retention bloats the dashboard.

**Decision:** `workspace.save` flips missing links to `enabled: false, deletedAt: new Date()`. The composite index `(userId, deletedAt, position)` keeps the public-page query (`enabled = true AND deletedAt IS NULL`) cheap.

**Consequences:**
- The dashboard can restore a recent delete with another publish round.
- Click rows (`ClickEvent`) cascade-delete with the `ProfileLink`, so analytics correctly attribute pre-delete clicks then stop.

---

## ADR-007 — Provider-agnostic billing via `PaymentProviderAdapter`

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Stripe, iyzico, PayTR and Adyen all solve the same problem with very different APIs. We need a uniform reconciliation path.

**Decision:** `src/server/payments/types.ts` defines a single interface; `src/server/payments/registry.ts` exposes `Map<BillingProvider, PaymentProviderAdapter>`. The universal webhook route `/api/webhooks/[provider]` dispatches by slug and reads the body as a raw `Buffer` to preserve HMAC signature validity.

**Consequences:**
- Adding a provider = implementing the interface + registering in the map. No router changes.
- Reconciliation (`processBillingEvent`) is provider-agnostic.
- Tests use exported helpers (`mapStripeSubscriptionStatus`, `normalizeAdyenNotification`, `createIyzicoWebhookSignature`, `createPaytrCallbackHash`).

---

## ADR-008 — PayTR is manual renewal

**Date:** 2026-07-20
**Status:** Accepted (by design)
**Context:** PayTR's hosted iFrame does not store card data, so the recurring contract has to be renegotiated at term end.

**Decision:** `cancelSubscription` on the PayTR adapter is intentionally a no-op (`src/server/payments/adapters/paytr.ts:186`); `getSubscriptionStatus` marks the subscription `EXPIRED` once `currentPeriodEnd <= now`. RenewalKey idempotency is reserved for future use.

**Consequences:**
- Users see a clear "Term ends on …" card; they are prompted to re-purchase before the term closes.
- Reconciliation ensures `cancelAtPeriodEnd: true` so the dashboard never shows "active" when PayTR says otherwise.

---

## ADR-009 — `react.cache` for `auth()` and `getProfile()`

**Date:** 2026-07-20
**Status:** Accepted
**Context:** A single render tree can hit `auth()` 5+ times (layout + page + child server components). Each call is a DB hit.

**Decision:** Wrap both helpers with `react.cache` so they are request-scoped memoised (`src/server/auth/index.ts:8` and inline on the public page). The server-side tRPC caller is similarly `cache`-wrapped in `src/trpc/server.ts`.

**Consequences:**
- Within one render the auth lookup is at most one DB hit.
- Webhook routes (which are non-rendering) do not benefit; that's fine.
- Tests reset mocks to avoid leakage between cases.

---

## ADR-010 — CSP set in `next.config.js`, not per-route

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Payment hosts (PayTR / iyzico / Adyen) require explicit `frame-src` and `form-action` allow-listing.

**Decision:** A global `headers()` hook in `next.config.js` emits the full CSP + `Referrer-Policy` + `X-Content-Type-Options: nosniff`. Per-route headers would drift; `frame-ancestors 'none'` would have to be repeated.

**Consequences:**
- Adding a new iframe integration = updating `frame-src` and `form-action` and the `AGENTS.md` lookup.
- `script-src` is `unsafe-inline`/`unsafe-eval` in dev only; production keeps `unsafe-inline` for Next's hydration scripts (see `errorsV2.md` for the trade-off discussion).

---

## ADR-011 — DB-backed sliding-window rate limiter (no Redis)

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Hosting on Vercel with a Postgres DB and no Redis dependency. Rate-limit traffic is low-volume (sign-up, link unlock, profile update) but the limit must survive across instances.

**Decision:** `RateLimitBucket` (sha256 hex PK, `count`, `windowStart`, `blockedUntil`). `consumeRateLimit(key, limit, windowMs)` performs a conditional upsert under a Postgres advisory lock and rejects when the count exceeds the limit. TTL cleanup is owned by `/api/maintenance`.

**Consequences:**
- No new infra. Postgres scales fine for our load.
- Cleanup is required or the table grows. The cron is `Authorization: Bearer <CRON_SECRET>`-guarded.
- Tests inject their own DB; the table is also reachable to a future Redis swap without an interface change.

---

## ADR-012 — `src/proxy.ts` middleware is host-based, not path-based

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Custom-domain users need to reach their profile without configuring DNS for every path. The middleware decides the host once and either allows, 404s, 410s, or rewrites.

**Decision:** The middleware resolves the request to a `CustomDomain` row (or one of the canonical hosts), then either passes through, returns the controlled 404/410 HTML, or rewrites `/` → `/{username}` for custom-domain hosts.

**Consequences:**
- The middleware runs on the edge runtime; no DB driver other than Prisma's standard `prisma-client` is used (we instantiate a dedicated client in this file — see source).
- The controlled 404/410 pages are statically cacheable (`Cache-Control: public, max-age=60`).

---

## ADR-013 — Revalidation tagged by username after `workspace.save`

**Date:** 2026-07-21 (proposed)
**Status:** Proposed
**Context:** Editor preview may diverge from the live page; there is no `revalidatePath`/`revalidateTag` in the codebase today.

**Decision:** Add `revalidateTag('profile:<username>')` inside `workspace.save` and after image / name / bio changes in `account.updateProfile`. Read-side: wrap `cache(getProfile)` with `unstable_cache(getProfile, ['profile'], { tags: [`profile:<username>`] })`.

**Consequences:**
- Edits propagate to the live page within one revalidate window (currently default).
- The middleware stays the same.
- See `.memory-bank/known_issues.md` and `progress.md` §2.

---

## ADR-014 — iyzico/PayTR require `billingDetails`

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Turkish providers legally require T.C. identity + address fields at checkout. Stripe and Adyen accept everything card-side and so do not.

**Decision:** `CheckoutInput.billingDetails` is optional in the type but the iyzico and PayTR adapters refuse without it (see `src/server/api/routers/billing.ts:121-125`). The dashboard surfaces the address fields only when an iyzico/PayTR provider is selected.

**Consequences:**
- The billing form has a small QR of conditional fields.
- Stripe and Adyen purchases continue to skip the form.
- The interface stays the same; provider-specific quirks are isolated to the adapters.

---

## ADR-015 — Bot filtering in `recordProfileView`

**Date:** 2026-07-20 (`9cc42b4`)
**Status:** Accepted
**Context:** Public view counts include crawlers, link previews and headless browsers — we want real human traffic only.

**Decision:** Bot filter via regex on the User-Agent header (`/bot|crawler|spider|headless|preview|facebookexternalhit|whatsapp|telegrambot|discordbot|slurp/i`). Filtered UAs do not record and do not consume a dedupe slot.

**Consequences:**
- Slack/Discord/WhatsApp link previews never inflate the dashboard.
- The pattern is intentionally permissive; if a new bot slips through, add to the regex.
- Tests rely on the assumption that `facebookexternalhit` etc. is filtered.

---

## ADR-016 — No global i18n abstraction

**Date:** 2026-07-20
**Status:** Accepted
**Context:** Turkish-first audience; English is an internal/handover concern.

**Decision:** All UI strings are Turkish literals; `tr-TR` is hard-coded into formatting (`Intl.NumberFormat("tr-TR")` etc.). Adding i18n is a deliberate future decision and should require an RFC.

**Consequences:**
- Translation cost is zero today.
- Adding English copy needs explicit approval (see `AGENTS.md` §5.4).
- Date / number formatting uses the Turkish locale consistently.

---

## ADR-017 — `gitignored` `generated/` directory

**Date:** 2026-07-21
**Status:** Accepted (with caveat)
**Context:** The audit-branch working tree has `generated/` checked in despite the `.gitignore`. CI/clean checkouts regenerate it.

**Decision:** Production `.gitignore` excludes `generated/`; the working tree includes it temporarily for offline static analysis. CI runs `pnpm db:generate` before any other step.

**Consequences:**
- New contributors must run `pnpm install && pnpm db:generate` before `pnpm dev`.
- Editing anything inside `generated/` is a build-input violation (see `AGENTS.md` §5).
