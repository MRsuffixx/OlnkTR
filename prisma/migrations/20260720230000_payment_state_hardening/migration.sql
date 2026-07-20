ALTER TYPE "PaymentIntentStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';

ALTER TABLE "Subscription"
ADD COLUMN "providerStartedAt" TIMESTAMP(3),
ADD COLUMN "lastProviderEventAt" TIMESTAMP(3);

UPDATE "Subscription"
SET
  "providerStartedAt" = "createdAt",
  "lastProviderEventAt" = "updatedAt";

-- Legacy rows without a bounded entitlement must never grant indefinite Pro access.
UPDATE "Subscription"
SET "status" = 'INCOMPLETE'
WHERE "plan" = 'PRO'
  AND "status" IN ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED')
  AND "currentPeriodEnd" IS NULL;

UPDATE "Subscription"
SET "status" = 'EXPIRED'
WHERE "plan" = 'PRO'
  AND "status" IN ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED')
  AND "currentPeriodEnd" <= CURRENT_TIMESTAMP;

ALTER TABLE "PaymentIntent"
ADD COLUMN "checkoutPresentation" JSONB,
ADD COLUMN "activeCheckoutKey" VARCHAR(191),
ADD COLUMN "reconciliationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastReconciledAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "PaymentIntent_activeCheckoutKey_key"
ON "PaymentIntent"("activeCheckoutKey");
