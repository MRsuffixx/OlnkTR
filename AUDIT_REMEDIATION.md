# Project Remediation Report

Audit date: 2026-07-25  
Repository state reviewed: baseline `13b84f5`, remediation checkpoint `d424561`, and the final
working-tree response-header hardening  
Audit input: external “Full Project Audit Report — OlnkTR Admin Dashboard”

## 1. Executive Summary

The audit contained 26 numbered findings and four additional architecture observations. All 30
items were checked against the current repository rather than accepted at face value.

- Critical issues remaining: **0**
- High issues remaining: **0**
- Audit items reviewed: **30** (26 numbered + 4 architecture observations)
- Fixed in this pass: **5**
- Partially fixed: **0**
- Already fixed before this pass: **11**
- Invalid or stale: **13**
- Deferred: **1**
- Newly discovered findings: **0**

The report was largely based on an older or different implementation. In particular, the current
tree has no `admin-users.ts`, no `changePlan` procedure, no session impersonation feature, no
`BillingProvider.MANUAL`, and no in-memory report limiter. Current admin authorization reloads the
live database role for every page and API operation.

The code is conditionally production-ready: all local static, unit, build, dependency, and
database-independent E2E gates pass. Before a production deployment, operators must provide the
required `AUTH_SECRET`, apply the already-committed migrations through the normal deployment
process, and run provider sandbox/live webhook checks with deployment credentials. Database-backed
E2E and migration deployment were not run because the configured database is non-local and the
local Docker daemon was unavailable.

## 2. Baseline Results

| Check | Command | Initial Result | Notes |
| ----- | ------- | -------------- | ----- |
| Install | `pnpm install --offline --frozen-lockfile` | PASS | Lockfile already current; no network or lockfile drift |
| Prisma generation | `pnpm db:generate` | PASS | Prisma Client 7.9.0 generated |
| Prisma schema | `pnpm exec prisma validate` | PASS | Schema valid |
| Lint + typecheck | `pnpm check` | PASS | Zero warnings and zero type errors |
| Formatting | `pnpm format:check` | PASS | All configured file types passed |
| Unit tests | `pnpm test` | PASS | 29/29 tests before remediation |
| Production build | `pnpm build` | PASS | Next.js 16.2.11 compiled and generated all routes |
| E2E (non-DB) | isolated localhost DB + `pnpm test:e2e` | PASS | 10 passed; 2 DB-backed cases skipped by design |
| Dependency audit | `pnpm audit --prod --audit-level high` | PASS | No known vulnerabilities |
| Outdated packages | `pnpm outdated --format list` | REVIEWED | Only ESLint 10 and TypeScript 7; intentionally outside the current peer graph |
| Migration deployment | `pnpm db:migrate` | NOT VERIFIED | Not run against the configured non-local database |
| DB-backed E2E | `RUN_DATABASE_E2E=1 pnpm test:e2e` | NOT VERIFIED | No isolated PostgreSQL daemon available |
| Docker CLI | `docker --version`; `docker compose version` | PASS | Docker 29.5.2 and Compose 5.1.3 installed |
| Docker daemon/build | `docker info` | NOT VERIFIED | Docker Desktop Linux daemon was not running; repository has no production Dockerfile |

## 3. Finding Resolution Summary

| ID | Severity | Finding | Validation Status | Final Status | Files Changed | Tests Added |
| -- | -------- | ------- | ----------------- | ------------ | ------------- | ----------- |
| CRIT-001 | Critical | Missing Prisma models crash `changePlan` | Referenced procedure/file absent | Invalid | — | — |
| HIGH-001 | High | Missing Prisma model crashes user detail | Current detail uses valid models | Invalid | — | — |
| HIGH-002 | High | Impersonation banner reads wrong cookie | Impersonation deliberately does not exist | Invalid | — | — |
| HIGH-003 | High | Adyen HMAC can be bypassed | Both official signature modes fail closed | Invalid | Provider test fixture | 2 |
| HIGH-004 | High | `ctx.ip` is undefined | Current audit hashes trusted request headers | Already Fixed | — | Existing RBAC tests |
| HIGH-005 | High | Admin can ban another admin | Current mutation rejects every admin target | Already Fixed | — | — |
| MED-001 | Medium | `MANUAL` missing from billing enum | Manual grants use a separate entitlement model | Invalid | — | Existing entitlement tests |
| MED-002 | Medium | Free-plan Prisma null filter is invalid | Current typed filter uses paid/manual negation | Already Fixed | — | Typecheck |
| MED-003 | Medium | In-memory report limiter fails at scale | No report route; limiter is PostgreSQL-backed | Invalid | — | — |
| MED-004 | Medium | Downgraded scheduled links leak | Schedule window is always enforced | Already Fixed | — | Existing rendering tests |
| MED-005 | Medium | iyzico callback trusts query intent | Token, DB intent, status, and provider result are bound | Already Fixed | — | Provider fixture |
| MED-006 | Medium | Referrers are grouped in memory | Current query uses Prisma SQL `groupBy` | Already Fixed | — | Typecheck |
| MED-007 | Medium | Predictable fallback signing secrets | Confirmed in three HMAC consumers | Fixed | Env, security, analytics, docs | Env fail-closed command + token tests |
| MED-008 | Medium | Audit detail is stored as plain string | Current schema uses typed JSON metadata | Invalid | — | Typecheck |
| LOW-001 | Low | `cookies()` is not awaited in admin layout | Admin layout does not call `cookies()` | Invalid | — | Build |
| LOW-002 | Low | Missing Auth.js user ID permits sign-in | Confirmed fail-open branch | Fixed | Auth config | Typecheck/build |
| LOW-003 | Low | Admin CLI records target as actor | Current CLI uses `server-cli`, nullable actor | Already Fixed | — | — |
| LOW-004 | Low | Admin API lacks explicit no-store | Framework default was safe; explicit defense added | Fixed | tRPC route | E2E/build |
| LOW-005 | Low | Bulk suspend creates N audit rows | No bulk suspend operation exists | Invalid | — | — |
| LOW-006 | Low | DB script parses URLs with `awk` | Confirmed | Fixed | DB startup script | Bash syntax + safe URL mode |
| LOW-007 | Low | Auth.js v5 is beta | Current beta is latest v5; no stable v5 exists | Deferred | Decision log already pins rationale | Audit/build |
| INFO-001 | Info | No CI pipeline | GitHub Actions CI exists | Already Fixed | — | — |
| INFO-002 | Info | No Docker/Compose | Optional for current Vercel-style deployment | Invalid | — | — |
| INFO-003 | Info | No automated tests | Vitest and Playwright suites exist | Already Fixed | — | 32 final tests |
| INFO-004 | Info | Prisma datasource has no schema URL | Correct Prisma 7 config pattern | Invalid | — | Prisma validate |
| INFO-005 | Info | Custom keyframes are globally named | Confirmed collision boundary | Fixed | CSS sanitizer | 1 |
| ARCH-A | Architecture | No edge cookie guard for admin | Proposed guard is weaker than live server RBAC | Invalid | — | Existing RBAC/E2E tests |
| ARCH-B | Architecture | Admin filters use `any` | Current filters use Prisma input types | Already Fixed | — | Typecheck |
| ARCH-C | Architecture | No bounded DB pool | `pg` already defaults to a bounded pool of 10 | Invalid | — | Build |
| ARCH-D | Architecture | Providers are untested | Provider contract fixtures exist and were expanded | Already Fixed | Provider tests | 2 added |

## 4. Detailed Changes

### MED-007 Predictable Fallback Signing Secrets

- Original Severity: Medium
- Validation Status: Confirmed
- Final Status: Fixed
- Root Cause: `AUTH_SECRET` was optional outside production and three HMAC consumers substituted
  publicly known development constants.
- Files Changed: `src/env.js`, `src/server/security/link-access.ts`,
  `src/server/security/profile-access.ts`, `src/server/analytics/ingest.ts`, `vitest.config.ts`,
  `README.md`, `README.tr.md`, `ENVIRONMENT.md`
- Tests Added: Explicit valid/missing-secret startup command; existing profile-token tests rerun
- Migration Added: No
- Breaking Change: Yes, configuration-only for environments that omitted `AUTH_SECRET`

#### Verification

Repository-wide search found three fallback strings. A controlled process import succeeded with a
32+ character secret and exited non-zero without it.

#### Changes Made

`AUTH_SECRET` is now required in all modes. Access-cookie and analytics HMACs use only the validated
secret. Vitest and CI use explicit test-only values. Setup documentation now states the requirement.

#### Why This Fix Is Safe

The HMAC algorithm and message formats did not change, so deployments already using a real secret
retain compatibility. Missing-secret deployments now stop instead of generating forgeable tokens.

#### Validation Performed

- `pnpm check`
- `pnpm test` (32/32)
- controlled `src/env.js` imports with present/missing `AUTH_SECRET`
- `pnpm build`

#### Remaining Risks

Every runtime environment must inject the secret before start. `SKIP_ENV_VALIDATION` remains a
build-stage escape only; it must not be set on a secretless runtime.

### LOW-002 Missing Auth.js User ID Permits Sign-In

- Original Severity: Low
- Validation Status: Confirmed
- Final Status: Fixed
- Root Cause: The sign-in callback returned `true` before account-state authorization when `user.id`
  was absent.
- Files Changed: `src/server/auth/config.ts`
- Tests Added: No new isolated callback test; strict typecheck and production auth bundle build
- Migration Added: No
- Breaking Change: No for valid adapter users

#### Verification

The current callback contained the exact fail-open branch. Auth.js adapter users in the intended
database-session flow have server-issued IDs.

#### Changes Made

The callback now returns `false` when no ID exists.

#### Why This Fix Is Safe

Valid Google and Nodemailer adapter flows retain their IDs. Malformed or incomplete callback
identities can no longer skip the account status check.

#### Validation Performed

- `pnpm check`
- `pnpm test`
- `pnpm build`
- login/register E2E accessibility routes

#### Remaining Risks

Provider sandbox sign-in should still be smoke-tested after deployment because external OAuth and
SMTP credentials were not available locally.

### LOW-004 Explicit Private No-Store tRPC Responses

- Original Severity: Low
- Validation Status: Partially Confirmed
- Final Status: Fixed
- Root Cause: Next.js Route Handlers are not cached by default, but the sensitive transport did not
  state its policy on the wire.
- Files Changed: `src/app/api/trpc/[trpc]/route.ts`
- Tests Added: No new isolated header test
- Migration Added: No
- Breaking Change: No

#### Verification

The handler had no explicit cache header. Current Next.js documentation confirms Route Handlers are
not cached by default, so this was defense-in-depth rather than an active data leak.

#### Changes Made

Every tRPC response now includes `Cache-Control: private, no-store`.

#### Why This Fix Is Safe

The API is request-specific and had no intended shared-cache behavior. The change makes that
contract explicit without altering procedure payloads.

#### Validation Performed

- `pnpm check`
- `pnpm build`
- unauthenticated admin and dashboard E2E redirects

#### Remaining Risks

None identified.

### LOW-006 Fragile Database URL Parsing

- Original Severity: Low
- Validation Status: Confirmed
- Final Status: Fixed
- Root Cause: Colon-delimited `awk` parsing treated encoded password punctuation and URL variants as
  structural separators.
- Files Changed: `start-database.sh`
- Tests Added: Non-mutating `--check-url` execution mode
- Migration Added: No
- Breaking Change: No

#### Verification

The original script split the URL by `:` and `@`, which cannot correctly parse encoded credentials.

#### Changes Made

The script uses Node’s WHATWG `URL` parser, validates the PostgreSQL protocol, decodes components,
uses the actual URL username, quotes Docker arguments, matches exact container names, resolves
`.env` relative to the script, and offers `--check-url`.

#### Why This Fix Is Safe

Node 22 is already a pinned project prerequisite. The validation mode exits before Docker access or
state changes.

#### Validation Performed

- Git Bash `bash -n start-database.sh`
- encoded `p%40ss%3Aword` URL: exit 0
- non-PostgreSQL URL: exit 1

#### Remaining Risks

Full container creation was not run because Docker Desktop’s Linux daemon was stopped.

### INFO-005 Custom Keyframe Name Collisions

- Original Severity: Informational
- Validation Status: Confirmed
- Final Status: Fixed
- Root Cause: Selectors were scoped, but CSS keyframe identifiers remain document-global.
- Files Changed: `src/server/security/custom-css.ts`,
  `src/server/security/custom-css.test.ts`
- Tests Added: One keyframe namespace and reference-rewrite regression test
- Migration Added: No
- Breaking Change: No

#### Verification

The sanitizer preserved valid `@keyframes` names and did not rewrite `animation` or
`animation-name`.

#### Changes Made

Accepted keyframes are renamed under `olnk-user-kf-`; references in both animation properties are
rewritten after all safe keyframes are collected.

#### Why This Fix Is Safe

User animations still render because definitions and references change together. Existing selector,
property, URL, escape, and global-selector restrictions remain unchanged.

#### Validation Performed

- focused sanitizer tests
- full `pnpm test` (32/32)
- `pnpm check`
- `pnpm build`

#### Remaining Risks

None identified within the sanitizer’s intentionally limited CSS grammar.

## 5. Invalid, Duplicate, or Already Fixed Findings

### CRIT-001 — Invalid

There is no `admin-users.ts` or `changePlan`. Manual support access is stored in
`ManualEntitlement`; provider subscriptions remain in `Subscription`. Prisma generation,
typecheck, and build pass.

### HIGH-001 — Invalid

The current user detail query calls `clickEvent`, `profileViewEvent`, and `billingInvoices`, all of
which exist in the Prisma schema and generated client.

### HIGH-002 and LOW-001 — Invalid

ADR-018 explicitly prohibits session impersonation. The admin layout does not read any impersonation
cookie and does not call `cookies()`. Troubleshooting links to the public profile only.

### HIGH-003 — Invalid

The recommendation to require a header HMAC for every Adyen event is incorrect. Adyen Standard
webhooks place `hmacSignature` in each notification item; less common non-standard webhooks use the
header. The adapter supports both and rejects a payload when neither verifies. Regression tests use
Adyen’s published Standard webhook fixture.

Reference: [Adyen — Verify HMAC signatures](https://docs.adyen.com/development-resources/webhooks/secure-webhooks/verify-hmac-signatures).

### HIGH-004 — Already Fixed

Audit inputs accept request headers and hash `getTrustedClientAddress(headers)`. `adminProcedure`
and `requireAdminSession()` pass current request headers; there is no `ctx.ip` reference.

### HIGH-005 — Already Fixed

`setAccountStatus` and account deletion reload the target inside the transaction and reject targets
whose live role is `ADMIN`.

### MED-001 — Invalid

Adding `MANUAL` to `BillingProvider` would mix support grants with payment-provider revenue. The
separate `ManualEntitlement` relation is intentional and audited.

### MED-002 — Already Fixed

The list router uses `Prisma.UserWhereInput`; Free means the negation of both active paid and active
manual entitlement filters. Strict TypeScript catches invalid relation filter shapes.

### MED-003 and LOW-005 — Invalid

No report router or bulk-suspend mutation exists. Security limits use the PostgreSQL-backed
`RateLimitBucket` implementation.

### MED-004 — Already Fixed

The public page always filters `scheduledStart <= now` and `scheduledEnd > now`, independently of
the user’s current entitlement.

### MED-005 — Already Fixed

The iyzico callback requires a DB row matching `(id, provider, externalSessionId, pending status)`,
retrieves the result from iyzico by token, and requires the provider-returned `conversationId` to
equal the intent. The query parameter alone grants nothing.

Reference: [iyzico — Initialize and retrieve subscription checkout](https://docs.iyzico.com/en/getting-started/preliminaries/api-reference-beta/subscription/subscription/initialize-subscription).

### MED-006 — Already Fixed

Countries, devices, and referrer hosts are aggregated with database `groupBy` queries and capped at
eight results. No 10,000-row in-memory referrer fetch exists.

### MED-008 — Invalid

`AdminAuditLog.metadata` is JSON. `createAdminAuditData` accepts `Prisma.InputJsonValue`, while
human-readable reasons use the separate bounded string column.

### LOW-003 — Already Fixed

The trusted-shell script records `actorLabel = server-cli` with no actor user ID. The target remains
only the target.

### INFO-001 and INFO-003 — Already Fixed

`.github/workflows/ci.yml` runs install, generation, migrations against PostgreSQL 17, check, tests,
audit, build, and Playwright. Vitest and Playwright suites are present.

### INFO-002 — Invalid as a defect

The repository targets a managed Next.js deployment and is not required to ship a production
container. A local DB helper exists. Docker packaging remains an optional deployment choice, not a
security or functional bug.

### INFO-004 — Invalid

Prisma 7 moved connection URLs to `prisma.config.ts`; the repository follows that exact pattern and
`prisma validate` passes.

Reference: [Prisma 7 upgrade guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).

### ARCH-A — Invalid recommendation

An edge check for the mere presence of a cookie is not authorization and can be forged. Current
server-rendered pages call `requireAdminSession()`, while every admin procedure independently calls
`adminProcedure`; both reload the live database role and account status.

### ARCH-B and ARCH-D — Already Fixed

Admin filters use generated Prisma input types. Provider fixtures cover Stripe, PayTR, iyzico, and
Adyen; this pass added full Adyen Standard HMAC acceptance/rejection cases.

### ARCH-C — Invalid as stated

`PrismaPg` receives a `pg` pool configuration. Node-postgres has a bounded default maximum of 10
connections. Deployment-specific pool sizing remains an operational capacity decision, not evidence
of an unbounded connection defect.

Reference: [node-postgres Pool API](https://node-postgres.com/apis/pool).

## 6. Deferred or Partially Fixed Findings

### LOW-007 — Auth.js v5 beta

- Reason: `5.0.0-beta.32` is the newest v5 release; the npm `latest` stable tag remains v4.24.15.
  Moving to v4 would be a major architectural downgrade from the current App Router/Auth.js v5 API.
- Current risk: Pre-release API stability risk, mitigated by exact pinning, database sessions,
  production build coverage, and a zero-advisory dependency audit.
- Remaining steps: Monitor the official v5 stable release; review its migration notes; upgrade in a
  dedicated branch; rerun auth provider sandbox tests, RBAC tests, build, and E2E.
- Required access/decision: Google OAuth and SMTP sandbox credentials for end-to-end verification.
- Recommended priority: Medium when stable v5 is published; no unsafe forced migration now.

Reference: [next-auth npm versions](https://www.npmjs.com/package/next-auth?activeTab=versions).

No finding was partially fixed.

## 7. Newly Discovered Findings

No separate new product defect was discovered. The test environment needed an explicit
non-production `AUTH_SECRET` after MED-007 became fail-closed; that configuration was updated as part
of the same finding.

## 8. Files Changed

- `src/env.js` — require a 32+ character signing secret in every mode.
- `src/server/security/link-access.ts` — remove the predictable link-token fallback.
- `src/server/security/profile-access.ts` — remove the predictable profile-token fallback.
- `src/server/analytics/ingest.ts` — remove the predictable analytics HMAC fallback.
- `src/server/auth/config.ts` — reject sign-in callbacks without a user ID.
- `src/app/api/trpc/[trpc]/route.ts` — emit explicit private/no-store responses.
- `src/server/security/custom-css.ts` — namespace keyframes and rewrite references.
- `src/server/security/custom-css.test.ts` — keyframe isolation regression coverage.
- `src/server/payments/adapters/providers.test.ts` — Adyen Standard HMAC acceptance/rejection.
- `vitest.config.ts` — explicit test-only signing secret.
- `start-database.sh` — safe URL parser, exact Docker targeting, and check-only mode.
- `README.md`, `README.tr.md`, `ENVIRONMENT.md` — mandatory-secret setup documentation.
- `.memory-bank/decision_log.md`, `.memory-bank/known_issues.md`, `progress.md` — architecture and
  remediation history.
- `AUDIT_REMEDIATION.md` — this report.

No files were deleted. No generated artifact, lockfile, dependency version, or migration changed.

## 9. Database and Migration Notes

- New migrations: None.
- Data migration: None.
- Deployment order: Provide runtime secrets, install with the frozen lockfile, generate Prisma
  Client, run `prisma migrate deploy`, then start the application.
- Rollback: Application code can be rolled back without a database rollback.
- Backup: No new data transformation requires a special backup; normal pre-deployment backup policy
  still applies before migration deployment.
- Compatibility: Existing production rows and HMAC formats are unchanged.
- Verification limitation: `prisma validate` and an empty-schema SQL diff passed. Applying the full
  migration chain to an isolated PostgreSQL database was not possible because Docker was stopped.

## 10. Environment and Deployment Changes

- New variables: None.
- Removed variables: None.
- Changed requirement: `AUTH_SECRET` is now mandatory in every runtime mode and must be at least 32
  characters.
- Changed defaults: Predictable HMAC fallback values were removed.
- Docker changes: Local startup helper only; no production Dockerfile was added.
- CI/CD changes: None; existing CI already provides a test-only secret and PostgreSQL service.
- Infrastructure changes: None.
- Secret rotation: No real secret was exposed, so no rotation is required. Environments that never
  set a secret must generate one before startup.

## 11. Final Validation Results

| Check | Command | Final Result | Important Output |
| ----- | ------- | ------------ | ---------------- |
| Install integrity | `pnpm install --offline --frozen-lockfile` | PASS | Already up to date |
| Prisma client | `pnpm db:generate` | PASS | Prisma Client 7.9.0 generated |
| Prisma schema | `pnpm exec prisma validate` | PASS | Schema valid |
| Static migration diff | `pnpm exec prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` | PASS | SQL generated without DB access |
| Type checking + lint | `pnpm check` | PASS | Zero warnings/errors |
| Formatting | `pnpm format:check` | PASS | All configured files pass |
| Unit/regression | `pnpm test` | PASS | 8 files, 32 tests |
| Focused security | selected Vitest files | PASS | 14 focused tests |
| Production build | `pnpm build` | PASS | Next.js optimized build complete |
| E2E (isolated, non-DB) | localhost-denied DB + `pnpm test:e2e` | PASS | 10 passed, 2 skipped |
| DB-backed E2E | `RUN_DATABASE_E2E=1 pnpm test:e2e` | NOT VERIFIED | Isolated PostgreSQL unavailable |
| Dependency audit | `pnpm audit --prod --audit-level high` | PASS | No known vulnerabilities |
| Migration deploy | `pnpm db:migrate` | NOT VERIFIED | Deliberately not run against non-local DB |
| Docker daemon/build | `docker info` | NOT VERIFIED | Docker Desktop Linux daemon stopped; no Dockerfile |
| Compose validation | `docker compose config` | NOT VERIFIED | No Compose file by design |
| DB helper syntax/URL | Git Bash syntax + `--check-url` | PASS | Encoded credentials accepted; wrong protocol rejected |
| Secret fail-closed | controlled `src/env.js` imports | PASS | Valid secret exit 0; missing secret exit 1 |

## 12. Manual Verification Checklist

1. Generate and inject a unique `AUTH_SECRET` in every deployment environment.
2. Deploy to staging and run `pnpm db:migrate`; confirm all committed migrations are applied.
3. Sign in once with Google and once with a Nodemailer magic link.
4. Confirm an unauthenticated `/admin/users` request redirects before admin content renders.
5. Confirm a normal user receives no admin data from direct tRPC calls.
6. As an admin, open user detail, update a profile, grant/revoke manual Pro, and inspect audit rows.
7. Attempt to suspend or delete another admin and confirm the server rejects it.
8. In each configured payment-provider sandbox, create checkout and replay a signed webhook.
9. For Adyen, test both a Standard notification-item signature and any configured non-standard
   header-signature webhook.
10. Complete an iyzico sandbox checkout and confirm a mismatched token/intent callback is rejected.
11. Save custom CSS with a keyframe and verify the animation works without changing built-in page
    animations.
12. Verify a scheduled link stays hidden before its start and after its end for both Free and Pro.
13. Run `start-database.sh --check-url` before using the helper with a new local DB URL.
14. Monitor admin denied-access audit volume, webhook verification failures, payment intent failures,
    database pool saturation, and rate-limit bucket growth after deployment.

## 13. Final Assessment

- Are all Critical findings resolved? **Yes; none of the reported Critical behavior exists in the
  current code.**
- Are all High findings resolved? **Yes; current implementations are protected or the findings were
  invalid, and Adyen verification now has direct regression coverage.**
- Is the project safe to deploy? **Conditionally yes after normal staging migration and provider
  credential smoke tests.**
- What still blocks production? **No code-level Critical/High blocker. Environment secret injection,
  staging migration verification, and configured-provider sandbox checks remain operational gates.**
- Are secrets required to be rotated? **No real credential exposure was found.**
- Are database operations required before deployment? **No new migration was added; continue to run
  the normal committed migration deployment step.**
- What should be monitored? **Admin access denials, webhook signature failures, payment reconciliation
  failures, DB connection saturation, and rate-limit storage growth.**
- Confidence: **High for static correctness, unit behavior, build integrity, and the audited trust
  boundaries; moderate-high overall because DB-backed E2E and live provider flows could not be run
  without an isolated database and external sandbox credentials.**
