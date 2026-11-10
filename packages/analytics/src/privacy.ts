import { createHmac } from "node:crypto";

/**
 * Anonymous visitor identifier: HMAC(secret, day | ip | user-agent | profile).
 * The key rotates every UTC day and the raw IP is never stored, so visitors
 * cannot be tracked across days or across profiles.
 */
export function visitorHash(input: {
  secret: string;
  day: string;
  ip: string | null;
  userAgent: string | null;
  profileId: string;
}): string {
  const dailyKey = createHmac("sha256", input.secret)
    .update(`olnktr-analytics:${input.day}`)
    .digest();
  return createHmac("sha256", dailyKey)
    .update(`${input.ip ?? "-"}|${input.userAgent ?? "-"}|${input.profileId}`)
    .digest("hex")
    .slice(0, 32);
}

/** Reduces a referrer URL to its host; internal navigation counts as direct. */
export function referrerHost(
  referrer: string | undefined | null,
  ownHosts: readonly string[],
): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (ownHosts.some((own) => own === host)) return null;
    return host.slice(0, 255);
  } catch {
    return null;
  }
}

/** Accepts only ISO 3166-1 alpha-2 codes (proxies send e.g. "XX"/"T1" for unknown/Tor). */
export function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(code) && code !== "XX" ? code : null;
}

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
