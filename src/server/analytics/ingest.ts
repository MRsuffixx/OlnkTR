import "server-only";

import { createHmac } from "node:crypto";

import { Prisma } from "../../../generated/prisma/client";
import { env } from "~/env";
import { db } from "~/server/db";
import {
  getTrustedClientAddress,
  getTrustedCountry,
} from "~/server/security/client-identity";
import { consumeRateLimit } from "~/server/security/rate-limit";

const BOT_PATTERN =
  /bot|crawler|spider|headless|preview|facebookexternalhit|whatsapp|telegrambot|discordbot|slurp/i;

function digest(value: string) {
  return createHmac(
    "sha256",
    env.AUTH_SECRET ?? "local-analytics-development-secret",
  )
    .update(value)
    .digest("hex");
}

function referrerData(headers: Pick<Headers, "get">) {
  const referrer = headers.get("referer")?.slice(0, 512) ?? null;
  if (!referrer) return { referrer, referrerHost: "direct" };
  try {
    return {
      referrer,
      referrerHost: new URL(referrer).hostname.toLowerCase().replace(/^www\./, ""),
    };
  } catch {
    return { referrer, referrerHost: "other" };
  }
}

function analyticsIdentity(headers: Pick<Headers, "get">) {
  const agent = headers.get("user-agent")?.slice(0, 512) ?? "";
  if (!agent || BOT_PATTERN.test(agent)) return null;
  const client = getTrustedClientAddress(headers);
  return {
    agent,
    client,
    visitorHash: digest(`${client}|${agent}`),
    country: getTrustedCountry(headers),
    ...referrerData(headers),
  };
}

function utcDate(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

export async function recordProfileView(
  userId: string,
  headers: Pick<Headers, "get">,
) {
  const identity = analyticsIdentity(headers);
  if (!identity) return;
  const [clientLimit, profileLimit] = await Promise.all([
    consumeRateLimit({
      key: `analytics:view:client:${identity.client}`,
      limit: 300,
      windowMs: 60 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `analytics:view:${userId}:${identity.client}`,
      limit: 30,
      windowMs: 60 * 60 * 1000,
    }),
  ]);
  if (!clientLimit.allowed || !profileLimit.allowed) return;

  const now = new Date();
  const minute = Math.floor(now.getTime() / 60_000);
  const dedupeKey = digest(`view:${userId}:${identity.visitorHash}:${minute}`);
  const deviceType = /tablet|ipad/i.test(identity.agent)
    ? "tablet"
    : /mobile|iphone|android/i.test(identity.agent)
      ? "mobile"
      : "desktop";
  try {
    await db.$transaction([
      db.profileViewEvent.create({
        data: {
          userId,
          createdAt: now,
          referrer: identity.referrer,
          referrerHost: identity.referrerHost,
          userAgent: identity.agent,
          country: identity.country,
          deviceType,
          visitorHash: identity.visitorHash,
          dedupeKey,
        },
      }),
      db.analyticsDailyBucket.upsert({
        where: {
          eventType_userId_targetKey_date: {
            eventType: "VIEW",
            userId,
            targetKey: "profile",
            date: utcDate(now),
          },
        },
        create: {
          eventType: "VIEW",
          userId,
          targetKey: "profile",
          date: utcDate(now),
          count: 1,
        },
        update: { count: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return;
    throw error;
  }
}

export async function recordLinkClick(input: {
  linkId: string;
  userId: string;
  headers: Pick<Headers, "get">;
}) {
  const identity = analyticsIdentity(input.headers);
  if (!identity) return;
  const [clientLimit, linkLimit] = await Promise.all([
    consumeRateLimit({
      key: `analytics:click:client:${identity.client}`,
      limit: 200,
      windowMs: 10 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `analytics:click:${input.linkId}:${identity.client}`,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    }),
  ]);
  if (!clientLimit.allowed || !linkLimit.allowed) return;

  const now = new Date();
  const tenSecondWindow = Math.floor(now.getTime() / 10_000);
  const dedupeKey = digest(
    `click:${input.linkId}:${identity.visitorHash}:${tenSecondWindow}`,
  );
  try {
    await db.$transaction([
      db.clickEvent.create({
        data: {
          linkId: input.linkId,
          userId: input.userId,
          createdAt: now,
          referrer: identity.referrer,
          referrerHost: identity.referrerHost,
          userAgent: identity.agent,
          country: identity.country,
          visitorHash: identity.visitorHash,
          dedupeKey,
        },
      }),
      db.analyticsDailyBucket.upsert({
        where: {
          eventType_userId_targetKey_date: {
            eventType: "CLICK",
            userId: input.userId,
            targetKey: input.linkId,
            date: utcDate(now),
          },
        },
        create: {
          eventType: "CLICK",
          userId: input.userId,
          targetKey: input.linkId,
          date: utcDate(now),
          count: 1,
        },
        update: { count: { increment: 1 } },
      }),
    ]);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return;
    throw error;
  }
}
