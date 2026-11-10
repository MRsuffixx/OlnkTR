import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "~/i18n/routing";
import { TRPCReactProvider } from "~/lib/trpc/client";
import "~/styles/globals.css";

export const metadata: Metadata = {
  title: { default: "OlnkTR", template: "%s · OlnkTR" },
  description: "Open-source link-in-bio platform",
  icons: { icon: "/favicon.svg" },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  // Reading the nonce opts every page into dynamic rendering, which the nonce-based CSP requires.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen antialiased" data-nonce-present={nonce ? "true" : "false"}>
        <NextIntlClientProvider>
          <TRPCReactProvider locale={locale}>{children}</TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
