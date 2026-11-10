import { useTranslations } from "next-intl";
import { Placeholder } from "./essential";
import { str, type BlockRendererProps } from "../types";

/** Embeds use fixed provider hosts with parsed ids; no user-supplied embed HTML. */
export function YouTubeBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const id = str(block.config, "videoId");
  if (!/^[A-Za-z0-9_-]{11}$/.test(id))
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "YouTube" })} />
    ) : null;
  const start =
    typeof block.config.startSeconds === "number" ? `?start=${block.config.startSeconds}` : "";
  return (
    <iframe
      className="op-embed"
      data-ratio="video"
      src={`https://www.youtube-nocookie.com/embed/${id}${start}`}
      title="YouTube"
      loading="lazy"
      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

export function SpotifyBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const type = str(block.config, "resourceType");
  const id = str(block.config, "resourceId");
  if (!type || !/^[A-Za-z0-9]{22}$/.test(id))
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "Spotify" })} />
    ) : null;
  const compact = block.config.compact === true;
  return (
    <iframe
      className="op-embed"
      style={{ height: compact ? 152 : 352 }}
      src={`https://open.spotify.com/embed/${type}/${id}`}
      title="Spotify"
      loading="lazy"
      allow="encrypted-media; fullscreen; picture-in-picture"
    />
  );
}

export function SoundCloudBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const url = str(block.config, "url");
  const parsed = URL.parse(url);
  if (!parsed || parsed.hostname !== "soundcloud.com")
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "SoundCloud" })} />
    ) : null;
  const visual = block.config.visual === true;
  const params = new URLSearchParams({ url, visual: String(visual), show_comments: "false" });
  return (
    <iframe
      className="op-embed"
      style={{ height: visual ? 300 : 166 }}
      src={`https://w.soundcloud.com/player/?${params.toString()}`}
      title="SoundCloud"
      loading="lazy"
      allow="autoplay"
    />
  );
}

export function TwitchBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const channel = str(block.config, "channel");
  if (!/^[A-Za-z0-9_]{3,25}$/.test(channel))
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "Twitch" })} />
    ) : null;
  const params = new URLSearchParams({
    channel,
    parent: ctx.embedHost,
    muted: String(block.config.muted !== false),
    autoplay: "false",
  });
  return (
    <iframe
      className="op-embed"
      data-ratio="video"
      src={`https://player.twitch.tv/?${params.toString()}`}
      title={`Twitch: ${channel}`}
      loading="lazy"
      allow="fullscreen"
    />
  );
}

export function VideoBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const src = str(block.config, "src");
  if (!src.startsWith("https://"))
    return ctx.mode === "preview" ? <Placeholder label={t("emptyVideo")} /> : null;
  const caption = str(block.config, "caption");
  const autoplay = block.config.autoplay === true && ctx.mode === "public";
  return (
    <figure className="op-figure">
      <video
        className="op-video"
        src={src}
        controls
        playsInline
        preload="metadata"
        muted={autoplay}
        autoPlay={autoplay}
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
