"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useClientValue } from "@/lib/useClientValue";
import { useSupport } from "@/lib/useSupport";

import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice } from "./ui/Notice";

export const ShareTargetCard = () => {
  const t = useTranslations("cards.share");
  const support = useSupport(() => "share" in navigator || "serviceWorker" in navigator);
  const origin = useClientValue(() => window.location.origin, "");

  return (
    <Card
      index={8}
      namespace="cards.share"
      api="manifest.share_target"
      icon="share"
      support={support}
    >
      <DataList
        items={[
          { label: t("action"), value: "/share-target" },
          { label: t("method"), value: "GET" },
          { label: t("params"), value: "title, text, url" },
          { label: t("origin"), value: origin || "…" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/share-target"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent/60 hover:text-accent"
        >
          {t("openTarget")}
        </Link>
        <Link
          href="/share-target?title=PWA%20Toolbox&text=Shared%20from%20the%20dashboard&url=https%3A%2F%2Fexample.com"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-transparent px-4 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
        >
          {t("simulate")}
        </Link>
      </div>

      <Notice>{t("notice")}</Notice>

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
      ) : null}
    </Card>
  );
};
