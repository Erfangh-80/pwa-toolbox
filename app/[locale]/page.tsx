import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

import { BadgeCard } from "../components/BadgeCard";
import { BluetoothCard } from "../components/BluetoothCard";
import { ClipboardCard } from "../components/ClipboardCard";
import { FileSystemCard } from "../components/FileSystemCard";
import { GeoCard } from "../components/GeoCard";
import { InstallCard } from "../components/InstallCard";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { NetworkCard } from "../components/NetworkCard";
import { OfflineCard } from "../components/OfflineCard";
import { PushCard } from "../components/PushCard";
import { ShareTargetCard } from "../components/ShareTargetCard";
import { SyncCard } from "../components/SyncCard";
import { UsbCard } from "../components/UsbCard";
import { Icon } from "../components/ui/icons";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: PageProps<"/[locale]">["params"];
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return { title: t("title"), description: t("description") };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tShare = await getTranslations("cards.share");

  const stats = [
    { label: t("stats.sections"), value: t("stats.sectionsValue") },
    { label: t("stats.detection"), value: t("stats.detectionValue") },
    { label: t("stats.queue"), value: t("stats.queueValue") },
    { label: t("stats.origin"), value: t("stats.originValue") },
  ];

  return (
    <div className="flex flex-1 flex-col bg-grid">
      <header className="border-b border-line bg-canvas/80 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-8 flex justify-end">
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {t("eyebrow")}
              </p>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {t("title")}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                {t("description")}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Link
                href="/share-target"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent/60 hover:text-accent"
              >
                {tShare("openTarget")}
                <Icon name="arrow" className="size-4 rtl:-scale-x-100" />
              </Link>
              <p className="font-mono text-[11px] text-muted">{t("stack")}</p>
            </div>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line/70 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-surface px-4 py-3">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                  {stat.label}
                </dt>
                <dd className="mt-1 font-mono text-sm text-ink">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {t("cardsTitle")}
          </h2>
          <p className="font-mono text-[11px] text-muted">{t("cardsMeta")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <InstallCard />
          <OfflineCard />
          <SyncCard />
          <PushCard />
          <GeoCard />
          <BluetoothCard />
          <UsbCard />
          <ShareTargetCard />
          <ClipboardCard />
          <FileSystemCard />
          <NetworkCard />
          <BadgeCard />
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-6 text-[11px] leading-relaxed text-muted sm:px-6 lg:px-8">
          <p className="font-mono uppercase tracking-[0.16em]">{t("notesTitle")}</p>
          <p className="max-w-3xl">
            {t.rich("notesBody", {
              code: (chunks) => (
                <code className="font-mono text-ink">{chunks}</code>
              ),
            })}
          </p>
        </div>
      </footer>
    </div>
  );
}
