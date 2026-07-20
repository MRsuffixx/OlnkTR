import { NextResponse, type NextRequest } from "next/server";

import { db } from "~/server/db";

export async function proxy(request: NextRequest) {
  const hostname = (request.headers.get("host") ?? "").split(":")[0]!.toLowerCase();
  const canonicalHosts = new Set(["olnk.tr", "www.olnk.tr", "localhost", "127.0.0.1"]);
  if (!hostname || canonicalHosts.has(hostname) || hostname.endsWith(".vercel.app")) return NextResponse.next();
  const domain = await db.customDomain.findUnique({ where: { domainNormalized: hostname }, include: { user: { select: { username: true, subscription: true } } } });
  if (!domain?.user.username || domain.status !== "VERIFIED") return NextResponse.next();
  const subscription = domain.user.subscription;
  const entitled = subscription?.plan === "PRO" && ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"].includes(subscription.status) && (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());
  if (!entitled) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${domain.user.username}`;
  return NextResponse.rewrite(url);
}

export const config = { matcher: "/" };
