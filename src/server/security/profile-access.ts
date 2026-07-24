import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "~/env";

const ACCESS_DURATION_MS = 12 * 60 * 60 * 1000;

function sign(value: string) {
  return createHmac(
    "sha256",
    env.AUTH_SECRET ?? "local-development-only-secret",
  )
    .update(value)
    .digest("base64url");
}

export function createProfileAccessToken(
  userId: string,
  accessVersion: number,
) {
  const expires = Date.now() + ACCESS_DURATION_MS;
  const value = `${userId}.${accessVersion}.${expires}`;
  return `${value}.${sign(value)}`;
}

export function verifyProfileAccessToken(
  userId: string,
  accessVersion: number,
  token: string | undefined,
) {
  if (!token) return false;
  const [tokenUserId, tokenVersion, expires, signature] = token.split(".");
  if (
    tokenUserId !== userId ||
    tokenVersion !== String(accessVersion) ||
    !expires ||
    !signature ||
    Number(expires) <= Date.now()
  )
    return false;
  const expected = Buffer.from(
    sign(`${tokenUserId}.${tokenVersion}.${expires}`),
  );
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function profileAccessCookieName(userId: string) {
  return `olnk_profile_${userId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
