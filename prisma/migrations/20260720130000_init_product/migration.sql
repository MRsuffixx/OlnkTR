CREATE SCHEMA IF NOT EXISTS "public";

CREATE TYPE "BackgroundType" AS ENUM ('SOLID', 'GRADIENT', 'IMAGE');
CREATE TYPE "ButtonStyle" AS ENUM ('SOLID', 'OUTLINE', 'GLASS', 'SHADOW');
CREATE TYPE "ButtonShape" AS ENUM ('ROUNDED', 'PILL', 'SQUARE');
CREATE TYPE "FontFamily" AS ENUM ('MODERN', 'FRIENDLY', 'EDITORIAL', 'MONO');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "username" TEXT,
    "usernameNormalized" TEXT,
    "bio" VARCHAR(160) NOT NULL DEFAULT '',
    "onboardedAt" TIMESTAMP(3),
    "editorRevision" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Theme" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "backgroundType" "BackgroundType" NOT NULL DEFAULT 'GRADIENT',
    "backgroundValue" TEXT NOT NULL DEFAULT 'linear-gradient(145deg, #F5F0DE 0%, #F8C95C 100%)',
    "buttonStyle" "ButtonStyle" NOT NULL DEFAULT 'SHADOW',
    "buttonShape" "ButtonShape" NOT NULL DEFAULT 'ROUNDED',
    "buttonColor" TEXT NOT NULL DEFAULT '#17211B',
    "textColor" TEXT NOT NULL DEFAULT '#17211B',
    "accentColor" TEXT NOT NULL DEFAULT '#F06432',
    "fontFamily" "FontFamily" NOT NULL DEFAULT 'FRIENDLY',
    "showBranding" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Theme_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProfileLink" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "iconUrl" VARCHAR(2048),
    "position" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProfileLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClickEvent" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referrer" VARCHAR(512),
    "userAgent" VARCHAR(512),
    "country" VARCHAR(2),
    "visitorHash" VARCHAR(64),
    CONSTRAINT "ClickEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuthIntent" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "usernameNormalized" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuthIntent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsernameBlocklist" (
    "id" TEXT NOT NULL,
    "termNormalized" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UsernameBlocklist_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "refresh_token_expires_in" INTEGER,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_usernameNormalized_key" ON "User"("usernameNormalized");
CREATE INDEX "User_usernameNormalized_idx" ON "User"("usernameNormalized");
CREATE UNIQUE INDEX "Theme_userId_key" ON "Theme"("userId");
CREATE INDEX "ProfileLink_userId_position_idx" ON "ProfileLink"("userId", "position");
CREATE INDEX "ProfileLink_userId_enabled_idx" ON "ProfileLink"("userId", "enabled");
CREATE UNIQUE INDEX "ProfileLink_id_userId_key" ON "ProfileLink"("id", "userId");
CREATE INDEX "ClickEvent_linkId_createdAt_idx" ON "ClickEvent"("linkId", "createdAt");
CREATE INDEX "ClickEvent_userId_createdAt_idx" ON "ClickEvent"("userId", "createdAt");
CREATE INDEX "ClickEvent_createdAt_idx" ON "ClickEvent"("createdAt");
CREATE UNIQUE INDEX "AuthIntent_token_key" ON "AuthIntent"("token");
CREATE UNIQUE INDEX "AuthIntent_email_key" ON "AuthIntent"("email");
CREATE UNIQUE INDEX "AuthIntent_usernameNormalized_key" ON "AuthIntent"("usernameNormalized");
CREATE INDEX "AuthIntent_expiresAt_idx" ON "AuthIntent"("expiresAt");
CREATE UNIQUE INDEX "UsernameBlocklist_termNormalized_key" ON "UsernameBlocklist"("termNormalized");
CREATE INDEX "UsernameBlocklist_enabled_idx" ON "UsernameBlocklist"("enabled");
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

ALTER TABLE "Theme" ADD CONSTRAINT "Theme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProfileLink" ADD CONSTRAINT "ProfileLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "ProfileLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
