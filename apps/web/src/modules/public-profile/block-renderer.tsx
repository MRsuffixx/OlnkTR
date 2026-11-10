import type { PublicProfileView } from "@olnktr/core";
import type { ThemeConfig } from "@olnktr/validators/theme";
import { BUTTON_SHAPE } from "./theme-style";

type Block = PublicProfileView["blocks"][number];

/** Block configs are validated by the registry; this narrows unknown values for rendering. */
const text = (value: unknown): string => (typeof value === "string" ? value : "");

const ALIGN = { left: "text-left", center: "text-center", right: "text-right" } as const;
const SPACER = { sm: "h-2", md: "h-6", lg: "h-10", xl: "h-16" } as const;

function buttonClass(theme: ThemeConfig, featured: boolean) {
  const variant =
    theme.buttons.variant === "outline"
      ? "border-2 border-[var(--profile-accent)] text-[var(--profile-text)]"
      : theme.buttons.variant === "soft"
        ? "bg-[var(--profile-surface)] text-[var(--profile-text)] border border-[var(--profile-border)]"
        : "bg-[var(--profile-accent)] text-[var(--profile-accent-text)]";
  return `block w-full px-4 py-3 text-center font-medium transition-transform hover:scale-[1.01] ${BUTTON_SHAPE[theme.buttons.shape]} ${variant} ${theme.buttons.shadow ? "shadow-md" : ""} ${featured ? "py-4 text-lg" : ""}`;
}

/**
 * Registry-driven public renderer: one branch per block type. Unknown types
 * (e.g. added by a newer deployment) render nothing instead of failing.
 * User text is rendered as text nodes only; URLs were validated on input;
 * embeds use fixed provider domains with parsed ids — never raw HTML/iframes.
 */
export function BlockRenderer({ block, theme }: { block: Block; theme: ThemeConfig }) {
  const config = block.config;
  switch (block.type) {
    case "link": {
      if (!block.link) return null;
      const newTab = block.link.metadata.openInNewTab !== false;
      return (
        <a
          href={`/go/${block.link.id}`}
          className={buttonClass(theme, config.style === "featured")}
          rel="noopener noreferrer nofollow"
          target={newTab ? "_blank" : undefined}
          data-testid="profile-link"
        >
          {block.link.title}
        </a>
      );
    }
    case "heading": {
      const Tag = config.level === 3 ? "h3" : "h2";
      return (
        <Tag className={`text-xl font-semibold ${ALIGN[config.align as keyof typeof ALIGN] ?? ""}`}>
          {text(config.text)}
        </Tag>
      );
    }
    case "text":
      return (
        <p
          className={`whitespace-pre-line text-[var(--profile-muted)] ${ALIGN[config.align as keyof typeof ALIGN] ?? ""}`}
        >
          {text(config.text)}
        </p>
      );
    case "image": {
      // Media is served via signed-URL redirects (/media/:id), which next/image cannot optimize.
      const image = (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/media/${text(config.mediaId)}`}
          alt={text(config.alt)}
          className="w-full rounded-lg object-cover"
          loading="lazy"
        />
      );
      return typeof config.href === "string" ? (
        <a href={config.href} rel="noopener noreferrer nofollow" target="_blank">
          {image}
        </a>
      ) : (
        image
      );
    }
    case "video":
      return (
        <figure className="grid gap-2">
          <video
            src={text(config.src)}
            controls
            preload="metadata"
            className="w-full rounded-lg"
            autoPlay={config.autoplay === true}
            muted={config.autoplay === true}
          />
          {config.caption ? (
            <figcaption className="text-sm text-[var(--profile-muted)]">
              {text(config.caption)}
            </figcaption>
          ) : null}
        </figure>
      );
    case "social_links": {
      const items = (config.items as { platform: string; url: string }[]) ?? [];
      return (
        <ul className="flex flex-wrap justify-center gap-3">
          {items.map((item) => (
            <li key={`${item.platform}:${item.url}`}>
              <a
                href={item.url}
                rel="noopener noreferrer nofollow me"
                target="_blank"
                className="rounded-full border border-[var(--profile-border)] px-3 py-1 text-sm capitalize"
              >
                {item.platform}
              </a>
            </li>
          ))}
        </ul>
      );
    }
    case "divider":
      return (
        <hr
          className="border-[var(--profile-border)]"
          style={{ borderStyle: (text(config.style) || "solid") as "solid" | "dashed" | "dotted" }}
        />
      );
    case "spacer":
      return <div aria-hidden className={SPACER[config.size as keyof typeof SPACER] ?? "h-6"} />;
    case "youtube": {
      const start = typeof config.startSeconds === "number" ? `?start=${config.startSeconds}` : "";
      return (
        <iframe
          title="YouTube"
          src={`https://www.youtube-nocookie.com/embed/${text(config.videoId)}${start}`}
          className="aspect-video w-full rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
        />
      );
    }
    case "spotify":
      return (
        <iframe
          title="Spotify"
          src={`https://open.spotify.com/embed/${text(config.resourceType)}/${text(config.resourceId)}`}
          className="w-full rounded-lg"
          height={config.compact ? 80 : 352}
          sandbox="allow-scripts allow-same-origin allow-popups"
          allow="encrypted-media"
          loading="lazy"
        />
      );
    default:
      return null;
  }
}
