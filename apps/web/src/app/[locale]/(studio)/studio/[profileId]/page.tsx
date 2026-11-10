import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getServerApi, requireSession } from "~/lib/server";
import { StudioApp } from "~/modules/studio/shell/studio-app";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("studio");
  return { title: t("pageTitle"), robots: { index: false, follow: false } };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Creator Studio: loads the draft (created from live content on first visit) and the theme catalogue. */
export default async function StudioPage({
  params,
}: {
  params: Promise<{ locale: string; profileId: string }>;
}) {
  const { locale, profileId } = await params;
  setRequestLocale(locale);
  const session = await requireSession(locale);
  if (!UUID.test(profileId)) notFound();
  const api = await getServerApi();
  const state = await api.editor.state({ profileId }).catch(() => null);
  if (!state) notFound();
  const themes = await api.themes.list({ organizationId: state.profile.organizationId });
  return (
    <StudioApp
      initial={state}
      themes={themes}
      user={{ email: session.user.email, name: session.user.name }}
    />
  );
}
