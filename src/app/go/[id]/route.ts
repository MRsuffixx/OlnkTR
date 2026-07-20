import { createHash } from "node:crypto";
import { after, NextResponse } from "next/server";

import { env } from "~/env";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const link = await db.profileLink.findFirst({
    where: { id, enabled: true, url: { not: "" } },
    select: { id: true, userId: true, url: true },
  });

  if (!link) {
    return NextResponse.redirect(new URL("/", request.url), 302);
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
