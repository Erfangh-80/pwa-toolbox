"use client";

import type { ReactNode } from "react";

export type NoticeTone = "info" | "success" | "warn" | "danger";

const tones: Record<NoticeTone, string> = {
  info: "border-line bg-surface-raised text-muted",
  success: "border-accent/40 bg-accent/10 text-accent",
  warn: "border-warn/40 bg-warn/10 text-warn",
  danger: "border-danger/40 bg-danger/10 text-danger",
};

type NoticeProps = {
  tone?: NoticeTone;
  children: ReactNode;
  /** Set for asynchronously produced messages so screen readers announce them. */
  announce?: boolean;
  className?: string;
};

export const Notice = ({
  tone = "info",
  children,
  announce = false,
  className = "",
}: NoticeProps) => (
  <p
    role={tone === "danger" ? "alert" : announce ? "status" : undefined}
    className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${tones[tone]} ${className}`}
  >
    {children}
  </p>
);
