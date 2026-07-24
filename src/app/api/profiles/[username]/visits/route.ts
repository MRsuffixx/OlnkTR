import { NextResponse, type NextRequest } from "next/server";

import { normalizeUsername } from "~/lib/username";
import { db } from "~/server/db";
import { getPublicVisitCount } from "~/server/analytics/public-count";
import { canPublishAccount } from "~/server/auth/account-access";
import { hasProAccess, resolveAppearanceForPlan } from "~/server/entitlements";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import { consumeRateLimit } from "~/server/security/rate-limit";
import {
  profileAccessCookieName,
  verifyProfileAccessToken,
} from "~/server/security/profile-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const rawUsername = (await params).username;
  if (!rawUsername || rawUsername.length > 64)
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const rate = await consumeRateLimit({
    key: `public-visits:${getTrustedClientAddress(request.headers)}`,
    limit: 120,
    windowMs: 60 * 60 * 1000,
  });
  if (!rate.allowed)
    return NextResponse.json(
      { error: "Çok fazla istek." },
      {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfterSeconds) },
      },
    );

  const profile = await db.user.findUnique({
    where: { usernameNormalized: normalizeUsername(rawUsername) },
    select: {
      id: true,
      username: true,
      accountStatus: true,
      accountStatusExpiresAt: true,
      deletionRequestedAt: true,
      profilePasswordHash: true,
      profileAccessVersion: true,
      theme: { select: { settings: true } },
      subscription: true,
      manualEntitlement: true,
    },
  });
  if (!profile?.username || !canPublishAccount(profile))
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const pro = hasProAccess(profile.subscription, profile.manualEntitlement);
  if (
    pro &&
    profile.profilePasswordHash &&
    !verifyProfileAccessToken(
      profile.id,
      profile.profileAccessVersion,
      request.cookies.get(profileAccessCookieName(profile.id))?.value,
    )
  )
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const socialProof = resolveAppearanceForPlan(profile.theme?.settings, pro)
    .effective.socialProof;
  if (!socialProof.enabled)
    return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });

  const count = await getPublicVisitCount(profile.id, socialProof.metric);
  return NextResponse.json(
    { count, metric: socialProof.metric },
    {
      headers: {
        "Cache-Control":
          socialProof.metric === "live"
            ? "private, no-store"
            : "public, max-age=30, stale-while-revalidate=60",
      },
    },
  );
}
