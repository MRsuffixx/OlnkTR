-- Extend the existing appearance primitives without rewriting stored themes.
ALTER TYPE "BackgroundType" ADD VALUE IF NOT EXISTS 'VIDEO';
ALTER TYPE "BackgroundType" ADD VALUE IF NOT EXISTS 'ANIMATED';
ALTER TYPE "ButtonStyle" ADD VALUE IF NOT EXISTS 'THREE_D';

CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'UNPAID', 'CANCELED', 'EXPIRED', 'REFUNDED');
CREATE TYPE "BillingProvider" AS ENUM ('STRIPE', 'IYZICO', 'PAYTR', 'ADYEN');
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE "PaymentIntentStatus" AS ENUM ('PENDING', 'CHECKOUT_CREATED', 'SUCCEEDED', 'FAILED', 'CANCELED', 'REFUNDED', 'DISPUTED');
CREATE TYPE "InvoiceStatus" AS ENUM ('OPEN', 'PAID', 'VOID', 'FAILED', 'REFUNDED');
CREATE TYPE "WebhookProcessStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');
CREATE TYPE "EmbedType" AS ENUM ('LINK', 'YOUTUBE', 'SPOTIFY');
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

ALTER TABLE "Theme" ADD COLUMN "settings" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Theme" ADD COLUMN "settingsVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Theme" ADD COLUMN "customCss" TEXT;

ALTER TABLE "ProfileLink" ADD COLUMN "customization" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "ProfileLink" ADD COLUMN "scheduledStart" TIMESTAMP(3);
ALTER TABLE "ProfileLink" ADD COLUMN "scheduledEnd" TIMESTAMP(3);
ALTER TABLE "ProfileLink" ADD COLUMN "passwordHash" VARCHAR(256);
ALTER TABLE "ProfileLink" ADD COLUMN "embedType" "EmbedType" NOT NULL DEFAULT 'LINK';

CREATE TABLE "ProfileViewEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "referrer" VARCHAR(512),
  "userAgent" VARCHAR(512),
  "country" VARCHAR(2),
  "deviceType" VARCHAR(24),
  "visitorHash" VARCHAR(64),
  CONSTRAINT "ProfileViewEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" "Plan" NOT NULL DEFAULT 'PRO',
  "provider" "BillingProvider" NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'INCOMPLETE',
  "billingInterval" "BillingInterval" NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "providerCustomerId" VARCHAR(191),
  "providerSubscriptionId" VARCHAR(191),
  "providerPaymentMethodId" VARCHAR(191),
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
  "canceledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PaymentIntent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL,
  "billingInterval" "BillingInterval" NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "status" "PaymentIntentStatus" NOT NULL DEFAULT 'PENDING',
  "externalSessionId" VARCHAR(191),
  "externalSubscriptionId" VARCHAR(191),
  "renewalKey" VARCHAR(191),
  "failureCode" VARCHAR(64),
  "failureMessage" VARCHAR(512),
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingInvoice" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL,
  "providerInvoiceId" VARCHAR(191),
  "status" "InvoiceStatus" NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "currency" VARCHAR(3) NOT NULL,
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "invoiceUrl" VARCHAR(2048),
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEvent" (
  "id" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL,
  "externalEventId" VARCHAR(191) NOT NULL,
  "payloadHash" VARCHAR(64) NOT NULL,
  "status" "WebhookProcessStatus" NOT NULL DEFAULT 'RECEIVED',
  "attempts" INTEGER NOT NULL DEFAULT 1,
  "lastError" VARCHAR(1024),
  "processedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomDomain" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "domain" VARCHAR(253) NOT NULL,
  "domainNormalized" VARCHAR(253) NOT NULL,
  "verificationToken" VARCHAR(64) NOT NULL,
  "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "lastCheckedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UploadedAsset" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "objectKey" VARCHAR(512) NOT NULL,
  "publicUrl" VARCHAR(2048) NOT NULL,
  "mimeType" VARCHAR(128) NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UploadedAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_provider_providerSubscriptionId_key" ON "Subscription"("provider", "providerSubscriptionId");
CREATE INDEX "Subscription_status_currentPeriodEnd_idx" ON "Subscription"("status", "currentPeriodEnd");
CREATE INDEX "Subscription_provider_status_idx" ON "Subscription"("provider", "status");
CREATE UNIQUE INDEX "PaymentIntent_provider_externalSessionId_key" ON "PaymentIntent"("provider", "externalSessionId");
CREATE UNIQUE INDEX "PaymentIntent_renewalKey_key" ON "PaymentIntent"("renewalKey");
CREATE INDEX "PaymentIntent_userId_createdAt_idx" ON "PaymentIntent"("userId", "createdAt");
CREATE INDEX "PaymentIntent_provider_status_createdAt_idx" ON "PaymentIntent"("provider", "status", "createdAt");
CREATE UNIQUE INDEX "BillingInvoice_provider_providerInvoiceId_key" ON "BillingInvoice"("provider", "providerInvoiceId");
CREATE INDEX "BillingInvoice_userId_createdAt_idx" ON "BillingInvoice"("userId", "createdAt");
CREATE UNIQUE INDEX "WebhookEvent_provider_externalEventId_key" ON "WebhookEvent"("provider", "externalEventId");
CREATE INDEX "WebhookEvent_status_createdAt_idx" ON "WebhookEvent"("status", "createdAt");
CREATE UNIQUE INDEX "CustomDomain_domainNormalized_key" ON "CustomDomain"("domainNormalized");
CREATE UNIQUE INDEX "CustomDomain_verificationToken_key" ON "CustomDomain"("verificationToken");
CREATE INDEX "CustomDomain_userId_status_idx" ON "CustomDomain"("userId", "status");
CREATE UNIQUE INDEX "UploadedAsset_objectKey_key" ON "UploadedAsset"("objectKey");
CREATE INDEX "UploadedAsset_userId_createdAt_idx" ON "UploadedAsset"("userId", "createdAt");
CREATE INDEX "ProfileLink_userId_scheduledStart_scheduledEnd_idx" ON "ProfileLink"("userId", "scheduledStart", "scheduledEnd");
CREATE INDEX "ProfileViewEvent_userId_createdAt_idx" ON "ProfileViewEvent"("userId", "createdAt");
CREATE INDEX "ProfileViewEvent_userId_country_createdAt_idx" ON "ProfileViewEvent"("userId", "country", "createdAt");
CREATE INDEX "ProfileViewEvent_userId_deviceType_createdAt_idx" ON "ProfileViewEvent"("userId", "deviceType", "createdAt");

ALTER TABLE "ProfileViewEvent" ADD CONSTRAINT "ProfileViewEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UploadedAsset" ADD CONSTRAINT "UploadedAsset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
