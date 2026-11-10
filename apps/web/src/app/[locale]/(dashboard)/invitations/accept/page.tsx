import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireSession } from "~/lib/server";
import { Alert } from "@olnktr/ui";
import { AcceptInvitation } from "~/modules/organizations/accept-invitation";

export default async function AcceptInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  const { token } = await searchParams;
  const t = await getTranslations("invitations");
  return (
    <div className="grid max-w-md gap-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      {token ? (
        <AcceptInvitation token={token} />
      ) : (
        <Alert variant="destructive">{t("missingToken")}</Alert>
      )}
    </div>
  );
}
