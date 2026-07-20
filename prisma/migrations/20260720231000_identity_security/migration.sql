-- Convert legacy theme columns before the application switches exclusively to
-- the structured appearance document. Common legacy gradients preserve their
-- first/last colors and angle; invalid values fall back field-by-field.
WITH legacy AS (
  SELECT
    t."id",
    ARRAY(
      SELECT color_match[1]
      FROM regexp_matches(
        t."backgroundValue",
        '(#[0-9A-Fa-f]{6})',
        'g'
      ) AS matches(color_match)
    ) AS colors,
    COALESCE(
      (regexp_match(t."backgroundValue", '([0-9]{1,3})deg'))[1]::integer,
      145
    ) AS angle
  FROM "Theme" t
  WHERE t."settings" = '{}'::jsonb
)
UPDATE "Theme" t
SET
  "settings" = jsonb_build_object(
    'background', jsonb_build_object(
      'mode', CASE t."backgroundType"::text
        WHEN 'SOLID' THEN 'solid'
        WHEN 'IMAGE' THEN 'image'
        WHEN 'VIDEO' THEN 'video'
        WHEN 'ANIMATED' THEN 'motion'
        ELSE 'gradient'
      END,
      'solidColor', CASE
        WHEN t."backgroundValue" ~ '^#[0-9A-Fa-f]{6}$' THEN t."backgroundValue"
        ELSE COALESCE(legacy.colors[1], '#F5F0DE')
      END,
      'gradient', jsonb_build_object(
        'type', CASE WHEN t."backgroundValue" ILIKE 'radial-gradient%' THEN 'radial' ELSE 'linear' END,
        'angle', LEAST(360, GREATEST(0, legacy.angle)),
        'stops', jsonb_build_array(
          jsonb_build_object('color', COALESCE(legacy.colors[1], '#F5F0DE'), 'position', 0),
          jsonb_build_object('color', COALESCE(legacy.colors[array_length(legacy.colors, 1)], '#F8C95C'), 'position', 100)
        )
      ),
      'mediaUrl', CASE
        WHEN t."backgroundType"::text IN ('IMAGE', 'VIDEO') AND t."backgroundValue" ~ '^https?://' THEN t."backgroundValue"
        ELSE ''
      END,
      'overlayColor', '#17211B',
      'overlayOpacity', 18,
      'preset', 'custom'
    ),
    'buttons', jsonb_build_object(
      'shape', CASE t."buttonShape"::text
        WHEN 'PILL' THEN 'pill' WHEN 'SQUARE' THEN 'square' ELSE 'rounded' END,
      'radius', 18,
      'fill', CASE t."buttonStyle"::text
        WHEN 'OUTLINE' THEN 'outline'
        WHEN 'GLASS' THEN 'glass'
        WHEN 'THREE_D' THEN 'threeD'
        WHEN 'SHADOW' THEN 'shadow'
        ELSE 'solid'
      END,
      'color', t."buttonColor",
      'textColor', '#FFFFFF',
      'borderColor', t."buttonColor",
      'shadowColor', t."accentColor",
      'height', 58,
      'spacing', 12,
      'hover', 'lift',
      'press', 'compress'
    ),
    'typography', jsonb_build_object(
      'headingFont', CASE t."fontFamily"::text
        WHEN 'EDITORIAL' THEN 'Playfair Display'
        WHEN 'MODERN' THEN 'Space Grotesk'
        WHEN 'MONO' THEN 'Bebas Neue'
        ELSE 'Fraunces'
      END,
      'bodyFont', CASE t."fontFamily"::text
        WHEN 'EDITORIAL' THEN 'Lora'
        WHEN 'MODERN' THEN 'Inter'
        WHEN 'MONO' THEN 'Roboto Mono'
        ELSE 'Manrope'
      END,
      'headingSize', 30,
      'bodySize', 15,
      'weight', 700,
      'letterSpacing', 0,
      'color', t."textColor"
    ),
    'layout', jsonb_build_object(
      'avatarShape', 'circle', 'avatarSize', 96, 'avatarBorderWidth', 3,
      'avatarBorderColor', '#FFFFFF', 'bioPlacement', 'belowName',
      'alignment', 'center', 'density', 'comfortable', 'contentWidth', 620,
      'socialPlacement', 'belowBio'
    ),
    'effects', jsonb_build_object(
      'cursor', 'default', 'cursorColor', t."accentColor", 'trail', 'none',
      'clickRipple', false, 'entrance', 'fade', 'staggerMs', 70
    ),
    'advanced', jsonb_build_object(
      'removeBranding', NOT t."showBranding",
      'customCssEnabled', false,
      'detailedAnalytics', false
    )
  ),
  "settingsVersion" = 1
FROM legacy
WHERE t."id" = legacy."id";

ALTER TABLE "User"
ADD COLUMN "emailNormalized" VARCHAR(254),
ADD COLUMN "usernameChangedAt" TIMESTAMP(3),
ADD COLUMN "deletionRequestedAt" TIMESTAMP(3);

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
ADD COLUMN "accessVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "deletedAt" TIMESTAMP(3);
CREATE INDEX "ProfileLink_userId_deletedAt_position_idx"
ON "ProfileLink"("userId", "deletedAt", "position");

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

ALTER TABLE "CustomDomain"
ADD COLUMN "claimExpiresAt" TIMESTAMP(3),
ADD COLUMN "nextRevalidationAt" TIMESTAMP(3),
ADD COLUMN "failureCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "CustomDomain"
SET
  "claimExpiresAt" = CASE
    WHEN "status" = 'VERIFIED' THEN CURRENT_TIMESTAMP + INTERVAL '100 years'
    ELSE "createdAt" + INTERVAL '24 hours'
  END,
  "nextRevalidationAt" = CASE
    WHEN "status" = 'VERIFIED' THEN CURRENT_TIMESTAMP
    ELSE NULL
  END;

ALTER TABLE "CustomDomain" ALTER COLUMN "claimExpiresAt" SET NOT NULL;
CREATE INDEX "CustomDomain_status_claimExpiresAt_idx"
ON "CustomDomain"("status", "claimExpiresAt");
CREATE INDEX "CustomDomain_status_nextRevalidationAt_idx"
ON "CustomDomain"("status", "nextRevalidationAt");

CREATE TABLE "DomainReclaimChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "domainNormalized" VARCHAR(253) NOT NULL,
  "verificationToken" VARCHAR(64) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DomainReclaimChallenge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "DomainReclaimChallenge_verificationToken_key"
ON "DomainReclaimChallenge"("verificationToken");
CREATE UNIQUE INDEX "DomainReclaimChallenge_userId_domainNormalized_key"
ON "DomainReclaimChallenge"("userId", "domainNormalized");
CREATE INDEX "DomainReclaimChallenge_expiresAt_idx"
ON "DomainReclaimChallenge"("expiresAt");
ALTER TABLE "DomainReclaimChallenge"
ADD CONSTRAINT "DomainReclaimChallenge_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TYPE "AccountDeletionStatus" AS ENUM ('PENDING', 'PROCESSING', 'RETRY_PENDING', 'COMPLETED');
CREATE TABLE "AccountDeletionJob" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "emailNormalized" VARCHAR(254),
  "status" "AccountDeletionStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastError" VARCHAR(1024),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountDeletionJob_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AccountDeletionJob_userId_key" ON "AccountDeletionJob"("userId");
CREATE INDEX "AccountDeletionJob_status_nextAttemptAt_idx"
ON "AccountDeletionJob"("status", "nextAttemptAt");
