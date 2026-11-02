"use client";

import type { ReactNode } from "react";

import type { SupportState } from "@/lib/useSupport";

import { Icon, type IconName } from "./icons";

const pillStyles: Record<
  SupportState,
  { label: string; dot: string; text: string; border: string }
> = {
  checking: {
    label: "Checking",
    dot: "bg-muted",
    text: "text-muted",
    border: "border-line",
  },
  supported: {
    label: "Supported",
    dot: "bg-accent",
    text: "text-accent",
    border: "border-accent/40",
  },
  unsupported: {
    label: "Not supported",
    dot: "bg-warn",
    text: "text-warn",
    border: "border-warn/40",
  },
};

export const StatusPill = ({ state }: { state: SupportState }) => {
  const style = pillStyles[state];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${style.border} ${style.text}`}
    >
      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {style.label}
    </span>
  );
};

type CardProps = {
  index: number;
  title: string;
  api: string;
  description: string;
  icon: IconName;
  support: SupportState;
  children: ReactNode;
  footnote?: ReactNode;
};

export const Card = ({
  index,
  title,
  api,
  description,
  icon,
  support,
  children,
  footnote,
}: CardProps) => {
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
              S{String(index).padStart(2, "0")} · {api}
            </p>
            <h2 id={titleId} className="truncate text-[15px] font-semibold text-ink">
              {title}
            </h2>
          </div>
        </div>
        <StatusPill state={support} />
      </header>

      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>

      <div className="mt-4 flex flex-1 flex-col gap-3">{children}</div>

      {footnote ? (
        <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] leading-relaxed text-muted/80">
          {footnote}
        </p>
      ) : null}
    </section>
  );
};
