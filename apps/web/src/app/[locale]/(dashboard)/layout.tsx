import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { LocaleSwitcher } from "~/components/locale-switcher";
import { Link, redirect } from "~/i18n/navigation";
import { getSession } from "~/lib/server";
import { SignOutButton } from "~/modules/auth/sign-out-button";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getSession();
  if (!session) return redirect({ href: "/login", locale });
  const t = await getTranslations("nav");
  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-3 text-sm">
          <Link href="/dashboard" className="font-semibold">
            OlnkTR
          </Link>
          <Link href="/dashboard">{t("dashboard")}</Link>
          <Link href="/settings/billing">{t("billing")}</Link>
          <Link href="/settings">{t("settings")}</Link>
          <span className="ml-auto flex items-center gap-3">
            <span className="hidden text-muted-foreground sm:inline" data-testid="current-user">
              {session.user.email}
            </span>
            <LocaleSwitcher />
            <SignOutButton />
          </span>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
