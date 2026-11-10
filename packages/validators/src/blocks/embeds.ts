import { SPOTIFY_RESOURCE_TYPES } from "./definitions";

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
