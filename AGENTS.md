# AGENTS.md — olnk.tr Agent Operational Guide

> **Audience:** AI coding agents (Kilo, Cursor, Claude, etc.) and human contributors.
> **Purpose:** Single source of truth for code style, tooling, workflows, and project conventions.

---

## 1. Project Snapshot

- **Name:** `olnk-tr` (package) / **olnk.tr** (product)
- **Version:** `0.2.0` (`private: true`)
- **Type:** ESM (`"type": "module"`)
- **Description:** Mobile-first link-in-bio platform for Turkish-speaking creators, professionals, and small businesses. Public profile at `olnk.tr/[username]`. Editable links, QR, analytics, custom domains, Pro billing.
- **Branch in development:** `codex/stabilize-upgrades-fixes` (HEAD `433f4fb`).
- **License:** Custom **olnk.tr Monetized Attribution License 1.0 (OMAL 1.0)** — source-available but **not** OSI-approved. Monetized deployments must include attribution linking back to `https://github.com/MRsuffixx/OlnkTR`. No revenue sharing, no source disclosure requirement. English (`LICENSE`) controls over Turkish (`LICENSE.tr`) on conflict.

---

## 2. Stack at a Glance

| Layer | Choice | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | `^20.19 \|\| ^22.13 \|\| >=24` | pinned to `22.13.0` via `.node-version` |
| Package manager | pnpm | `11.9.0` | `verifyDepsBeforeRun: false` |
| Framework | Next.js (App Router, Turbopack) | `16.2.10` | `serverExternalPackages: ["iyzipay", "@adyen/api-library"]` |
| UI | React + React DOM | `19.2.7` | |
| Language | TypeScript | `6.0.3` | `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax` |
| Styling | Tailwind CSS | `4.3.3` | PostCSS plugin only; design tokens via `@theme` in `globals.css` |
| ORM | Prisma (`prisma-client` ESM generator) | `7.9.0` | output to `../generated/prisma` (gitignored) |
| Driver | `@prisma/adapter-pg` + `pg` | `7.9.0` / `8.22.0` | |
| API | tRPC + TanStack Query | `11.18.0` / `5.101.2` | superjson, httpBatchStreamLink |
| Auth | Auth.js (NextAuth v5 beta) | `5.0.0-beta.31` | `database` session strategy, Prisma adapter |
| Email | Nodemailer | `9.0.3` | pinned via `peerDependencyRules` |
| Validation | Zod | `4.4.3` | all untrusted input |
| Env validation | `@t3-oss/env-nextjs` | `0.13.11` | `src/env.js` |
| Storage | AWS SDK v3 (S3-compatible) | `3.1090.0` | `forcePathStyle: true` for R2/MinIO/Backblaze |
| Payments | Stripe, iyzipay, PayTR, Adyen | `22.3.2` / `2.0.69` / — / `32.0.0` | adapter registry pattern |
| Drag & drop | `@dnd-kit/*` | core `6.3.1`, sortable `10.0.0` | workspace editor |
| Icons | `lucide-react` | `1.25.0` | |
| QR | `qrcode` | `1.5.4` | `/api/qr/[username]` |
| Testing | Vitest + Playwright + axe-core | `4.1.10` / `1.61.1` / `4.12.1` | |

---

## 3. Repository Layout

```
.
├── AGENTS.md                     # This file (master rules)
├── PROJECT_CONTEXT.md            # Executive summary + tech stack + folder map
├── ARCHITECTURE.md               # System design + data flow + integrations
├── SCHEMA.md                     # Prisma models + relations + Zod schemas
├── ENVIRONMENT.md                # Env variables + modes
├── progress.md                   # Status, in-progress, backlog, change log
├── .memory-bank/                 # Specialized memory (ADRs, known issues, tests)
│   ├── decision_log.md
│   ├── known_issues.md
│   └── testing_strategy.md
├── LICENSE / LICENSE.tr          # OMAL 1.0 (English controls)
├── README.md / README.tr.md      # Setup + feature overview
├── CONTRIBUTING(.tr).md          # Contribution guide
├── CODE_OF_CONDUCT(.tr).md       # CoC
├── SECURITY(.tr).md              # Vulnerability reporting
├── package.json                  # Scripts + deps
├── pnpm-workspace.yaml           # pnpm peer overrides + allowBuilds
├── tsconfig.json                 # strict + `~/*` alias
├── next.config.js                # CSP, serverExternalPackages, env side-effect
├── prisma.config.ts              # Prisma datasource URL
├── prisma/schema.prisma          # 21 models, 15 enums
├── prisma/migrations/            # 4 migrations — DO NOT edit applied ones
├── eslint.config.js              # flat config; `--max-warnings=0`
├── prettier.config.js            # `prettier-plugin-tailwindcss` only
├── vitest.config.ts              # aliases ~ and server-only, node env
├── playwright.config.ts          # port 3100, Chromium + mobile-chromium
├── postcss.config.js             # `@tailwindcss/postcss` only
├── next-env.d.ts                 # Next generated types
├── src/                          # Application source (see PROJECT_CONTEXT.md)
├── tests/                        # Playwright + Vitest stubs
├── public/                       # favicon.ico, og.png
├── generated/                    # Prisma ESM output (gitignored, but checked in here)
└── errorsV2.md                   # Internal audit report (39 KB)
```

---

## 4. Core System Rules

### 4.1 Language & Imports

- **TypeScript strict.** All code is type-safe; no `any` unless absolutely necessary (and document why).
- Use `import type { ... }` for type-only imports (`@typescript-eslint/consistent-type-imports` is a warning).
- `verbatimModuleSyntax` is on — always use `import type` for types.
- `noUncheckedIndexedAccess` is on — handle `undefined` from array/object indexing.
- Path alias: `~/...` for `src/...`. **Never** use relative imports deeper than `./..` when the alias works.
- Module type: **ESM only**. No CommonJS in source.

### 4.2 Naming Conventions

| Entity | Convention | Example |
|---|---|---|
| Files (components, modules) | kebab-case | `workspace-editor.tsx`, `custom-css.ts` |
| React components | PascalCase exports | `export function WorkspaceEditor()` |
| Hooks | camelCase starting with `use` | `useDebouncedCallback` |
| tRPC procedures | camelCase | `workspace.get`, `billing.createCheckout` |
| DB models | PascalCase (Prisma) | `User`, `ProfileLink` |
| Enum values | SCREAMING_SNAKE | `BillingProvider.STRIPE`, `Plan.PRO` |
| Env variables | SCREAMING_SNAKE | `AUTH_SECRET`, `DATABASE_URL` |
| CSS variables | kebab-case inside `--...` | `--ink`, `--font-geist` |
| Cookies | `olnk-*` prefix | `olnk-signup-intent`, `olnk_link_<id>` |

### 4.3 Formatting (Prettier)

- Single quotes, no semicolons only inside strings, 100-col wrap.
- `prettier-plugin-tailwindcss` sorts Tailwind classes automatically.
- Run `pnpm format:write` before committing. `pnpm format:check` is the gate.

### 4.4 Linting (ESLint)

- Flat config based on `eslint-config-next/core-web-vitals` + `typescript-eslint` recommended-type-checked + stylistic-type-checked.
- `consistent-type-imports: warn` (auto-fixable with `inline` fixStyle).
- `no-unused-vars: warn` with `argsIgnorePattern: "^_"` — prefix unused params with `_`.
- `no-misused-promises: error` with `checksVoidReturn.attributes: false`.
- `require-await: off` — many `async` handlers are not awaited by callers.
- **`pnpm check` and `pnpm lint` MUST pass with `--max-warnings=0`.** Warnings block CI.

### 4.5 React / Next.js Conventions

- **App Router only.** No `pages/`.
- Server Components by default. Add `"use client"` only when needed (state, effects, browser APIs, event handlers).
- Use `next/server` `after()` for non-blocking analytics writes (e.g. `recordProfileView`).
- Use `<dialog>` (the HTML element) via `ui/modal-dialog.tsx` for accessible modals. **Do not** use portal-based libraries.
- Forms: prefer server actions for simple flows; use tRPC mutations from client components.
- Images: `next/image` for static/S3-hosted assets. Public avatars and favicons from user-configured HTTPS hosts require `eslint-disable @next/next/no-img-element` (see `src/app/[username]/page.tsx:1`).

### 4.6 Tailwind / Styling

- **Design tokens are defined in `src/styles/globals.css` via `@theme`** — `--ink #17211B`, `--cream #F5F0DE`, `--paper #FDFCF7`, `--orange #F06432`, `--yellow #F8C95C`, `--mint #B9DDC7`. Use these tokens; never hardcode hex values inline.
- For per-user appearance, use the **structured `AppearanceSettings`** schema in `src/lib/appearance.ts`, not inline styles.
- Display font: `Iowan Old Style, Baskerville, Times New Roman` (set in `globals.css`).
- All UI strings are Turkish literals. **Do not introduce English copy** without a clear reason.

### 4.7 State Management

- Server state → **tRPC + TanStack Query** (staleTime: 30_000).
- Optimistic UI → `editorRevision` (`User.editorRevision`) pattern with `CONFLICT` propagation.
- Local UI state → `useState` / `useRef`.
- Cross-request memoisation → `react.cache` (e.g. `auth()`, `getProfile`).
- No Redux, Zustand, Jotai, or similar global stores.

### 4.8 Data Fetching

- RSC → server-side tRPC caller (`src/trpc/server.ts`'s `createHydrationHelpers`).
- Client → `api.<router>.<procedure>.useQuery/useMutation()`.
- `superjson` is enabled (Date, Map, Set, BigInt survive the wire).
- Errors thrown from procedures propagate as `TRPCClientError` — handle `code: "CONFLICT"` for optimistic-lock conflicts.

### 4.9 Validation

- **All untrusted input MUST be validated with Zod** before reaching business logic. Server-side validation is mandatory; client-side is supplementary.
- Schemas live in `src/lib/schemas.ts` (request inputs) and `src/lib/appearance.ts` (structured appearance).
- Cross-field rules (e.g. `scheduledEnd > scheduledStart`, unique link ids) are part of the schema via `.superRefine()`.
- `src/server/api/trpc.ts` formats `ZodError` into the procedure output automatically.

### 4.10 Database

- Prisma 7 ESM generator → `generated/prisma`. **Do not** edit files in `generated/` — they are regenerated by `pnpm db:generate`.
- Use the singleton from `src/server/db.ts`. Never instantiate a new `PrismaClient`.
- For race-sensitive operations, use `pg_advisory_xact_lock` (see `src/server/identity/claim-username.ts`).
- Soft deletes: `ProfileLink.deletedAt`, `User.deletionRequestedAt`, `UploadedAsset.status = DELETE_PENDING`.
- All User-related models use `onDelete: Cascade`. `AccountDeletionJob.userId` is intentionally not a FK (survives deletion).

### 4.11 Security

- **Auth:** server-side checks via `protectedProcedure` (tRPC) and `requireDashboardSession()` (RSC).
- **Sessions:** `database` strategy; `Session.sessionToken` is unique.
- **CSRF:** Next.js + Auth.js defaults.
- **Rate limit:** DB-backed sliding window via `consumeRateLimit()` (see `src/server/security/rate-limit.ts`).
- **Trusted IP:** `env.TRUSTED_IP_HEADER` (none | cf-connecting-ip | x-vercel-forwarded-for | x-forwarded-for | x-real-ip). Default `none` = no country recorded.
- **CSP:** set globally in `next.config.js` — frame-src includes `*.paytr.com`, `*.iyzipay.com`, `*.iyzico.com`, `youtube-nocookie.com`, `open.spotify.com`.
- **Custom CSS:** server-side `sanitizeCustomCss` (postcss-based); scopes everything to `[data-olnk-profile]`, strips `url(...)`, rejects global selectors, rejects CSS escapes.
- **Link unlock:** scrypt password + 12h HMAC cookie `olnk_link_<id>` scoped to `/go/<id>`.
- **Webhook verification:** Stripe `constructEvent`, iyzico v3 HMAC, PayTR callback HMAC, Adyen `hmacsignature` header or per-item HMAC.

### 4.12 Secrets & Config

- `.env.example` is the only env file committed. Real `.env*` are gitignored.
- Use `src/env.js` (T3 env) for type-safe env access — never read `process.env.X` directly in app code.
- `AUTH_SECRET` ≥ 32 chars in production (validated by `env.js`).
- `CRON_SECRET` ≥ 24 chars; guards `/api/billing/renew` and `/api/maintenance`.
- Production secrets live in platform secret managers, never in code.

---

## 5. Forbidden Patterns

❌ **Never** do any of the following:

1. **Edit or delete applied migrations** in `prisma/migrations/`. Always create a new one with `pnpm db:migrate:dev`.
2. **Edit `generated/`** — it is regenerated by `pnpm db:generate`.
3. **Modify `.pnpm-store/`, `node_modules/`, `.next/`** — these are tooling outputs.
4. **Introduce hardcoded English UI copy.** All strings are Turkish.
5. **Use `process.env.X` directly** in app code — go through `src/env.js`.
6. **Use `JSON.parse` / `JSON.stringify` on `Date` / `Map` / `Set` / `BigInt`** without superjson.
7. **Skip Zod validation** for any input that crosses a trust boundary (HTTP body, headers, cookies, query params).
8. **Use `dangerouslySetInnerHTML` without server-side sanitization** (only `sanitizeCustomCss` output is allowed).
9. **Use portal-based modal libraries** — the project uses `<dialog>` via `ui/modal-dialog.tsx`.
10. **Import from `@prisma/client` directly** — import from `generated/prisma` (or use `db` from `src/server/db.ts`).
11. **Create a new `PrismaClient`** — use the singleton.
12. **Add a new payment provider** without implementing the full `PaymentProviderAdapter` interface and registering it in `src/server/payments/registry.ts`.
13. **Use `dangerouslyAllowBrowser: true`** for Stripe on the client (server-side only).
14. **Commit `.env`, secrets, or `*.pem`/`*.key` files.**
15. **Run `prisma db push` against production** — use `prisma migrate deploy`.
16. **Skip the lint/typecheck step** before pushing. CI runs `pnpm check` and fails on any warning.
17. **Bypass the existing CSP** without updating `next.config.js`.
18. **Add a TODO/FIXME/HACK comment without an associated issue** — these are tracked via `.memory-bank/known_issues.md`.

---

## 6. Command Palette

All commands run from the repository root. Node version is enforced by `.node-version`.

### Setup
```bash
corepack enable
pnpm install                 # Honour pnpm-lock.yaml
pnpm db:generate             # Regenerate Prisma client (runs on predev/prebuild automatically)
pnpm db:migrate:dev          # Apply migrations + create new one in dev
pnpm db:push                 # Dev-only schema sync (no migration)
pnpm db:migrate              # Deploy migrations (CI / production)
pnpm db:studio               # Prisma Studio
```

### Development
```bash
pnpm dev                     # next dev (Turbopack), port 3000
pnpm build                   # Production build
pnpm start                   # next start (port 3000)
pnpm preview                 # build + start in one shot
```

### Lint, Type, Format
```bash
pnpm check                   # eslint src --max-warnings=0 && tsc --noEmit
pnpm lint                    # eslint only
pnpm lint:fix                # eslint --fix
pnpm typecheck               # tsc --noEmit
pnpm format:check            # prettier --check
pnpm format:write            # prettier --write
```

### Tests
```bash
pnpm test                    # Vitest unit tests
pnpm test:unit               # alias for above
pnpm test:e2e                # Playwright on port 3100 (requires build first)
RUN_DATABASE_E2E=1 pnpm test:e2e   # also run DB-backed e2e
```

### Health / Audit
```bash
pnpm audit --prod --audit-level high   # CI gate
```

---

## 7. Workflow Protocols

### 7.1 Adding a Feature

1. **Spec first.** For non-trivial work, write the change in `progress.md` (Backlog → In-Progress).
2. **Schema first** if it touches DB: update `prisma/schema.prisma` and run `pnpm db:migrate:dev`. Document the migration in `SCHEMA.md` if it introduces new models or indices.
3. **Zod schemas** in `src/lib/schemas.ts`; **never** invent ad-hoc validation in routers.
4. **Procedure** in the appropriate router (`src/server/api/routers/`). Add the procedure to `progress.md` and update `SCHEMA.md` if the input/output is stable.
5. **Client wiring:** `useQuery`/`useMutation` hooks; respect staleTime; handle `CONFLICT` for optimistic-locked mutations.
6. **Tests:**
   - Pure logic → Vitest in `src/**/*.test.ts` next to the source.
   - Render behaviour → Vitest with `@testing-library` (only if pure rendering logic; not currently used — most rendering is verified via Playwright).
   - E2E → Playwright in `tests/e2e/*.spec.ts`; gate DB assertions behind `RUN_DATABASE_E2E=1`.
7. **Update docs:**
   - `AGENTS.md` if the new code changes a pattern.
   - `ARCHITECTURE.md` if the new code changes a module boundary.
   - `ENVIRONMENT.md` if it adds an env var.
   - `.memory-bank/decision_log.md` for non-obvious choices.
   - `.memory-bank/known_issues.md` for tricky edge cases.
8. **Lint + typecheck + format:** `pnpm check && pnpm format:check`. Fix all warnings — CI rejects them.

### 7.2 Fixing a Bug

1. Reproduce via a failing test if at all possible (Vitest for logic, Playwright for UI).
2. Trace the data path: log → procedure → DB query → response.
3. Apply the minimal fix; **never** bundle unrelated changes.
4. Add a regression test if the fix is non-trivial.
5. Document the bug and fix in `.memory-bank/known_issues.md`.

### 7.3 Refactor / Tech Debt

1. Create an entry in `progress.md` Backlog.
2. Open an issue (or note it in `.memory-bank/decision_log.md`).
3. Refactor in a single PR; do not mix with feature work.
4. Verify `pnpm check && pnpm test && pnpm test:e2e` all pass.

### 7.4 Database Migrations

1. Never edit a migration in `prisma/migrations/` that has been applied.
2. Always generate a new migration with `pnpm db:migrate:dev` and a descriptive name.
3. For destructive changes (drop column, type change), provide a two-step migration:
   - Step 1: add the new column/table; backfill data.
   - Step 2: drop the old column/table in a separate migration.
4. Test against a copy of production data if possible.

### 7.5 Commit Messages

- Follow **Conventional Commits**: `<type>(optional-scope): <summary>`
- Types: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Imperative mood; no period; ≤ 72 chars for the summary.
- Reference issues/PRs in the body when relevant.

### 7.6 Branching

- `main` — production-ready.
- `codex/<topic>` — stabilization / large changes (current: `codex/stabilize-upgrades-fixes`).
- `feat/<short-topic>` — feature work.
- `fix/<short-topic>` — bug fixes.

### 7.7 Pull Requests

- Title mirrors the commit message.
- Description: **what** + **why** + **how to verify** + screenshots for UI.
- All CI checks must pass: install, generate, migrate, lint, typecheck, unit, audit, build, e2e.
- At least one reviewer for non-trivial changes.

---

## 8. Routing Quick Reference

| Route | Auth | Render | Notes |
|---|---|---|---|
| `/` | public | RSC, static | Marketing home |
| `/[username]` | public | RSC, dynamic | The link-in-bio page; `notFound()` if no user |
| `/go/[id]` | public | route.ts | 302 redirect + `recordLinkClick` (after) |
| `/unlock/[id]` | public | RSC | Password form; action posts to `/api/links/[id]/unlock` |
| `/login`, `/register` | public | RSC, dynamic | `(auth)` group layout |
| `/onboarding` | required | RSC | `requireDashboardSession` + username check |
| `/dashboard` | required | RSC | `<WorkspaceEditor>` |
| `/dashboard/analytics` | required | RSC | 30-day hard-coded; router supports 7/30/90 |
| `/dashboard/billing` | required | RSC | `<BillingSettings>` + `?checkout=&intent=` |
| `/dashboard/settings` | required | RSC | `<SettingsForm/>` + `<DomainSettings/>` |
| `/api/auth/[...nextauth]` | n/a | route.ts | Auth.js handlers |
| `/api/trpc/[trpc]` | n/a | route.ts | tRPC fetch adapter |
| `/api/webhooks/[provider]` | n/a | route.ts | Universal billing webhook |
| `/api/billing/iyzico/callback` | n/a | route.ts | iyzico hosted-form return → 303 |
| `/api/billing/renew` | bearer | route.ts | Adyen recurring cron |
| `/api/links/[id]/unlock` | n/a | route.ts | Password verification |
| `/api/maintenance` | bearer | route.ts | Cleanup cron |
| `/api/qr/[username]` | n/a | route.ts | PNG QR, 1h cache + 24h SWR |
| `/api/register/intent` | n/a | route.ts | Rate-limited intent reservation |

---

## 9. Where to Find Things

| Need | File |
|---|---|
| Add a tRPC procedure | `src/server/api/routers/<name>.ts` (register in `src/server/api/root.ts`) |
| Add a Zod schema | `src/lib/schemas.ts` |
| Add an appearance field | `src/lib/appearance.ts` + `src/config/feature-catalog.ts` |
| Add an env var | `.env.example` + `src/env.js` + `ENVIRONMENT.md` |
| Add a payment provider | `src/server/payments/types.ts` + `adapters/<name>.ts` + `registry.ts` |
| Add a feature flag / Pro gate | `src/server/entitlements.ts` + `src/config/feature-catalog.ts` |
| Add a cron job | `src/app/api/maintenance/route.ts` |
| Modify the public profile | `src/app/[username]/page.tsx` (RSC) + `src/components/profile/*` |
| Modify the editor | `src/components/dashboard/workspace-editor.tsx` |
| Modify billing UI | `src/components/dashboard/billing-settings.tsx` |
| Update CSP headers | `next.config.js` |
| Update middleware | `src/proxy.ts` |

---

## 10. Verification Checklist Before Committing

- [ ] `pnpm install` succeeds (no lockfile drift).
- [ ] `pnpm db:generate` succeeds (no Prisma schema errors).
- [ ] `pnpm check` returns 0 (lint + typecheck, no warnings).
- [ ] `pnpm format:check` passes.
- [ ] `pnpm test` passes (unit).
- [ ] If UI changed: `pnpm test:e2e` passes (after build).
- [ ] If schema changed: a new migration exists under `prisma/migrations/`.
- [ ] If env changed: `.env.example`, `src/env.js`, `ENVIRONMENT.md` updated.
- [ ] If behaviour changed: docs in `progress.md` / `.memory-bank/` updated.
- [ ] No secrets committed.
- [ ] Commit message follows Conventional Commits.

---

## 11. Emergency Runbooks

### "Prisma errors after pulling main"
1. `pnpm install` (lockfile may have changed).
2. `pnpm db:generate` (Prisma client regenerated).
3. `pnpm db:migrate:dev` (apply any new migrations to your local DB).

### "Auth login fails — `SessionTokenError` / `PrismaClientKnownRequestError`"
1. Check `DATABASE_URL` in `.env` is reachable.
2. Confirm migrations applied (`pnpm db:studio` → Session table exists).
3. Check `AUTH_SECRET` is set (≥ 32 chars in production).

### "Public profile doesn't reflect editor changes"
- There is **no explicit cache invalidation** after edits (see `ARCHITECTURE.md` §5.4 and `.memory-bank/known_issues.md`). Wait for the default revalidation window or restart `next start`.

### "Hydration mismatch warnings in dev"
- Almost always the **Dark Reader** browser extension. Disable for `localhost` or use a private window.

### "CSP blocks a payment iframe"
- Check `next.config.js` `frame-src` and `form-action` directives. Update both the directive and this guide.

### "Payment webhook returns 401"
- Verify the signature header name and secret per provider (see `src/server/payments/adapters/*`).
- Ensure the body is read as raw `Buffer` (not parsed JSON) before signature validation.