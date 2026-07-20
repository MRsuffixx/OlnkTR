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
