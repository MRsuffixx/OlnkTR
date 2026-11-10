import { z } from "zod";

export const uuidSchema = z.uuid();

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i,
];

/** True when the hostname is a loopback / private / link-local literal. */
export function isPrivateHostname(hostname: string): boolean {
  return PRIVATE_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

/**
 * A user-supplied outbound URL (links, social profiles, image targets).
 * Only http(s), no embedded credentials, no private-network hosts. The
 * platform never fetches these URLs server-side; the host restriction is a
 * defence-in-depth measure that also protects visitors.
 */
export const publicHttpUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .pipe(z.url({ protocol: /^https?$/, hostname: z.regexes.domain }))
  .refine((value) => {
    const url = new URL(value);
    return !url.username && !url.password;
  }, "URLs must not contain credentials")
  .refine((value) => !isPrivateHostname(new URL(value).hostname), "URL host is not allowed");

/** Plain, single-line text without control characters. Rendering escapes it. */
export const plainText = (max: number, min = 0) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    // eslint-disable-next-line no-control-regex
    .refine((value) => !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), {
      message: "Text contains invalid control characters",
    });

export const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #RRGGBB color");

export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  cursor: z.string().max(200).nullish(),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Validates an internal redirect target (e.g. `callbackURL` after login).
 * Only same-origin, path-only values are allowed: prevents open redirects.
 */
export function safeRedirectPath(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\\]/.test(value)) return fallback;
  try {
    const url = new URL(value, "http://placeholder.invalid");
    if (url.origin !== "http://placeholder.invalid") return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
