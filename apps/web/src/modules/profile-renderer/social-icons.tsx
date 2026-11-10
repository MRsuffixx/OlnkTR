import { Briefcase, Globe } from "lucide-react";
import {
  siBluesky,
  siDiscord,
  siFacebook,
  siGithub,
  siInstagram,
  siSpotify,
  siTelegram,
  siThreads,
  siTiktok,
  siTwitch,
  siWhatsapp,
  siX,
  siYoutube,
  type SimpleIcon,
} from "simple-icons";
import type { SocialPlatform } from "@olnktr/validators/blocks";

/** Brand glyphs from Simple Icons (CC0). LinkedIn is not distributed there. */
const BRAND: Partial<Record<SocialPlatform, SimpleIcon>> = {
  instagram: siInstagram,
  x: siX,
  tiktok: siTiktok,
  youtube: siYoutube,
  facebook: siFacebook,
  github: siGithub,
  twitch: siTwitch,
  spotify: siSpotify,
  threads: siThreads,
  bluesky: siBluesky,
  discord: siDiscord,
  telegram: siTelegram,
  whatsapp: siWhatsapp,
};

export const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  x: "X",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  github: "GitHub",
  twitch: "Twitch",
  spotify: "Spotify",
  threads: "Threads",
  bluesky: "Bluesky",
  discord: "Discord",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  website: "Website",
};

export function SocialIcon({
  platform,
  className,
}: {
  platform: SocialPlatform;
  className?: string;
}) {
  const icon = BRAND[platform];
  if (!icon) {
    const Fallback = platform === "linkedin" ? Briefcase : Globe;
    return <Fallback className={className} aria-hidden="true" />;
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
