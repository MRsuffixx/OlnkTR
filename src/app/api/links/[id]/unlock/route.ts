import { NextResponse } from "next/server";

import { db } from "~/server/db";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import {
  createLinkAccessToken,
  linkAccessCookieName,
} from "~/server/security/link-access";
import {
  PasswordVerificationBusyError,
  verifyLinkPassword,
} from "~/server/security/link-password";
import { consumeRateLimit } from "~/server/security/rate-limit";
import { readRequestText } from "~/server/security/request-body";

function rejected(request: Request, id: string, retryAfter?: number) {
  const response = NextResponse.redirect(
    new URL(`/unlock/${encodeURIComponent(id)}?error=1`, request.url),
    303,
  );
  if (retryAfter) response.headers.set("Retry-After", String(retryAfter));
  return response;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id || id.length > 100) return rejected(request, id);
  const client = getTrustedClientAddress(request.headers);
  const [clientLimit, linkLimit, pairLimit] = await Promise.all([
    consumeRateLimit({
      key: `unlock:client:${client}`,
      limit: 30,
      windowMs: 15 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `unlock:link:${id}`,
      limit: 80,
      windowMs: 15 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `unlock:pair:${id}:${client}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    }),
  ]);
  if (!clientLimit.allowed || !linkLimit.allowed || !pairLimit.allowed)
    return rejected(
      request,
      id,
      Math.max(
        clientLimit.retryAfterSeconds,
        linkLimit.retryAfterSeconds,
        pairLimit.retryAfterSeconds,
      ),
    );

  const raw = await readRequestText(request, 1_024);
  if (raw === null) return rejected(request, id);
  const password = new URLSearchParams(raw).get("password");
  if (!password || password.length < 6 || password.length > 72)
    return rejected(request, id);

  const link = await db.profileLink.findUnique({ where: { id } });
  if (!link?.passwordHash || !link.enabled) return rejected(request, id);
  try {
    if (!(await verifyLinkPassword(password, link.passwordHash)))
      return rejected(request, id);
  } catch (error) {
    if (error instanceof PasswordVerificationBusyError)
      return rejected(request, id, 3);
    throw error;
  }

  const response = NextResponse.redirect(new URL(`/go/${id}`, request.url), 303);
  response.cookies.set(
    linkAccessCookieName(id),
    createLinkAccessToken(id, link.accessVersion),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: `/go/${id}`,
      maxAge: 12 * 60 * 60,
    },
  );
  return response;
}
