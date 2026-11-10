import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { cache } from "react";
import { getContainer } from "@olnktr/api";
import { getUsernameProblem, normalizeUsername } from "@olnktr/validators";
import { AnalyticsBeacon } from "~/modules/public-profile/analytics-beacon";
import { BlockRenderer } from "~/modules/public-profile/block-renderer";
import { AVATAR_SHAPE, MAX_WIDTH, themeStyle } from "~/modules/public-profile/theme-style";

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
  const theme = profile.theme;

  return (
    <div
      style={{
        ...themeStyle(theme),
        background: "var(--profile-bg)",
        color: "var(--profile-text)",
        fontFamily: "var(--profile-font)",
      }}
      className="min-h-screen"
    >
      <main
        className={`mx-auto flex flex-col items-center gap-4 px-4 py-12 ${MAX_WIDTH[theme.layout.maxWidth]}`}
        data-testid="public-profile"
      >
        {profile.avatarMediaId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${profile.avatarMediaId}`}
            alt=""
            className={`size-24 object-cover ${AVATAR_SHAPE[theme.layout.avatarShape]}`}
          />
        ) : null}
        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
        {profile.bio ? (
          <p className="whitespace-pre-line text-center text-[var(--profile-muted)]">
            {profile.bio}
          </p>
        ) : null}
        <div className="mt-4 grid w-full gap-3">
          {profile.blocks.map((block) => (
            <BlockRenderer key={block.id} block={block} theme={theme} />
          ))}
        </div>
        {profile.showBranding ? (
          <a
            href={locale === "tr" ? "/tr" : "/"}
            className="mt-8 text-xs text-[var(--profile-muted)] hover:underline"
          >
            {t("poweredBy")}
          </a>
        ) : null}
      </main>
      <AnalyticsBeacon profileId={profile.id} />
    </div>
  );
}
