import { NextResponse } from "next/server";

import { hasProAccess } from "~/server/entitlements";
import { db } from "~/server/db";
import { createLinkAccessToken, linkAccessCookieName } from "~/server/security/link-access";
import { verifyLinkPassword } from "~/server/security/link-password";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const form = await request.formData();
  const password = form.get("password");
  const link = await db.profileLink.findUnique({ where: { id }, include: { user: { include: { subscription: true } } } });
  if (!link?.passwordHash || !hasProAccess(link.user.subscription) || typeof password !== "string" || !(await verifyLinkPassword(password, link.passwordHash))) return NextResponse.redirect(new URL(`/unlock/${id}?error=1`, request.url), 303);
  const response = NextResponse.redirect(new URL(`/go/${id}`, request.url), 303);
  response.cookies.set(linkAccessCookieName(id), createLinkAccessToken(id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: `/go/${id}`, maxAge: 12 * 60 * 60 });
  return response;
}
