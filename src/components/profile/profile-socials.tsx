/* eslint-disable @next/next/no-img-element -- Discord avatars come from Discord's public CDN. */

import {
  ArrowUpRight,
  Gamepad2,
  Headphones,
  MessageCircle,
} from "lucide-react";

import { socialPlatformDefinition } from "~/config/social-platform-registry";
import type { AppearanceSettings } from "~/lib/appearance";
import type { WorkspaceSocialInput } from "~/lib/schemas";
import type { DiscordPresence } from "~/server/integrations/discord-presence";

const STATUS_LABELS = {
  online: "Çevrimiçi",
  idle: "Boşta",
  dnd: "Rahatsız etmeyin",
  offline: "Çevrimdışı",
} as const;

const STATUS_COLORS = {
  online: "#23A55A",
  idle: "#F0B232",
  dnd: "#F23F43",
  offline: "#80848E",
} as const;

function discordUrl(account: WorkspaceSocialInput) {
  if (account.url) return account.url;
  const userId = account.settings.discord.userId;
  return userId ? `https://discord.com/users/${userId}` : "";
}

export function ProfileSocials({
  accounts,
  appearance,
  discordPresence,
  preview = false,
}: {
  accounts: WorkspaceSocialInput[];
  appearance: AppearanceSettings;
  discordPresence?: DiscordPresence | null;
  preview?: boolean;
}) {
  const visible = accounts.filter((account) => account.enabled);
  if (!visible.length) return null;
  const discord = visible.find(
    (account) =>
      account.platform === "DISCORD" &&
      (account.settings.discord.showPresence ||
        account.settings.discord.showActivity ||
        account.settings.discord.showSpotify) &&
      account.settings.discord.userId,
  );
  const order =
    appearance.layout.socialPlacement === "aboveBio"
      ? 1
      : appearance.layout.socialPlacement === "belowBio"
        ? 3
        : 5;

  return (
    <section className="relative w-full" style={{ order }}>
      <nav
        className="flex flex-wrap items-center gap-2"
        aria-label="Sosyal hesaplar"
        style={{
          justifyContent:
            appearance.layout.alignment === "left"
              ? "flex-start"
              : appearance.layout.alignment === "right"
                ? "flex-end"
                : "center",
          marginTop: 16,
        }}
      >
        {visible.map((account) => {
          const definition = socialPlatformDefinition(account.platform);
          const href =
            account.platform === "DISCORD" ? discordUrl(account) : account.url;
          const color = account.usePlatformColor
            ? definition.color
            : (account.customColor ?? appearance.colors.accent);
          const content = (
            <>
              <span
                className="grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-black text-white"
                style={{ backgroundColor: color }}
                aria-hidden
              >
                {definition.shortLabel}
              </span>
              {!account.iconOnly && (
                <span className="max-w-40 truncate text-xs font-black">
                  {account.label}
                </span>
              )}
              {!account.iconOnly && <ArrowUpRight className="size-3.5" />}
            </>
          );
          const className =
            "inline-flex min-h-10 items-center gap-2 rounded-full border border-current/15 bg-white/45 px-1.5 pr-3 backdrop-blur transition hover:-translate-y-0.5";
          return href && !preview ? (
            <a
              key={account.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={account.tooltip || account.label}
              className={className}
            >
              {content}
            </a>
          ) : (
            <span
              key={account.id}
              title={account.tooltip || account.label}
              className={className}
            >
              {content}
            </span>
          );
        })}
      </nav>
      {discord && Boolean(discordPresence ?? preview) && (
        <DiscordPresenceCard
          account={discord}
          presence={discordPresence}
          appearance={appearance}
          preview={preview}
        />
      )}
    </section>
  );
}

function DiscordPresenceCard({
  account,
  presence,
  appearance,
  preview,
}: {
  account: WorkspaceSocialInput;
  presence?: DiscordPresence | null;
  appearance: AppearanceSettings;
  preview: boolean;
}) {
  const settings = account.settings.discord;
  const activity = settings.showActivity
    ? presence?.activities.find(
        (item) => item.type !== 4 && item.name !== "Spotify",
      )
    : null;
  const spotify = settings.showSpotify ? presence?.spotify : null;
  const displayName =
    presence?.discord_user.global_name ??
    presence?.discord_user.username ??
    account.username ??
    account.label;
  const avatar = presence?.discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${presence.discord_user.id}/${presence.discord_user.avatar}.webp?size=128`
    : null;
  const status = presence?.discord_status ?? "offline";

  return (
    <div
      className="mt-3 w-full overflow-hidden rounded-2xl border p-3 text-left backdrop-blur-xl"
      style={{
        borderColor: `${appearance.colors.cardBorder}88`,
        backgroundColor: `${appearance.colors.card}D9`,
        color: appearance.colors.textPrimary,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[#5865F2] text-sm font-black text-white">
          {avatar ? (
            <img src={avatar} alt="" className="size-full object-cover" />
          ) : (
            "D"
          )}
          <span
            className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-white"
            style={{ backgroundColor: STATUS_COLORS[status] }}
          />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-black">
            {displayName}
          </span>
          <span className="block text-[11px] opacity-60">
            {preview && !presence
              ? "Canlı Discord durumu burada görünür"
              : STATUS_LABELS[status]}
          </span>
        </span>
        <MessageCircle className="size-4 text-[#5865F2]" aria-hidden />
      </div>
      {activity && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/5 p-2 text-xs">
          <Gamepad2 className="size-4 shrink-0" />
          <span className="min-w-0">
            <strong className="block truncate">{activity.name}</strong>
            {Boolean(activity.details ?? activity.state) && (
              <span className="block truncate opacity-60">
                {activity.details ?? activity.state}
              </span>
            )}
          </span>
        </div>
      )}
      {spotify && (
        <a
          href={`https://open.spotify.com/track/${spotify.track_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-2 rounded-xl bg-[#1DB954]/10 p-2 text-xs"
        >
          <Headphones className="size-4 shrink-0 text-[#1DB954]" />
          <span className="min-w-0">
            <strong className="block truncate">{spotify.song}</strong>
            <span className="block truncate opacity-60">{spotify.artist}</span>
          </span>
        </a>
      )}
    </div>
  );
}
