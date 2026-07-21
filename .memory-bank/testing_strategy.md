# `.memory-bank/testing_strategy.md` — How tests are organised

> Tests must run fast locally and lock behaviour that future refactors will break.
> Unit: Vitest (`src/**/*.test.ts`).
> E2E: Playwright (`tests/e2e/*.spec.ts`, port 3100).
> Accessibility: `@axe-core/playwright`.

---

## 1. Where tests live

```
src/**/*.test.ts              # Vitest unit tests, colocated with source
tests/e2e/*.spec.ts           # Playwright end-to-end tests
tests/stubs/server-only.ts    # empty `export {}` aliased in vitest.config.ts
```

Colocation keeps tests close to the module they exercise and easy to discover. Naming follows the suffix convention enforced by Vitest's `include` glob.

---

## 2. Vitest configuration (`vitest.config.ts`)

- `test.environment: "node"` (no JSDOM; we test pure logic, server-only modules are stubbed).
- `globals: false` — every test file uses `import { describe, it, expect } from "vitest"`.
- Aliases mirror `tsconfig.json`:
  - `~` → `./src`
  - `server-only` → `./tests/stubs/server-only.ts` (so RSC modules can be unit-tested).
- `DATABASE_URL` defaults to a dummy Postgres URL when running unit tests.
- `restoreMocks: true`, `clearMocks: true`.

---

## 3. Existing unit tests

| File | Tests | What it locks |
|---|---|---|
| `src/lib/profile-rendering.test.ts` | 3 | `outline` button preserves color/border/transparent background; every offered font maps to `var(--font-…)`; Spotify and YouTube URL transformations. |
| `src/lib/schemas.test.ts` | 2 | Duplicate link ids rejected; 50 links accepted, 51st rejected. |
| `src/server/entitlements.test.ts` | 3 (parameterised) | `hasProAccess` requires future `currentPeriodEnd`; closed for `INCOMPLETE/UNPAID/EXPIRED/REFUNDED`; `resolveAppearanceForPlan(stored, false)` deterministically locks Pro paths. |
| `src/server/payments/adapters/providers.test.ts` | 4 | `mapStripeSubscriptionStatus` always returns non-Pro for unknown; declined Adyen authorisation becomes `payment_failed`/`UNPAID`; iyzico v3 signature fixture; PayTR callback hash fixture. |
| `src/server/security/custom-css.test.ts` | 3 | Safe selectors scoped to `[data-olnk-profile]`; CSS-escape obfuscation rejected; global selectors and `url(...)` stripped. |

Run: `pnpm test` (alias for `pnpm test:unit`).

---

## 4. Playwright configuration (`playwright.config.ts`)

- `testDir: ./tests/e2e`.
- `fullyParallel: true`; `retries: process.env.CI ? 2 : 0`.
- `reporter: process.env.CI ? "github" : "list"`.
- `use.baseURL: http://localhost:3100`.
- `use.trace: "on-first-retry"`.
- Projects: `chromium` (Desktop Chrome) and `mobile-chromium` (Pixel 7).
- `webServer`:
  - `command: "pnpm start --port 3100"` (production build, not dev).
  - `url: http://localhost:3100/`, `reuseExistingServer: false`, `timeout: 180_000`.

Run: `RUN_DATABASE_E2E=1 pnpm test:e2e`. Without the env flag, DB-backed tests are skipped.

---

## 5. Existing e2e tests

`tests/e2e/public-accessibility.spec.ts` covers:
- `/`, `/login`, `/register`: axe-core scan for `wcag2a/2aa/21aa` with no serious/critical violations.
- `/dashboard/billing?checkout=return&intent=untrusted`: unauthenticated visitor is redirected to `/login`.
- `/this-profile-does-not-exist-404`: `404` response and the `"Bu adres henüz kimsenin değil."` copy. **Gated by `RUN_DATABASE_E2E=1`**; CI sets this flag.

---

## 6. How to add a unit test

1. Pick the module under test (e.g. `src/lib/foo.ts`).
2. Create `src/lib/foo.test.ts` next to it.
3. Import with `import { describe, it, expect, vi } from "vitest"`.
4. Avoid mocking the Prisma client directly — test pure functions and adapters that don't need it. If a router test is needed, mock `src/server/db.ts` with `vi.mock("~/server/db", () => ({ db: <mock> }))`.
5. Cover:
   - Happy path,
   - One negative case,
   - Edge case (boundary / empty / max).
6. Run `pnpm test --watch src/lib/foo.test.ts` locally.

---

## 7. How to add an e2e test

1. Build once (`pnpm build`) so `pnpm start --port 3100` works.
2. Create `tests/e2e/<feature>.spec.ts` with `import { test, expect } from "@playwright/test"`.
3. If the test needs a User/Subscription fixture, gate it behind `RUN_DATABASE_E2E`:
   ```ts
   test.skip(!process.env.RUN_DATABASE_E2E, "requires database")
   ```
4. For accessibility assertions, use `import AxeBuilder from "@axe-core/playwright"`:
   ```ts
   const results = await new AxeBuilder({ page }).analyze()
   expect(results.violations.filter(v =>
     v.impact === "serious" || v.impact === "critical")).toEqual([])
   ```
5. Run:
   ```bash
   RUN_DATABASE_E2E=1 pnpm test:e2e -- --grep "<your test name>"
   ```

---

## 8. Mock data patterns

| Need | Approach |
|---|---|
| Appearance document | Use `parseAppearance({ ... DEFAULT_APPEARANCE, buttons: { ... } })` from `src/lib/appearance.ts`. |
| Pricing facts | Use `CANONICAL_USD_PRICES` from `src/server/payments/pricing.ts`. |
| HMAC fixtures | The adapters export helpers (`mapStripeSubscriptionStatus`, `normalizeAdyenNotification`, `createIyzicoWebhookSignature`, `createPaytrCallbackHash`); use them to construct snapshots. |
| Now / dates | Use `new Date("2026-07-21T13:00:00Z")` and adjust arithmetic in the test. Never rely on a "real" clock. |
| URL helpers | The `src/lib/profile-rendering.ts` `profileEmbedUrl` returns `null` for unsanctioned URLs — assert against the known happy cases (`youtube.com/watch?v=…`, `youtu.be/…`, `open.spotify.com/track/…`). |

---

## 9. Test recipes

### 9.1 Locking a Zod schema

```ts
import { workspaceInput } from "~/lib/schemas"

it("rejects more than 50 links", () => {
  const links = Array.from({ length: 51 }, (_, i) => ({
    id: crypto.randomUUID(), title: `t${i}`, url: "https://example.com",
    iconUrl: null, enabled: true, customization: {},
    scheduledStart: null, scheduledEnd: null, passwordProtected: false,
    embedType: "LINK",
  }))
  const res = workspaceInput.safeParse({
    revision: 0, name: "X", bio: "", image: null,
    theme: {}, appearance: {}, customCss: "", links,
  })
  expect(res.success).toBe(false)
})
```

### 9.2 Locking an adapter fixture

```ts
import { createIyzicoWebhookSignature } from "~/server/payments/adapters/iyzico"

it("matches the iyzico v3 signature fixture", () => {
  expect(createIyzicoWebhookSignature({
    apiKey: "key", secretKey: "secret", merchantId: "m",
    eventType: "subscription.cancelled",
    subscriptionRef: "sub", orderRef: "ord", customerRef: "cus",
  })).toMatchSnapshot()
})
```

### 9.3 Locking CSS sanitisation

```ts
import { sanitizeCustomCss } from "~/server/security/custom-css"

it("rejects global selectors", () => {
  const css = `body { background: red; }`
  expect(() => sanitizeCustomCss(css)).toThrow()
})
```

---

## 10. CI gates (`pnpm check && pnpm test && pnpm audit --prod --audit-level high && pnpm build && RUN_DATABASE_E2E=1 pnpm test:e2e`)

The CI matrix rejects any of the following:
- ESLint or tsc warning (`--max-warnings=0`),
- Vitest unit failure,
- Production npm-advisory at high severity or above,
- Next.js build failure,
- Playwright e2e failure (including the DB-backed slice when `RUN_DATABASE_E2E=1`).

---

## 11. Conventions

- **Type-only imports** in tests too: `import type { Mock } from "vitest"`.
- **No `any`** in tests.
- **`expect.assertions(n)`** is helpful when a branch could silently skip an assertion.
- **No `setTimeout`-based sleeps** — use `vi.useFakeTimers()` or `vi.advanceTimersByTime()` instead.
- **`vi.mock("@/server/db", …)`** must use the exact alias `~/server/db`.
- **Always reset mocks** between tests (the config does this automatically, but be aware).
- **Snapshot files** belong in `__snapshots__/` colocated with the test; do not commit accidentally generated snapshots from interactive runs.
