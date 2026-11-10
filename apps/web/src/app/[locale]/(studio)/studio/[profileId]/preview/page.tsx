import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getContainer } from "@olnktr/api";
import { getServerApi, requireSession } from "~/lib/server";
import { ProfileView } from "~/modules/profile-renderer/profile-view";
import { toRenderBlocks } from "~/modules/studio/preview/render-blocks";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Draft preview: the unpublished draft rendered exactly like the public page.
 * Requires a session with read access to the profile (owner or teammate), so
 * a copied preview link only works for people who may see the draft.
 */
export default async function DraftPreviewPage({
  params,
}: {
  params: Promise<{ locale: string; profileId: string }>;
}) {
  const { locale, profileId } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  if (!UUID.test(profileId)) notFound();
  const api = await getServerApi();
  const preview = await api.editor.preview({ profileId }).catch(() => null);
  if (!preview) notFound();
  const t = await getTranslations("studio.previewPage");
  const host = new URL(getContainer().env.APP_URL).hostname;
  const { document } = preview;
  return (
    <div className="flex min-h-screen flex-col">
      <div
        role="status"
        className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-[#1c1d22] px-4 py-2 text-center text-xs text-[#ecedef]"
      >
        <span className="size-2 rounded-full bg-[#e8b04b]" aria-hidden="true" />
        {t("banner")}
      </div>
      <div className="flex-1">
        <ProfileView
          profile={{
            id: preview.profile.id,
            displayName: document.profile.displayName,
            bio: document.profile.bio || null,
            avatarMediaId: document.profile.avatarMediaId,
            coverMediaId: document.profile.coverMediaId,
          }}
          blocks={toRenderBlocks({
            ...document,
            blocks: document.blocks.filter((block) => block.isVisible),
          })}
          theme={preview.theme}
          mode="preview"
          embedHost={host}
        />
      </div>
    </div>
  );
}
