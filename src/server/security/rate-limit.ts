import "server-only";

import { createHash } from "node:crypto";

import { Prisma } from "../../../generated/prisma/client";
import { db } from "~/server/db";

type RateLimitRow = {
  count: number;
  windowStart: Date;
  blockedUntil: Date | null;
};

export async function consumeRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
  blockMs?: number;
}) {
  const key = createHash("sha256").update(input.key).digest("hex");
  const blockMs = input.blockMs ?? input.windowMs;
  const rows = await db.$queryRaw<RateLimitRow[]>(Prisma.sql`
    INSERT INTO "RateLimitBucket" (
      "key", "count", "windowStart", "blockedUntil", "updatedAt"
    )
    VALUES (${key}, 1, CURRENT_TIMESTAMP, NULL, CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."windowStart" <= CURRENT_TIMESTAMP - (${input.windowMs} * INTERVAL '1 millisecond') THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimitBucket"."windowStart" <= CURRENT_TIMESTAMP - (${input.windowMs} * INTERVAL '1 millisecond') THEN CURRENT_TIMESTAMP
        ELSE "RateLimitBucket"."windowStart"
      END,
      "blockedUntil" = CASE
        WHEN "RateLimitBucket"."blockedUntil" > CURRENT_TIMESTAMP THEN "RateLimitBucket"."blockedUntil"
        WHEN (
          CASE
            WHEN "RateLimitBucket"."windowStart" <= CURRENT_TIMESTAMP - (${input.windowMs} * INTERVAL '1 millisecond') THEN 1
            ELSE "RateLimitBucket"."count" + 1
          END
        ) > ${input.limit} THEN CURRENT_TIMESTAMP + (${blockMs} * INTERVAL '1 millisecond')
        ELSE NULL
      END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "windowStart", "blockedUntil"
  `);
  const row = rows[0];
  if (!row) throw new Error("Rate limit state could not be persisted.");
  const now = Date.now();
  const blocked = Boolean(row.blockedUntil && row.blockedUntil.getTime() > now);
  return {
    allowed: !blocked && row.count <= input.limit,
    retryAfterSeconds: blocked
      ? Math.max(1, Math.ceil((row.blockedUntil!.getTime() - now) / 1000))
      : 0,
  };
}
