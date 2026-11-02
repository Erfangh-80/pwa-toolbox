import { defineRouting } from "next-intl/routing";

/**
 * Single source of truth for the supported locales.
 *
 * `localePrefix: "always"` keeps `/en/...` and `/fa/...` explicit so the language
 * of a page is always visible in the URL (and cached/crawled separately).
 */
export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    // Remember the choice for a year so returning visits skip detection.
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type Locale = (typeof routing.locales)[number];

export const defaultLocale: Locale = routing.defaultLocale;

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && routing.locales.includes(value as Locale);

/**
 * Text direction for a locale. `fa` is right-to-left; everything else is LTR.
 */
export const getDirection = (locale: Locale): "rtl" | "ltr" =>
  locale === "fa" ? "rtl" : "ltr";
