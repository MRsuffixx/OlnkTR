-- Prisma's @updatedAt is maintained by the client, not a database default.
-- This preserves current data while aligning replayed migration history with
-- the live schema so `prisma migrate dev` no longer reports drift.
ALTER TABLE "UploadedAsset" ALTER COLUMN "updatedAt" DROP DEFAULT;
