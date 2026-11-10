import { getTranslations, setRequestLocale } from "next-intl/server";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@olnktr/ui";
import { Link } from "~/i18n/navigation";
import { getServerApi, requireSession } from "~/lib/server";
import { CreateProfileForm } from "~/modules/profiles/create-profile-form";

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession(locale);
  const t = await getTranslations("dashboard");
  const api = await getServerApi();
  const [profiles, billing] = await Promise.all([api.profiles.list({}), api.billing.summary({})]);
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Badge variant="secondary">{t("plan", { plan: billing.plan.key })}</Badge>
      </div>
      {profiles.length === 0 ? <p className="text-muted-foreground">{t("empty")}</p> : null}
      <ul className="grid gap-3" data-testid="profile-list">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <Card>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="grid gap-1">
                  <span className="font-medium">{profile.displayName}</span>
                  <span className="text-sm text-muted-foreground">/{profile.username}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={profile.status === "published" ? "default" : "outline"}>
                    {t(profile.status)}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/profiles/${profile.id}`}>{t("manage")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      <Card>
        <CardHeader>
          <CardTitle>{t("createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
