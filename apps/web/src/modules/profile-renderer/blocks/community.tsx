import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SocialPlatform } from "@olnktr/validators/blocks";
import { Placeholder } from "./essential";
import { SOCIAL_LABELS, SocialIcon } from "../social-icons";
import { str, type BlockRendererProps } from "../types";

export function DiscordBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const code = str(block.config, "inviteCode");
  const name = str(block.config, "serverName");
  if (!code || !name)
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "Discord" })} />
    ) : null;
  const description = str(block.config, "description");
  return (
    <div className="op-card">
      <div className="op-card-row">
        <SocialIcon platform="discord" className="op-card-icon" />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="op-card-title">{name}</p>
          {description ? <p className="op-card-text">{description}</p> : null}
        </div>
      </div>
      <a
        className="op-cta"
        href={`https://discord.gg/${code}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("joinDiscord")}
      </a>
    </div>
  );
}

export function GitHubBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const username = str(block.config, "username");
  if (!username)
    return ctx.mode === "preview" ? (
      <Placeholder label={t("emptyEmbed", { provider: "GitHub" })} />
    ) : null;
  const repository = str(block.config, "repository");
  const headline = str(block.config, "headline");
  const href = `https://github.com/${username}${repository ? `/${repository}` : ""}`;
  return (
    <a
      className="op-card op-card-row"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <SocialIcon platform="github" className="op-card-icon" />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="op-card-title" style={{ display: "block" }}>
          {repository ? `${username}/${repository}` : `@${username}`}
        </span>
        <span className="op-card-text" style={{ display: "block" }}>
          {headline || t("viewOnGitHub")}
        </span>
      </span>
    </a>
  );
}

export function SocialProfileBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const platform = (str(block.config, "platform") || "website") as SocialPlatform;
  const url = str(block.config, "url");
  const handle = str(block.config, "handle");
  if (!url || !handle)
    return ctx.mode === "preview" ? <Placeholder label={t("emptySocialProfile")} /> : null;
  return (
    <a
      className="op-card op-card-row"
      href={url}
      target="_blank"
      rel="noopener noreferrer me"
      style={{ textDecoration: "none" }}
    >
      <SocialIcon platform={platform} className="op-card-icon" />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span className="op-card-title" style={{ display: "block" }}>
          {handle}
        </span>
        <span className="op-card-text" style={{ display: "block" }}>
          {SOCIAL_LABELS[platform]}
        </span>
      </span>
      <span className="op-cta" style={{ marginTop: 0 }}>
        {str(block.config, "callToAction") || t("follow")}
      </span>
    </a>
  );
}

export function ContactBlock({ block, ctx }: BlockRendererProps) {
  const t = useTranslations("renderer");
  const email = str(block.config, "email");
  const phone = str(block.config, "phone");
  const whatsapp = str(block.config, "whatsapp");
  const address = str(block.config, "address");
  if (!email && !phone && !whatsapp && !address)
    return ctx.mode === "preview" ? <Placeholder label={t("emptyContact")} /> : null;
  const digits = (value: string) => value.replace(/[^0-9+]/g, "");
  return (
    <div className="op-card">
      <p className="op-card-title">{t("contact")}</p>
      <ul className="op-contact-list">
        {email ? (
          <li className="op-card-row">
            <Mail size={16} aria-hidden="true" />
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        ) : null}
        {phone ? (
          <li className="op-card-row">
            <Phone size={16} aria-hidden="true" />
            <a href={`tel:${digits(phone)}`}>{phone}</a>
          </li>
        ) : null}
        {whatsapp ? (
          <li className="op-card-row">
            <MessageCircle size={16} aria-hidden="true" />
            <a
              href={`https://wa.me/${digits(whatsapp).replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </li>
        ) : null}
        {address ? (
          <li className="op-card-row">
            <MapPin size={16} aria-hidden="true" />
            <span>{address}</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
