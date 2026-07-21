# ENVIRONMENT.md — Environment Configuration

> All non-secret environment knobs and their meaning.
> Source of truth: `.env.example` and the T3-env schema in `src/env.js`.

---

## 1. Required Variables

### 1.1 Authentication

| Key | Required in | Type | Notes |
|---|---|---|---|
| `AUTH_SECRET` | production | string ≥ 32 chars | Used by Auth.js (NextAuth v5) to sign tokens and HMAC dedupe keys; dev fallback is logged if missing. |

### 1.2 Google OAuth

| Key | Required | Notes |
|---|---|---|
| `AUTH_GOOGLE_ID` | when enabling Google | OAuth client ID |
| `AUTH_GOOGLE_SECRET` | when enabling Google | OAuth client secret |

If both are present, `googleEnabled = true` (see `src/server/auth/config.ts:25`) and Google is offered alongside email sign-in.

### 1.3 Email (Nodemailer)

| Key | Required | Notes |
|---|---|---|
| `EMAIL_SERVER` | when enabling email | SMTP URL, e.g. `smtp://user:pass@smtp.example.com:587` |
| `EMAIL_FROM` | when enabling email | e.g. `"olnk.tr <merhaba@olnk.tr>"` |

If both are present, `emailEnabled = true` and the magic-link form is offered. Magic links expire after 10 minutes (`maxAge: 10 * 60`).

### 1.4 Database

| Key | Required | Notes |
|---|---|---|
| `DATABASE_URL` | everywhere | PostgreSQL connection string (use `postgres://` or `postgresql://`). In dev defaults to `postgresql://postgres:postgres@localhost:5432/olnk_dev`. |

### 1.5 Application URL

| Key | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | yes | Canonical origin, used by `metadataBase`, sitemap, robots, webhooks, email links. |

### 1.6 Trusted IP / Geo

| Key | Required | Default | Allowed values |
|---|---|---|---|
| `TRUSTED_IP_HEADER` | no | `none` | `none`, `cf-connecting-ip`, `x-vercel-forwarded-for`, `x-forwarded-for`, `x-real-ip` |

`none` means no client IP is trusted and no country is recorded in analytics. Pick the value matching your hosting provider.

### 1.7 Stripe

| Key | Required | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | when enabling Stripe | `sk_test_...` / `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | when enabling Stripe | Webhook signing secret from the Stripe dashboard |

### 1.8 iyzico

| Key | Required | Notes |
|---|---|---|
| `IYZICO_API_KEY` | when enabling iyzico | |
| `IYZICO_SECRET_KEY` | when enabling iyzico | |
| `IYZICO_MERCHANT_ID` | when enabling iyzico | |
| `IYZICO_BASE_URL` | when enabling iyzico | `https://api.iyzipay.com` (live) or `https://sandbox-api.iyzipay.com` |
| `IYZICO_MONTHLY_PLAN_CODE` | when enabling iyzico | Subscription plan code from the dashboard |
| `IYZICO_YEARLY_PLAN_CODE` | when enabling iyzico | Subscription plan code from the dashboard |

### 1.9 PayTR

| Key | Required | Notes |
|---|---|---|
| `PAYTR_MERCHANT_ID` | when enabling PayTR | |
| `PAYTR_MERCHANT_KEY` | when enabling PayTR | |
| `PAYTR_MERCHANT_SALT` | when enabling PayTR | |
| `PAYTR_TEST_MODE` | when enabling PayTR | `"0"` or `"1"`; live mode also requires `PAYTR_LIVE_MODE_ACKNOWLEDGED=true` |
| `PAYTR_LIVE_MODE_ACKNOWLEDGED` | when enabling PayTR live | `"true"` opt-in to live transactions |

PayTR is manual-renewal: there is no stored card, no `cancelSubscription` API call; the user must renew each term.

### 1.10 Localised pricing (used only by iyzico / PayTR)

| Key | Required | Default | Notes |
|---|---|---|---|
| `LOCAL_PRO_MONTHLY_TRY` | when enabling iyzico/PayTR | `12900` | Price in kuruş (₺129.00) |
| `LOCAL_PRO_YEARLY_TRY` | when enabling iyzico/PayTR | `94900` | Price in kuruş (₺949.00) |

### 1.11 Adyen

| Key | Required | Notes |
|---|---|---|
| `ADYEN_API_KEY` | when enabling Adyen | |
| `ADYEN_MERCHANT_ACCOUNT` | when enabling Adyen | |
| `ADYEN_HMAC_KEY` | when enabling Adyen | Webhook HMAC key |
| `ADYEN_API_URL` | when enabling Adyen | `https://checkout-test.adyen.com/v71` (test) or production |
| `ADYEN_RECURRING_URL` | when enabling Adyen | Typically the same as `ADYEN_API_URL` |
| `NEXT_PUBLIC_ADYEN_CLIENT_KEY` | when enabling Adyen (client) | Public client key for the Drop-in |
| `ADYEN_ENVIRONMENT` | when enabling Adyen (client) | `test` or `live` |

### 1.12 Cron / maintenance

| Key | Required | Notes |
|---|---|---|
| `CRON_SECRET` | in production | String ≥ 24 chars; sent as `Authorization: Bearer <CRON_SECRET>` to `/api/billing/renew` and `/api/maintenance` |

### 1.13 Storage (S3-compatible)

| Key | Required | Notes |
|---|---|---|
| `STORAGE_ENDPOINT` | when allowing uploads | e.g. `https://<accountid>.r2.cloudflarestorage.com` |
| `STORAGE_REGION` | optional | defaults to `"auto"` (R2/Backblaze friendly) |
| `STORAGE_BUCKET` | when allowing uploads | |
| `STORAGE_ACCESS_KEY_ID` | when allowing uploads | |
| `STORAGE_SECRET_ACCESS_KEY` | when allowing uploads | |
| `STORAGE_PUBLIC_URL` | when allowing uploads | CDN/origin used to compose the `publicUrl` stored on `UploadedAsset` |

If any of the required five is missing, `getStorageConfig()` returns `null` and the asset upload UI prompts the user to paste an HTTPS URL instead.

### 1.14 Build-time escape

| Key | Notes |
|---|---|
| `SKIP_ENV_VALIDATION=1` | Bypasses `src/env.js` validation (e.g. inside Docker build stages that don't have secrets) |

---

## 2. Optional / Reserved

There are no reserved env vars beyond the above. The T3-env schema throws at build/dev time if a required production key is missing.

---

## 3. Variable Behaviour Map

| Concern | Variables |
|---|---|
| Database | `DATABASE_URL` |
| Auth core | `AUTH_SECRET` |
| Google OAuth | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Magic links | `EMAIL_SERVER`, `EMAIL_FROM` |
| Public origin | `NEXT_PUBLIC_APP_URL` |
| Geo / rate limits | `TRUSTED_IP_HEADER` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| iyzico | `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_MERCHANT_ID`, `IYZICO_BASE_URL`, `IYZICO_MONTHLY_PLAN_CODE`, `IYZICO_YEARLY_PLAN_CODE`, `LOCAL_PRO_MONTHLY_TRY`, `LOCAL_PRO_YEARLY_TRY` |
| PayTR | `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT`, `PAYTR_TEST_MODE`, `PAYTR_LIVE_MODE_ACKNOWLEDGED` |
| Adyen | `ADYEN_API_KEY`, `ADYEN_MERCHANT_ACCOUNT`, `ADYEN_HMAC_KEY`, `ADYEN_API_URL`, `ADYEN_RECURRING_URL`, `NEXT_PUBLIC_ADYEN_CLIENT_KEY`, `ADYEN_ENVIRONMENT` |
| Cron | `CRON_SECRET` |
| Storage | `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY_ID`, `STORAGE_SECRET_ACCESS_KEY`, `STORAGE_PUBLIC_URL` |

---

## 4. Modes

### 4.1 Local / Dev

- `AUTH_SECRET` is **optional** (a dev fallback is logged if missing).
- `DATABASE_URL` defaults to `postgresql://postgres:postgres@localhost:5432/olnk_dev` if unset (but `src/env.js` still requires it to be parseable).
- `TRUSTED_IP_HEADER` is typically `none` — no country recorded.
- `NEXT_PUBLIC_APP_URL` is typically `http://localhost:3000`.
- Storage and payment provider keys are typically absent — the UI gracefully falls back.
- Prisma logging: `["query", "error", "warn"]`.

### 4.2 CI (`.github/workflows/ci.yml`)

- `AUTH_SECRET`: ≥ 32 char secret set in the workflow env.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3100`.
- `CRON_SECRET`: per-workflow secret.
- `TRUSTED_IP_HEADER`: `none`.
- `RUN_DATABASE_E2E=1`: enables the Playwright DB-backed tests (`tests/e2e/public-accessibility.spec.ts`).
- Postgres service: `postgres:17` on port 5432 with health check.

### 4.3 Production

- All required production keys present and rotated through a secret manager.
- `AUTH_SECRET` ≥ 32 chars.
- `CRON_SECRET` ≥ 24 chars.
- `TRUSTED_IP_HEADER` set to match the platform (`cf-connecting-ip`, `x-vercel-forwarded-for`, etc.) so analytics get a country.
- Prisma logging: `["error"]`.
- CSP upgrades to `upgrade-insecure-requests` (see `next.config.js`).
- Custom domains enabled by setting `STORAGE_*` and at least one billing provider.
- Webhook endpoints (`/api/webhooks/[provider]`) require HTTPS in the provider dashboards.

---

## 5. Validation

`src/env.js` defines a T3-env schema:

- `server` keys are read on the server only and validated at boot.
- `client` keys must be prefixed `NEXT_PUBLIC_*`.
- Unknown keys throw at process start.
- A malformed `DATABASE_URL` is rejected at startup, including in dev.
- `SKIP_ENV_VALIDATION=1` disables validation (used by Docker).

If you add a new env var:

1. Add it to `.env.example` (dummy values only).
2. Add it to the `server` or `client` object in `src/env.js` with the appropriate validator.
3. Add an entry above and run `pnpm check`.

---

## 6. Secrets Policy

- `.env*` (other than `.env.example`) are gitignored.
- Real secrets live in Vercel/GitHub Actions/Docker secret managers; never in code or commit history.
- `.npmrc` has `public-hoist-pattern[]=*eslint*` and `*prettier*` so dev tools work under pnpm's strict isolation.
- If a secret leaks, rotate immediately and follow `SECURITY.md`.