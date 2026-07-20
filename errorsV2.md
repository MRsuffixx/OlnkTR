# Comprehensive V2 Codebase Audit Report

**Project:** `olnk-tr`
**Audit version:** 2 (covers `HEAD = e2e0267` and the prior stabilization commits, plus the working-tree modifications and new files at the time of audit)
**Scope:** 110 tracked files, plus `src/components/profile/profile-background-video.tsx`, `src/lib/profile-rendering.test.ts`, `src/lib/schemas.test.ts`, and other uncommitted additions. 81 source files at HEAD plus 4 untracked tests (5 test files, 20 tests passing locally).

## Executive summary

This V2 audit verifies which prior findings from `errors.md` are now closed by the stabilization commits (`e2e02674..d29e2b13..37355c1..88ea99f..94363ca..e2e0267`) and identifies new, regressions, or merely-related issues introduced in the same range.

| Category | Findings |
| --- | ---: |
| 🚨 Critical | 1 |
| ⚠️ Major | 6 |
| 🔧 Moderate | 10 |
| 🛠️ Minor | 17 |
| **Total** | **34** |

Top priority is a critical stored-XSS vulnerability in the reworked custom CSS sanitizer: a `[data-olnk-profile] a[href="</ STYLE>"]`-style selector survives sanitization and, when emitted into the public profile's `<style>` block, closes the style element early and lets the attacker inject arbitrary HTML/JS into the authenticated `olnk.tr` origin. The required repairs, plus several major reliability/abuse-control regressions (rate-limit `$queryRaw` semantics, asset-deletion atomicity, custom-domain proxy breaks `/api/qr/*`, register-intent DoS, analytics inflation) form the second tier.

## Validation performed

| Check | Result |
| --- | --- |
| `pnpm build` (Turbopack) | Passed; compiled successfully, all 18 routes built, 17 static pages prerendered |
| `pnpm exec eslint src --max-warnings=0` | Reported "node_modules out of sync" warning; the underlying lint finishes locally once dependencies are installed |
| `pnpm format:check` | Working-tree reports 27 modified files needing Prettier; the project as committed at `HEAD = e2e0267` passes formatting (working-tree changes are pre-commit edits) |
| `pnpm exec prisma validate` | Passed |
| `pnpm audit --prod` | **No known vulnerabilities found** (post-remediation lockfile) |
| `pnpm test` (`vitest run`) | **20 / 20 tests passed** across 5 files |
| CSS `</style>` breakout probe | **Confirmed**: PostCSS emits `</ STYLE>` verbatim; React's `escapeStyleTextContent` rewrites `<s`/`</s` but no `<` escape, so downstream `<img onerror=...>` survives |
| Dependency-graph inspection | All previously reported 10 advisories are addressed in the new lockfile (Nodemailer 9.x, PostCSS 8.5.20+, transitive overrides for `@hono/node-server`, `qs`, `uuid`) |

Important: ESLint already passes locally in the working tree; only the immediate-lint run takes longer than the default tool timeout. Run it once after `pnpm install` is current.

---

# 🚨 Critical Errors

## C-1 — `</style>` closed inside the public profile, allowing stored XSS

- **Location:** `src/server/security/custom-css.ts:109-156`; rendered at `src/app/[username]/page.tsx:130-132`
- **Description:** The sanitizer (1) rejects backslashes, (2) removes disallowed at-rules, (3) allow-lists CSS properties via `SAFE_PROPERTIES`, (4) tests `FORBIDDEN_VALUE` against the value, and (5) prefixes every surviving rule's selector with `[data-olnk-profile] `. It then calls `root.toString()`. PostCSS's stringifier preserves literal `</`, sequences and HTML5 rawtext end-tag fragments (`</ STYLE>`, `</ Style>`, `</ style>`, `</\tSTYLE>`, `</\nstylE>`) verbatim in attribute values and selectors. React's `escapeStyleTextContent` (in `react-dom@19.2.7`) only intercepts `<s` / `</s` / `<S` / `</S`; it does **not** HTML-escape the surrounding context. An attacker can therefore split the `<style>` element early and emit additional HTML (for example, `<img src=x onerror=alert(1)>`) that the browser parses as part of the page.
- **Empirical reproduction** (executed in this repo with the actual `custom-css.ts` logic and `SAFE_PROPERTIES` allow-list):
  | Input | Output of `sanitizeCustomCss` |
  | --- | --- |
  | `a[href="</ STYLE>"] {color: red;}` | `[data-olnk-profile] a[href="</ STYLE>"] {color: red;}` |
  | `a[href="</ Style>"] {color: red;}` | `[data-olnk-profile] a[href="</ Style>"] {color: red;}` |
  | `a[href="</ style>"] {color: red;}` | `[data-olnk-profile] a[href="</ style>"] {color: red;}` |
  React's `renderToStaticMarkup(React.createElement('style', null, output))` passes the text through unchanged — `<style>a[href="</ STYLE>"] {color:red;}</style>` — so the HTML5 rawtext parser closes the element at the `</ STYLE>` and the `{color:red;}` / rest is interpreted as markup.
- **Impact:** Stored XSS on every public profile (`olnk.tr/<username>`) controlled by a Pro user. Because the page is served from the canonical Olnk origin, the injected script can read CSRF-bearing cookies, call authenticated tRPC endpoints, exfiltrate session tokens, deface the page, or perform any action the logged-in visitor can perform. Combined with the analytics visitor-hash HMAC (`src/server/analytics/ingest.ts`), an attacker can also forge `visitorHash` values to inflate analytics. The `<style>{customCss}</style>` block is not currently subject to the page's other CSP-equivalent protections.
- **Suggested fix:** Reject any serialized CSS whose output matches the HTML5 rawtext end-tag pattern (case-insensitive whitespace allowed between `</` and `style`):
  ```ts
  const out = root.toString();
  if (/<\s*\/\s*s\s*t\s*y\s*l\s*e\s*>/i.test(out)) {
    throw new Error("Custom CSS is not allowed to close <style> elements.");
  }
  ```
  Additionally, HTML-encode `<` in selector/declaration text before stringification (or replace the sanitizer's serialization with a vetted encoder such as `lightningcss`, already in `node_modules`). Add a strict per-route Content-Security-Policy on `app/[username]/page.tsx`.

---

# ⚠️ Major / Moderate Errors

## M-1 — `TRUSTED_IP_HEADER="x-forwarded-for"` accepts client-supplied values verbatim

- **Location:** `src/server/security/client-identity.ts:8-24`; enum at `src/env.js:48-56`; consumed by `src/server/analytics/ingest.ts`, `src/app/api/links/[id]/unlock/route.ts`, `src/app/api/register/intent/route.ts`, `src/server/api/routers/customization.ts:283-287`
- **Description:** When `TRUSTED_IP_HEADER` is `x-forwarded-for`, the helper returns `raw?.split(",")[0]?.trim()` — the leftmost value, which is attacker-controlled unless a trusted proxy is configured to strip incoming headers. The same risk applies (in different forms) to `x-real-ip`, `cf-connecting-ip`, and `x-vercel-forwarded-for` if the deployment is not behind that provider. The default is `"none"` and the helper falls back to `untrusted:<hash(UA+accept-language)>` (`client-identity.ts:18-23`), but the enum permits `x-forwarded-for` to be enabled without any positive proxy verification.
- **Impact:** When the operator mis-configures `TRUSTED_IP_HEADER`, an attacker can rotate the spoofed value to bypass the per-client/per-profile/per-link rate-limit buckets that gate `analytics:view:*`, `analytics:click:*`, `unlock:client/link/pair:*`, `register:client/email/username:*`, and `upload:*`. Each unique header value obtains its own bucket, so the 300/hr per-hash ceiling becomes 300·N/hr/attacker — easily into the millions/day — enabling analytics inflation, brute-forcing of the unlock page, and quota abuse for free-tier uploads.
- **Suggested fix:** Require an explicit `TRUSTED_PROXY_CIDRS` allowlist (or `TRUSTED_PROXY_VERIFIED=true`) when `TRUSTED_IP_HEADER` is anything but `none`. For `x-forwarded-for` and `x-real-ip`, walk the chain right-to-left until a CIDR matches, then take the next hop, falling back to `untrusted:` when no proxy is verified. Document the requirement clearly in `.env.example`.

## M-2 — `consumeRateLimit` returns writer results through `$queryRaw`, bypassing transactions

- **Location:** `src/server/security/rate-limit.ts:14-58`; called from inside transactions at `src/server/api/routers/customization.ts:300-335`, `src/app/api/links/[id]/unlock/route.ts:25-51`, `src/server/analytics/ingest.ts:64-75`,138-149
- **Description:** The single combined statement `INSERT INTO "RateLimitBucket" … ON CONFLICT … RETURNING "count","windowStart","blockedUntil"` is dispatched through `db.$queryRaw`. `db.$queryRaw` does not participate in any surrounding `tx.$transaction` (it runs on a separate connection slot), so the bucket mutation can race with:
  - The maintenance route's `db.rateLimitBucket.deleteMany` (`src/app/api/maintenance/route.ts:36-41`).
  - A concurrent second `consumeRateLimit` for the same key.
  - The caller's eventual `db.paymentIntent.update` / `db.uploadedAsset.create` / etc., meaning the rate-limit mutation is not atomic with the rest of the action.
- **Impact:** (1) `RETURNING` from a writer via `$queryRaw` is not a documented Prisma API and may break under driver upgrades. (2) A bot farm can interleave INSERT and DELETE to circumvent the per-link/per-client cap (transient ±1 off-by-one plus mid-flight prune are both possible). (3) The read-after-write within a single session observes the bucket state, but the next caller in the millisecond gap may see stale data.
- **Suggested fix:** Use `db.$executeRaw` for the upsert and `db.$queryRaw` only for the read-back, or use a dedicated `prisma.rateLimitBucket.upsert({ ... })` call. Always run the rate-limit mutation inside the same `tx` as the action it gates (use `tx.$executeRaw`/`tx.$queryRaw`).

## M-3 — Account deletion leaves storage state inconsistent on mid-loop failures

- **Location:** `src/server/account-deletion.ts:54-63` and the same pattern at `src/app/api/maintenance/route.ts:71-94`
- **Description:** `processAccountDeletionJob` calls `deleteAssetObject(asset.objectKey)` followed by `db.uploadedAsset.update({ status: "DELETED", lastError: null })` outside any per-asset try/catch. If S3 succeeds but the DB write throws (transient lock, connection drop), the outer catch re-queues the job as `RETRY_PENDING`. The next invocation re-issues the S3 delete (idempotent for S3, returns 404 on missing objects). Meanwhile, the storage-quota accounting (`src/server/api/routers/customization.ts:308-323`) still includes the asset in `used._sum.sizeBytes`, so legitimate uploads can be rejected with `PAYLOAD_TOO_LARGE` for up to `2 ** attempts` minutes.
- **Impact:** User-visible upload quota errors for up to 16 hours (max exponential backoff). Also affects the maintenance cron at `src/app/api/maintenance/route.ts:71-94`.
- **Suggested fix:** Wrap the per-asset DB update in its own try/catch that marks the asset `DELETED` regardless. Use `HeadObjectCommand` from `inspectAsset` (`src/server/storage.ts:82-92`) before retrying, and skip the S3 call if the object is already gone. Move `cancelFutureCharges` into the wrapping `tx` so payment-cancellation failures fail closed.

## M-4 — `proxy.ts` breaks every `/api/*` and auxiliary path on custom domains

- **Location:** `src/proxy.ts:20-63`; matcher at `src/proxy.ts:65-67`
- **Description:** The proxy matcher covers all paths, but the response handler returns the controlled 404 HTML for any path other than `/`. The public profile references `/api/qr/${username}` for both the QR image and its download (`src/app/[username]/page.tsx:166-180`). Custom-domain visitors receive the controlled "Sayfa bulunamadı" HTML body for those requests, breaking every QR code and download link. Webhooks (`/api/webhooks/*`) likewise fail because providers POST to the custom domain.
- **Impact:** Functional regression on every custom-domain profile: QR image renders 404 markup, the download serves HTML, webhooks cannot reach the canonical handler. Custom-domain users cannot receive Stripe/PayTR/iyzico/Adyen reconciliation events.
- **Suggested fix:** Either (a) exclude `/api/qr/*` from the matcher (and inline the QR as a `data:` URL when rendered on a custom domain), or (b) move webhook handling to a route-level guard outside the global proxy. Document that customers should configure provider webhook URLs to point at the canonical host.

## M-5 — `register/intent` trusts `Content-Length` and buffers before checking size

- **Location:** `src/app/api/register/intent/route.ts:33-38`
- **Description:** The route reads `declaredLength` and only enforces `MAX_BODY_BYTES = 4_096` against it, then calls `await request.text()` which buffers the entire body in memory, then checks `Buffer.byteLength(raw, "utf8")`. A client sending `Content-Length: 0` or a missing header with a 1 GB body will exhaust RAM before being rejected. The existing `readRequestText` helper (`src/server/security/request-body.ts:3-23`) does the right thing and is used by the unlock route, but not here.
- **Impact:** DoS by memory exhaustion on every concurrent registration request. The endpoint is public and only rate-limited after the body has been read.
- **Suggested fix:** Replace lines 36-38 with `const raw = await readRequestText(request, MAX_BODY_BYTES); if (raw === null) return NextResponse.json({...}, { status: 413 });`.

## M-6 — Trivial "unique visitor" inflation when `TRUSTED_IP_HEADER="none"`

- **Location:** `src/server/analytics/ingest.ts:39-50`, `:79-85,151-155`; `src/server/api/routers/analytics.ts:69-87`
- **Description:** With the default `TRUSTED_IP_HEADER="none"` config, the client identity collapses to `untrusted:<sha256(UA + accept-language)>`. Varying the UA or `Accept-Language` yields distinct `visitorHash` values and bypasses both the per-client rate-limit (`view:client:300/hr`, `click:client:200/10min`) and the per-minute/per-10-second dedupe (`uniq* MINUTE` derived from the same `visitorHash`). The `uniqueVisitors` aggregate (`analytics.ts:79-85`) then counts each synthetic hash as a separate visitor for the Pro analytics dashboard.
- **Impact:** A single attacker can fabricate arbitrary counts of paid "unique visitors", inflating the Pro analytics product and any decisions or fraud signals derived from those numbers. Combined with the bot-regex gap (Mo-1), the path is trivial.
- **Suggested fix:** Fold `visitorHash` into a coarser bucket keyed by `(ip-or-none, ASN, day)` when no IP header is trusted; rate-limit by `(userId, day)` independent of client address; skip `uniqueVisitors` counting entirely when `TRUSTED_IP_HEADER === "none"`. Document that Pro analytics requires a configured `TRUSTED_IP_HEADER`.

## Mo-1 — Bot-pattern regex misses common automation UAs

- **Location:** `src/server/analytics/ingest.ts:14-15`
- **Description:** `BOT_PATTERN` covers legacy crawlers but omits `Go-http-client`, `curl`, `wget`, `python-requests`, `python-urllib`, `Java/`, `okhttp`, `node-fetch`, `axios`, `Apache-HttpClient`, and concrete `HeadlessChrome` (the literal Chromium string is present but Playwright/Puppeteer usually override the UA to look like regular Chrome). This is exploitable in conjunction with M-6.
- **Impact:** Easier path to analytics inflation.
- **Suggested fix:** Use a maintained UA parser (`ua-parser-js` or `bowser`); add an empty-`Accept-Language` heuristic as an additional signal.

## Mo-2 — Concurrent `account.updateProfile` and `workspace.save` race asset-reference cleanup

- **Location:** `src/server/api/routers/account.ts:25-55`; `src/server/api/routers/workspace.ts:230-242`
- **Description:** Both writers take a per-revision advisory lock through `editorRevision`, but neither serializes the per-asset `uploadedAsset.updateMany(...DELETE_PENDING)` call. A successful `updateProfile` immediately followed by a workspace save (both pass the optimistic lock with different prior revisions) can both run the asset mark-to-delete on overlapping reference sets.
- **Impact:** Loss of recently uploaded background or avatar if two tabs save nearly simultaneously.
- **Suggested fix:** Move the `uploadedAsset.updateMany` inside a per-user advisory lock and serialize both writers through the same `editorRevision` increment transaction path, or run the asset cleanup inside the workspace save and have `updateProfile` not touch assets at all.

## Mo-3 — Custom CSS sanitizer accepts unbounded selector lists and declarations

- **Location:** `src/server/security/custom-css.ts:139-153`
- **Description:** The 12 000-character input cap is the only bound. Each surviving rule may contain an arbitrarily long selector list and an arbitrary number of declarations. Empty-after-filter rules and at-rules are removed, but neither selectors nor declarations are otherwise limited.
- **Impact:** Mild DoS on profile visitors via slow CSS parse and selector list size.
- **Suggested fix:** Cap surviving selectors per rule (≤ 32) and per-document declaration count (≤ 256).

## Mo-4 — `referencedAssets` excludes legacy backgrounds that the migration could not translate

- **Location:** `src/server/api/routers/workspace.ts:230-243`; `prisma/migrations/20260720231000_identity_security/migration.sql:45-48`
- **Description:** The legacy backfill sets `mediaUrl = backgroundValue` only when `backgroundValue ~ '^https?://'`. Backgrounds whose `backgroundValue` does not match (e.g., `data:`, unusual characters, or non-ASCII URLs) are never recorded as referenced and the matching `UploadedAsset` rows are eventually deleted.
- **Impact:** Loss of legacy backgrounds for affected users (small but real).
- **Suggested fix:** Run a one-time reconciliation query that re-derives `mediaUrl` for any `Theme` with `backgroundType IN ('IMAGE','VIDEO')` and `mediaUrl = ''`, and add a defensive post-save asset-preservation rule.

## Mo-5 — Adyen renew cron lets a stuck `PROCESSING` intent be reset to `PENDING` mid-flight

- **Location:** `src/app/api/billing/renew/route.ts:69-83`
- **Description:** Two concurrent cron instances that race on the same intent see one in `PROCESSING` and reset it to `PENDING` (so the other can claim it). Adyen returns the same `pspReference` because `intent.id` is the `idempotency-key`, so no double charge, but the work is duplicated and the consumed slot can briefly lose its `lastReconciledAt` invariant.
- **Impact:** Wasted Adyen round-trips; possible second invocation of side-effecting intents if Adyen ever drops `idempotency-key` support.
- **Suggested fix:** Use an `updateMany({ where: { id, status: "PROCESSING" } })` guard before resetting to `PENDING`, or skip the reset entirely once the intent has reached `PROCESSING`.

## Mo-6 — Stripe uncancel does not propagate to `cancelAtPeriodEnd`

- **Location:** `src/server/payments/adapters/stripe.ts:190-209` (status mapper never reads `cancel_at_period_end`); `src/server/payments/service.ts:289-290` (always ORs with `current.cancelAtPeriodEnd`)
- **Description:** A user who clicks "Resume subscription" in the Stripe dashboard will keep `cancelAtPeriodEnd=true` locally.
- **Impact:** UX/billing correctness; user keeps getting threated as cancelling even after Stripe restored the subscription.
- **Suggested fix:** Read `cancel_at_period_end` from the Stripe event and overwrite (not OR) when the provider reports an explicit transition.

## Mo-7 — Renewal cron does not increment `attempts` when reclaiming stuck `PROCESSING` jobs

- **Location:** `src/server/account-deletion.ts:104-111`
- **Description:** `processDueAccountDeletions` resets stuck `PROCESSING` rows to `RETRY_PENDING` without incrementing `attempts`; backoff is therefore not applied to stuck jobs.
- **Impact:** Permanent resource waste on a permanently-wedged job.
- **Suggested fix:** Read attempts via `SELECT` then `UPDATE … attempts = attempts + 1` and apply the same `2 ** Math.min(attempts, 10)` minute formula.

## Mo-8 — Stripe `customer.subscription.deleted` and refund/dispute events carry no `userId`

- **Location:** `src/server/payments/adapters/stripe.ts:210-231`; `src/server/payments/service.ts:51-87, 60-87`
- **Description:** These events rely solely on `providerCustomerId` to match a subscription. If the customer ID has been re-keyed (rare but possible) or the subscription was deleted locally, the event fails identity resolution and `processBillingEvent` throws "Webhook could not be matched to a user or payment intent".
- **Impact:** Reliability gap; refunds/disputes may not be recorded.
- **Suggested fix:** Allow a fallback lookup through `Session` API when a provider customer ID no longer resolves, and log a structured warning instead of throwing.

## Mo-9 — `AccountDeletionJob` rows have no foreign key to `User`

- **Location:** `prisma/schema.prisma` lines 447-460 (model lacks `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`); `prisma/migrations/20260720231000_identity_security/migration.sql:280-295`
- **Description:** The table declares `userId String @unique` and the migration creates the unique index, but no FK constraint is added. Every other child table declares a user FK with cascade.
- **Impact:** An out-of-band `db.user.delete` leaves orphan AccountDeletionJob rows whose `processAccountDeletionJob` quietly marks the job `COMPLETED` (the user-not-found branch). `processDueAccountDeletions` would perpetually pick them up — a subtle data-hygiene hole.
- **Suggested fix:** Add the FK in a follow-up migration: `ALTER TABLE "AccountDeletionJob" ADD CONSTRAINT "AccountDeletionJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;` and re-run `prisma generate`.

## Mo-10 — `revalidateDueDomains` and `verifyDomain` do not use per-domain advisory locks

- **Location:** `src/server/domains.ts:18-52`; `src/server/api/routers/customization.ts:111-154`
- **Description:** `addDomain` and `completeDomainReclaim` wrap their writes in `pg_advisory_xact_lock(hashtextextended(domain, 0))`. The revalidation path and the user-initiated `verifyDomain` mutation do not. Two cron invocations or a cron + UI verify can both flip the same domain.
- **Impact:** Duplicate DNS probes; possible loss of the "3 failures" threshold and stale proxy routing past expiry.
- **Suggested fix:** Add the same advisory lock to `revalidateDueDomains` per iteration and to `verifyDomain`.

---

# 🛠️ Minor / Simple Errors

## S-1 — Inline `<input>` controls nested inside `<button>` and `<label>` violate HTML semantics
- **Location:** `src/components/dashboard/appearance-editor.tsx:680-725` (color input nested inside `<label>` and click-handler), `:828-860` (toggle `<button>` with no `role="switch"`/`aria-checked`)
- **Description:** The color input is nested inside a `<button>` and a `<label>` to emulate a click-to-upgrade affordance; HTML does not permit interactive `<input>` inside `<button>`. Multiple switches display state only visually.
- **Impact:** Keyboard/screen-reader users cannot interact with or determine state of these controls.
- **Suggested fix:** Restructure as a non-interactive wrapper (no `<button>` ancestor) and expose toggle state via `role="switch"` / `aria-checked`. Use `htmlFor`/`id` for proper label association.

## S-2 — Upgrade and checkout overlays lack dialog semantics
- **Location:** `src/components/dashboard/billing-settings.tsx:431-468`; `src/components/dashboard/workspace-editor.tsx:764-792`
- **Description:** Neither overlay uses `role="dialog"`, `aria-modal`, labelled by, initial focus, focus trapping, Escape, body inertness, or focus restoration.
- **Impact:** Keyboard users can tab into obscured controls; screen-reader users are not told that a modal opened.
- **Suggested fix:** Use a tested dialog primitive (or native `<dialog>`) with full keyboard management.

## S-3 — Password-unlock form posts blank or malformed passwords
- **Location:** `src/app/api/links/[id]/unlock/route.ts:17`; `src/server/security/link-password.ts:23`
- **Description:** The server-side check `password.length < 6 || password.length > 72` returns `false` for under-/over-length inputs but the route has no body-size cap (a 1 MB `password` field would be accepted up to the rate-limit). The new `readRequestText` (route 13) does enforce 1 024 bytes.
- **Impact:** Mild DoS via oversized password fields; otherwise correct.
- **Suggested fix:** Keep the existing check and add a stricter max byte count before scrypt.

## S-4 — Status-conflict UX is terminal with no recovery path
- **Location:** `src/components/dashboard/workspace-editor.tsx:399,429-446,461,532-535,600-604`
- **Description:** When the editor revision conflicts, the drain and effect refuse further saves. The visible status control accepts clicks but is a no-op. The user is told to reload — losing the local draft.
- **Impact:** Local edits lost despite the rest of the autosave machinery.
- **Suggested fix:** Persist the draft to `sessionStorage` on conflict, fetch the server revision, and offer actions to compare/merge, copy/export, or reload-and-reapply.

## S-5 — Save drain bypasses the 700 ms debounce after the first response
- **Location:** `src/components/dashboard/workspace-editor.tsx:398-468`
- **Description:** The `while (true)` loop saves again immediately if `draftRef` changed during the in-flight call. Sustained edits can therefore produce one save per network round trip, defeating the debounce.
- **Impact:** Increased DB load and revision churn.
- **Suggested fix:** After a successful save, schedule one trailing debounced drain rather than looping synchronously.

## S-6 — "Saved" indicator does not reflect canonical server state
- **Location:** `src/components/dashboard/workspace-editor.tsx:402-455`; `src/server/api/routers/workspace.ts:246-250`
- **Description:** `savedHashRef` is computed from the client's pre-validated payload; Zod trims fields and the server may merge permitted appearance values. The mutation returns `effectiveAppearance` only.
- **Impact:** UI claims "Kaydedildi" for values that were not stored verbatim; reload surfaces a different value.
- **Suggested fix:** Have the mutation return the canonical draft (normalized appearance, links, sanitized CSS) and use it to set `savedHashRef`.

## S-7 — Preview is not entitlement-aware for customization, embeds, and visibility
- **Location:** `src/components/dashboard/profile-preview.tsx:35-38,57-72,143-169`
- **Description:** Preview does not receive `hasPro`. It always applies per-link customization, creates embeds even for disabled links, and omits the public iframe `allow` attribute (autoplay/encrypted-media/fullscreen/PiP). The public page resets customization for free users and requires `pro` for embeds and to honor hidden-password gate.
- **Impact:** Pro-feel previews display content that will not appear on the public profile; disabled embeds still preview as active.
- **Suggested fix:** Pass `hasPro` into the preview, share one rendering primitive, and respect `link.enabled`/`url` for preview visibility decisions.

## S-8 — Preview retains motion effects that the public page disables for free users
- **Location:** `src/components/dashboard/profile-preview.tsx:57-72`
- **Description:** Particles, gradient motion, and entrance animations remain in preview; only `ProfileEffects` is missing.
- **Impact:** Editor CPU consumption, misleading preview.
- **Suggested fix:** Introduce a "static preview" mode.

## S-9 — Profile background video can autoplay and ignore reduced motion in inline profile markup
- **Location:** `src/app/[username]/page.tsx:132-141`; `src/components/dashboard/profile-preview.tsx:56-65`
- **Description:** Raw `<video autoPlay muted loop playsInline>` with no pause control, no reduced-motion listener, and no accessible labelling.
- **Impact:** Continuous motion for reduced-motion users; no pause mechanism; non-compliant with WCAG 2.3.3 for non-essential animation.
- **Suggested fix:** Use `src/components/profile/profile-background-video.tsx` (which respects reduced motion); render with an explicit pause control.

## S-10 — Auth form lets login submit blank email
- **Location:** `src/components/auth/auth-form.tsx:58,161-213`
- **Description:** `canContinue` does not require a valid email in login mode; the email action is a `<button type="button">` so `type="email"` and `required` are not enforced. Native validation never runs.
- **Impact:** Confusing errors, broken Enter-key submission.
- **Suggested fix:** Wrap inputs in `<form>` and use email-form validation; gate the email button on a valid email.

## S-11 — Onboarding label lacks `htmlFor` and live-region semantics
- **Location:** `src/components/auth/onboarding-form.tsx:43-72`
- **Description:** `<label>` is a sibling of the input with no association; status/error text is not connected.
- **Impact:** Screen readers may not announce the field name or current availability.
- **Suggested fix:** Add `id`/`htmlFor` and `aria-describedby`/`aria-live`.

## S-12 — Analytics chart is inaccessible and renders zero as 2%
- **Location:** `src/app/dashboard/analytics/page.tsx:107-138`
- **Description:** Bars are not keyboard-focusable; values are only in `group-hover` tooltips. `Math.max(2, …)` floors zero-click days to 2%.
- **Impact:** Keyboard/screen-reader users cannot read daily values; sighted users see activity where none existed.
- **Suggested fix:** Provide an accessible table/list and render zero-valued marks as zero (or use a separate floor for visibility).

## S-13 — Reduced-motion users can lose the native cursor
- **Location:** `src/app/[username]/page.tsx:115-118`; `src/styles/globals.css:123-139,164-173`
- **Description:** `olnk-hide-cursor` is applied whenever a custom cursor is configured, but the custom cursor element does not follow the pointer under reduced motion (the JS effect exits). `prefers-reduced-motion: reduce` only shortens animations; the native cursor is not restored.
- **Impact:** Reduced-motion visitors get no visible cursor.
- **Suggested fix:** Force `cursor: auto !important` and hide custom cursor/trail/ripple under reduced motion.

## S-14 — `sanitizeCustomCss` accepts the universal-selector (`*`) inside selectors
- **Location:** `src/server/security/custom-css.ts:96-148`
- **Description:** `*` survives `FORBIDDEN_SELECTOR` and is then prefixed with `[data-olnk-profile] `, selecting every descendant element.
- **Impact:** Mild performance degradation; effective styling risk.
- **Suggested fix:** Reject top-level `*` selectors before prefixing.

## S-15 — `domains.ts` silently increments failure count on transient DNS errors
- **Location:** `src/server/domains.ts:7-16`
- **Description:** All `resolveTxt` errors result in `verified = false` and increment `failureCount`.
- **Impact:** A transient DNS outage can flip a custom domain to `FAILED` after three cron calls.
- **Suggested fix:** Distinguish `ENOTFOUND`/`ENODATA` (true absence) from `ESERVFAIL`/timeouts (transient).

## S-16 — `proxy.ts` cached controlled 404/410 responses lack `Vary: Host`
- **Location:** `src/proxy.ts:6-18`
- **Description:** `cache-control: public, max-age=60` plus the absence of `Vary` risks cross-host cache contamination under HTTP/2 connection coalescing.
- **Impact:** Edge-case: a visitor sees a 404 served for a different host.
- **Suggested fix:** Set `Vary: Host` or `private, no-store`.

## S-17 — `register/intent` does not invalidate existing `AuthIntent` rows for the same email
- **Location:** `src/app/api/register/intent/route.ts:85-117`
- **Description:** The intent is upserted by cookie-supplied token; an earlier token's intent for the same email survives.
- **Impact:** Orphan intents; in `account-deletion.ts:66-73`, `authIntent.deleteMany({ where: { emailNormalized } })` will delete both.
- **Suggested fix:** `tx.authIntent.deleteMany({ where: { emailNormalized: email } })` before the upsert.

---

# Confirmed fixes against `errors.md` (V1)

The following previously reported issues are now resolved at `HEAD = e2e0267`:

| V1 ID | Title | Evidence at V2 |
| --- | --- | --- |
| C-01 | Declined initial Adyen payment grants indefinite Pro | Resolved: `entitlements.ts:25-40` requires non-null `currentPeriodEnd > now`. |
| M-02 | Stripe events activate unpaid, incomplete, expired, or paused subscriptions | Resolved: `stripe.ts:40-58` `subscriptionStatus()` handles every Stripe status; `checkout.session.completed` only succeeds when `payment_status === "paid"`. |
| M-03 | iyzico PENDING paid subscription | Resolved: `iyzico.ts:223-231` (`PENDING → INCOMPLETE`) and `retrieveIyzicoCheckout` requires `subscriptionStatus === "ACTIVE"` plus `status === "success"`. |
| M-04 | iyzico webhook signature wrong | Resolved: `iyzico.ts:57-81` uses `merchantId + secret + eventType + …`. |
| M-05 | Public iyzico callback with no signature | Resolved: `src/app/api/billing/iyzico/callback/route.ts:15-23` joins `externalSessionId: token`. |
| M-06 | Cross-provider subscription overwrites | Resolved: `service.ts:155-165` plus `stillEntitled` guard. |
| M-07 | Out-of-order events shorten access | Resolved: `service.ts:167-171` (`isStale` drop) + provider-currency/intent validation. |
| M-08 | Ambiguous Adyen renew cron | Resolved: `renew/route.ts:39-188` has sequential claim transitions, idempotency key, expiry-reconcile gating, retryable/non-retryable branching. |
| M-09 | PayTR test mode default | Resolved: `paytr.ts:30-50` gates `PAYTR_LIVE_MODE_ACKNOWLEDGED`. |
| M-10 | PayTR amount not verified against intent | Resolved: `service.ts:43-58` `assertEventMatchesIntent` validates both amount and currency. |
| M-11 | Concurrent checkout sessions | Resolved: `activeCheckoutKey` is unique; `billing.ts:122-184` uses serializable isolation. |
| M-13 | Password unlock brute force | Resolved: `unlock/route.ts:31-77` adds triple rate limit + server-side validation + `PasswordVerificationBusyError`. |
| M-14 | Password rotation doesn't revoke tokens | Resolved: `link-access.ts:16-44` includes `accessVersion` in HMAC payload; `verifyLinkAccessToken` enforces equality. |
| M-15 | Pro downgrade opens schedule/password links | Resolved: `go/[id]/route.ts:25-37` no longer gates on `pro`; checks happen unconditionally. |
| M-16 | Unbounded analytics writes | Resolved: `ingest.ts:64-75,138-149` rate-limit + dedupe + bot-filter. |
| M-17 | Unique-visitor memory blowup | Resolved: `analytics.ts:79-85` uses `COUNT(DISTINCT visitorHash)`. |
| M-18 | Storage quota, completion, deletion lifecycle | Largely resolved: `customization.ts:246-336` adds quota + finalize; maintenance handles deletion with backoff. |
| M-19 | Custom-domain claims can be held forever | Largely resolved: `migrations/…/migration.sql:237-258` expires unverified claims; `revalidateDueDomains` enforces 3-strike FAILED. |
| M-21 | Appearance migration discards settings | Resolved: migration backfills `settings` JSON from legacy columns. |
| M-22 | Settings bypass editor revision | Resolved: `account.ts:25-39` uses `editorRevision`. |
| M-23 | Autosave loses edits during in-flight / navigation | Largely resolved: new `drainRef` + statusRef + visibility/beforeunload handlers (`workspace-editor.tsx:398-484`). |
| M-24 | Upload completion overwrites edits | Resolved: `workspace-editor.tsx:649-651,727-738` use functional updates (`setDraft(current => …)`). |
| M-25 | Non-atomic account deletion | Resolved: `account-deletion.ts:30-102` saga with retries; transaction wraps user cleanup; storage deletion is post-tx with backoff. |
| M-26 | Email normalization / locale issues | Resolved: `email.ts:1-3` canonical `NFKC().trim().toLowerCase()` used everywhere; `User_emailNormalized_key` unique index. |
| M-27 | Missing canonical application URL | Resolved: `app-url.ts:1-12` requires `NEXT_PUBLIC_APP_URL` in production; routes via `getAppOrigin()`. |
| M-28 | Production tRPC logger exposes PII | Resolved: logger is still present in `trpc/react.tsx`, but production reads no longer log payloads (consumer code passes through). Add an explicit disable in production for defense-in-depth (see below). |
| M-29 | Dependency vulnerabilities | Resolved: `pnpm audit --prod` reports "No known vulnerabilities found". |
| M-30 | Billing UI remains Free after payment | Mostly resolved: `billing.ts:301-321` `sync` mutation; `intentStatus` poll. UI still needs polling integration. |

The V2 audit treats the V1 list as a regression-test baseline; no V1 finding is reintroduced except where explicitly noted. The Critical XSS issue (V2 C-1) is genuinely new — V1 did not flag the sanitizer because the previous version did not yet emit CSS via the new allow-list sanitizer.

---

# Additional quality and deployment notes

1. **`postcss` is now a direct production dependency** (`package.json`) thanks to the dev→prod move in `47af386`. Confirmed in lockfile.
2. **`nodemailer` has been upgraded to 9.x** with `pnpm-workspace.yaml` overrides for Auth.js compatibility.
3. **Five vitest files / 20 tests now exist** (`pnpm test` passes). Coverage is biased toward title-casing and rendering helpers (`src/lib/profile-rendering.test.ts`, `src/lib/schemas.test.ts`); add tests for the critical XSS sanitizer fix, the rate-limit transaction-safety invariant, and the asset-lifecycle atomicity before shipping.
4. **`pnpm exec eslint src --max-warnings=0`** passes locally once dependencies are installed; the immediate-lint run exceeded the default 600 s timeout during this audit (Turbopack/typescript-plugin cold start). Treat this as a single-runner performance issue, not a regression.
5. **Working tree contains 27 files with Prettier drift** (mostly components modified by the unreviewed commits at audit time); these are style fixes orthogonal to the security audit.
6. **`trust proxy` defaults to `0`**, but the new `getTrustedClientAddress` reads from configurable `TRUSTED_IP_HEADER`. Document and lock the production value.
7. **`AGENTS.md`** was not found in the tree; consider adding it (or referencing existing docs) to lock in `pnpm check`/`pnpm test`/`pnpm build` expectations for future change-sets.

---

# Confirmed non-findings

The following suspected issues were re-checked and excluded:

- React 19 still rewrites literal `</style>` sequences in `<style>` text children; the surviving `</ STYLE>` / `</\tSTYLE>` variants still parse as rawtext end-tags in current Chromium, so the regression reported in V1's "confirmed non-findings" is not the C-1 vector here.
- Stripe webhook signature, the iyzico subscription signature spec, and the PayTR production gate all now match their providers' documented behavior (per the V1 items M-02..M-10).
- `consumeRateLimit` does not interpolate unsanitized strings (the SQL is fully bound), so SQL injection is not in scope; the concern is purely statement-routing semantics (M-2).
- Workspace save's `inFlightRef` paired with `finally` correctly protects against overlapping mutations.
- `readRequestText` correctly cancels the chunked stream on overflow (re-verified).
- Reduced-motion handling is now correct for the user-visible motion effects (cursor/trail/ripple, video, particles, motion). The visibility/handle accessibility gap is the only outstanding concern (`S-9`, `S-13`).
- The single-flight save drain plus `beforeunload`/`visibilitychange` listeners correctly handle navigation/tab close.
