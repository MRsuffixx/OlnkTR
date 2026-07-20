import { createHash } from "node:crypto";
import { after, NextResponse, type NextRequest } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";
import { hasProAccess } from "~/server/entitlements";
import { linkAccessCookieName, verifyLinkAccessToken } from "~/server/security/link-access";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const link = await db.profileLink.findFirst({
    where: { id, enabled: true, url: { not: "" } },
    include: { user: { select: { username: true, subscription: true } } },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), 302);
  }

  const pro = hasProAccess(link.user.subscription);
  const now = new Date();
  const scheduledOut = pro && ((link.scheduledStart !== null && link.scheduledStart > now) || (link.scheduledEnd !== null && link.scheduledEnd <= now));
  if (scheduledOut) return NextResponse.redirect(new URL(`/${link.user.username ?? ""}`, request.url), 302);
  if (pro && link.passwordHash) {
    const token = request.cookies.get(linkAccessCookieName(id))?.value;
    if (!verifyLinkAccessToken(id, token)) return NextResponse.redirect(new URL(`/unlock/${id}`, request.url), 302);
  }

  const headers = request.headers;
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  const visitorHash = ip
    ? createHash("sha256")
        .update(`${ip}:${env.AUTH_SECRET ?? "local-development"}`)
        .digest("hex")
    : null;

  after(async () => {
    try {
      await db.clickEvent.create({
        data: {
          linkId: link.id,
          userId: link.userId,
          referrer: headers.get("referer")?.slice(0, 512) ?? null,
          userAgent: headers.get("user-agent")?.slice(0, 512) ?? null,
          country:
            headers.get("cf-ipcountry")?.slice(0, 2) ??
            headers.get("x-vercel-ip-country")?.slice(0, 2) ??
            null,
          visitorHash,
        },
      });
    } catch {
      // Analytics must never delay or break a visitor's redirect.
    }
  });

  return NextResponse.redirect(link.url, 302);
}
