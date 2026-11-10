import { ArrowUpRight, ImageIcon, Link2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import type { SocialPlatform } from "@olnktr/validators/blocks";
import { resolveBlockAppearance } from "@olnktr/validators/theme";
import { renderInlineText } from "../inline-text";
import { SOCIAL_LABELS, SocialIcon } from "../social-icons";
import { str, type BlockRendererProps } from "../types";

/** Block-level appearance overrides become scoped CSS variables. */
function appearanceStyle({ block, ctx }: BlockRendererProps): CSSProperties | undefined {
  if (!block.appearance) return undefined;
  const resolved = resolveBlockAppearance(ctx.theme, block.appearance);
  return {
    "--op-btn-bg": resolved.background,
    "--op-btn-fg": resolved.text,
    "--op-btn-radius": `${resolved.radius}px`,
  } as CSSProperties;
}

export function Placeholder({ label }: { label: string }) {
  return <div className="op-placeholder">{label}</div>;
}

export function LinkBlock(props: BlockRendererProps) {
  const { block, ctx } = props;
  const t = useTranslations("renderer");
  const link = block.link;
  if (!link || !link.title)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyLink")} /> : null;
  const tracked = ctx.mode === "public" && link.id && link.trackClicks !== false;
  const href = tracked ? `/go/${link.id}` : link.url || "#";
  const variant = block.appearance?.variant ?? ctx.theme.buttons.variant;
  return (
    <a
      className="op-button"
      href={href}
      data-variant={variant}
      data-featured={block.appearance?.emphasis === "featured" || block.config.style === "featured"}
      style={appearanceStyle(props)}
      {...(link.openInNewTab
        ? { target: "_blank", rel: "noopener noreferrer" }
        : { rel: "noopener" })}
    >
      <span className="op-button-icon">
        {link.thumbnailMediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="op-button-thumb"
            src={`/media/${link.thumbnailMediaId}`}
            alt=""
            loading="lazy"
          />
        ) : (
          <Link2 size={18} aria-hidden="true" />
        )}
      </span>
      <span className="op-button-label">
        {link.title}
        {link.description ? <span className="op-button-desc">{link.description}</span> : null}
      </span>
    </a>
  );
}

export function ButtonBlock(props: BlockRendererProps) {
  const { block, ctx } = props;
  const t = useTranslations("renderer");
  const label = str(block.config, "label");
  if (!label) return ctx.mode === "preview" ? <Placeholder label={t("emptyButton")} /> : null;
  const auto = block.config.width === "auto";
  return (
    <a
      className="op-button"
      href={str(block.config, "url") || "#"}
      data-variant={block.appearance?.variant ?? ctx.theme.buttons.variant}
      data-featured={block.appearance?.emphasis === "featured"}
      style={{ ...appearanceStyle(props), ...(auto ? { width: "auto", alignSelf: "center" } : {}) }}
      {...(block.config.openInNewTab !== false
        ? { target: "_blank", rel: "noopener noreferrer" }
        : { rel: "noopener" })}
    >
      <span className="op-button-label">{label}</span>
      <span className="op-button-icon">
        <ArrowUpRight size={18} aria-hidden="true" />
      </span>
    </a>
  );
}

export function HeadingBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const text = str(block.config, "text");
  if (!text) return ctx.mode === "preview" ? <Placeholder label={t("emptyHeading")} /> : null;
  const level = block.config.level === 3 ? 3 : 2;
  const Tag = level === 3 ? "h3" : "h2";
  return (
    <Tag
      className="op-heading"
      data-level={level}
      data-align-self={str(block.config, "align") || "center"}
    >
      {text}
    </Tag>
  );
}

export function TextBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const text = str(block.config, "text");
  if (!text) return ctx.mode === "preview" ? <Placeholder label={t("emptyText")} /> : null;
  return (
    <p
      className="op-text"
      data-size={str(block.config, "size") || "md"}
      data-weight={str(block.config, "weight") || "regular"}
      data-tone={str(block.config, "tone") || "default"}
      data-align-self={str(block.config, "align") || "center"}
    >
      {renderInlineText(text)}
    </p>
  );
}

const ASPECT: Record<string, string | undefined> = {
  square: "1 / 1",
  portrait: "4 / 5",
  wide: "16 / 9",
};

export function ImageBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const mediaId = str(block.config, "mediaId");
  if (!mediaId)
    return ctx.mode === "preview" ? (
      <div className="op-placeholder">
        <ImageIcon size={20} aria-hidden="true" />
        {t("emptyImage")}
      </div>
    ) : null;
  const radius = typeof block.config.radius === "number" ? `${block.config.radius}px` : undefined;
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="op-image"
      src={`/media/${mediaId}`}
      alt={str(block.config, "alt")}
      loading="lazy"
      decoding="async"
      style={{
        aspectRatio: ASPECT[str(block.config, "aspect")],
        objectFit: block.config.fit === "contain" ? "contain" : "cover",
        borderRadius: radius,
      }}
    />
  );
  const href = str(block.config, "href");
  const caption = str(block.config, "caption");
  return (
    <figure className="op-figure">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {image}
        </a>
      ) : (
        image
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

export function GalleryBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const items = Array.isArray(block.config.items)
    ? (block.config.items as { mediaId?: string; alt?: string }[]).filter((item) => item?.mediaId)
    : [];
  if (items.length === 0)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyGallery")} /> : null;
  const aspect = ASPECT[str(block.config, "aspect")] ?? "1 / 1";
  return (
    <div
      className="op-gallery"
      data-layout={str(block.config, "layout") || "grid"}
      style={{ "--op-cols": block.config.columns === 3 ? 3 : 2 } as CSSProperties}
    >
      {items.map((item, index) => (
        <div key={`${item.mediaId}-${index}`} style={{ aspectRatio: aspect }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/media/${item.mediaId}`}
            alt={item.alt ?? ""}
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  );
}

export function SocialLinksBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const items = Array.isArray(block.config.items)
    ? (block.config.items as { platform: SocialPlatform; url: string }[]).filter(
        (item) => item?.url,
      )
    : [];
  if (items.length === 0)
    return ctx.mode === "preview" ? <Placeholder label={t("emptySocials")} /> : null;
  const display = str(block.config, "display") || "icons";
  return (
    <nav
      className="op-socials"
      aria-label={t("socialLinks")}
      data-display={display}
      data-icon-style={str(block.config, "iconStyle") || "plain"}
      data-size={str(block.config, "size") || "md"}
    >
      {items.map((item, index) => (
        <a
          key={`${item.platform}-${index}`}
          className="op-social"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={SOCIAL_LABELS[item.platform]}
        >
          <SocialIcon platform={item.platform} />
          {display === "icons" ? null : <span>{SOCIAL_LABELS[item.platform]}</span>}
        </a>
      ))}
    </nav>
  );
}

export function DividerBlock({ block }: BlockRendererProps) {
  return <hr className="op-divider" data-style={str(block.config, "style") || "solid"} />;
}

export function SpacerBlock({ block }: BlockRendererProps) {
  return (
    <div className="op-spacer" data-size={str(block.config, "size") || "md"} aria-hidden="true" />
  );
}
