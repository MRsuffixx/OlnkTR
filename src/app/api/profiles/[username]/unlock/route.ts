import { NextResponse } from "next/server";

import { env } from "~/env";
import { normalizeUsername } from "~/lib/username";
import { db } from "~/server/db";
import { canPublishAccount } from "~/server/auth/account-access";
import { hasProAccess } from "~/server/entitlements";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import {
  createProfileAccessToken,
  profileAccessCookieName,
} from "~/server/security/profile-access";
import {
  PasswordVerificationBusyError,
  verifyLinkPassword,
} from "~/server/security/link-password";
import { consumeRateLimit } from "~/server/security/rate-limit";
import { readRequestText } from "~/server/security/request-body";

function profilePath(username: string) {
  return `/${encodeURIComponent(username)}`;
}

function rejected(request: Request, username: string, retryAfter?: number) {
  const response = NextResponse.redirect(
    new URL(`${profilePath(username)}?gateError=1`, request.url),
    303,
  );
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter));
  return response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const rawUsername = (await params).username;
  if (!rawUsername || rawUsername.length > 64)
    return rejected(request, rawUsername);
  const username = normalizeUsername(rawUsername);
  const client = getTrustedClientAddress(request.headers);
  const [clientLimit, profileLimit, pairLimit] = await Promise.all([
    consumeRateLimit({
      key: `profile-unlock:client:${client}`,
      limit: 30,
      windowMs: 15 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `profile-unlock:profile:${username}`,
      limit: 80,
      windowMs: 15 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `profile-unlock:pair:${username}:${client}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    }),
  ]);
  if (!clientLimit.allowed || !profileLimit.allowed || !pairLimit.allowed)
    return rejected(
      request,
      rawUsername,
      Math.max(
        clientLimit.retryAfterSeconds,
        profileLimit.retryAfterSeconds,
        pairLimit.retryAfterSeconds,
      ),
    );

  const raw = await readRequestText(request, 1_024);
  if (raw === null) return rejected(request, rawUsername);
  const password = new URLSearchParams(raw).get("password");
  if (!password || password.length < 6 || password.length > 72)
    return rejected(request, rawUsername);

  const profile = await db.user.findUnique({
    where: { usernameNormalized: username },
    include: {
      subscription: true,
      manualEntitlement: true,
    },
  });
  if (
    !profile?.username ||
    !profile.profilePasswordHash ||
    !canPublishAccount(profile) ||
    !hasProAccess(profile.subscription, profile.manualEntitlement)
  )
    return rejected(request, rawUsername);

  try {
    if (!(await verifyLinkPassword(password, profile.profilePasswordHash)))
      return rejected(request, profile.username);
  } catch (error) {
    if (error instanceof PasswordVerificationBusyError)
      return rejected(request, profile.username, 3);
    throw error;
  }

  const response = NextResponse.redirect(
    new URL(profilePath(profile.username), request.url),
    303,
  );
  response.cookies.set(
    profileAccessCookieName(profile.id),
    createProfileAccessToken(profile.id, profile.profileAccessVersion),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      path: "/",
      maxAge: 12 * 60 * 60,
    },
  );
  return response;
}
