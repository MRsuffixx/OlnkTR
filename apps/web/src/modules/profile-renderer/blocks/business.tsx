import { useLocale, useTranslations } from "next-intl";
import { Placeholder } from "./essential";
import { CountdownClock, MapEmbed } from "../interactive";
import { str, type BlockRendererProps } from "../types";

export function ProductBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const locale = useLocale();
  const title = str(block.config, "title");
  if (!title) return ctx.mode === "preview" ? <Placeholder label={t("emptyProduct")} /> : null;
  const mediaId = str(block.config, "mediaId");
  const description = str(block.config, "description");
  const badge = str(block.config, "badge");
  const price =
    typeof block.config.priceMinor === "number"
      ? new Intl.NumberFormat(locale, {
          style: "currency",
          currency: str(block.config, "currency") || "TRY",
        }).format(block.config.priceMinor / 100)
      : null;
  return (
    <article className="op-card">
      <div className="op-card-row op-card-media-row">
        {mediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="op-card-media" src={`/media/${mediaId}`} alt="" loading="lazy" />
        ) : null}
        <div style={{ minWidth: 0, flex: 1 }}>
          {badge ? <span className="op-badge">{badge}</span> : null}
          <h3 className="op-card-title">{title}</h3>
          {description ? <p className="op-card-text">{description}</p> : null}
          {price ? <p className="op-price">{price}</p> : null}
          <a
            className="op-cta"
            href={str(block.config, "url") || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {str(block.config, "callToAction") || t("buy")}
          </a>
        </div>
      </div>
    </article>
  );
}

export function NewsletterBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const title = str(block.config, "title");
  if (!title) return ctx.mode === "preview" ? <Placeholder label={t("emptyNewsletter")} /> : null;
  const description = str(block.config, "description");
  return (
    <section className="op-card">
      <h3 className="op-card-title">{title}</h3>
      {description ? <p className="op-card-text">{description}</p> : null}
      <a
        className="op-cta"
        href={str(block.config, "url") || "#"}
        target="_blank"
        rel="noopener noreferrer"
      >
        {str(block.config, "callToAction") || t("subscribe")}
      </a>
    </section>
  );
}

export function FaqBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const items = Array.isArray(block.config.items)
    ? (block.config.items as { question?: string; answer?: string }[]).filter(
        (item) => item?.question,
      )
    : [];
  if (items.length === 0)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyFaq")} /> : null;
  const title = str(block.config, "title");
  return (
    <section className="op-card op-faq">
      {title ? (
        <h3 className="op-card-title" style={{ marginBottom: 6 }}>
          {title}
        </h3>
      ) : null}
      {items.map((item, index) => (
        <details key={index}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  );
}

export function CountdownBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const title = str(block.config, "title");
  const targetAt = str(block.config, "targetAt");
  if (!title || !targetAt)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyCountdown")} /> : null;
  const url = str(block.config, "url");
  return (
    <section className="op-card" style={{ textAlign: "center" }}>
      <h3 className="op-card-title">{title}</h3>
      <CountdownClock targetAt={targetAt} endedText={str(block.config, "endedText")} />
      {url ? (
        <a className="op-cta" href={url} target="_blank" rel="noopener noreferrer">
          {t("learnMore")}
        </a>
      ) : null}
    </section>
  );
}

export function LocationBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const label = str(block.config, "label");
  const address = str(block.config, "address");
  if (!label || !address)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyLocation")} /> : null;
  const zoom = typeof block.config.zoom === "number" ? block.config.zoom : 15;
  const directions = `https://www.google.com/maps/search/?${new URLSearchParams({ api: "1", query: address }).toString()}`;
  return (
    <section className="op-card">
      <h3 className="op-card-title">{label}</h3>
      <p className="op-card-text">{address}</p>
      <div className="op-card-row" style={{ flexWrap: "wrap", gap: 8 }}>
        <a className="op-cta" href={directions} target="_blank" rel="noopener noreferrer">
          {t("directions")}
        </a>
        {block.config.showMap !== false ? (
          <MapEmbed address={address} zoom={zoom} interactive={ctx.mode === "public"} />
        ) : null}
      </div>
    </section>
  );
}
