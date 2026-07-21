# `.memory-bank/known_issues.md` — Real Bugs and Workarounds

> This file captures non-obvious runtime behaviour that future agents will trip over. Each entry describes the symptom, root cause, workaround (if any), and the canonical fix or follow-up issue.

---

## 1. Public profile cache is not explicitly invalidated after edits

**Severity:** Medium (correctness, not security)
**Symptom:** Edits made in the editor (avatar, name, link order, appearance) may not be visible on the live profile for the duration of the default revalidation window.
**Root cause:** `src/app/[username]/page.tsx` has no `export const revalidate` or `export const dynamic`. The handler does not call `revalidateTag` or `revalidatePath`. RSC thus relies on Next's default stale-while-revalidate cadence.
**Workaround:**
- Force a re-build (`pnpm build && pnpm start`) for immediate visibility in production.
- For dev, restart `next dev` after major edits.
**Canonical fix:** Add `unstable_cache(getProfile, ['profile'], { tags: [`profile:<username>`] })` on the server and `revalidateTag('profile:<username>')` in `workspace.save` and `account.updateProfile`. See `decision_log.md` ADR-013.
**Tracked in:** `progress.md` §2 "Public profile cache invalidation".

---

## 2. `Hydration mismatch` warnings on `<html>` and `<svg>` from Dark Reader

**Severity:** Cosmetic (dev only)
**Symptom:** Browser console reports hydration mismatches on `<html>` (`data-darkreader-mode`, `data-darkreader-scheme`) and on every `<svg>` (`style="--darkreader-inline-stroke:currentColor"`, `data-darkreader-inline-stroke=""`).
**Root cause:** The Dark Reader extension mutates the DOM after SSR HTML arrives but before React hydrates. This is documented in the same React warning.
**Workaround:** Disable Dark Reader for `localhost` or use a private window while developing.
**Canonical fix:** None needed; this is third-party noise. Production visitors without the extension see no warnings.
**Tracked in:** `AGENTS.md` §11.

---

## 3. `scroll-behavior: smooth` warning from `globals.css`

**Severity:** Cosmetic (dev only)
**Symptom:** Next.js logs `Detected \`scroll-behavior: smooth\` on the \`<html>\` element. To disable smooth scrolling during route transitions, add \`data-scroll-behavior="smooth"\` to your \`<html>\` element.`
**Root cause:** `src/styles/globals.css:30` sets `scroll-behavior: smooth` on `html`. Next's router wants a `data-` attribute so it can suppress the smooth scroll during instant client-side navigations.
**Workaround:** None required; the warning is dev-only.
**Canonical fix:** Remove the CSS rule and add `data-scroll-behavior="smooth"` to `<html>` in `src/app/layout.tsx:81`.
**Tracked in:** `progress.md` §4.

---

## 4. `pnpm dev` warns "Your node_modules are out of sync with your lockfile"

**Severity:** Cosmetic
**Symptom:** A warning at the top of `pnpm dev` output.
**Root cause:** `package.json` or `pnpm-workspace.yaml` changed since the last install. The shutdown of the latest stabilisation commit changed the workspace shape (`verifyDepsBeforeRun: false`), so a fresh checkout will see this warning until `pnpm install` is run.
**Workaround:** Run `pnpm install`.
**Canonical fix:** Re-running `pnpm install` clears it. Once lockfile and tree are in sync, no further action.

---

## 5. Auth login fails with `SessionTokenError` / `PrismaClientKnownRequestError`

**Severity:** Medium (deploy / first-run only)
**Symptom:** Every Auth.js call fails with `PrismaClientKnownRequestError` and the dashboard redirects to `/login?error=Configuration`.
**Root cause:** `prisma migrate` was not run against the target Postgres (or the connection is wrong). Tables such as `Session`, `User`, `Account`, `VerificationToken` are missing.
**Workaround:** Run `pnpm db:migrate:dev` or `pnpm db:push`.
**Canonical fix:** Ensure `.env`'s `DATABASE_URL` is reachable, then run `pnpm db:generate && pnpm db:migrate:dev` (development) or `pnpm db:migrate` (production).
**Tracked in:** `AGENTS.md` §11 "Auth login fails".

---

## 6. `Next.js: serverComponentsContext ...` warning during `npm install` after a stack upgrade

**Severity:** Cosmetic (only during major version transitions)
**Symptom:** Peer-dependency warnings on `next-auth` with `@auth/core`.
**Root cause:** We pin `nodemailer@9.0.3` via `peerDependencyRules` in `pnpm-workspace.yaml`. Auth.js requests `nodemailer@^7` historically and the override satisfies it.
**Workaround:** None needed; `pnpm install` succeeds despite the warning.
**Canonical fix:** Tracking upstream `@auth/core` peer range for a future bump is on the stabilisation board.

---

## 7. Adyen renewal cron may produce duplicate charge attempts

**Severity:** Low (idempotent at the provider level)
**Symptom:** If the network drops after Adyen returns `Authorised` but before we persist, the renew cron retries. We rely on the provider's idempotency key.
**Root cause:** `/api/billing/renew/route.ts` uses `idempotency-key = intentId` on `POST /payments`. Adyen honours it, but only for ~24 hours.
**Workaround:** None required.
**Canonical fix:** If we ever see double-charges, surface a reconciliation diff between `WebhookEvent` and `BillingInvoice` and refund via the dashboard's "refund" action (not yet implemented — see `progress.md` §3.1).

---

## 8. `session.user.username` may briefly be `null` during sign-in

**Severity:** Low (UX)
**Symptom:** `session.user.username` is `null` between the moment a User is created (e.g. via OAuth) and the moment `signIn` calls `claimSignupIntent()`. The dashboard layout calls `requireDashboardSession()` which redirects to `/onboarding`.
**Root cause:** New users who did **not** pass through `/register` (`/api/register/intent` reserves a username) have no username yet; that's intentional.
**Workaround:** None needed; `/onboarding` is the resolution path.
**Canonical fix:** This is by design — see `AGENTS.md` §8 and `ARCHITECTURE.md` §2.3.

---

## 9. iyzico hosted-form `cancelSubscription` flips status to `CANCELED` immediately

**Severity:** Behavioural, documented
**Symptom:** Cancelling an iyzico subscription inside `period_end` mode flips the local Subscription.status to `CANCELED` synchronously instead of mirroring Stripe's `cancel_at_period_end` behaviour.
**Root cause:** iyzico does not support `cancel_at_period_end` natively in hosted form.
**Workaround:** The dashboard shows the current status; the user knows the term ended.
**Canonical fix:** Not planned.

---

## 10. PayTR `cancelSubscription` is intentionally a no-op

**Severity:** Behavioural, documented
**Symptom:** "Aboneliği iptal et" silently does nothing for PayTR subscriptions.
**Root cause:** PayTR is manual-renewal. There is no stored card.
**Workaround:** Users must let the term end or contact `merhaba@olnk.tr`.
**Canonical fix:** See `decision_log.md` ADR-008.

---

## 11. Custom CSS rejection of CSS escapes can over-block valid CSS

**Severity:** Low (false positive)
**Symptom:** Some legitimate CSS using escapes (e.g. for emoji selectors) is rejected.
**Root cause:** `sanitizeCustomCss` rejects backslash escapes to close obfuscation bypasses.
**Workaround:** Use plain class selectors instead of escape-based targeting.
**Canonical fix:** If a real, non-exploitable escape pattern is needed, allow-list specific Unicode escapes. Tracked in `errorsV2.md`.

---

## 12. `script-src 'unsafe-eval'` is present in dev only

**Severity:** Documented
**Symptom:** Strict CSP scanners flag the dev CSP.
**Root cause:** Next.js dev needs `unsafe-eval` for HMR; the production CSP drops it (it keeps `'unsafe-inline'` for hydration scripts).
**Workaround:** None needed; staging/prod harden it.
**Canonical fix:** Tracked via CSP review in `next.config.js`.

---

## 13. Adyen sandbox cron retries must complete within 180 s

**Severity:** Low
**Symptom:** `/api/billing/renew` processes up to 100 subscriptions per call; large subscription bases need multiple cron runs.
**Root cause:** The webserver / fetch upper bound is 180 s (Playwright webserver timeout); Vercel function max is 60 s on Hobby, 300 s on Pro.
**Workaround:** Split cron runs across multiple shards when nearing the limit. Future work: hand off to a job queue.
**Canonical fix:** Plan in `progress.md` §3.1 "Background-job queue".

---

## 14. The `generated/` directory is checked in on this branch

**Severity:** Cosmetically misleading
**Symptom:** `.gitignore` excludes `generated/`; the working tree shows the directory present.
**Root cause:** Stabilisation commit `433f4fb` ran the audit's offline build and committed the directory to share the snapshot. New checkouts regenerate it.
**Workaround:** Treat `generated/` as read-only.
**Canonical fix:** Ensure the next stabilisation merge cleans `generated/`. Tracked in `decision_log.md` ADR-017.

---

## 15. RSC `cache()` helpers are per-request; cross-request caching is only via `unstable_cache`

**Severity:** Documented
**Symptom:** A request that bypasses RSC (e.g. a `route.ts`) will not share `cache(auth)` with an RSC sibling.
**Root cause:** `react.cache` is request-scoped; the server-side tRPC caller (also `cache`-wrapped) is invoked via fetch in `route.ts` contexts.
**Workaround:** None; behaviour is correct.
**Canonical fix:** If we ever need cross-process caching, add `unstable_cache` with tags (see ADR-013).

---

## 16. Password unlock cookies are scoped to `/go/<id>` only

**Severity:** Behavioural, documented
**Symptom:** Browsing directly to a password-gated link returns a 404 if the cookie is absent.
**Root cause:** `olnk_link_<id>` is set with `path: /go/<id>` and is verified in `/go/[id]/route.ts` and `/unlock/[id]/page.tsx`.
**Workaround:** Use `/unlock/<id>` from the unlock form, which sets the cookie and then redirects.
**Canonical fix:** None; this is the intended single-flow behaviour.

---

## 17. `AdyenApiError.retryable=true` reset intent to `PENDING`

**Severity:** Documented
**Symptom:** A retryable Adyen error leaves the PaymentIntent in `PENDING` with `attempts` incremented.
**Root cause:** `src/app/api/billing/renew/route.ts:165-185` preserves idempotency by reverting the intent status.
**Workaround:** Re-running the cron (next attempt at `nextAttemptAt`) retries automatically.
**Canonical fix:** Ensure the renewal cron is scheduled by the platform at >= once-per-day cadence. Future work: emit a "needs attention" event.

---

## 18. `hydrate` warnings can also come from a stale `<head>` (font fallback)

**Severity:** Cosmetic
**Symptom:** Some users may see hydration mismatches with non-Latin glyphs if the fallback font fails to load.
**Root cause:** `next/font/google` is configured with `subsets: ["latin"]` only.
**Workaround:** None; most users load Latin glyphs.
**Canonical fix:** Add `latin-ext` if the dashboard is expected to be used by visitors with non-Latin usernames/display names.

---

## 19. CSP blocks the public inspector window in dev

**Severity:** Cosmetic
**Symptom:** DevTools console shows "Refused to apply inline style because it violates the directive".
**Root cause:** The current CSP includes `'unsafe-inline'` for styles, but not all inspector tools are aware of inline styles when CSP is in nonces mode.
**Workaround:** None; this only impacts the third-party inspector.
**Canonical fix:** None planned.

---

## 20. `next.config.js` requires `import "~/env"` side-effect

**Severity:** Documented
**Symptom:** A Docker build that does not have env vars at build time fails.
**Root cause:** `src/env.js` throws unless `SKIP_ENV_VALIDATION=1`.
**Workaround:** Set `SKIP_ENV_VALIDATION=1` in the build stage, then run the server with the real env.
**Canonical fix:** Documented in `ENVIRONMENT.md` §1.14.

---

## 21. Playwright e2e + axe-core can flag colour contrast as "serious"

**Severity:** Cosmetic
**Symptom:** Some custom button configurations can lower contrast below WCAG AA.
**Root cause:** Pro-tier custom CSS is fully user-controlled.
**Workaround:** Document contrast guidance in the appearance editor help text.
**Canonical fix:** Add a real-time contrast warning to the `Choice`/color UI. Tracked in `progress.md` §3.2.

---

## 22. `data-darkreader-mode` dataset inflates `app-bundle` hydration cost

**Severity:** Cosmetic
**Symptom:** Slow first paint when the user has Dark Reader + many SVGs.
**Root cause:** Every lucide-react SVG renders large enough that the DOM swap before hydration is slow on mid-range laptops.
**Workaround:** Disable Dark Reader for the host.
**Canonical fix:** None planned.

---

## 23. `dnsmasq` / corporate proxies inject X-Forwarded-* headers

**Severity:** Behavioural
**Symptom:** `getTrustedClientAddress` returns a private IP when the request went through a corporate proxy.
**Root cause:** `TRUSTED_IP_HEADER=none` (default) ignores the upstream headers.
**Workaround:** Set `TRUSTED_IP_HEADER=x-forwarded-for` only when behind a trusted proxy.
**Canonical fix:** Operational; document deployment expectations.

---

## 24. CSP `img-src 'self' data: https:` allows any HTTPS image

**Severity:** Behavioural (privacy)
**Symptom:** Pro avatars and backgrounds can load from any HTTPS source.
**Root cause:** We do not have an allow-list of image hosts.
**Workaround:** None (this is intended — users can self-host images via HTTPS).
**Canonical fix:** If abuse ever appears, swap to a stricter policy: `img-src 'self' data: https://<allowed-cdn>`.

---

## 25. Migration `20260720231000_identity_security` fails on case-conflicting emails

**Severity:** Operational
**Symptom:** `pnpm db:migrate:dev` aborts with a guard message if any two `User.email` values collide case-insensitively.
**Root cause:** The migration verifies uniqueness before NOT NULL + UNIQUE-ing `emailNormalized`.
**Workaround:** Reconcile the offending rows manually (collapse or rename).
**Canonical fix:** Migration is a one-time guard; future normalisations won't repeat this check.
