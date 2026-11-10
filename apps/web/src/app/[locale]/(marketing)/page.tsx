import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@olnktr/ui";
import { LocaleSwitcher } from "~/components/locale-switcher";
import { Link } from "~/i18n/navigation";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing");
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-4 py-16">
      <p className="text-sm font-semibold tracking-wide">OlnkTR</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("title")}</h1>
      <p className="max-w-xl text-lg text-muted-foreground">{t("subtitle")}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/register">{t("getStarted")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      </div>
      <LocaleSwitcher />
    </main>
  );
}
