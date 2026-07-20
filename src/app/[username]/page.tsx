/* eslint-disable @next/next/no-img-element -- Public avatars and favicons can come from user-configured HTTPS hosts. */
import { createHash } from "node:crypto";

import { after } from "next/server";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ArrowUpRight, Download, LockKeyhole, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";

import { Brand } from "~/components/brand";
import { ProfileEffects } from "~/components/profile/profile-effects";
import { ShareButton } from "~/components/profile/share-button";
import {
  appearanceBackground,
  type AppearanceSettings,
} from "~/lib/appearance";
import { linkCustomizationSchema } from "~/lib/schemas";
import { getAppOrigin } from "~/lib/app-url";
import { normalizeUsername } from "~/lib/username";
import { db } from "~/server/db";
import { hasProAccess, resolveAppearanceForPlan } from "~/server/entitlements";
import { env } from "~/env";

const getProfile = cache((username: string) =>
  db.user.findUnique({
    where: { usernameNormalized: normalizeUsername(username) },
    include: {
      theme: true,
      subscription: true,
      links: {
        where: { enabled: true, url: { not: "" } },
        orderBy: { position: "asc" },
      },
    },
  }),
);

function radius(settings: AppearanceSettings) {
  return settings.buttons.shape === "pill"
    ? 999
    : settings.buttons.shape === "square"
      ? 5
      : settings.buttons.shape === "custom"
        ? settings.buttons.radius
        : 18;
}
function linkStyle(
  settings: AppearanceSettings,
  custom: ReturnType<typeof linkCustomizationSchema.parse>,
): React.CSSProperties {
  const button = settings.buttons;
  const color = custom.buttonColor ?? button.color;
  const text = custom.textColor ?? button.textColor;
  const style: React.CSSProperties = {
    minHeight: button.height,
    borderRadius: radius(settings),
    color: text,
    background: color,
    fontFamily:
      custom.fontFamily === "inherit"
        ? settings.typography.bodyFont
        : custom.fontFamily,
  };
  if (button.fill === "outline")
    return {
      ...style,
      background: "transparent",
      color,
      border: `2px solid ${button.borderColor}`,
    };
  if (button.fill === "glass")
    return {
      ...style,
      background: "rgba(255,255,255,.48)",
      border: "1px solid rgba(255,255,255,.65)",
      backdropFilter: "blur(14px)",
    };
  if (button.fill === "shadow")
    return { ...style, boxShadow: `4px 5px 0 ${button.shadowColor}` };
  if (button.fill === "threeD")
    return {
      ...style,
      boxShadow: `inset 0 -5px 0 rgba(0,0,0,.24), 0 6px 0 ${button.shadowColor}`,
    };
  return style;
}

function avatarRadius(shape: AppearanceSettings["layout"]["avatarShape"]) {
  return shape === "circle"
    ? "50%"
    : shape === "square"
      ? "4px"
      : shape === "squircle"
        ? "32%"
        : shape === "hexagon"
          ? "0"
          : "22%";
}
function embedUrl(type: "YOUTUBE" | "SPOTIFY", value: string) {
  try {
    const url = new URL(value);
    if (type === "YOUTUBE") {
      const id = url.hostname.includes("youtu.be")
        ? url.pathname.slice(1)
        : (url.searchParams.get("v") ??
          url.pathname.split("/").filter(Boolean).at(-1));
      return id && /^[\w-]{6,20}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : null;
    }
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 2
      ? `https://open.spotify.com/embed/${parts.slice(-2).join("/")}`
      : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile?.username) return { title: "Profil bulunamadı" };
  const title = profile.name ?? `@${profile.username}`;
  const description = profile.bio || `${title} bağlantılarını olnk'te keşfet.`;
  return {
    title,
    description,
    alternates: { canonical: `/${profile.username}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${profile.username}`,
    },
    robots: { index: true, follow: true },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile?.username) notFound();
  const pro = hasProAccess(profile.subscription);
  const appearance = resolveAppearanceForPlan(
    profile.theme?.settings,
    pro,
  ).effective;
  const now = new Date();
  const links = profile.links.filter(
    (link) =>
      !pro ||
      ((!link.scheduledStart || link.scheduledStart <= now) &&
        (!link.scheduledEnd || link.scheduledEnd > now)),
  );
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip");
  const agent = requestHeaders.get("user-agent") ?? "";
  const deviceType = /tablet|ipad/i.test(agent)
    ? "tablet"
    : /mobile|iphone|android/i.test(agent)
      ? "mobile"
      : "desktop";
  const visitorHash = ip
    ? createHash("sha256")
        .update(
          `${ip}:${new Date().toISOString().slice(0, 10)}:${env.AUTH_SECRET ?? "local"}`,
        )
        .digest("hex")
    : null;
  after(() =>
    db.profileViewEvent
      .create({
        data: {
          userId: profile.id,
          referrer: requestHeaders.get("referer")?.slice(0, 512) ?? null,
          userAgent: agent.slice(0, 512) || null,
          country:
            requestHeaders.get("cf-ipcountry")?.slice(0, 2) ??
            requestHeaders.get("x-vercel-ip-country")?.slice(0, 2) ??
            null,
          deviceType,
          visitorHash,
        },
      })
      .catch(() => undefined),
  );
  const initial = (profile.name ?? profile.username)
    .slice(0, 1)
    .toLocaleUpperCase("tr-TR");
  const profileUrl = `${getAppOrigin()}/${profile.username}`;
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: profile.name ?? profile.username,
    description: profile.bio,
    url: profileUrl,
    mainEntity: {
      "@type": "Person",
      name: profile.name ?? profile.username,
      url: profileUrl,
    },
  }).replace(/</g, "\\u003c");
  const alignment =
    appearance.layout.alignment === "left"
      ? "text-left items-start"
      : "text-center items-center";
  const background = appearanceBackground(appearance);

  return (
    <main
      data-olnk-profile
      className={`relative min-h-dvh overflow-hidden px-4 py-7 ${appearance.effects.cursor !== "default" ? "olnk-hide-cursor" : ""}`}
      style={{
        ...background,
        color: appearance.typography.color,
        fontFamily: appearance.typography.bodyFont,
        fontSize: appearance.typography.bodySize,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {pro &&
        appearance.advanced.customCssEnabled &&
        profile.theme?.customCss && <style>{profile.theme.customCss}</style>}
      {appearance.background.mode === "video" &&
        appearance.background.mediaUrl && (
          <video
            src={appearance.background.mediaUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 size-full object-cover"
          />
        )}
      {appearance.background.mode === "particles" && (
        <div className="olnk-particles absolute inset-0" />
      )}
      {appearance.background.mode === "motion" && (
        <div className="olnk-gradient-motion absolute inset-0" />
      )}
      <ProfileEffects effects={appearance.effects} />
      <div
        className="relative mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full flex-col"
        style={{ maxWidth: appearance.layout.contentWidth }}
      >
        <div className="flex items-center justify-end gap-2">
          <details className="group relative">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-full border border-current/15 bg-white/50 backdrop-blur transition hover:scale-105"
              aria-label="QR kodunu göster"
            >
              <QrCode className="size-4" />
            </summary>
            <div className="border-ink/10 bg-paper text-ink absolute top-12 right-0 z-30 w-64 rounded-3xl border p-4 shadow-2xl">
              <img
                src={`/api/qr/${profile.username}`}
                alt={`${profile.username} profili QR kodu`}
                className="w-full rounded-2xl"
              />
              <a
                href={`/api/qr/${profile.username}`}
                download={`${profile.username}-qr.png`}
                className="bg-ink text-paper mt-3 flex h-10 items-center justify-center gap-2 rounded-full text-sm font-black"
              >
                <Download className="size-4" /> QR kodunu indir
              </a>
            </div>
          </details>
          <ShareButton title={profile.name ?? profile.username} />
        </div>
        <section className={`mt-4 flex flex-col ${alignment}`}>
          <div
            className="bg-orange grid place-items-center overflow-hidden text-4xl font-black text-white shadow-[4px_5px_0_rgba(23,33,27,.55)]"
            style={{
              width: appearance.layout.avatarSize,
              height: appearance.layout.avatarSize,
              borderRadius: avatarRadius(appearance.layout.avatarShape),
              border: `${appearance.layout.avatarBorderWidth}px solid ${appearance.layout.avatarBorderColor}`,
              clipPath:
                appearance.layout.avatarShape === "hexagon"
                  ? "polygon(25% 6.7%,75% 6.7%,100% 50%,75% 93.3%,25% 93.3%,0 50%)"
                  : undefined,
            }}
          >
            {profile.image ? (
              <img
                src={profile.image}
                alt={`${profile.name ?? profile.username} profil fotoğrafı`}
                className="size-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          {appearance.layout.bioPlacement === "aboveName" && profile.bio && (
            <p className="mt-5 max-w-md leading-7 opacity-70">{profile.bio}</p>
          )}
          <h1
            className="mt-5 font-black"
            style={{
              fontFamily: appearance.typography.headingFont,
              fontSize: appearance.typography.headingSize,
              letterSpacing: appearance.typography.letterSpacing,
            }}
          >
            {profile.name ?? `@${profile.username}`}
          </h1>
          {appearance.layout.bioPlacement === "belowName" && profile.bio && (
            <p className="mt-3 max-w-md leading-7 opacity-70">{profile.bio}</p>
          )}
        </section>
        <nav
          className="mt-8 grid"
          style={{ gap: appearance.buttons.spacing }}
          aria-label={`${profile.name ?? profile.username} bağlantıları`}
        >
          {links.map((link, index) => {
            const custom = pro
              ? linkCustomizationSchema
                  .catch({
                    buttonColor: null,
                    textColor: null,
                    fontFamily: "inherit",
                    iconStyle: "favicon",
                  })
                  .parse(link.customization)
              : linkCustomizationSchema.parse({});
            const embed =
              pro && link.embedType !== "LINK"
                ? embedUrl(link.embedType, link.url)
                : null;
            return (
              <div
                key={link.id}
                className="olnk-link"
                data-hover={appearance.buttons.hover}
                data-entrance={appearance.effects.entrance}
                style={{
                  animationDelay: `${index * appearance.effects.staggerMs}ms`,
                }}
              >
                {embed && (
                  <iframe
                    src={embed}
                    title={link.title}
                    loading="lazy"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    className="mb-3 aspect-video w-full rounded-2xl border-0 shadow-lg"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                )}
                <a
                  href={
                    pro && link.passwordHash
                      ? `/unlock/${link.id}`
                      : `/go/${link.id}`
                  }
                  target={pro && link.passwordHash ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex w-full items-center gap-3 px-4 text-left font-black transition duration-200"
                  style={linkStyle(appearance, custom)}
                >
                  {custom.iconStyle !== "hidden" && (
                    <span className="text-ink grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white/90 text-xs">
                      {link.iconUrl ? (
                        <img
                          src={link.iconUrl}
                          alt=""
                          className={`size-5 ${custom.iconStyle === "mono" ? "grayscale" : ""}`}
                        />
                      ) : (
                        link.title.slice(0, 1).toUpperCase()
                      )}
                    </span>
                  )}
                  <span className="flex-1">{link.title}</span>
                  {pro && link.passwordHash ? (
                    <LockKeyhole className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:rotate-12" />
                  )}
                </a>
              </div>
            );
          })}
        </nav>
        {!links.length && (
          <div className="mt-9 rounded-3xl border border-current/15 bg-white/25 px-5 py-8 text-center text-sm font-semibold opacity-65 backdrop-blur">
            Bu profil yakında bağlantılarını paylaşacak.
          </div>
        )}
        {!appearance.advanced.removeBranding && (
          <div className="mt-auto flex justify-center pt-14">
            <span className="rounded-full bg-white/45 px-4 py-2 backdrop-blur">
              <Brand compact />
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
