# AGENTS.md — rules for humans and AI coding agents working on OlnkTR

OlnkTR is an open-source, self-hostable Link-in-Bio SaaS (primary domain https://olnk.tr).
This file is the contract for anyone changing the code. Read it fully before editing.
Deeper explanations live in `docs/` (start with `docs/architecture/overview.md`).

## 1. Project overview

- **Modular monolith** in a pnpm + Turborepo workspace. No microservices.
- Two deployable apps: `apps/web` (Next.js 16 App Router: UI, tRPC, REST, auth, webhooks)
  and `apps/worker` (BullMQ consumers + scheduled maintenance).
- Domain logic lives in `packages/*`, never in React components or route handlers.
- Languages: code, identifiers, schemas, comments and docs in **English**. User-facing
  strings in **English and Turkish** via `apps/web/messages/{en,tr}.json`.

## 2. Technology stack (pinned major lines)

Node.js 24 LTS · pnpm 10 · Turborepo 2 · TypeScript 6 (strict) · Next.js 16 · React 19 ·
tRPC 11 · Zod 4 · PostgreSQL 18 + Drizzle ORM 0.45 / Drizzle Kit 0.31 (postgres.js 3) ·
Better Auth 1.7 · Redis 8 + BullMQ 5 (ioredis 5) · S3 API (AWS SDK v3; MinIO locally) ·
Nodemailer (SMTP; Mailpit locally) · Stripe SDK · Tailwind CSS 4 + Radix + shadcn-style UI ·
React Hook Form · next-intl 4 · Pino · OpenTelemetry · Sentry SDK (optional) ·
Vitest 4 · Playwright · ESLint 10 (typescript-eslint, type-aware) · Prettier 3.

TypeScript 7 (native compiler) is intentionally not used yet: typescript-eslint supports `<6.1`.

## 3. Repository map

```
apps/web            Next.js app: pages (/[locale]/...), route handlers (/api/*, /go, /media), proxy.ts
apps/worker         BullMQ worker runtime, processors, health server; bundles migrate.js
packages/config     env schema (Zod), constants, shared tsconfig/eslint/vitest presets
packages/types      shared kernel: AppError taxonomy, Actor model, OwnerRef, Clock
packages/validators isomorphic Zod contracts, block registry, theme schema, entitlement catalogue
packages/db         Drizzle schema (per module), client, migrations, seed, test helpers
packages/observability  logger (pino, redaction), request context, tracing, error reporting
packages/jobs       queue names, job payload schemas, BullMQ producer, Redis connections
packages/storage    ObjectStorage port + S3 and in-memory adapters
packages/email      SMTP transport + bilingual templates
packages/billing    plans, subscription state machine, entitlement engine, payment providers, webhooks
packages/analytics  privacy-preserving ingestion, aggregation, rollups, retention, queries
packages/core       domain modules (access, audit, users, organizations, profiles, links, blocks,
                    themes, media, api-keys, platform, admin, public-profiles, billing/analytics facades)
packages/auth       Better Auth server config, session resolution, browser client
packages/api        composition container, tRPC routers/procedures, REST v1, HTTP handlers
packages/ui         shadcn-style UI primitives (Radix + Tailwind)
infrastructure/     Dockerfiles, Postgres/MinIO init, Caddy, OTel collector, backup/restore scripts
docs/               architecture, modules, database, security, deployment, development guides
```

## 4. Architecture rules (enforced)

1. **Layering** (a package may only depend on packages above it):
   `config, types` → `validators, observability` → `db` → `jobs, storage, email` →
   `billing, analytics` → `core` → `auth` → `api` → `apps/*`. `ui` depends only on React libs.
2. **Public exports only.** Import workspace packages through their `exports` map.
   `@olnktr/<pkg>/src/...` deep imports are lint errors.
3. **Core module boundaries.** Inside `packages/core/src/modules/*`, import another module
   only via `../<module>/index` (lint-enforced). Shared kernel: `../../shared/*`.
4. **Business logic in services.** Route handlers, tRPC procedures, REST handlers and React
   components only parse input, call a service and shape the output.
5. **Authorization at the service boundary.** Every tenant-scoped service method takes an
   `Actor` and authorizes via `core.access`. Never rely on the transport layer alone.
6. **Never trust client-supplied tenant ids.** Organization membership and role are re-read
   from the database (`access.assertOrganizationPermission` / `resolveOwner`).
7. **Hide foreign resources as NOT_FOUND**, not FORBIDDEN (IDOR/enumeration resistance).
8. **Premium limits only through the entitlement engine** (`EntitlementService`). Never
   hard-code plan names or limits. Plans/limits live in the `plans` table.
9. **Quota checks run inside the write transaction after locking** the owner/parent row
   (`lockOwner`, `authorizeProfile(..., { lock: true })`).
10. **Background work runs in `apps/worker`**, never inside request handlers. Producers use
    `JobProducer`; consumers must be idempotent or safe to retry.
11. **Dependency inversion.** Lower packages define ports (`ObjectStorage`, `PaymentProvider`,
    `UsageResolver`, `JobProducer`, `ImageProcessor`); composition roots wire adapters
    (`packages/api/src/container.ts`, `apps/worker/src/container.ts`, `core/src/index.ts`).

## 5. Coding standards

- TypeScript strict + `noUncheckedIndexedAccess`; no `any` (lint error); `import type` for types.
- Validate every external input with Zod (`@olnktr/validators`), at the edge _and_ in jobs.
- Throw `AppError` (via `errors.*` in `@olnktr/types`) for expected failures; let unexpected
  errors propagate to the central handlers (they are logged + reported, never leaked).
- No `console.*` except `warn`/`error` in CLIs. Use the injected `Logger`.
- No secrets, tokens, passwords, raw IPs or full API keys in logs or audit metadata.
- Prefer small, explicit functions over abstractions; no premature generalization.
- Keep files focused; add a module `index.ts` for anything other modules consume.

## 6. Database conventions

- Drizzle schema in `packages/db/src/schema/<module>.ts`, `casing: "snake_case"`.
- UUID primary keys (`gen_random_uuid()`), `timestamptz` timestamps, `created_at/updated_at`.
- Tenant-owned rows use `owner_user_id` XOR `owner_organization_id` with a CHECK constraint.
- Every FK declares `ON DELETE` behaviour explicitly. Add indexes for every FK used in lookups.
- **Migrations:** change the schema → `pnpm db:generate` → review the SQL → commit both.
  Never edit an applied migration. The app role (`olnktr_app`) has DML only; migrations run
  as `olnktr_migrator`.
- Multi-row changes go in `db.transaction`. Write audit entries in the same transaction.

## 7. API conventions

- **tRPC** (`/api/trpc`) for first-party UI. Use `publicProcedure`, `protectedProcedure`,
  `rateLimitedProcedure` (mutations), `organizationProcedure`, `adminProcedure`.
  Inputs come from `@olnktr/validators`. Mutations require a same-origin request.
- **REST** (`/api/v1/*`) for integrations: API key auth (`Authorization: Bearer olnk_…`),
  scopes, per-key plan rate limits, envelope `{ data }` / `{ error: { code, message, details?, requestId } }`.
  Breaking changes → new version prefix. Register routes in `packages/api/src/rest/router.ts`.
- Error codes map centrally (`AppError` → tRPC code / HTTP status). Don't invent ad-hoc statuses.

## 8. Security rules (non-negotiable)

- Use Better Auth for authentication; **never** implement custom password hashing, sessions
  or token crypto. HMAC verification of provider webhooks follows the provider's spec.
- Subscription state changes **only** from verified webhooks or authenticated server-to-server
  provider calls — never from a browser redirect.
- Webhooks: verify signature → insert into `billing_events` (unique provider event id) →
  process in a transaction holding a row lock. Keep this order.
- User URLs: `publicHttpUrlSchema` only (http/https, no credentials, no private hosts).
  The server never fetches user-supplied URLs; any future fetcher needs an SSRF guard.
- Render user content as text; no `dangerouslySetInnerHTML`. Embeds use fixed provider
  domains with parsed ids. Media: raster images only, verified by magic bytes.
- Redirects: internal paths through `safeRedirectPath`; external only to stored, validated link URLs.
- New env vars → `packages/config/src/env.ts` + `.env.example` + docs. Production-only
  safety checks belong in the `superRefine` of that schema.

## 9. Testing requirements

- Unit tests: `*.test.ts` (no I/O). Integration: `*.int.test.ts` (real Postgres/Redis/MinIO/
  Mailpit, isolated `*_test` database and Redis DB 15). E2E: `apps/web/e2e/*.spec.ts`.
- Every new service method needs integration coverage for: happy path, authorization
  (other tenant → NOT_FOUND), role/scope denial, and entitlement/quota enforcement if applicable.
- Bug fix → regression test first. Never weaken or delete a failing test to make CI pass.
- Tests must create their own data (`insertTestUser`, `uniqueSuffix`) and never depend on order.

## 10. Commands

```bash
pnpm install                 # install (Node 24, pnpm 10)
pnpm setup:env               # create .env with generated secrets (alias of scripts/setup-env.sh)
pnpm infra:up                # Postgres, Redis, MinIO, Mailpit (Docker)
pnpm db:migrate && pnpm db:seed
pnpm dev                     # web on :3100, worker with hot reload
pnpm format:check | pnpm lint | pnpm typecheck
pnpm test:unit               # fast, no services
pnpm db:test:prepare && pnpm test:integration
pnpm test:e2e                # needs a running stack started with TRUST_PROXY=true
pnpm build                   # production build (web + worker bundle)
pnpm db:generate             # create a migration after schema changes
```

## 11. Rules for AI coding agents

1. Read the relevant `docs/modules/*.md` and the module's `index.ts` before changing a module.
2. Keep changes inside the owning module; cross-module needs go through public `index.ts` APIs.
3. Run `pnpm format:check && pnpm lint && pnpm typecheck` and the affected test suites before
   declaring work done. Report failures honestly; never claim untested behaviour works.
4. Never disable lint rules, type checks or security checks to make something pass. If a rule
   is wrong, change it in `packages/config/eslint` with a justification comment.
5. Do not add dependencies casually: prefer the platform and existing packages; pin to stable
   major lines and keep the lockfile committed.
6. Do not hard-code plan limits, secrets, URLs or user-facing strings.
7. Update docs in the same change when behaviour, env vars, schema or commands change.
8. Never run destructive commands against non-test databases; integration tests refuse
   databases not ending in `_test`.
9. Custom domains are deliberately **not implemented**; extend `PublicProfileLookup`
   (`core/modules/public-profiles`) when that phase starts.
