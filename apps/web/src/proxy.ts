import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { buildContentSecurityPolicy, originOf } from "./lib/csp";

/**
 * Edge of every page request:
 *  1. correlation id (x-request-id) — accepted from upstream if well-formed
 *  2. per-request CSP nonce (forwarded to Next.js via the request CSP header)
 *  3. locale routing (next-intl). Public profile URLs (/<username>) never
 *     redirect based on Accept-Language so shared links stay stable.
 */
const intl = createMiddleware(routing);
const intlWithoutDetection = createMiddleware({ ...routing, localeDetection: false });

const APP_SEGMENTS = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "verify-email",
  "two-factor",
  "dashboard",
  "settings",
  "invitations",
  ...routing.locales,
]);

const REQUEST_ID = /^[A-Za-z0-9._:-]{8,128}$/;

function isProfilePath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  return segments.length === 1 && !APP_SEGMENTS.has(segments[0]!);
}

export default function proxy(request: NextRequest) {
  const inbound = request.headers.get("x-request-id");
  const requestId = inbound && REQUEST_ID.test(inbound) ? inbound : crypto.randomUUID();
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy({
    nonce,
    isDev: process.env.NODE_ENV !== "production",
    storageOrigin: originOf(process.env.S3_PUBLIC_ENDPOINT),
    upgradeInsecure: process.env.APP_URL?.startsWith("https://") ?? false,
  });

  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);
  headers.set("x-nonce", nonce);
  headers.set("content-security-policy", csp);
  const forwarded = new NextRequest(request, { headers });

  const response = (isProfilePath(request.nextUrl.pathname) ? intlWithoutDetection : intl)(
    forwarded,
  );
  response.headers.set("content-security-policy", csp);
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  // Pages only: API routes, redirects, media and static assets are excluded.
  matcher: ["/((?!api|go|media|_next|_vercel|.*\\..*).*)"],
};
