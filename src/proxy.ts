import { NextResponse, type NextRequest } from "next/server";

import { getAppOrigin } from "~/lib/app-url";
import { db } from "~/server/db";

function controlledResponse(status: 404 | 410) {
  return new NextResponse(
    `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>${status}</title><body><main><h1>${status === 410 ? "Bu profil artık burada değil." : "Sayfa bulunamadı."}</h1></main></body></html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=60",
        "x-robots-tag": "noindex, nofollow",
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "")
    .split(":")[0]!
    .toLowerCase();
  const canonical = new URL(getAppOrigin()).hostname;
  const canonicalHosts = new Set([
    canonical,
    canonical.startsWith("www.") ? canonical.slice(4) : `www.${canonical}`,
    "localhost",
    "127.0.0.1",
  ]);
  if (
    !hostname ||
    canonicalHosts.has(hostname) ||
    hostname.endsWith(".vercel.app")
  )
    return NextResponse.next();

  const domain = await db.customDomain.findUnique({
    where: { domainNormalized: hostname },
    include: { user: { select: { username: true, subscription: true } } },
  });
  if (!domain) return controlledResponse(404);
  const subscription = domain.user.subscription;
  const entitled = Boolean(
    subscription?.plan === "PRO" &&
      ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"].includes(
        subscription.status,
      ) &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > new Date(),
  );
  if (
    domain.status !== "VERIFIED" ||
    !domain.user.username ||
    !entitled
  )
    return controlledResponse(410);
  if (request.nextUrl.pathname !== "/") return controlledResponse(404);

  const url = request.nextUrl.clone();
  url.pathname = `/${domain.user.username}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|og.png).*)"],
};
