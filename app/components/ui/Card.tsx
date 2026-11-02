"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { SupportState } from "@/lib/useSupport";

import { Icon, type IconName } from "./icons";

const pillStyles: Record<SupportState, { dot: string; text: string; border: string }> = {
  checking: {
    dot: "bg-muted",
    text: "text-muted",
    border: "border-line",
  },
  supported: {
    dot: "bg-accent",
    text: "text-accent",
    border: "border-accent/40",
  },
  unsupported: {
    dot: "bg-warn",
    text: "text-warn",
    border: "border-warn/40",
  },
};

export const StatusPill = ({ state }: { state: SupportState }) => {
  const t = useTranslations("common");
  const style = pillStyles[state];
  const label =
    state === "checking"
      ? t("checking")
      : state === "supported"
        ? t("supported")
        : t("notSupported");

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${style.border} ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};

type CardProps = {
  index: number;
  /** Message namespace with `title`, `description` and `footnote` keys. */
  namespace: string;
  api: string;
  icon: IconName;
  support: SupportState;
  children: ReactNode;
  /** Values for ICU placeholders that appear in the `footnote` message. */
  footnoteValues?: Record<string, string | number>;
};

export const Card = ({
  index,
  namespace,
  api,
  icon,
  support,
  children,
  footnoteValues,
}: CardProps) => {
  const t = useTranslations(namespace);
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const titleId = `card-${index}-title`;

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors duration-200 hover:border-line-strong"
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-raised text-accent">
            <Icon name={icon} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              {tCommon("cardEyebrow", {
                // Localises the ordinal too: "01" in English, "۰۱" in Persian.
                index: format.number(index, { minimumIntegerDigits: 2 }),
                api,
              })}
            </p>
            <h2 id={titleId} className="truncate text-[15px] font-semibold text-ink">
              {t("title")}
            </h2>
          </div>
        </div>
        <StatusPill state={support} />
      </header>

      <p className="mt-3 text-sm leading-relaxed text-muted">{t("description")}</p>

      <div className="mt-4 flex flex-1 flex-col gap-3">{children}</div>

      <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] leading-relaxed text-muted/80">
        {t("footnote", footnoteValues)}
      </p>
    </section>
  );
};
