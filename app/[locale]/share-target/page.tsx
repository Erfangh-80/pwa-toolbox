import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ShareTargetView } from "../../components/ShareTargetView";
import { Icon } from "../../components/ui/icons";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: PageProps<"/[locale]/share-target">["params"];
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "meta.shareTarget" });
  return { title: t("title"), description: t("description") };
}

export default async function ShareTargetPage({
  params,
}: PageProps<"/[locale]/share-target">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("shareTargetPage");

  return (
    <div className="flex flex-1 flex-col bg-grid">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors duration-200 hover:text-accent"
          >
            <Icon name="arrow" className="size-3.5 rotate-180 rtl:rotate-0" />
            {t("back")}
          </Link>
          <LanguageSwitcher />
        </div>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {t.rich("description", {
            code: (chunks) => <code className="font-mono text-ink">{chunks}</code>,
          })}
        </p>

        <div className="mt-8">
          <Suspense
            fallback={
              <div
                className="rounded-2xl border border-line bg-surface p-5 font-mono text-xs text-muted shadow-card"
                aria-busy="true"
              >
                {t("loading")}
              </div>
            }
          >
            <ShareTargetView />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
