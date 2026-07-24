CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
CREATE TYPE "AdminAuditCategory" AS ENUM (
  'AUTHORIZATION',
  'USER',
  'CONTENT',
  'BILLING',
  'SECURITY'
);
CREATE TYPE "AdminAuditOutcome" AS ENUM ('SUCCESS', 'DENIED', 'FAILURE');

ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "accountStatusReason" VARCHAR(500),
ADD COLUMN "accountStatusExpiresAt" TIMESTAMP(3),
ADD COLUMN "lastLoginAt" TIMESTAMP(3),
ADD COLUMN "lastActiveAt" TIMESTAMP(3);

ALTER TABLE "BillingInvoice"
ADD COLUMN "refundFlaggedAt" TIMESTAMP(3),
ADD COLUMN "refundFlagReason" VARCHAR(500),
ADD COLUMN "refundFlaggedById" TEXT;

CREATE TABLE "ManualEntitlement" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "reason" VARCHAR(500) NOT NULL,
  "grantedById" TEXT,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ManualEntitlement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminAuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorLabel" VARCHAR(254) NOT NULL,
  "targetUserId" TEXT,
  "targetEmail" VARCHAR(254),
  "targetUsername" VARCHAR(30),
  "category" "AdminAuditCategory" NOT NULL,
  "action" VARCHAR(80) NOT NULL,
  "outcome" "AdminAuditOutcome" NOT NULL DEFAULT 'SUCCESS',
  "reason" VARCHAR(500),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "requestIpHash" VARCHAR(64),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManualEntitlement_userId_key"
ON "ManualEntitlement"("userId");
CREATE INDEX "ManualEntitlement_expiresAt_revokedAt_idx"
ON "ManualEntitlement"("expiresAt", "revokedAt");
CREATE INDEX "ManualEntitlement_grantedById_createdAt_idx"
ON "ManualEntitlement"("grantedById", "createdAt");

CREATE INDEX "AdminAuditLog_createdAt_idx"
ON "AdminAuditLog"("createdAt");
CREATE INDEX "AdminAuditLog_actorUserId_createdAt_idx"
ON "AdminAuditLog"("actorUserId", "createdAt");
CREATE INDEX "AdminAuditLog_targetUserId_createdAt_idx"
ON "AdminAuditLog"("targetUserId", "createdAt");
CREATE INDEX "AdminAuditLog_category_action_createdAt_idx"
ON "AdminAuditLog"("category", "action", "createdAt");
CREATE INDEX "AdminAuditLog_outcome_createdAt_idx"
ON "AdminAuditLog"("outcome", "createdAt");

CREATE INDEX "User_role_accountStatus_idx"
ON "User"("role", "accountStatus");
CREATE INDEX "User_accountStatus_accountStatusExpiresAt_idx"
ON "User"("accountStatus", "accountStatusExpiresAt");
CREATE INDEX "User_createdAt_idx"
ON "User"("createdAt");
CREATE INDEX "User_lastActiveAt_idx"
ON "User"("lastActiveAt");
CREATE INDEX "BillingInvoice_refundFlaggedAt_idx"
ON "BillingInvoice"("refundFlaggedAt");

ALTER TABLE "ManualEntitlement"
ADD CONSTRAINT "ManualEntitlement_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ManualEntitlement"
ADD CONSTRAINT "ManualEntitlement_grantedById_fkey"
FOREIGN KEY ("grantedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog"
ADD CONSTRAINT "AdminAuditLog_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AdminAuditLog"
ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey"
FOREIGN KEY ("targetUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice"
ADD CONSTRAINT "BillingInvoice_refundFlaggedById_fkey"
FOREIGN KEY ("refundFlaggedById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
