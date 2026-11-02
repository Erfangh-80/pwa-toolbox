"use client";

import type { ReactNode } from "react";

export type DataEntry = {
  label: string;
  value: ReactNode;
};

type DataListProps = {
  items: DataEntry[];
  columns?: 1 | 2;
};

export const DataList = ({ items, columns = 2 }: DataListProps) => (
  <dl
    className={`grid gap-px overflow-hidden rounded-lg border border-line bg-line/70 ${
      columns === 2 ? "sm:grid-cols-2" : ""
    }`}
  >
    {items.map((item) => (
      <div key={item.label} className="flex min-w-0 flex-col gap-0.5 bg-surface px-3 py-2">
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {item.label}
        </dt>
        <dd className="break-words font-mono text-xs text-ink">{item.value}</dd>
      </div>
    ))}
  </dl>
);
