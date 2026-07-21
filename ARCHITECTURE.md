# ARCHITECTURE.md — olnk.tr System Design

> Last updated against HEAD `433f4fb` on `codex/stabilize-upgrades-fixes`.
> This document maps modules, data flow, integrations, and the cross-cutting concerns that every contributor must understand before changing the system.

---

## 1. High-Level Topology

```
                ┌─────────────────────────────────────────────────────┐
                │                   Browser (client)                 │
                │  RSC page shells · TRPCReactProvider · tRPC client │
                │  TanStack Query (staleTime 30_000) · superjson      │
                └────────────────────┬────────────────────────────────┘
                                     │ HTTPS (Supabase-routed region)
                                     ▼
                ┌─────────────────────────────────────────────────────┐
                │                Next.js 16 App Router                │
                │  RSC pages · route handlers · middleware (proxy)   │
                │  serverExternalPackages: iyzipay, @adyen/api-library│
                └──────────┬──────────────────┬──────────────┬─────────┘
                           │                  │              │
                           ▼                  ▼              ▼
                ┌───────────────┐   ┌─────────────────┐   ┌────────────┐
                │  tRPC routers │   │ API routes      │   │ Middleware │
                │  (protected / │   │ (webhooks,      │   │ (proxy.ts) │
                │   public)     │   │  billing,       │   │ host-based │
                │  + Zod input  │   │  unlock, qr,    │   │ rewriting  │
                └───────┬───────┘   │  intent, auth,  │   └────────────┘
                        │           │  maintenance,   │
                        │           │  renew)         │
                        │           └────────┬────────┘
                        │                    │
                        ▼                    ▼
                ┌─────────────────────────────────────────────────────┐
                │                 Server-only modules                │
                │   db (PrismaPg) · auth · identity · payments · …    │
                └────────────────────────┬────────────────────────────┘
                                         │
                                         ▼
                ┌─────────────────────────────────────────────────────┐
                │ PostgreSQL (sessions · users · links · events · …)  │
                └─────────────────────────────────────────────────────┘
```

Auxiliaries that connect from inside the server:
- AWS S3-compatible object storage (avatars, backgrounds).
- Stripe, iyzico, PayTR, Adyen via the adapter registry + universal webhook route.
- Email via Nodemailer/SMTP for magic links.

---

## 2. Request Lifecycle

### 2.1 Public profile (`GET /[username]`)

1. **Middleware (`src/proxy.ts`)** rewrites `/` to `/{username}` for custom-domain hosts; rejects unknown hosts with a controlled `404`/`410`.
2. The App-Router renders `src/app/[username]/page.tsx` (RSC).
3. `cache(getProfile)` (request-scoped memo) looks up `db.user.findUnique({ where: { usernameNormalized } })` plus `theme`, `subscription`, and active links.
4. If `username` is missing → `notFound()`.
5. `hasProAccess()` and `resolveAppearanceForPlan()` lock Pro paths.
6. `recordProfileView()` is scheduled via `next/server`'s `after()` — non-blocking; the response returns immediately.
7. RSC stream includes the optional YouTube/Spotify iframe (Pro), a JSON-LD `<script>`, optional custom CSS via `<style>` after `sanitizeCustomCss`.
8. **Caching note:** no `revalidate` is exported. Updates do not explicitly invalidate. See `.memory-bank/known_issues.md`.

### 2.2 Dashboard (`/dashboard/*`)

1. `requireDashboardSession()` (server-only helper in `src/server/auth/require-dashboard-session.ts`) calls `auth()` (cached) and redirects to:
   - `/login` if no session,
   - `/onboarding` if no `username`.
2. RSC pages (`page.tsx`) call server-side tRPC procedures (`api.workspace.get`, `api.analytics.overview`, `api.billing.overview`, `api.customization.domainOverview`) via the cached caller in `src/trpc/server.ts`.
3. The page hydrates with the resulting state; subsequent mutations use the client `httpBatchStreamLink`.
4. The dashboard layout sets `metadata.robots = { index: false, follow: false }`.

### 2.3 Auth flow

```
Browser
  │
  ▼
/login or /register (RSC) → <AuthForm/> (client)
  │  fetch("/api/register/intent", POST) — rate-limited, sets `olnk-signup-intent` cookie
  │  GET /api/auth/csrf
  │  POST /api/auth/signin/nodemailer (or /signin/google)
  │
  ▼
Auth.js handler (src/app/api/auth/[...nextauth]/route.ts)
  │  Custom PrismaAdapter normalises email via normalizeEmail()
  │  Custom createUser → also persists emailNormalized + claims signup intent
  │  Custom event.signIn → ensures Theme row; tries claimUsername() from cookie
  │
  ▼
signIn callback → reject if user.deletionRequestedAt set
session callback → enrich session.user.username from DB
  │
  ▼
Redirect to /dashboard (or /onboarding if username still null)
```

For signup with Google without a prior reservation, `signIn` rejects `UsernameUnavailableError` and the user is sent to `/onboarding` to pick a name.

### 2.4 Link click

1. `/go/[id]` (`route.ts`) resolves the link, returns a 302 to the external URL.
2. `recordLinkClick()` is invoked via `next/server`'s `after()` — non-blocking; click metrics and 90-day retention are unaffected by client latency.
3. If the link is password-protected, the link URL is only returned when a valid `olnk_link_<id>` cookie (HMAC, 12h, `accessVersion`-bound) is presented.

### 2.5 Billing webhook

```
Provider → POST /api/webhooks/[provider] (route.ts)
  │  raw body read as Buffer (no JSON.parse)
  │  dispatched to adapter.handleWebhook → NormalizedBillingEvent[]
  │
  ▼
processBillingEvent(provider, event, rawBody)
  │  payloadHash = sha256(rawBody).hex
  │  idempotency: WebhookEvent uniqueness on (provider, externalEventId)
  │  Serializable transaction:
  │    ├─ locate PaymentIntent (matches id or externalSessionId)
  │    ├─ refuse provider switch if another provider has entitlement
  │    ├─ skip stale event (occurredAt ≤ lastProviderEventAt)
  │    ├─ update PaymentIntent.status
  │    └─ upsert Subscription, insert BillingInvoice, write WebhookEvent.status
```

PayTR responds `text/plain OK`; others respond `{ received: true }`.

---

## 3. Core Modules & Services

### 3.1 tRPC surface (`src/server/api/`)

| Router | Procedures | Notes |
|---|---|---|
| `account` | `updateProfile`, `updateUsername`, `delete` | Optimistic locking; deletion triggers async pipeline. |
| `analytics` | `overview({ days })` | Free: total clicks, daily series, per-link clicks. Pro: views, unique visitors, countries, devices, sources. |
| `billing` | `overview`, `intentStatus`, `createCheckout`, `cancel`, `sync` | `createCheckout` runs in a Serializable tx with `activeCheckoutKey` dedupe. |
| `customization` | `domainOverview`, `addDomain`, `verifyDomain`, `beginDomainReclaim`, `completeDomainReclaim`, `removeDomain`, `uploadStatus`, `createUpload`, `finalizeUpload` | Pro-gated where appropriate; rate-limited per IP. |
| `username` | `check` (public), `checkForAccount`, `claim` | `claim` uses `claimUsername()` (advisory lock). |
| `workspace` | `get`, `save`, `setLinkPassword` | `save` performs revision-checked upsert + sanitized CSS. |

`publicProcedure` and `protectedProcedure` (`src/server/api/trpc.ts`) define the auth boundary. `protectedProcedure` throws `UNAUTHORIZED` with the Turkish message `"Oturum açmanız gerekiyor."`.

### 3.2 Auth (`src/server/auth/`)

- `config.ts` — provider enable flags (`googleEnabled`, `emailEnabled`), custom adapter (email normalization + verification token routing), session callback (`session.user.username`), events (`createUser` ensures theme; `signIn` ensures theme + claims the signup intent when possible).
- `index.ts` — exports `auth` (wrapped with `react.cache`), `handlers`, `signIn`, `signOut`.
- `require-dashboard-session.ts` — RSC helper that orchestrates redirects.

### 3.3 Payments (`src/server/payments/`)

The `PaymentProviderAdapter` interface (`src/server/payments/types.ts`) enforces a uniform shape:

```ts
interface PaymentProviderAdapter {
  id: BillingProvider
  label: string
  renewal: "automatic" | "manual"
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutPresentation>
  handleWebhook(rawBody, headers): Promise<NormalizedBillingEvent[]>
  cancelSubscription(s: Subscription): Promise<void>
  getSubscriptionStatus(s: Subscription): Promise<ProviderSubscriptionStatus>
}
```

| Provider | File | Renewal | Checkout | Webhook | Verification |
|---|---|---|---|---|---|
| Stripe | `adapters/stripe.ts` | automatic | `redirect` | `stripe.webhooks.constructEvent` | Stripe SDK |
| iyzico | `adapters/iyzico.ts` | automatic | `html` iframe | `x-iyz-signature-v3` HMAC-SHA256 | `timingSafeEqual` |
| PayTR | `adapters/paytr.ts` | **manual** | `iframe` (PayTR iFrame token) | `hash` form field | `base64(HMAC-SHA256(merchant_oid+salt+status+total_amount))` |
| Adyen | `adapters/adyen.ts` | automatic | `adyen` session JSON | `hmacsignature` header | per-item HMAC |

Pricing: `CANONICAL_USD_PRICES = { MONTHLY: 300, YEARLY: 2200 }`. STRIPE/ADYEN quote USD; IYZICO/PAYTR quote TRY (`LOCAL_PRO_MONTHLY_TRY` default `12900`, `LOCAL_PRO_YEARLY_TRY` default `94900`).

`processBillingEvent()` is the single idempotent reconciliation function. Stale-event detection uses `event.occurredAt ≤ current.lastProviderEventAt`. Subscription continuity preserves `currentPeriodEnd` (never shortened) and resets `providerPaymentMethodId` to `null` on a deliberate provider switch.

### 3.4 Analytics (`src/server/analytics/ingest.ts`)

- Bot filter: a regex of common UAs (`/bot|crawler|spider|headless|preview|.../`).
- `visitorHash = HMAC-SHA256("client|userAgent", AUTH_SECRET)`.
- Dedupe key per minute to avoid double counts.
- Single transaction: insert the event + upsert the daily bucket.
- Rate limits: 300/hour per client, 30/hour per `(userId, client)`.
- Country only recorded when `TRUSTED_IP_HEADER` is `cf-connecting-ip` or `x-vercel-forwarded-for` (default `none` → country is `null`).

### 3.5 Identity (`src/server/identity/claim-username.ts`)

`claimUsername()` uses `pg_advisory_xact_lock(hashtext(userId))` to serialise concurrent claims per-user. The DB unique index on `User.usernameNormalized` is the final authority; collisions bubble up as `UsernameUnavailableError` (caught in the auth flow to redirect to `/onboarding`).

### 3.6 Security helpers (`src/server/security/`)

- `custom-css.ts` — PostCSS pipeline that scopes every selector to `[data-olnk-profile]`, drops `@import`, strips `url(...)`, rejects global selectors and `\\` escapes.
- `link-password.ts` — scrypt with concurrency cap during verification.
- `link-access.ts` — HMAC-signed 12h unlock cookie, versioned against `ProfileLink.accessVersion`.
- `rate-limit.ts` — DB-backed sliding window keyed by sha256 hex; uses `pg_advisory_xact_lock`-style conditional upsert.
- `client-identity.ts` — `getTrustedClientAddress` honours `TRUSTED_IP_HEADER`; `getTrustedCountry` reads the matching header.
- `request-body.ts` — streaming reader with a hard size cap.

### 3.7 Storage (`src/server/storage.ts`)

S3-compatible via `@aws-sdk/client-s3` with `forcePathStyle: true` (R2/MinIO/Backblaze friendly). `region: env.STORAGE_REGION ?? "auto"`. If any of `STORAGE_ENDPOINT / BUCKET / ACCESS_KEY_ID / SECRET_ACCESS_KEY / PUBLIC_URL` is missing, `getStorageConfig()` returns `null` and the client displays the "https adres kullanın" fallback. Allowed mime types: `jpeg|png|webp|gif|mp4|webm`.

---

## 4. Middleware & Routing

### 4.1 Host-based middleware (`src/proxy.ts`)

Excludes `_next/static`, `_next/image`, `favicon.ico`, `og.png`. For all other requests:

1. Allow canonical host (and `www`/no-`www` flip), `localhost`, `127.0.0.1`, `*.vercel.app`.
2. Otherwise resolve `CustomDomain.domainNormalized`; if none → `404` HTML.
3. If found but `status !== VERIFIED` or user is not Pro or has no `username` → `410` HTML.
4. For path `/`, rewrite to `/{username}`.

The 404 and 410 responses are `Cache-Control: public, max-age=60` HTML pages.

### 4.2 Special routes

| Path | Behaviour |
|---|---|
| `/api/qr/[username]` | PNG (720px, ink-on-paper), `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`. |
| `/api/register/intent` | Rate-limited (12/15min/IP, 5/h/email, 10/h/username); sets `olnk-signup-intent` (15 min, `httpOnly`). |
| `/api/links/[id]/unlock` | Verifies password (scrypt), sets `olnk_link_<id>` cookie (12h). Rate-limited. |
| `/api/billing/iyzico/callback` | iyzico hosted-form return; 303 to `/dashboard/billing?checkout=…&intent=…`. |
| `/api/billing/renew` | Bearer `CRON_SECRET`; Adyen recurring charges (≤ 100 per call, idempotent via `renewalKey`). |
| `/api/maintenance` | Bearer `CRON_SECRET`; cleanup cron (events > 90d, rate buckets > 2d, intents/challenges, assets, deletions, domain revalidations). |
| `/api/webhooks/[provider]` | Universal billing webhook; raw body preserved; returns plain text for PayTR, JSON for the rest. |

---

## 5. State, Caching & Data Flow

### 5.1 Server state

- **Source of truth:** Postgres via Prisma 7 ESM client.
- **TanStack Query:** `staleTime: 30_000ms`. Mutations call `invalidateQueries` selectively (e.g. workspace). `superjson` serialises Date/Map/Set/BigInt.
- **Optimistic concurrency:** `User.editorRevision` is incremented on every `workspace.save` and `account.updateProfile`. Clients track a `revisionRef` and pass it back; on `CONFLICT` the dashboard surfaces the "taslağı korumak için sayfayı yenile" copy.

### 5.2 Cross-request memo

- `auth()` is `cache()`-wrapped in `src/server/auth/index.ts`.
- `getProfile()` on the public page is `cache()`-wrapped inline.
- The server-side tRPC caller is shared via `createHydrationHelpers` so SSR + RSC see one instance per request.

### 5.3 Local UI state

- `useState` / `useRef` only. No global stores.
- The editor uses `savedHashRef` + `inFlightRef` to coalesce drain iterations of its debounce loop.

### 5.4 Caching & invalidation

- **No explicit `revalidateTag` / `revalidatePath` calls.** This is a known gap (see `.memory-bank/known_issues.md`).
- The public profile renders static at build time and uses default stale-while-revalidate after edits.
- `/api/qr/[username]` sets 1h max-age + 24h SWR.
- Webhook routes return non-cacheable responses.

### 5.5 Non-blocking writes

- `after()` (from `next/server`) is used for `recordProfileView` and `recordLinkClick`. This keeps the response snappy and decouples analytics from the user experience.

---

## 6. External Integrations

| Service | Purpose | SDK / approach | Where |
|---|---|---|---|
| **Google OAuth** | Provider sign-in | `next-auth/providers/google` | `src/server/auth/config.ts` |
| **Nodemailer / SMTP** | Magic-link emails | `next-auth/providers/nodemailer`, `maxAge: 10*60` | `src/server/auth/config.ts` |
| **Stripe** | Subscriptions + webhooks | `stripe@22`, `maxNetworkRetries: 2`, `constructEvent` | `src/server/payments/adapters/stripe.ts` |
| **iyzico** | Turkish card + subscriptions | `iyzipay@2.0.69` (serverExternalPackages), `subscriptionCheckoutForm.initialize`, hosted HTML | `src/server/payments/adapters/iyzico.ts` |
| **PayTR** | Turkish iFrame, no card storage | Manual HTTP + HMAC of `merchant_oid+salt+status+total_amount` | `src/server/payments/adapters/paytr.ts` |
| **Adyen** | Global recurring + Drop-in | `@adyen/api-library@32` (HMAC), `@adyen/adyen-web@6.41` (Drop-in client only) | `src/server/payments/adapters/adyen.ts` + `src/components/dashboard/adyen-checkout.tsx` |
| **AWS S3-compatible storage** | Avatars + backgrounds | `@aws-sdk/client-s3` + presigner, `forcePathStyle: true` | `src/server/storage.ts` |
| **DNS** | Custom domain verification | `_olnk.<domain>` TXT lookup (provider-agnostic) | `src/server/domains.ts`, `src/server/api/routers/customization.ts` |
| **Auth.js / NextAuth** | Auth core + adapters | `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter@2.11.2` | `src/server/auth/*` |
| **Vercel** (optional) | Hosting | HTTP headers via `x-vercel-forwarded-for` | via `env.TRUSTED_IP_HEADER` |
| **Cloudflare** (optional) | CDN | HTTP headers via `cf-connecting-ip` | via `env.TRUSTED_IP_HEADER` |

### 6.1 Webhook contracts

| Provider | URL | Headers / body | Response |
|---|---|---|---|
| Stripe | `https://<host>/api/webhooks/stripe` | `stripe-signature`, raw body | `200 {received: true}` |
| iyzico | `https://<host>/api/webhooks/iyzico` | `x-iyz-signature-v3` | `200 {received: true}` |
| PayTR | `https://<host>/api/webhooks/paytr` | form-encoded `hash` | `200 text/plain OK` |
| Adyen | `https://<host>/api/webhooks/adyen` | `hmacsignature` | `200 {received: true}` |

On `401` from any provider: `WebhookVerificationError`. On `500`: a generic error is returned and the event is left `RECEIVED` for replay (provider dashboards cover recovery).

### 6.2 Adyen Drop-in (client)

`src/components/dashboard/adyen-checkout.tsx` mounts `AdyenCheckout({ environment, clientKey, session })` with `Dropin({ paymentMethodsConfiguration: { card: { ... } } })`. Loaded CSS: `@adyen/adyen-web/styles/adyen.css`.

---

## 7. Security Boundary Summary

| Concern | Mitigation | Where |
|---|---|---|
| SQL injection | Parameterised queries only (Prisma) | `src/server/db.ts` |
| XSS in user HTML | No `dangerouslySetInnerHTML` except for sanitized CSS output | `src/server/security/custom-css.ts` |
| Cross-site request forgery | Auth.js + Next server actions + origin checks (CSP `frame-ancestors 'none'`) | `next.config.js`, `src/auth` |
| Click fraud | Minute-bucketed dedupe keys, rate limits, bot filter | `src/server/analytics/ingest.ts` |
| Password leak | scrypt (not bcrypt), rate-limited unlock endpoint | `src/server/security/link-password.ts` |
| Brute-force unlock | DB-backed sliding window | `src/server/security/rate-limit.ts` |
| CSS injection | PostCSS scoping + escape-strip | `src/server/security/custom-css.ts` |
| Host spoofing | Host-based middleware allows only canonical + verified custom domains | `src/proxy.ts` |
| Payment signature replay | sha256 `payloadHash` + `(provider, externalEventId)` uniqueness | `src/server/payments/service.ts` |
| Payment provider event ordering | `isStale` check on `lastProviderEventAt` | `src/server/payments/service.ts` |
| Provider switch races | Refuse entitlement transfer mid-flight | `src/server/payments/service.ts` |
| Race-condition username claims | `pg_advisory_xact_lock` + DB unique index | `src/server/identity/claim-username.ts` |

---

## 8. Operational Concerns

- **CSP headers** set in `next.config.js` for every path; payment hosts are explicitly allow-listed.
- **Cron endpoints** (`/api/billing/renew`, `/api/maintenance`) require `Authorization: Bearer ${CRON_SECRET}` and have a 120-second upper bound on work per call.
- **Logging:** `console.*`. Prisma logs `query|error|warn` in dev, `error` in prod.
- **No telemetry SDK** is installed.
- **No external error tracker** is configured.

---

## 9. Where to Extend Safely

| Adding | Touch these files |
|---|---|
| A new tRPC procedure | `src/server/api/routers/<name>.ts`, `src/server/api/root.ts`, `src/lib/schemas.ts`, this doc |
| A new Prisma model | `prisma/schema.prisma`, create a migration, `SCHEMA.md` |
| A new env var | `.env.example`, `src/env.js`, `ENVIRONMENT.md` |
| A new payment provider | `src/server/payments/types.ts`, `adapters/<provider>.ts`, `registry.ts`, `pricing.ts`, `service.ts` (only if behaviour diverges) |
| A new appearance field | `src/lib/appearance.ts`, `src/config/feature-catalog.ts`, `src/components/dashboard/appearance-editor.tsx` |
| A new middleware behaviour | `src/proxy.ts`, `next.config.js` (for headers) |
| A new cron job | `src/app/api/maintenance/route.ts` |

See `AGENTS.md` §9 for the canonical lookup.