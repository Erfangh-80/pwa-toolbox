import { getLocale, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getDirection, isLocale } from "@/i18n/routing";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const locale = await getLocale();
  const dir = isLocale(locale) ? getDirection(locale) : "ltr";

  return (
    /*
     * Next renders `not-found` inside its error shell rather than the locale layout,
     * so language and direction are re-applied here to keep the Persian 404 RTL.
     */
    <div
      lang={locale}
      dir={dir}
      className="flex flex-1 items-center justify-center bg-grid px-4 py-20"
    >
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">404</p>
        <h1 className="mt-2 text-xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">{t("description")}</p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors duration-200 hover:brightness-110"
        >
          {t("back")}
        </Link>
      </div>
    </div>
  );
}
