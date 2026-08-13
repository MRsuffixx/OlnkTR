/* eslint-disable @next/next/no-img-element -- Public avatars and favicons can come from user-configured HTTPS hosts. */
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import { ArrowUpRight, Download, LockKeyhole, QrCode } from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";

import { Brand } from "~/components/brand";
import { ProfileEffects } from "~/components/profile/profile-effects";
import { ProfileAmbientEffects } from "~/components/profile/profile-ambient-effects";
import { ProfileBackgroundVideo } from "~/components/profile/profile-background-video";
import { ProfileAudioPlayer } from "~/components/profile/profile-audio-player";
import { ProfileGate } from "~/components/profile/profile-gate";
import { ShareButton } from "~/components/profile/share-button";
import { VisitorCounter } from "~/components/profile/visitor-counter";
import {
  appearanceBackground,
  appearanceCardStyle,
  appearanceCssVariables,
} from "~/lib/appearance";
import { linkCustomizationSchema } from "~/lib/schemas";
import { getAppOrigin, isCustomProfileHost } from "~/lib/app-url";
import { normalizeUsername } from "~/lib/username";
import {
  profileAvatarRadius,
  profileButtonStyle,
  profileCardMargin,
  profileDensity,
  profileEmbedUrl,
  profileFontFamily,
  profileHeadingStyle,
} from "~/lib/profile-rendering";
import { db } from "~/server/db";
import { recordProfileView } from "~/server/analytics/ingest";
import { getPublicVisitCount } from "~/server/analytics/public-count";
import { canPublishAccount } from "~/server/auth/account-access";
import { hasProAccess, resolveAppearanceForPlan } from "~/server/entitlements";
import {
  profileAccessCookieName,
  verifyProfileAccessToken,
} from "~/server/security/profile-access";

const getProfile = cache((username: string) =>
  db.user.findUnique({
    where: { usernameNormalized: normalizeUsername(username) },
    include: {
      theme: true,
      subscription: true,
      manualEntitlement: true,
      links: {
        where: { enabled: true, deletedAt: null, url: { not: "" } },
        orderBy: { position: "asc" },
      },
    },
  }),
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile?.username || !canPublishAccount(profile))
    return { title: "Profil bulunamadı" };
  const pro = hasProAccess(profile.subscription, profile.manualEntitlement);
  if (pro && profile.profilePasswordHash)
    return {
      title: `@${profile.username} · Korumalı profil`,
      description: "Bu olnk profili parola ile korunuyor.",
      robots: { index: false, follow: false },
    };
  const appearance = resolveAppearanceForPlan(
    profile.theme?.settings,
    pro,
  ).effective;
  const title = appearance.seo.title || profile.name || `@${profile.username}`;
  const description =
    appearance.seo.description ||
    profile.bio ||
    `${title} bağlantılarını olnk'te keşfet.`;
  return {
    title,
    description,
    alternates: { canonical: `/${profile.username}` },
    openGraph: {
      title,
      description,
      type: "profile",
      url: `/${profile.username}`,
      ...(appearance.seo.imageUrl ? { images: [appearance.seo.imageUrl] } : {}),
    },
    robots: {
      index: appearance.privacy.allowIndexing,
      follow: appearance.privacy.allowIndexing,
    },
  };
}

export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ gateError?: string }>;
}) {
  const { username } = await params;
  const query = await searchParams;
  const profile = await getProfile(username);
  if (!profile?.username || !canPublishAccount(profile)) notFound();
  const pro = hasProAccess(profile.subscription, profile.manualEntitlement);
  const requestHeaders = await headers();
  if (pro && profile.profilePasswordHash) {
    const cookieStore = await cookies();
    const unlocked = verifyProfileAccessToken(
      profile.id,
      profile.profileAccessVersion,
      cookieStore.get(profileAccessCookieName(profile.id))?.value,
    );
    if (!unlocked)
      return (
        <ProfileGate
          username={profile.username}
          hasError={query.gateError === "1"}
          useRootPath={isCustomProfileHost(requestHeaders.get("host"))}
        />
      );
  }
  const appearance = resolveAppearanceForPlan(
    profile.theme?.settings,
    pro,
  ).effective;
  if (appearance.privacy.analyticsEnabled)
    after(() =>
      recordProfileView(profile.id, requestHeaders).catch(() => undefined),
    );
  const now = new Date();
  const links = profile.links.filter(
    (link) =>
      (!link.scheduledStart || link.scheduledStart <= now) &&
      (!link.scheduledEnd || link.scheduledEnd > now),
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
  const desktopAlignment =
    appearance.layout.alignment === "left"
      ? "md:text-left md:items-start"
      : appearance.layout.alignment === "right"
        ? "md:text-right md:items-end"
        : "md:text-center md:items-center";
  const mobileAlignment =
    appearance.layout.mobileAlignment === "left"
      ? "text-left items-start"
      : appearance.layout.mobileAlignment === "right"
        ? "text-right items-end"
        : "text-center items-center";
  const background = appearanceBackground(appearance);
  const density = profileDensity(appearance.layout.density);
  const visitorCount = appearance.socialProof.enabled
    ? await getPublicVisitCount(
        profile.id,
        appearance.socialProof.metric,
      ).catch(() => null)
    : null;

  return (
    <main
      data-olnk-profile
      className={`relative min-h-dvh overflow-hidden px-4 py-7 ${
        appearance.audio.enabled || appearance.audio.entryEnabled ? "pb-44" : ""
      }`}
      style={{
        ...appearanceCssVariables(appearance),
        ...background,
        color: appearance.colors.textPrimary,
        fontFamily: profileFontFamily(appearance.typography.bodyFont),
        fontSize: appearance.typography.bodySize,
        fontWeight: appearance.typography.weight,
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
          <ProfileBackgroundVideo src={appearance.background.mediaUrl} />
        )}
      {appearance.background.mode === "particles" && (
        <div className="olnk-particles absolute inset-0" />
      )}
      {appearance.background.mode === "motion" && (
        <div className="olnk-gradient-motion absolute inset-0" />
      )}
      <ProfileEffects
        effects={appearance.effects}
        color={appearance.colors.accent}
      />
      <ProfileAmbientEffects
        effects={appearance.effects}
        particleColor={appearance.colors.particle}
      />
      {(appearance.audio.enabled || appearance.audio.entryEnabled) && (
        <ProfileAudioPlayer settings={appearance.audio} />
      )}
      <div
        className={`relative flex w-full flex-col ${appearance.card.enabled ? "" : "min-h-[calc(100dvh-3.5rem)]"}`}
        data-olnk-template={appearance.layout.template}
        style={{
          maxWidth: appearance.layout.contentWidth,
          ...profileCardMargin(appearance.layout.cardPosition),
          ...appearanceCardStyle(appearance),
        }}
      >
        {appearance.privacy.showShareActions && (
          <div
            className="flex items-center justify-end gap-2"
            style={{
              order:
                appearance.layout.socialPlacement === "aboveBio"
                  ? 1
                  : appearance.layout.socialPlacement === "belowBio"
                    ? 3
                    : 5,
            }}
          >
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
        )}
        <section
          className={`mt-4 flex flex-col ${mobileAlignment} ${desktopAlignment}`}
          data-olnk-tilt="profile"
          style={{ order: 2 }}
        >
          <div
            className="bg-orange grid place-items-center overflow-hidden text-4xl font-black text-white shadow-[4px_5px_0_rgba(23,33,27,.55)]"
            style={{
              width: appearance.layout.avatarSize,
              height: appearance.layout.avatarSize,
              borderRadius: profileAvatarRadius(appearance.layout.avatarShape),
              border: `${appearance.layout.avatarBorderWidth}px solid ${appearance.colors.cardBorder}`,
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
            <p
              className="max-w-md leading-7 opacity-70"
              style={{ marginTop: density.profileGap }}
            >
              {profile.bio}
            </p>
          )}
          <h1
            className="font-black"
            style={{
              marginTop: density.profileGap,
              fontFamily: profileFontFamily(appearance.typography.headingFont),
              fontSize: appearance.typography.headingSize,
              letterSpacing: appearance.typography.letterSpacing,
              ...profileHeadingStyle(appearance),
            }}
          >
            {profile.name ?? `@${profile.username}`}
          </h1>
          {appearance.layout.bioPlacement === "belowName" && profile.bio && (
            <p
              className="max-w-md leading-7 opacity-70"
              style={{ marginTop: Math.max(8, density.profileGap / 2) }}
            >
              {profile.bio}
            </p>
          )}
          {visitorCount !== null && (
            <VisitorCounter
              username={profile.username}
              initialCount={visitorCount}
              settings={appearance.socialProof}
            />
          )}
        </section>
        <nav
          className={`grid ${appearance.layout.template === "bento" ? "grid-cols-2" : "grid-cols-1"}`}
          style={{
            gap: appearance.buttons.spacing,
            marginTop: density.linksTop,
            order: 4,
          }}
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
              pro && !link.passwordHash && link.embedType !== "LINK"
                ? profileEmbedUrl(link.embedType, link.url)
                : null;
            return (
              <div
                key={link.id}
                className={`olnk-link ${appearance.layout.template === "bento" && index % 3 === 2 ? "col-span-2" : ""}`}
                data-olnk-tilt="link"
                data-hover={appearance.buttons.hover}
                data-press={appearance.buttons.press}
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
                    link.passwordHash ? `/unlock/${link.id}` : `/go/${link.id}`
                  }
                  target={link.passwordHash ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex w-full items-center gap-3 px-4 text-left font-black transition duration-200"
                  style={profileButtonStyle(appearance, custom)}
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
                  {link.passwordHash ? (
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
          <div className="order-[4] mt-9 rounded-3xl border border-current/15 bg-white/25 px-5 py-8 text-center text-sm font-semibold opacity-65 backdrop-blur">
            Bu profil yakında bağlantılarını paylaşacak.
          </div>
        )}
        {!appearance.advanced.removeBranding && (
          <div className="order-[6] mt-auto flex justify-center pt-14">
            <span className="rounded-full bg-white/45 px-4 py-2 backdrop-blur">
              <Brand compact />
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
