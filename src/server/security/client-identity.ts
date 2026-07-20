import "server-only";

import { createHash } from "node:crypto";
import { isIP } from "node:net";

import { env } from "~/env";

export function getTrustedClientAddress(headers: Pick<Headers, "get">) {
  const header = env.TRUSTED_IP_HEADER;
  if (header !== "none") {
    const raw = headers.get(header);
    const candidate =
      header === "x-forwarded-for" ? raw?.split(",")[0]?.trim() : raw?.trim();
    if (candidate && isIP(candidate)) return candidate;
  }

  // Never treat an unconfigured forwarding header as authoritative. This
  // fallback is only a coarse abuse-control key, not a geographic identity.
  return `untrusted:${createHash("sha256")
    .update(
      `${headers.get("user-agent") ?? ""}|${headers.get("accept-language") ?? ""}`,
    )
    .digest("hex")}`;
}

export function getTrustedCountry(headers: Pick<Headers, "get">) {
  if (env.TRUSTED_IP_HEADER === "cf-connecting-ip")
    return headers.get("cf-ipcountry")?.toUpperCase().slice(0, 2) ?? null;
  if (env.TRUSTED_IP_HEADER === "x-vercel-forwarded-for")
    return headers.get("x-vercel-ip-country")?.toUpperCase().slice(0, 2) ?? null;
  return null;
}
