import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, isLocale, LOCALES } from "@olnktr/config/constants";

/**
 * Locale routing: English is the default (no prefix), Turkish lives under /tr.
 * The default can be changed at build time with NEXT_PUBLIC_DEFAULT_LOCALE.
 */
const configured = process.env.NEXT_PUBLIC_DEFAULT_LOCALE;

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: isLocale(configured) ? configured : DEFAULT_LOCALE,
  localePrefix: "as-needed",
});
