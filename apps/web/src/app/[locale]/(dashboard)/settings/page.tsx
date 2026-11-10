import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@olnktr/ui";
import { getServerApi, requireSession } from "~/lib/server";
import { AccountDeletion } from "~/modules/settings/account-deletion";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  const t = await getTranslations("settings");
  const me = await (await getServerApi()).me.get();
  return (
    <div className="grid gap-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("preferences")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1 text-sm">
          <span>{me.name}</span>
          <span className="text-muted-foreground">{me.email}</span>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountDeletion scheduledFor={me.deletionScheduledFor?.toISOString() ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
