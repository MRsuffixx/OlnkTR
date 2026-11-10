import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { LoginForm } from "~/modules/auth/login-form";

export async function generateMetadata() {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("auth.login");
  return (
    <section className="grid gap-6">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        {t.has("description") ? (
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        ) : null}
      </header>
      <Suspense>
        <LoginForm />
      </Suspense>
    </section>
  );
}
