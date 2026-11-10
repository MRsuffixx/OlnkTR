/**
 * Content Security Policy for HTML pages. Scripts are allowed only with the
 * per-request nonce ('strict-dynamic' lets Next.js load its chunks). Embeds are
 * limited to the fixed provider players used by blocks (YouTube no-cookie,
 * Spotify, SoundCloud, Twitch and the click-to-load Google Maps embed).
 */
export function buildContentSecurityPolicy(options: {
  nonce: string;
  isDev: boolean;
  storageOrigin: string | null;
  upgradeInsecure: boolean;
}): string {
  const storage = options.storageOrigin ? ` ${options.storageOrigin}` : "";
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${options.nonce}' 'strict-dynamic'${options.isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${storage}`,
    "font-src 'self' data:",
    `connect-src 'self'${storage}${options.isDev ? " ws:" : ""}`,
    "media-src 'self' https:",
    "frame-src https://www.youtube-nocookie.com https://open.spotify.com https://w.soundcloud.com https://player.twitch.tv https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(options.upgradeInsecure ? ["upgrade-insecure-requests"] : []),
  ];
  return directives.join("; ");
}

export function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
