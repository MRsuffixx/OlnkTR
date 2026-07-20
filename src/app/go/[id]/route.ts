import { after, NextResponse, type NextRequest } from "next/server";

import { recordLinkClick } from "~/server/analytics/ingest";
import { db } from "~/server/db";
import {
  linkAccessCookieName,
  verifyLinkAccessToken,
} from "~/server/security/link-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const link = await db.profileLink.findFirst({
    where: { id, enabled: true, deletedAt: null, url: { not: "" } },
    include: { user: { select: { username: true } } },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const now = new Date();
  const scheduledOut =
    (link.scheduledStart !== null && link.scheduledStart > now) ||
    (link.scheduledEnd !== null && link.scheduledEnd <= now);
  if (scheduledOut)
    return NextResponse.redirect(
      new URL(`/${link.user.username ?? ""}`, request.url),
      302,
    );
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
