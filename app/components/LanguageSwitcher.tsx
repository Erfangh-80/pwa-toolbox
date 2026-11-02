"use client";

import { useLocale, useTranslations } from "next-intl";

import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * EN / FA toggle.
 *
 * Switches to the other locale while keeping the current path and query string, so
 * `/en/share-target?url=…` becomes `/fa/share-target?url=…`. next-intl's router
 * rewrites the locale prefix and syncs the `NEXT_LOCALE` cookie.
 */
export const LanguageSwitcher = ({ className = "" }: { className?: string }) => {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (next: Locale) => {
    if (next === locale) {
      return;
    }

    const search =
      typeof window === "undefined" ? "" : window.location.search.replace(/^\?/, "");
    const query = Object.fromEntries(new URLSearchParams(search));

    router.replace(
      Object.keys(query).length > 0 ? { pathname, query } : pathname,
      { locale: next },
    );
  };

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-0.5 ${className}`}
    >
      {routing.locales.map((candidate) => {
        const active = candidate === locale;
        const label = t(candidate);

        return (
          <button
            key={candidate}
            type="button"
            lang={candidate}
            aria-current={active ? "true" : undefined}
            aria-label={active ? label : t("switchTo", { language: label })}
            onClick={() => switchTo(candidate)}
            className={`min-h-9 min-w-11 cursor-pointer rounded-full px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-200 ${
              active
                ? "bg-accent text-accent-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            {candidate}
          </button>
        );
      })}
    </div>
  );
};
