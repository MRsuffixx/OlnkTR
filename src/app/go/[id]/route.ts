import { after, NextResponse, type NextRequest } from "next/server";

import { recordLinkClick } from "~/server/analytics/ingest";
import { isCustomProfileHost } from "~/lib/app-url";
import { db } from "~/server/db";
import { hasProAccess } from "~/server/entitlements";
import {
  linkAccessCookieName,
  verifyLinkAccessToken,
} from "~/server/security/link-access";
import {
  profileAccessCookieName,
  verifyProfileAccessToken,
} from "~/server/security/profile-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const now = new Date();
  const link = await db.profileLink.findFirst({
    where: {
      id,
      enabled: true,
      deletedAt: null,
      url: { not: "" },
      user: {
        deletionRequestedAt: null,
        OR: [
          { accountStatus: "ACTIVE" },
          {
            accountStatus: "SUSPENDED",
            accountStatusExpiresAt: { lte: now },
          },
        ],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profilePasswordHash: true,
          profileAccessVersion: true,
          subscription: true,
          manualEntitlement: true,
        },
      },
    },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const profilePath = isCustomProfileHost(request.headers.get("host"))
    ? "/"
    : `/${link.user.username ?? ""}`;
  const scheduledOut =
    (link.scheduledStart !== null && link.scheduledStart > now) ||
    (link.scheduledEnd !== null && link.scheduledEnd <= now);
  if (scheduledOut)
    return NextResponse.redirect(new URL(profilePath, request.url), 302);
  if (
    link.user.profilePasswordHash &&
    hasProAccess(link.user.subscription, link.user.manualEntitlement)
  ) {
    const token = request.cookies.get(
      profileAccessCookieName(link.user.id),
    )?.value;
    if (
      !verifyProfileAccessToken(
        link.user.id,
        link.user.profileAccessVersion,
        token,
      )
    )
      return NextResponse.redirect(new URL(profilePath, request.url), 302);
  }
  if (link.passwordHash) {
    const token = request.cookies.get(linkAccessCookieName(id))?.value;
    if (!verifyLinkAccessToken(id, link.accessVersion, token))
      return NextResponse.redirect(new URL(`/unlock/${id}`, request.url), 302);
  }

  after(() =>
    recordLinkClick({
      linkId: link.id,
      userId: link.userId,
      headers: request.headers,
    }).catch(() => undefined),
  );

  return NextResponse.redirect(link.url, 302);
}
