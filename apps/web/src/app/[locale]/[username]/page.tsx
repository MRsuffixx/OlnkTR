import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";
import { getContainer } from "@olnktr/api";
import { getUsernameProblem, normalizeUsername } from "@olnktr/validators";
import { ProfileView } from "~/modules/profile-renderer/profile-view";
import { AnalyticsBeacon } from "~/modules/public-profile/analytics-beacon";

/**
 * Public profile page. Resolution goes through the PublicProfileLookup
 * boundary ({ kind: "username" }); a future custom-domain resolver plugs in
 * there without changing this page's rendering.
 */
const loadProfile = cache(async (username: string) => {
  const normalized = normalizeUsername(decodeURIComponent(username));
  if (getUsernameProblem(normalized)) return null;
  return getContainer().core.publicProfiles.resolve({ kind: "username", username: normalized });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const profile = await loadProfile((await params).username);
  if (!profile) return { robots: { index: false } };
  return {
    title: profile.seo.title ?? profile.displayName,
    description: profile.seo.description ?? profile.bio ?? undefined,
    robots: profile.seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: profile.seo.title ?? profile.displayName,
      description: profile.seo.description ?? profile.bio ?? undefined,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  setRequestLocale(locale);
  const profile = await loadProfile(username);
  if (!profile) notFound();
  const t = await getTranslations("common");
  const embedHost = new URL(getContainer().env.APP_URL).hostname;

  return (
    <div className="min-h-screen">
      <ProfileView
        profile={profile}
        theme={profile.theme}
        mode="public"
        embedHost={embedHost}
        blocks={profile.blocks.map((block) => ({
          id: block.id,
          type: block.type,
          config: block.config,
          appearance: block.appearance,
          link: block.link
            ? {
                id: block.link.id,
                title: block.link.title,
                url: block.link.url,
                description:
                  typeof block.link.metadata.description === "string"
                    ? block.link.metadata.description
                    : undefined,
                thumbnailMediaId:
                  typeof block.link.metadata.thumbnailMediaId === "string"
                    ? block.link.metadata.thumbnailMediaId
                    : null,
                openInNewTab: block.link.metadata.openInNewTab === true,
                trackClicks: block.link.metadata.trackClicks !== false,
              }
            : undefined,
        }))}
        branding={
          profile.showBranding ? (
            <a href={locale === "tr" ? "/tr" : "/"} className="op-branding">
              {t("poweredBy")}
            </a>
          ) : null
        }
      />
      <AnalyticsBeacon profileId={profile.id} />
    </div>
  );
}
