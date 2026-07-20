ALTER TABLE "User"
ADD COLUMN "emailNormalized" VARCHAR(254),
ADD COLUMN "usernameChangedAt" TIMESTAMP(3);

UPDATE "User"
SET "emailNormalized" = LOWER(BTRIM("email"))
WHERE "email" IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "User"
    WHERE "emailNormalized" IS NOT NULL
    GROUP BY "emailNormalized"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Case-insensitive duplicate User emails must be merged before this migration can continue';
  END IF;
END $$;

CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");

ALTER TABLE "AuthIntent"
ADD COLUMN "emailNormalized" VARCHAR(254);

UPDATE "AuthIntent"
SET "emailNormalized" = LOWER(BTRIM("email"));

ALTER TABLE "AuthIntent"
ALTER COLUMN "emailNormalized" SET NOT NULL;

DROP INDEX IF EXISTS "AuthIntent_email_key";
DROP INDEX IF EXISTS "AuthIntent_usernameNormalized_key";
CREATE INDEX "AuthIntent_emailNormalized_expiresAt_idx"
ON "AuthIntent"("emailNormalized", "expiresAt");
CREATE INDEX "AuthIntent_usernameNormalized_expiresAt_idx"
ON "AuthIntent"("usernameNormalized", "expiresAt");

CREATE TABLE "RateLimitBucket" (
  "key" VARCHAR(64) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitBucket_updatedAt_idx" ON "RateLimitBucket"("updatedAt");
CREATE INDEX "RateLimitBucket_blockedUntil_idx" ON "RateLimitBucket"("blockedUntil");

ALTER TABLE "ProfileLink"
ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 0;

CREATE TYPE "AnalyticsEventType" AS ENUM ('CLICK', 'VIEW');

ALTER TABLE "ClickEvent"
ADD COLUMN "referrerHost" VARCHAR(253),
ADD COLUMN "dedupeKey" VARCHAR(64);

ALTER TABLE "ProfileViewEvent"
ADD COLUMN "referrerHost" VARCHAR(253),
ADD COLUMN "dedupeKey" VARCHAR(64);

CREATE UNIQUE INDEX "ClickEvent_dedupeKey_key" ON "ClickEvent"("dedupeKey");
CREATE INDEX "ClickEvent_userId_visitorHash_createdAt_idx"
ON "ClickEvent"("userId", "visitorHash", "createdAt");
CREATE INDEX "ClickEvent_userId_referrerHost_createdAt_idx"
ON "ClickEvent"("userId", "referrerHost", "createdAt");

CREATE UNIQUE INDEX "ProfileViewEvent_dedupeKey_key"
ON "ProfileViewEvent"("dedupeKey");
CREATE INDEX "ProfileViewEvent_userId_visitorHash_createdAt_idx"
ON "ProfileViewEvent"("userId", "visitorHash", "createdAt");
CREATE INDEX "ProfileViewEvent_userId_referrerHost_createdAt_idx"
ON "ProfileViewEvent"("userId", "referrerHost", "createdAt");

CREATE TABLE "AnalyticsDailyBucket" (
  "id" TEXT NOT NULL,
  "eventType" "AnalyticsEventType" NOT NULL,
  "userId" TEXT NOT NULL,
  "targetKey" VARCHAR(191) NOT NULL,
  "date" DATE NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AnalyticsDailyBucket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AnalyticsDailyBucket_eventType_userId_targetKey_date_key"
ON "AnalyticsDailyBucket"("eventType", "userId", "targetKey", "date");
CREATE INDEX "AnalyticsDailyBucket_userId_eventType_date_idx"
ON "AnalyticsDailyBucket"("userId", "eventType", "date");

CREATE TYPE "AssetPurpose" AS ENUM ('AVATAR', 'BACKGROUND');
CREATE TYPE "AssetStatus" AS ENUM ('PENDING', 'READY', 'DELETE_PENDING', 'DELETED', 'FAILED');

ALTER TABLE "UploadedAsset"
ADD COLUMN "actualSizeBytes" INTEGER,
ADD COLUMN "purpose" "AssetPurpose",
ADD COLUMN "status" "AssetStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "finalizedAt" TIMESTAMP(3),
ADD COLUMN "deletionAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "nextDeletionAt" TIMESTAMP(3),
ADD COLUMN "lastError" VARCHAR(512),
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "UploadedAsset"
SET
  "purpose" = CASE
    WHEN "objectKey" LIKE '%/avatar/%' THEN 'AVATAR'::"AssetPurpose"
    ELSE 'BACKGROUND'::"AssetPurpose"
  END,
  "status" = 'READY',
  "actualSizeBytes" = "sizeBytes",
  "finalizedAt" = "createdAt";

ALTER TABLE "UploadedAsset" ALTER COLUMN "purpose" SET NOT NULL;
CREATE INDEX "UploadedAsset_status_nextDeletionAt_idx"
ON "UploadedAsset"("status", "nextDeletionAt");
