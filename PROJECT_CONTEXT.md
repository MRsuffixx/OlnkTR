# PROJECT_CONTEXT.md — olnk.tr Project Blueprint

> Project: **olnk.tr** · Package: `olnk-tr` v0.2.0 · Private.
> Branch: `codex/stabilize-upgrades-fixes` · HEAD: `433f4fb`.
> License: **olnk.tr Monetized Attribution License 1.0 (OMAL 1.0)** — source-available, not OSI-approved.

---

## 1. Executive Summary

`olnk.tr` is a **mobile-first link-in-bio platform** built primarily for **Turkish-speaking creators, professionals, and small businesses**. Each user receives a public profile at `olnk.tr/[username]` where they publish links, personalise their appearance, share a QR code, and view audience engagement. The project is a private `0.2.0` release in active stabilisation on the `codex/stabilize-upgrades-fixes` branch.

### Feature pillars
- **Authentication:** Google OAuth and passwordless email via Nodemailer (Auth.js v5 / NextAuth `database` session strategy).
- **Public profiles:** mobile-optimised, real-time preview in the editor.
- **Editable links:** drag-and-drop reorder, per-link icon, scheduling, password protection, YouTube and Spotify embeds, click recording.
- **Appearance:** structured `AppearanceSettings` JSON (background, buttons, typography, layout, effects, advanced) with custom CSS for Pro.
- **Analytics:** click + view tracking, dedupe keys, daily buckets, 7/30/90-day dashboards. Advanced block (countries, devices, sources) is Pro-gated.
- **Pro billing:** USD $3/mo and $22/yr via Stripe and Adyen; ₺129/₺949 via iyzico and PayTR. PayTR is manual renewal.
- **Storage:** S3-compatible object storage (R2 / MinIO / Backblaze supported) for avatars and backgrounds.
- **Custom domains:** Pro-gated. DNS TXT verification via `_olnk.<domain>`. Reclaim-challenge flow for previously owned domains.
- **Account deletion:** async pipeline (`AccountDeletionJob`) with exponential backoff; cascades through all User-related tables.

### Target audience
- Turkish-speaking creators (influencers, podcasters, YouTubers).
- Freelancers and small business owners.
- Anyone who wants a fast, branded single-link landing page in Turkish.

### Business goals
- Free tier with sensible defaults; Pro tier unlocks appearance customisation, scheduling, password protection, embeds, custom domains, advanced analytics.
- License keeps the source open while requiring attribution for monetised deployments (no revenue share, no source-disclosure requirement).
- Native Turkish copy throughout the product; no i18n abstraction.

---

## 2. Tech Stack

| Layer | Choice | Version | Role |
|---|---|---|---|
| Runtime | Node.js | `^20.19 \|\| ^22.13 \|\| >=24` (pinned `22.13.0`) | LTS node |
| Package manager | pnpm | `11.9.0` | Workspace + peer override management |
| Framework | Next.js (App Router, Turbopack) | `16.2.10` | RSC + server actions + middleware |
| UI | React + React DOM | `19.2.7` | Concurrent rendering |
| Language | TypeScript | `6.0.3` | strict + verbatimModuleSyntax + noUncheckedIndexedAccess |
| Styling | Tailwind CSS | `4.3.3` | PostCSS plugin only; tokens via `@theme` |
| ORM | Prisma (`prisma-client` ESM gen) | `7.9.0` | Output to `generated/prisma` |
| DB driver | `@prisma/adapter-pg` + `pg` | `7.9.0` / `8.22.0` | Postgres connection pool |
| DB | PostgreSQL | 17 (CI) | Migrations + advisory locks |
| API | tRPC + TanStack Query | `11.18.0` / `5.101.2` | End-to-end typed RPC + cache |
| Wire format | superjson | `2.2.6` | Date / Map / Set / BigInt round-trip |
| Auth | Auth.js (NextAuth v5 beta) | `5.0.0-beta.31` | Server-rendered OAuth + magic link |
| Auth adapter | `@auth/prisma-adapter` | `2.11.2` | Adapter normalisation extension in `src/server/auth/config.ts` |
| Email | Nodemailer | `9.0.3` | pinned via peer rules |
| Validation | Zod | `4.4.3` | All untrusted input |
| Env validation | `@t3-oss/env-nextjs` | `0.13.11` | `src/env.js` |
| Storage | AWS SDK v3 (S3-compatible) | `3.1090.0` | Presigned PUTs, head + delete |
| Payments — Stripe | `stripe` | `22.3.2` | Subscriptions + webhooks |
| Payments — iyzico | `iyzipay` | `2.0.69` | serverExternalPackages; ambient `.d.ts` |
| Payments — PayTR | (HTTP) | — | Manual iframe + HMAC |
| Payments — Adyen | `@adyen/api-library` | `32.0.0` | HMAC validator + API |
| Adyen Web | `@adyen/adyen-web` | `6.41.0` | Drop-in UI (client only) |
| Drag & drop | `@dnd-kit/core` / `sortable` / `utilities` | `6.3.1` / `10.0.0` / `3.2.2` | Editor reorder |
| Icons | `lucide-react` | `1.25.0` | Throughout UI |
| QR | `qrcode` | `1.5.4` | `/api/qr/[username]` |
| Analytics parser | none | — | rolling window + dedupe handled in code |
| Logging | none | — | `console.*` + Prisma query log in dev |
| Testing — Unit | Vitest | `4.1.10` | `src/**/*.test.ts` |
| Testing — E2E | Playwright | `1.61.1` | `tests/e2e/*.spec.ts` (port 3100) |
| Accessibility | `@axe-core/playwright` | `4.12.1` | Playwright a11y assertions |
| Dev tools | ESLint / Prettier / typescript-eslint | `9.39.5` / `3.9.5` / `8.64.0` | `--max-warnings=0` gate |

### CI/CD
- **GitHub Actions** (`.github/workflows/ci.yml`) on `push` to `main` and on every `pull_request`.
- Ubuntu + Node `22.13` + pnpm `11.9` + Postgres 17 service container.
- Steps: install → generate → migrate → check (lint+tsc) → test → audit → build → playwright install → e2e.
- **No pre-commit hooks** (`.git/hooks/*` are stock samples).

---

## 3. Directory & Folder Structure

```
.
├── AGENTS.md                       # Master rules (this branch's source of truth)
├── PROJECT_CONTEXT.md              # You are here
├── ARCHITECTURE.md                 # System design
├── SCHEMA.md                       # Data layer reference
├── ENVIRONMENT.md                  # Env variables + modes
├── progress.md                     # Status / in-progress / backlog / changelog
├── .memory-bank/                   # ADRs / known issues / testing strategy
│   ├── decision_log.md
│   ├── known_issues.md
│   └── testing_strategy.md
├── LICENSE, LICENSE.tr             # OMAL 1.0 (English controls)
├── README.md, README.tr.md         # Setup + features
├── CONTRIBUTING(.tr).md            # Contribution guide
├── CODE_OF_CONDUCT(.tr).md         # CoC
├── SECURITY(.tr).md                # Vulnerability disclosure
│
├── package.json                    # Scripts, deps, engines
├── pnpm-workspace.yaml             # peerDependencyRules, allowBuilds, overrides
├── pnpm-lock.yaml                  # Lockfile — never edit manually
│
├── tsconfig.json                   # strict, ~/* alias, ESM, target ES2022
├── next.config.js                  # CSP headers, serverExternalPackages
├── eslint.config.js                # Flat config, --max-warnings=0
├── prettier.config.js              # + tailwind plugin
├── vitest.config.ts                # aliases, NODE_ENV, server-only stub
├── playwright.config.ts            # port 3100, Chromium + mobile-chromium
├── postcss.config.js               # @tailwindcss/postcss
├── prisma.config.ts                # datasource URL via dotenv
├── .env.example                    # Doc-only env file (committed)
├── .npmrc                          # public-hoist patterns for eslint/prettier
├── .node-version                   # 22.13.0
├── next-env.d.ts                   # Next.js generated types
├── start-database.sh               # T3 starter legacy script
│
├── prisma/
│   ├── schema.prisma               # 511 lines · 21 models · 15 enums
│   └── migrations/
│       ├── migration_lock.toml
│       ├── 20260720130000_init_product/
│       ├── 20260720180000_billing_customization/
│       ├── 20260720230000_payment_state_hardening/
│       └── 20260720231000_identity_security/
│
├── src/
│   ├── env.js                      # T3 env: server + client + runtime
│   ├── proxy.ts                    # Next.js middleware (custom-domain routing)
│   │
│   ├── app/                        # App Router
│   │   ├── layout.tsx              # <html lang="tr">, 12 Google fonts, metadata
│   │   ├── page.tsx                # Marketing home (public)
│   │   ├── not-found.tsx
│   │   ├── error.tsx, global-error.tsx
│   │   ├── robots.ts               # Disallow dashboard/api/go/unlock/onboarding
│   │   ├── sitemap.ts              # Static sitemap of public/legal/auth pages
│   │   │
│   │   ├── privacy/page.tsx        # <LegalPage/> — Turkish
│   │   ├── terms/page.tsx          # <LegalPage/> — Turkish
│   │   │
│   │   ├── [username]/page.tsx     # ★ PUBLIC PROFILE (RSC, dynamic)
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Split-screen yellow noise-grid + form
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── onboarding/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx            # Username picker
│   │   │
│   │   ├── dashboard/              # robots: noindex
│   │   │   ├── layout.tsx          # requireDashboardSession + nav + TRPCReactProvider
│   │   │   ├── page.tsx            # <WorkspaceEditor/>
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── billing/page.tsx    # <BillingSettings/>
│   │   │   └── settings/page.tsx   # <SettingsForm/> + <DomainSettings/>
│   │   │
│   │   ├── go/[id]/route.ts        # 302 redirect → record click (after)
│   │   ├── unlock/[id]/page.tsx    # Link unlock form
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── trpc/[trpc]/route.ts
│   │       ├── webhooks/[provider]/route.ts
│   │       ├── billing/iyzico/callback/route.ts
│   │       ├── billing/renew/route.ts
│   │       ├── links/[id]/unlock/route.ts
│   │       ├── maintenance/route.ts
│   │       ├── qr/[username]/route.ts
│   │       └── register/intent/route.ts
│   │
│   ├── components/
│   │   ├── brand.tsx
│   │   ├── site-header.tsx
│   │   ├── legal-page.tsx
│   │   ├── auth/
│   │   │   ├── auth-form.tsx          # combined login + register (client)
│   │   │   └── onboarding-form.tsx
│   │   ├── ui/
│   │   │   └── modal-dialog.tsx       # <dialog>-based modal
│   │   ├── dashboard/
│   │   │   ├── dashboard-nav.tsx
│   │   │   ├── workspace-editor.tsx   # 829-line heart of the editor
│   │   │   ├── appearance-editor.tsx  # 897-line tabbed appearance studio
│   │   │   ├── asset-upload.tsx       # S3 presigned PUT
│   │   │   ├── profile-preview.tsx    # Phone-frame live preview
│   │   │   ├── billing-settings.tsx   # Provider chooser + checkout modals
│   │   │   ├── domain-settings.tsx    # DNS TXT add/verify/reclaim
│   │   │   ├── settings-form.tsx      # Profile + username + delete
│   │   │   └── adyen-checkout.tsx     # Adyen Drop-in wrapper
│   │   └── profile/
│   │       ├── profile-effects.tsx        # Cursor / particles / ripple (a11y)
│   │       ├── profile-background-video.tsx
│   │       └── share-button.tsx
│   │
│   ├── lib/                        # Cross-cutting utilities (no server-only deps)
│   │   ├── appearance.ts           # Zod appearance schema + presets + CSSProperties
│   │   ├── app-url.ts              # server-only getAppOrigin()
│   │   ├── email.ts                # normalizeEmail() — single source of truth
│   │   ├── profile-rendering.ts    # profileFontFamily / ButtonStyle / Density / EmbedUrl
│   │   ├── schemas.ts              # All Zod inputs for procedures
│   │   ├── theme.ts                # DEFAULT_THEME + getBackgroundStyle + faviconForUrl
│   │   └── username.ts             # normalizeUsername / validate / isUsernameAvailable
│   │
│   ├── config/
│   │   ├── feature-catalog.ts      # FEATURE_CATALOG, FEATURE_GROUPS, CAPABILITY_CATALOG
│   │   └── username-policy.ts      # USERNAME_POLICY, USERNAME_UNAVAILABLE_MESSAGE
│   │
│   ├── server/
│   │   ├── db.ts                   # PrismaClient singleton (PrismaPg + pg)
│   │   ├── account-deletion.ts     # processAccountDeletionJob, processDueAccountDeletions
│   │   ├── domains.ts              # domainProofMatches, revalidateDueDomains
│   │   ├── storage.ts              # S3 presigned PUT + Head + Delete
│   │   ├── entitlements.ts         # hasProAccess, canUseFeature, resolveAppearanceForPlan
│   │   ├── analytics/ingest.ts     # recordProfileView, recordLinkClick
│   │   ├── api/
│   │   │   ├── trpc.ts             # publicProcedure, protectedProcedure, superjson
│   │   │   ├── root.ts             # appRouter = account + analytics + billing + customization + username + workspace
│   │   │   └── routers/
│   │   │       ├── account.ts      # updateProfile, updateUsername, delete
│   │   │       ├── analytics.ts    # overview (7/30/90)
│   │   │       ├── billing.ts      # overview, intentStatus, createCheckout, cancel, sync
│   │   │       ├── customization.ts # domainOverview, addDomain, verifyDomain, ..., finalizeUpload
│   │   │       ├── username.ts     # check (public), checkForAccount, claim
│   │   │       └── workspace.ts    # get, save, setLinkPassword
│   │   ├── auth/
│   │   │   ├── config.ts           # providers, adapter, callbacks, events
│   │   │   ├── index.ts            # NextAuth() + cache(auth)
│   │   │   └── require-dashboard-session.ts  # RSC redirect helper
│   │   ├── identity/
│   │   │   └── claim-username.ts   # claimUsername() with pg_advisory_xact_lock
│   │   ├── payments/
│   │   │   ├── types.ts            # PaymentProviderAdapter interface
│   │   │   ├── registry.ts         # adapter Map + getEnabledProviderIds
│   │   │   ├── pricing.ts          # CANONICAL_USD_PRICES, priceForProvider, formatMoney
│   │   │   ├── service.ts          # processBillingEvent, handleProviderWebhook (390 lines)
│   │   │   └── adapters/
│   │   │       ├── stripe.ts
│   │   │       ├── iyzico.ts
│   │   │       ├── paytr.ts
│   │   │       └── adyen.ts
│   │   └── security/
│   │       ├── client-identity.ts   # getTrustedClientAddress, getTrustedCountry
│   │       ├── custom-css.ts        # sanitizeCustomCss (postcss)
│   │       ├── link-access.ts       # HMAC link-unlock token (12h, versioned)
│   │       ├── link-password.ts     # scrypt hash + verify (with concurrency cap)
│   │       ├── rate-limit.ts        # DB-backed sliding window
│   │       └── request-body.ts      # streaming body reader with size cap
│   │
│   ├── styles/
│   │   └── globals.css             # Tailwind v4 + tokens + keyframes + link hover/press
│   │
│   ├── trpc/
│   │   ├── react.tsx               # TRPCReactProvider (httpBatchStreamLink)
│   │   ├── server.ts               # createHydrationHelpers (cache-d caller)
│   │   └── query-client.ts         # QueryClient factory
│   │
│   └── types/
│       └── iyzipay.d.ts            # Ambient module declaration for `iyzipay`
│
├── tests/
│   ├── e2e/
│   │   └── public-accessibility.spec.ts   # axe-core + redirect + 404
│   └── stubs/
│       └── server-only.ts          # Empty export for Vitest alias
│
├── public/
│   ├── favicon.ico
│   └── og.png                      # 1728x910 Open Graph image
│
├── generated/                      # ★ Prisma 7 ESM client output (gitignored in real repo)
│   └── prisma/                     #   (committed here for offline static build)
│
└── errorsV2.md                     # Internal audit report (39 KB)
```

---

## 4. Design System & Conventions

### 4.1 Visual language

- **Palette (`@theme` in `globals.css`):**
  - `--ink`: `#17211B` (near-black green)
  - `--cream`: `#F5F0DE`
  - `--paper`: `#FDFCF7` (page background)
  - `--orange`: `#F06432` (brand accent)
  - `--yellow`: `#F8C95C`
  - `--mint`: `#B9DDC7`
- **Display serif stack:** `Iowan Old Style, Baskerville, Times New Roman`.
- **Sans fonts:** loaded via `next/font/google` (Geist, Fraunces, Manrope, Space Grotesk, Playfair Display, DM Serif Display, Bebas Neue, Inter, Montserrat, Lora, Roboto Mono). Each one is attached to a `--font-*` CSS variable on `<html>`.
- **Backgrounds:** noise-grid pattern, optional custom gradients, video, particle layers (`src/styles/globals.css` + `<ProfileEffects>`).

### 4.2 Naming

| Asset | Pattern |
|---|---|
| Component file | `kebab-case.tsx` |
| Component export | `PascalCase` |
| tRPC procedure | `camelCase` |
| DB model | `PascalCase` |
| Enum value | `SCREAMING_SNAKE` |
| Env variable | `SCREAMING_SNAKE` |
| CSS variable | `--kebab-case` |
| Cookie name | `olnk-...` |

### 4.3 UI primitives

- **Modal:** `<dialog>` via `ui/modal-dialog.tsx`. Always use this — no portal libraries.
- **Avatar:** `next/image` only for static assets; user-configured HTTPS hosts require `eslint-disable @next/next/no-img-element`.
- **Icons:** `lucide-react` only.
- **Buttons / inputs:** styled via Tailwind utilities, plus global `.input` class in `globals.css`.
- **Effects:** prefer-reduced-motion is honoured in `profile-effects.tsx` and `profile-background-video.tsx`.

### 4.4 Appearance schema

The `AppearanceSettings` document is a deeply-typed Zod schema in `src/lib/appearance.ts`. Six top-level groups (`background`, `buttons`, `typography`, `layout`, `effects`, `advanced`). Editing the editor or the live preview always goes through the **same** schema and `mergePermittedAppearance` so free users never read Pro-only paths.

Background presets: `sunrise`, `mint`, `paper`, `aurora`, `midnight`, `mesh`, `confetti`.

### 4.5 Mobile-first

- Public profile uses `min-h-screen` and a centred single column.
- Editor preview is a phone frame (`320/350 px` × `660 px`, 9 px bezel).
- Dashboard has a top nav on desktop and a bottom-bar nav on mobile (`src/components/dashboard/dashboard-nav.tsx`).

### 4.6 Accessibility

- All E2E suites assert `wcag2a/2aa/21aa` via axe-core on `/`, `/login`, `/register`.
- `<dialog>` for modals provides native focus trap; we restore focus on close.
- Custom cursors, particles, and the background video respect `(pointer: fine) and (prefers-reduced-motion: no-preference)`.

### 4.7 Copy & i18n

- **All UI strings are Turkish literals.** No abstraction layer.
- Adding English copy is a deliberate decision and should be raised in PR review.
- Legal copy (`/privacy`, `/terms`) and contact emails (`merhaba@olnk.tr`, `gizlilik@olnk.tr`) are Turkish.