"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Icon } from "./ui/icons";
import { Notice } from "./ui/Notice";

const isSafeHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

export const ShareTargetView = () => {
  const searchParams = useSearchParams();
  const title = searchParams.get("title") ?? "";
  const text = searchParams.get("text") ?? "";
  const url = searchParams.get("url") ?? "";
  const hasPayload = Boolean(title || text || url);

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
          Shared payload
        </p>

        {hasPayload ? (
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Title
              </dt>
              <dd className="mt-1 break-words font-mono text-sm text-ink">
                {title || <span className="text-muted">—</span>}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Text
              </dt>
              <dd className="mt-1 whitespace-pre-wrap break-words font-mono text-sm text-ink">
                {text || <span className="text-muted">—</span>}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                URL
              </dt>
              <dd className="mt-1 break-words font-mono text-sm text-ink">
                {url ? (
                  isSafeHttpUrl(url) ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent underline decoration-accent/40 underline-offset-4 transition-colors duration-200 hover:decoration-accent"
                    >
                      {url}
                      <Icon name="external" className="size-3.5" />
                    </a>
                  ) : (
                    url
                  )
                ) : (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-4">
            <Notice tone="info">
              No share data in the query string. Try the &ldquo;Simulate a share&rdquo;
              link on the dashboard, or share a link from another app to this installed
              PWA.
            </Notice>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-accent-ink transition-colors duration-200 hover:brightness-110"
        >
          Back to dashboard
        </Link>
        <Link
          href="/share-target"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent/60 hover:text-accent"
        >
          Clear payload
        </Link>
      </div>
    </div>
  );
};
