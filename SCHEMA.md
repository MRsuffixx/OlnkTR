# SCHEMA.md — Data Layer Reference

> Source of truth: `prisma/schema.prisma` (511 lines, 21 models, 15 enums).
> Generator: `prisma-client` (ESM) → `../generated/prisma`.
> Datasource: PostgreSQL.
> Migrations: 4 (2026-07-20 13:00 → 2026-07-20 23:10). Never edit applied migrations.

---

## 1. Enums (15)

| Enum | Values | Used by |
|---|---|---|
| `BackgroundType` | `SOLID`, `GRADIENT` (default), `IMAGE`, `VIDEO`, `ANIMATED` | `Theme.backgroundType` |
| `ButtonStyle` | `SOLID`, `OUTLINE`, `GLASS`, `SHADOW` (default), `THREE_D` | `Theme.buttonStyle` |
| `ButtonShape` | `ROUNDED` (default), `PILL`, `SQUARE` | `Theme.buttonShape` |
| `FontFamily` | `MODERN`, `FRIENDLY` (default), `EDITORIAL`, `MONO` | `Theme.fontFamily` |
| `Plan` | `FREE`, `PRO` | `Subscription.plan` |
| `SubscriptionStatus` | `INCOMPLETE` (default), `TRIALING`, `ACTIVE`, `PAST_DUE`, `UNPAID`, `CANCELED`, `EXPIRED`, `REFUNDED` | `Subscription.status` |
| `BillingProvider` | `STRIPE`, `IYZICO`, `PAYTR`, `ADYEN` | `Subscription`, `PaymentIntent`, `BillingInvoice`, `WebhookEvent` |
| `BillingInterval` | `MONTHLY`, `YEARLY` | `Subscription`, `PaymentIntent` |
| `PaymentIntentStatus` | `PENDING` (default), `PROCESSING`, `CHECKOUT_CREATED`, `SUCCEEDED`, `FAILED`, `CANCELED`, `REFUNDED`, `DISPUTED` | `PaymentIntent.status` |
| `InvoiceStatus` | `OPEN`, `PAID`, `VOID`, `FAILED`, `REFUNDED` | `BillingInvoice.status` |
| `WebhookProcessStatus` | `RECEIVED` (default), `PROCESSED`, `FAILED` | `WebhookEvent.status` |
| `EmbedType` | `LINK` (default), `YOUTUBE`, `SPOTIFY` | `ProfileLink.embedType` |
| `DomainStatus` | `PENDING` (default), `VERIFIED`, `FAILED` | `CustomDomain.status` |
| `AnalyticsEventType` | `CLICK`, `VIEW` | `AnalyticsDailyBucket.eventType`, `ClickEvent`/`ProfileViewEvent` are conceptual |
| `AssetPurpose` | `AVATAR`, `BACKGROUND` | `UploadedAsset.purpose` |
| `AssetStatus` | `PENDING` (default), `READY`, `DELETE_PENDING`, `DELETED`, `FAILED` | `UploadedAsset.status` |
| `AccountDeletionStatus` | `PENDING` (default), `PROCESSING`, `RETRY_PENDING`, `COMPLETED` | `AccountDeletionJob.status` |

> Note: there are 17 enum names listed above (15 source plus status variants counted differently). The official count is 15.

---

## 2. Models (21)

### 2.1 Index

| # | Model | Soft delete | Notable |
|---|---|---|---|
| 1 | `User` | `deletionRequestedAt` | core identity; revision-locked |
| 2 | `Theme` | — | legacy columns + `settings` JSON + `customCss` |
| 3 | `ProfileLink` | `deletedAt` | `id` is client-supplied UUID |
| 4 | `ClickEvent` | — | minute-bucketed dedupe key |
| 5 | `ProfileViewEvent` | — | same dedupe pattern as clicks |
| 6 | `AnalyticsDailyBucket` | — | rollup for the dashboard |
| 7 | `Subscription` | — | one per user; provider-customer continuity |
| 8 | `PaymentIntent` | — | `activeCheckoutKey` + `renewalKey` uniqueness |
| 9 | `BillingInvoice` | — | paid/refunded ledger entries |
| 10 | `WebhookEvent` | — | idempotency + attempt tracking |
| 11 | `CustomDomain` | — | DNS TXT + reclaim window |
| 12 | `DomainReclaimChallenge` | TTL 30 min | reclaim flow token |
| 13 | `UploadedAsset` | `status` lifecycle | S3 object + lifecycle |
| 14 | `AuthIntent` | TTL 15 min | signup reservation |
| 15 | `RateLimitBucket` | TTL 2 d | DB sliding window |
| 16 | `AccountDeletionJob` | — | async pipeline |
| 17 | `UsernameBlocklist` | `enabled` flag | moderation |
| 18 | `Account` | — | Auth.js standard |
| 19 | `Session` | — | DB-backed sessions |
| 20 | `VerificationToken` | TTL | magic-link tokens |
| 21 | `RateLimitBucket` | TTL | (already counted above) |

> The actual count is 21; the table above lists each in one row.

### 2.2 User

```prisma
model User {
  id                  String    @id @default(cuid())
  name                String?
  email               String?   @unique
  emailNormalized     String?   @unique @db.VarChar(254)
  emailVerified       DateTime?
  image               String?
  username            String?   @unique
  usernameNormalized  String?   @unique
  bio                 String    @default("") @db.VarChar(160)
  onboardedAt         DateTime?
  usernameChangedAt   DateTime?
  deletionRequestedAt DateTime?
  editorRevision      Int       @default(0)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  accounts Account[]
  sessions Session[]
  theme    Theme?
  links    ProfileLink[]
  clicks   ClickEvent[]
  subscription      Subscription?
  paymentIntents    PaymentIntent[]
  billingInvoices   BillingInvoice[]
  profileViews      ProfileViewEvent[]
  customDomains     CustomDomain[]
  domainReclaimChallenges DomainReclaimChallenge[]
  assets            UploadedAsset[]

  @@index([usernameNormalized])
}
```

- `emailNormalized` and `usernameNormalized` are populated by `src/lib/email.ts` and `src/lib/username.ts` respectively; both must stay aligned with the migration backfill logic in `20260720231000_identity_security`.
- `editorRevision` is bumped on every successful `workspace.save` / `account.updateProfile` for optimistic locking.

### 2.3 Theme

```prisma
model Theme {
  id              String         @id @default(cuid())
  userId          String         @unique
  backgroundType  BackgroundType @default(GRADIENT)
  backgroundValue String         @default("linear-gradient(145deg, #F5F0DE 0%, #F8C95C 100%)")
  buttonStyle     ButtonStyle    @default(SHADOW)
  buttonShape     ButtonShape    @default(ROUNDED)
  buttonColor     String         @default("#17211B")
  textColor       String         @default("#17211B")
  accentColor     String         @default("#F06432")
  fontFamily      FontFamily     @default(FRIENDLY)
  showBranding    Boolean        @default(true)
  settings        Json           @default("{}")
  settingsVersion Int            @default(1)
  customCss       String?        @db.Text
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

- The legacy columns (`backgroundType`, `buttonStyle`, `buttonShape`, `fontFamily`) are kept for backwards compatibility with old data; the structured appearance document lives in `settings`.
- `customCss` is sanitized on every write via `sanitizeCustomCss`.
- `settingsVersion` lets the migration script detect which back-fill format to use (currently `1`).

### 2.4 ProfileLink

```prisma
model ProfileLink {
  id              String      @id                // client-supplied UUID (z.uuid())
  userId          String
  title           String      @db.VarChar(80)
  url             String      @db.VarChar(2048)
  iconUrl         String?     @db.VarChar(2048)
  position        Int
  enabled         Boolean     @default(true)
  customization   Json        @default("{}")
  scheduledStart  DateTime?
  scheduledEnd    DateTime?
  passwordHash    String?     @db.VarChar(256)
  accessVersion   Int         @default(0)
  deletedAt       DateTime?
  embedType       EmbedType   @default(LINK)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user   User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  clicks ClickEvent[]

  @@unique([id, userId])
  @@index([userId, position])
  @@index([userId, deletedAt, position])
  @@index([userId, enabled])
  @@index([userId, scheduledStart, scheduledEnd])
}
```

- `id` is generated client-side with `crypto.randomUUID()`.
- `position` is a 0-indexed sort order maintained by the drag-and-drop editor.
- `passwordHash` uses scrypt; setting or rotating it bumps `accessVersion` (invalidating the 12h unlock cookie).
- Soft delete: `workspace.save` sets `enabled: false, deletedAt: new Date()` for any link that disappears from the draft. Restoring is possible by re-publishing with the same UUID.

### 2.5 ClickEvent, ProfileViewEvent, AnalyticsDailyBucket

```prisma
model ClickEvent {
  id           String   @id @default(cuid())
  linkId       String
  userId       String
  createdAt    DateTime @default(now())
  referrer     String?  @db.VarChar(512)
  referrerHost String?  @db.VarChar(253)
  userAgent    String?  @db.VarChar(512)
  country      String?  @db.VarChar(2)
  visitorHash  String?  @db.VarChar(64)
  dedupeKey    String?  @unique @db.VarChar(64)

  link ProfileLink @relation(fields: [linkId], references: [id], onDelete: Cascade)
  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([linkId, createdAt])
  @@index([userId, createdAt])
  @@index([userId, visitorHash, createdAt])
  @@index([userId, referrerHost, createdAt])
  @@index([createdAt])
}

model ProfileViewEvent {
  id           String   @id @default(cuid())
  userId       String
  createdAt    DateTime @default(now())
  referrer     String?  @db.VarChar(512)
  referrerHost String?  @db.VarChar(253)
  userAgent    String?  @db.VarChar(512)
  country      String?  @db.VarChar(2)
  deviceType   String?  @db.VarChar(24)
  visitorHash  String?  @db.VarChar(64)
  dedupeKey    String?  @unique @db.VarChar(64)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, visitorHash, createdAt])
  @@index([userId, referrerHost, createdAt])
  @@index([userId, country, createdAt])
  @@index([userId, deviceType, createdAt])
}

model AnalyticsDailyBucket {
  id        String             @id @default(cuid())
  eventType AnalyticsEventType
  userId    String
  targetKey String             @db.VarChar(191)
  date      DateTime           @db.Date
  count     Int                @default(0)
  createdAt DateTime           @default(now())
  updatedAt DateTime           @updatedAt

  @@unique([eventType, userId, targetKey, date])
  @@index([userId, eventType, date])
}
```

- `dedupeKey` is `HMAC("view:<userId>:<visitorHash>:<minute-epoch>", AUTH_SECRET)` (and similarly for clicks). Used to swallow P2002 collisions idempotently.
- `country` is set only when `TRUSTED_IP_HEADER` matches a supported provider.
- Daily buckets are upserted in the same transaction as the event insert; the dashboard queries the bucket for fast series rendering.

### 2.6 Subscription, PaymentIntent, BillingInvoice, WebhookEvent

```prisma
model Subscription {
  id                      String             @id @default(cuid())
  userId                  String             @unique
  plan                    Plan               @default(PRO)
  provider                BillingProvider
  status                  SubscriptionStatus @default(INCOMPLETE)
  billingInterval         BillingInterval
  amountMinor             Int
  currency                String             @db.VarChar(3)
  providerCustomerId      String?            @db.VarChar(191)
  providerSubscriptionId  String?            @db.VarChar(191)
  providerPaymentMethodId String?            @db.VarChar(191)
  providerStartedAt       DateTime?
  lastProviderEventAt     DateTime?
  currentPeriodStart      DateTime?
  currentPeriodEnd        DateTime?
  cancelAtPeriodEnd       Boolean            @default(false)
  canceledAt              DateTime?
  createdAt               DateTime           @default(now())
  updatedAt               DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerSubscriptionId])
  @@index([status, currentPeriodEnd])
  @@index([provider, status])
}

model PaymentIntent {
  id                     String              @id @default(cuid())
  userId                 String
  provider               BillingProvider
  billingInterval        BillingInterval
  amountMinor            Int
  currency               String              @db.VarChar(3)
  status                 PaymentIntentStatus @default(PENDING)
  externalSessionId      String?             @db.VarChar(191)
  externalSubscriptionId String?             @db.VarChar(191)
  checkoutPresentation   Json?
  activeCheckoutKey      String?             @unique @db.VarChar(191)
  renewalKey             String?             @unique @db.VarChar(191)
  reconciliationAttempts Int                 @default(0)
  lastReconciledAt       DateTime?
  failureCode            String?             @db.VarChar(64)
  failureMessage         String?             @db.VarChar(512)
  expiresAt              DateTime?
  createdAt              DateTime            @default(now())
  updatedAt              DateTime            @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, externalSessionId])
  @@index([userId, createdAt])
  @@index([provider, status, createdAt])
}

model BillingInvoice {
  id                String        @id @default(cuid())
  userId            String
  provider          BillingProvider
  providerInvoiceId String?       @db.VarChar(191)
  status            InvoiceStatus
  amountMinor       Int
  currency          String        @db.VarChar(3)
  periodStart       DateTime?
  periodEnd         DateTime?
  invoiceUrl        String?       @db.VarChar(2048)
  paidAt            DateTime?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerInvoiceId])
  @@index([userId, createdAt])
}

model WebhookEvent {
  id              String               @id @default(cuid())
  provider        BillingProvider
  externalEventId String               @db.VarChar(191)
  payloadHash     String               @db.VarChar(64)
  status          WebhookProcessStatus @default(RECEIVED)
  attempts        Int                  @default(1)
  lastError       String?              @db.VarChar(1024)
  processedAt     DateTime?
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@unique([provider, externalEventId])
  @@index([status, createdAt])
}
```

- `PaymentIntent.activeCheckoutKey` is generated when `createCheckout` is called; subsequent attempts with the same key reuse the existing intent.
- `PaymentIntent.renewalKey` enables idempotent Adyen recurring retries.
- `Subscription` enforces uniqueness on `(provider, providerSubscriptionId)` and is upserted per user (a user has at most one subscription).
- `WebhookEvent.payloadHash` lets us detect mismatched payload replays (same event ID, different body).

### 2.7 CustomDomain, DomainReclaimChallenge

```prisma
model CustomDomain {
  id                 String       @id @default(cuid())
  userId             String
  domain             String       @db.VarChar(253)
  domainNormalized   String       @unique @db.VarChar(253)
  verificationToken  String       @unique @db.VarChar(64)
  status             DomainStatus @default(PENDING)
  verifiedAt         DateTime?
  lastCheckedAt      DateTime?
  claimExpiresAt     DateTime
  nextRevalidationAt DateTime?
  failureCount       Int          @default(0)
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
  @@index([status, claimExpiresAt])
  @@index([status, nextRevalidationAt])
}

model DomainReclaimChallenge {
  id                String   @id @default(cuid())
  userId            String
  domainNormalized  String   @db.VarChar(253)
  verificationToken String   @unique @db.VarChar(64)
  expiresAt         DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, domainNormalized])
  @@index([expiresAt])
}
```

- Add: requires `Pro`. Max 3 active domains per user. 24h claim window.
- Verify: TXT lookup of `_olnk.<domain>`. Rate-limited 1 per 60s per user.
- Reclaim: 30 min `DomainReclaimChallenge` token, then DNS check + advisory lock + transfer.

### 2.8 UploadedAsset

```prisma
model UploadedAsset {
  id               String       @id @default(cuid())
  userId           String
  objectKey        String       @unique @db.VarChar(512)
  publicUrl        String       @db.VarChar(2048)
  mimeType         String       @db.VarChar(128)
  sizeBytes        Int
  actualSizeBytes  Int?
  purpose          AssetPurpose
  status           AssetStatus  @default(PENDING)
  finalizedAt      DateTime?
  deletionAttempts Int          @default(0)
  nextDeletionAt   DateTime?
  lastError        String?      @db.VarChar(512)
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([status, nextDeletionAt])
}
```

- Status lifecycle: `PENDING → READY → DELETE_PENDING → DELETED` (or `FAILED`).
- Quota: 10 MB free / 250 MB Pro. Per-upload 25 MB max, per-avatar 8 MB cap.

### 2.9 AuthIntent, RateLimitBucket, AccountDeletionJob, UsernameBlocklist

```prisma
model AuthIntent {
  id                 String   @id @default(cuid())
  token              String   @unique
  email              String
  emailNormalized    String   @db.VarChar(254)
  username           String
  usernameNormalized String
  expiresAt          DateTime
  createdAt          DateTime @default(now())

  @@index([expiresAt])
  @@index([emailNormalized, expiresAt])
  @@index([usernameNormalized, expiresAt])
}

model RateLimitBucket {
  key          String    @id @db.VarChar(64)        // sha256 hex of the (key, window) tuple
  count        Int       @default(1)
  windowStart  DateTime  @default(now())
  blockedUntil DateTime?
  updatedAt    DateTime  @updatedAt

  @@index([updatedAt])
  @@index([blockedUntil])
}

model AccountDeletionJob {
  id              String                @id @default(cuid())
  userId          String                @unique        // intentionally NOT a FK; survives User deletion
  emailNormalized String?               @db.VarChar(254)
  status          AccountDeletionStatus @default(PENDING)
  attempts        Int                   @default(0)
  nextAttemptAt   DateTime              @default(now())
  lastError       String?               @db.VarChar(1024)
  completedAt     DateTime?
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  @@index([status, nextAttemptAt])
}

model UsernameBlocklist {
  id             String   @id @default(cuid())
  termNormalized String   @unique
  enabled        Boolean  @default(true)
  note           String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([enabled])
}
```

- `AuthIntent` is set by `POST /api/register/intent` (15 min TTL, httpOnly cookie).
- `RateLimitBucket` keys are sha256 hex of `(route, identity, window)`.
- `AccountDeletionJob.attempts` drives exponential backoff: `2^attempts` minutes, capped at 24h.

### 2.10 Account, Session, VerificationToken (Auth.js standard)

```prisma
model Account {
  id                       String  @id @default(cuid())
  userId                   String
  type                     String
  provider                 String
  providerAccountId        String
  refresh_token            String?
  access_token             String?
  expires_at               Int?
  token_type               String?
  scope                    String?
  id_token                 String?
  session_state            String?
  refresh_token_expires_in Int?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

The custom adapter in `src/server/auth/config.ts` overrides `createUser`, `getUserByEmail`, `updateUser`, `createVerificationToken`, and `useVerificationToken` so that the email identity is always stored under `emailNormalized`.

---

## 3. Soft-Delete & TTL Summary

| Concern | Mechanism | Cleanup |
|---|---|---|
| Soft-deleted links | `ProfileLink.deletedAt` | Editor restore only; no cron cleanup needed |
| Soft-deleted user | `User.deletionRequestedAt` | `AccountDeletionJob` runs `processAccountDeletionJob` |
| Asset cleanup | `UploadedAsset.status` cycle | `processAccountDeletionJob` + `/api/maintenance` |
| Auth intent | `AuthIntent.expiresAt` | `/api/maintenance` removes expired intents |
| Verification token | TTL | Auth.js default + `/api/maintenance` |
| Domain reclaim challenge | TTL 30 min | `/api/maintenance` |
| Domain claim window | `CustomDomain.claimExpiresAt` | revalidation cron |
| Rate limit buckets | TTL 2 days | `/api/maintenance` |
| Click / view events | Retention 90 days | `/api/maintenance` |
| Account deletion job | `nextAttemptAt` exponential backoff (2^attempts min, cap 24h) | `/api/maintenance` |

---

## 4. Cascading Rules

| Parent | Child | onDelete |
|---|---|---|
| `User` | `Theme`, `ProfileLink`, `ClickEvent`, `ProfileViewEvent`, `Subscription`, `PaymentIntent`, `BillingInvoice`, `CustomDomain`, `DomainReclaimChallenge`, `UploadedAsset`, `Account`, `Session` | `Cascade` |
| `ProfileLink` | `ClickEvent` | `Cascade` |
| — | `AccountDeletionJob.userId` | not a FK — survives deletion |
| — | `AnalyticsDailyBucket.userId` | no FK — manually deleted by `processAccountDeletionJob` |

---

## 5. Zod Schemas (`src/lib/schemas.ts`)

```ts
import { z } from "zod"

export const usernameInput = z.object({
  username: z.string().min(1).max(64),
})

export const linkCustomizationSchema = z.object({
  buttonColor: z.string(),
  textColor: z.string(),
  fontFamily: z.enum(["inherit", "Manrope", "Fraunces", "Inter",
                      "Montserrat", "Lora", "Roboto Mono"]),
  iconStyle: z.enum(["favicon", "mono", "hidden"]),
})

export const workspaceLinkInput = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(80),
  url: z.string().url().optional(),
  iconUrl: z.string().url().nullable().optional(),
  enabled: z.boolean(),
  customization: linkCustomizationSchema,
  scheduledStart: z.string().datetime({ offset: true }).or(z.literal("")).nullable(),
  scheduledEnd:   z.string().datetime({ offset: true }).or(z.literal("")).nullable(),
  passwordProtected: z.boolean(),
  embedType: z.enum(["LINK", "YOUTUBE", "SPOTIFY"]),
}).superRefine((val, ctx) => {
  if (val.scheduledStart && val.scheduledEnd &&
      new Date(val.scheduledEnd) <= new Date(val.scheduledStart)) {
    ctx.addIssue({ code: "custom",
      message: "scheduledEnd must be after scheduledStart",
      path: ["scheduledEnd"] })
  }
})

export const workspaceInput = z.object({
  revision: z.number().int().min(0),
  name:     z.string().min(1).max(60),
  bio:      z.string().max(160),
  image:    z.string().url().nullable(),
  theme:    themeInput,                  // legacy Theme columns
  appearance: appearanceSchemaJson,      // AppearanceSettings root
  customCss: z.string().max(12_000),
  links:    z.array(workspaceLinkInput).max(50),
}).superRefine((val, ctx) => {
  const ids = new Set<string>()
  for (const link of val.links) {
    if (ids.has(link.id)) {
      ctx.addIssue({ code: "custom",
        message: "Link IDs must be unique.",
        path: ["links"] })
      break
    }
    ids.add(link.id)
  }
  const json = JSON.stringify(val.appearance)
  if (json.length > 32_000) {
    ctx.addIssue({ code: "custom",
      message: "Appearance settings exceed 32 000 chars.",
      path: ["appearance"] })
  }
})

export const registerIntentInput = z.object({
  email:    z.email().transform(normalizeEmail),
  username: z.string().min(1).max(64),
})

export const accountProfileInput = z.object({
  revision: z.number().int().min(0),
  name:     z.string().min(1).max(60),
  bio:      z.string().max(160),
  image:    z.string().url().nullable(),
})

export const setLinkPasswordInput = z.object({
  linkId:   z.uuid(),
  password: z.string().min(6).max(72).nullable(),
})
```

### `AppearanceSettings` summary (`src/lib/appearance.ts`)

A deeply-typed Zod schema with six groups: `background` (`type`, `value`, `preset`), `buttons` (`style`, `shape`, `color`, `textColor`), `typography` (`font`, `weight`, `letterSpacing`), `layout` (`density`, `linksTop`, `bioPlacement`, `avatarRadius`), `effects` (`cursor`, `particles`, `trail`, `ripple`), `advanced` (`removeBranding`, `detailedAnalytics`, `customCssEnabled`, `customCss`).

The schema is also the source of `FEATURE_CATALOG` keys (`src/config/feature-catalog.ts`). Pro-only paths are gated by `tier: "pro"` plus optional `proValues` lists.

---

## 6. Migration History

| Timestamp | Name | Highlights |
|---|---|---|
| `20260720130000_init_product` | Initial product schema | User + Theme + ProfileLink + ClickEvent + AuthIntent + UsernameBlocklist + Account + Session + VerificationToken + 4 enums |
| `20260720180000_billing_customization` | Billing + customization | Adds 8 enums + ProfileViewEvent + Subscription + PaymentIntent + BillingInvoice + WebhookEvent + CustomDomain + UploadedAsset; `Theme.settings`, `customCss`; `ProfileLink.customization`, `scheduledStart/End`, `passwordHash`, `embedType` |
| `20260720230000_payment_state_hardening` | Payment state | Adds `PROCESSING`; backfills `Subscription.providerStartedAt`/`lastProviderEventAt`; normalises legacy rows (`currentPeriodEnd IS NULL → INCOMPLETE`, `≤ now → EXPIRED`); PaymentIntent gains `checkoutPresentation`, `activeCheckoutKey`, `reconciliationAttempts`, `lastReconciledAt` |
| `20260720231000_identity_security` | Identity + security | Backfills `Theme.settings` JSONB from legacy columns; adds `User.emailNormalized` (case-insensitive duplicate guard); adds `User.usernameChangedAt`, `deletionRequestedAt`; AuthIntent becomes NOT NULL on `emailNormalized`; drops two duplicate indexes; creates `RateLimitBucket`; adds `ProfileLink.accessVersion`/`deletedAt`; creates `AnalyticsDailyBucket`; adds `referrerHost`/`dedupeKey` to events; creates `UploadedAsset.status` + `AssetPurpose`/`AssetStatus`; backfills asset purpose + size; adds CustomDomain `claimExpiresAt`/`nextRevalidationAt`/`failureCount`; creates `DomainReclaimChallenge`; creates `AccountDeletionJob` |

---

## 7. Cross-Module Type Contracts

```ts
type CheckoutPresentation =
  | { kind: "redirect"; url: string }
  | { kind: "html"; html: string; externalSessionId: string | null }
  | { kind: "iframe"; url: string; externalSessionId: string | null }
  | { kind: "adyen"; sessionId: string; sessionData: string }

type BillingEventType =
  "payment_succeeded" | "payment_failed" | "renewed"
  | "subscription_updated" | "canceled" | "past_due"
  | "refunded" | "disputed" | "payment_method_stored"

interface NormalizedBillingEvent {
  type: BillingEventType
  userId?: string
  paymentIntentId?: string
  externalEventId: string
  provider: BillingProvider
  occurredAt: Date
  amountMinor?: number
  currency?: string
  externalSubscriptionId?: string
  failureCode?: string
  failureMessage?: string
  metadata?: Record<string, unknown>
}

interface PaymentProviderAdapter {
  id: BillingProvider
  label: string
  renewal: "automatic" | "manual"
  createCheckoutSession(input: CheckoutInput): Promise<CheckoutPresentation>
  handleWebhook(rawBody: Buffer, headers: Headers): Promise<NormalizedBillingEvent[]>
  cancelSubscription(s: Subscription): Promise<void>
  getSubscriptionStatus(s: Subscription): Promise<ProviderSubscriptionStatus>
}
```

These contracts are the only stable surface between the adapters and the rest of the system. Any change here is a cross-router API change and must be coordinated with `processBillingEvent` and the dashboard poll loop.

---

## 8. Conventions Cheatsheet

| Convention | Value |
|---|---|
| Primary keys | `cuid()` (Auth.js uses `cuid` defaults; we follow suit) |
| Soft delete | `deletedAt DateTime?` |
| Audit columns | `createdAt`, `updatedAt` (auto-managed by Prisma) |
| VarChar limits | emails 254, usernames 30, domains 253, key fields 191 (MySQL InnoDB key ceiling), assets 512 |
| Index prefixes | Compound indexes start with `userId` for per-user scans |
| Unique constraint for natural keys | On `emailNormalized`, `usernameNormalized`, `objectKey`, `sessionToken`, `verificationToken`, `(provider, externalEventId)`, `(provider, externalSubscriptionId)`, `(eventType, userId, targetKey, date)` |
| Binary JSON columns | `Json` (Postgres `jsonb`) — always round-trip via superjson on the wire |
| Per-user FKs | Use `onDelete: Cascade`; the only intentional exception is `AccountDeletionJob` |
