# Testing

| Level       | Location                 | Command                                         | Needs                            |
| ----------- | ------------------------ | ----------------------------------------------- | -------------------------------- |
| Unit        | `**/src/**/*.test.ts`    | `pnpm test:unit`                                | nothing                          |
| Integration | `**/*.int.test.ts`       | `pnpm db:test:prepare && pnpm test:integration` | `pnpm infra:up`                  |
| End-to-end  | `apps/web/e2e/*.spec.ts` | `pnpm test:e2e`                                 | running web + worker (see below) |

## Isolation

Integration tests load the root `.env`, then force `DATABASE_URL=TEST_DATABASE_URL` (must end in
`_test`, otherwise they refuse to run), Redis DB 15 and a test key prefix. Each test creates its
own users/profiles with unique suffixes; suites run serially per package.

## Coverage of critical paths (current suites)

- Auth (Better Auth via real HTTP handler): registration, hashed passwords, verification email,
  login/logout, wrong password, unverified login, CSRF origin check, session fixation, suspension,
  password reset without enumeration, registration toggle, per-IP brute-force limiting.
- Profiles/links/blocks: creation, username rules + uniqueness, quota under concurrency,
  publication/visibility, CRUD, ordering, schedules, entitlement limits, registry validation.
- Organizations: roles, seat limits, invitation binding, last-owner protection, tenant isolation.
- Billing: plans, entitlement resolution, state transitions, duplicate webhooks, payment failure
  - grace, out-of-order events, underpayment, inline processing when Redis is down, lifecycle,
    provider signature verification (dev, Stripe, PayTR).
- Analytics: validation, bot/opt-out filtering, dedupe, queue processing, aggregation,
  idempotency, rollups, retention, summaries.
- Security: IDOR, cross-tenant access, API key scopes/revocation/suspension, admin roles,
  audit sanitization, API rate limits, CSP/headers.
- Worker: real BullMQ processing of billing, analytics, email (Mailpit) and maintenance jobs.

## End-to-end tests

Run against a production build with `TRUST_PROXY=true` (each test gets its own client IP):

```bash
pnpm build
TRUST_PROXY=true APP_ENV=development pnpm --filter @olnktr/web start &
pnpm --filter @olnktr/worker start &          # after `pnpm --filter @olnktr/worker build`
pnpm --filter @olnktr/web exec playwright install --with-deps chromium
pnpm test:e2e
```

Or against the containers: `TRUST_PROXY=true docker compose --profile app up -d --build`, then run
Playwright from the official image (no host browser dependencies needed):

```bash
docker run --rm --network host --ipc host -v "$PWD":/work -w /work/apps/web \
  mcr.microsoft.com/playwright:v1.65.0-noble npx playwright test
```
