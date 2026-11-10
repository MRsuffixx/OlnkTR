/** Maps a tRPC/app error to a translation key in the `errors` namespace. */
const KNOWN = new Set([
  "ENTITLEMENT_REQUIRED",
  "QUOTA_EXCEEDED",
  "CONFLICT",
  "RATE_LIMITED",
  "NOT_FOUND",
  "FORBIDDEN",
  "UNAUTHORIZED",
]);

export function errorKey(error: unknown): string {
  const data = (error as { data?: { appCode?: string | null; code?: string } } | null)?.data;
  const code = data?.appCode ?? data?.code;
  if (code === "TOO_MANY_REQUESTS") return "RATE_LIMITED";
  return code && KNOWN.has(code) ? code : "generic";
}
