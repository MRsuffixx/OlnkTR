import { isIP } from "node:net";

/**
 * Determines the client IP. Proxy headers are only honoured when TRUST_PROXY
 * is enabled (otherwise any client could spoof them to evade rate limits).
 * Returns null when unknown; callers then fall back to a shared bucket.
 */
export function getClientIp(
  headers: Headers,
  options: { trustProxy: boolean; header: string },
): string | null {
  if (!options.trustProxy) return null;
  const raw = headers.get(options.header);
  if (!raw) return null;
  // For X-Forwarded-For the left-most entry is the original client (the proxy must overwrite, not append, untrusted values).
  const candidate = raw.split(",")[0]?.trim() ?? "";
  return isIP(candidate) ? candidate : null;
}
