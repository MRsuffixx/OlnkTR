import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { env } from "~/env";

function sign(value: string) {
  return createHmac(
    "sha256",
    env.AUTH_SECRET ?? "local-development-only-secret",
  )
    .update(value)
    .digest("base64url");
}

export function createLinkAccessToken(linkId: string) {
  const expires = Date.now() + 12 * 60 * 60 * 1000;
  const value = `${linkId}.${expires}`;
  return `${value}.${sign(value)}`;
}

export function verifyLinkAccessToken(
  linkId: string,
  token: string | undefined,
) {
  if (!token) return false;
  const [tokenLinkId, expires, signature] = token.split(".");
  if (
    tokenLinkId !== linkId ||
    !expires ||
    !signature ||
    Number(expires) <= Date.now()
  )
    return false;
  const expected = Buffer.from(sign(`${tokenLinkId}.${expires}`));
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export function linkAccessCookieName(linkId: string) {
  return `olnk_link_${linkId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
