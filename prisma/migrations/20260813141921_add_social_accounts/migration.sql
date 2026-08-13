-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "label" VARCHAR(40) NOT NULL,
    "username" VARCHAR(80),
    "url" VARCHAR(2048) NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "iconOnly" BOOLEAN NOT NULL DEFAULT true,
    "usePlatformColor" BOOLEAN NOT NULL DEFAULT true,
    "customColor" VARCHAR(7),
    "tooltip" VARCHAR(80),
    "settings" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SocialAccount_userId_deletedAt_position_idx" ON "SocialAccount"("userId", "deletedAt", "position");

-- CreateIndex
CREATE INDEX "SocialAccount_userId_enabled_idx" ON "SocialAccount"("userId", "enabled");

-- CreateIndex
CREATE INDEX "SocialAccount_platform_idx" ON "SocialAccount"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_id_userId_key" ON "SocialAccount"("id", "userId");

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
