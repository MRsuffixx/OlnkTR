"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "~/i18n/navigation";
import { routing } from "~/i18n/routing";

export function LocaleSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      {t("language")}
      <select
        className="rounded-md border border-border bg-background px-2 py-1"
        value={locale}
        onChange={(event) => router.replace(pathname, { locale: event.target.value })}
      >
        {routing.locales.map((value) => (
          <option key={value} value={value}>
            {value === "tr" ? "Türkçe" : "English"}
          </option>
        ))}
      </select>
    </label>
  );
}
