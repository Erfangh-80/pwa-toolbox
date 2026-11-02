"use client";

import Link from "next/link";
import { useClientValue } from "@/lib/useClientValue";
import { useSupport } from "@/lib/useSupport";

import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice } from "./ui/Notice";

const SAMPLE_SHARE =
  "/share-target?title=PWA%20Toolbox&text=Shared%20from%20the%20dashboard&url=https%3A%2F%2Fexample.com";

export const ShareTargetCard = () => {
  const support = useSupport(() => "share" in navigator || "serviceWorker" in navigator);
  const origin = useClientValue(() => window.location.origin, "");

  return (
    <Card
      index={8}
      title="Share target"
      api="manifest.share_target"
      icon="share"
      support={support}
      description="Receive a link, text or file from the operating system share sheet and render it on a dedicated route."
      footnote="Registered in public/manifest.json as a GET share target → /share-target"
    >
      <DataList
        items={[
          { label: "Action", value: "/share-target" },
          { label: "Method", value: "GET" },
          { label: "Params", value: "title, text, url" },
          { label: "Origin", value: origin || "…" },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Link
          href="/share-target"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent/60 hover:text-accent"
        >
          Open target page
        </Link>
        <Link
          href={SAMPLE_SHARE}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-transparent px-4 text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
        >
          Simulate a share
        </Link>
      </div>

      <Notice>
        Install the app, then share a link from another app and pick &ldquo;PWA
        Toolbox&rdquo;. Shared values arrive as query parameters.
      </Notice>

      {support === "unsupported" ? (
        <Notice tone="warn">
          This browser exposes neither the Web Share API nor a service worker, so the
          share sheet will not list the app.
        </Notice>
      ) : null}
    </Card>
  );
};
