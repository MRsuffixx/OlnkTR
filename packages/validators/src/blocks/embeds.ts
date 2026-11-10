import { SPOTIFY_RESOURCE_TYPES, type SocialPlatform } from "./definitions";

/** Extracts an 11-character YouTube video id from common URL shapes. */
export function parseYouTubeUrl(input: string): string | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return /^[A-Za-z0-9_-]{11}$/.test(input.trim()) ? input.trim() : null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") id = url.searchParams.get("v");
    else {
      const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(url.pathname);
      id = match?.[1] ?? null;
    }
  }
  return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

export type SpotifyResource = {
  resourceType: (typeof SPOTIFY_RESOURCE_TYPES)[number];
  resourceId: string;
};

/** Parses `https://open.spotify.com/<type>/<id>` (with optional `intl-xx/` prefix). */
export function parseSpotifyUrl(input: string): SpotifyResource | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.hostname !== "open.spotify.com") return null;
  const match = /^\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?([a-z]+)\/([A-Za-z0-9]{22})/.exec(
    url.pathname,
  );
  if (!match) return null;
  const [, type, id] = match;
  if (!type || !id || !(SPOTIFY_RESOURCE_TYPES as readonly string[]).includes(type)) return null;
  return { resourceType: type as SpotifyResource["resourceType"], resourceId: id };
}

const SOCIAL_URL_TEMPLATES: Partial<Record<SocialPlatform, string>> = {
  instagram: "https://instagram.com/{}",
  x: "https://x.com/{}",
  tiktok: "https://www.tiktok.com/@{}",
  youtube: "https://www.youtube.com/@{}",
  facebook: "https://facebook.com/{}",
  linkedin: "https://www.linkedin.com/in/{}",
  github: "https://github.com/{}",
  twitch: "https://www.twitch.tv/{}",
  threads: "https://www.threads.net/@{}",
  bluesky: "https://bsky.app/profile/{}",
  telegram: "https://t.me/{}",
};

/**
 * Turns "@handle" or "handle" into the platform's profile URL; full URLs are
 * returned unchanged. Returns null when a handle cannot be mapped.
 */
export function socialProfileUrl(platform: SocialPlatform, input: string): string | null {
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, "");
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(handle)) return null;
  const template = SOCIAL_URL_TEMPLATES[platform];
  return template ? template.replace("{}", handle) : null;
}

/** Extracts the channel name from a twitch.tv URL or returns a bare channel name. */
export function parseTwitchChannel(input: string): string | null {
  const value = input.trim();
  try {
    const url = new URL(value);
    if (!/(^|\.)twitch\.tv$/.test(url.hostname)) return null;
    const channel = url.pathname.split("/").filter(Boolean)[0];
    return channel && /^[A-Za-z0-9_]{3,25}$/.test(channel) ? channel : null;
  } catch {
    return /^[A-Za-z0-9_]{3,25}$/.test(value) ? value : null;
  }
}

/** Extracts the invite code from discord.gg / discord.com/invite URLs. */
export function parseDiscordInvite(input: string): string | null {
  const value = input.trim();
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const parts = url.pathname.split("/").filter(Boolean);
    const code =
      host === "discord.gg"
        ? parts[0]
        : host === "discord.com" && parts[0] === "invite"
          ? parts[1]
          : null;
    return code && /^[A-Za-z0-9-]{2,32}$/.test(code) ? code : null;
  } catch {
    return /^[A-Za-z0-9-]{2,32}$/.test(value) ? value : null;
  }
}
