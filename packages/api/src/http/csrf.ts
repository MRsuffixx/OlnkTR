/**
 * CSRF defence for cookie-authenticated, state-changing endpoints (tRPC
 * mutations, dev checkout forms): the Origin (or Referer) must match the app
 * origin. Combined with SameSite=Lax cookies and JSON-only bodies this blocks
 * cross-site request forgery.
 */
export function isSameOrigin(
  request: Request,
  appUrl: string,
  extraOrigins: readonly string[] = [],
): boolean {
  const allowed = new Set([
    new URL(appUrl).origin,
    ...extraOrigins.map((origin) => new URL(origin).origin),
  ]);
  const origin = request.headers.get("origin");
  if (origin) return allowed.has(origin);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }
  // Same-origin fetches from modern browsers always send Origin for POST; treat absence as untrusted.
  return request.headers.get("sec-fetch-site") === "same-origin";
}
