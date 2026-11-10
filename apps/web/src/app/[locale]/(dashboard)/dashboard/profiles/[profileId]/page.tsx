import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@olnktr/ui";
import { getServerApi, requireSession } from "~/lib/server";
import { Link } from "~/i18n/navigation";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; profileId: string }>;
}) {
  const { locale, profileId } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) notFound();
  const api = await getServerApi();
  const profile = await api.profiles.get({ profileId }).catch(() => null);
  if (!profile) notFound();
  const t = await getTranslations("profile");
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10);
  const analytics = await api.analytics.summary({ profileId, from, to });
  const publicPath = locale === "tr" ? `/tr/${profile.username}` : `/${profile.username}`;
  const numbers = new Intl.NumberFormat(locale);

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold">{profile.displayName}</h1>
          <a
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            href={publicPath}
            data-testid="public-url"
          >
            {t("publicUrl")}: {publicPath}
          </a>
        </div>
        <Link
          href={`/studio/${profile.id}`}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          {t("openStudio")}
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("analytics")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["views", t("views"), analytics.totals["profile.view"].count],
            ["visitors", t("visitors"), analytics.totals["profile.view"].uniqueVisitors],
            ["clicks", t("clicks"), analytics.totals["link.click"].count],
          ].map(([key, label, value]) => (
            <div key={String(key)} className="grid gap-1">
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-2xl font-semibold" data-testid={`analytics-${String(key)}`}>
                {numbers.format(Number(value))}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
