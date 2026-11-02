import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ShareTargetView } from "../components/ShareTargetView";

export const metadata: Metadata = {
  title: "Share target",
  description: "Payload received from the operating system share sheet.",
};

const ShareTargetFallback = () => (
  <div
    className="rounded-2xl border border-line bg-surface p-5 font-mono text-xs text-muted shadow-card"
    aria-busy="true"
  >
    Reading shared payload…
  </div>
);

export default function ShareTargetPage() {
  return (
    <div className="flex flex-1 flex-col bg-grid">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors duration-200 hover:text-accent"
        >
          ← PWA Toolbox
        </Link>

        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Share target
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          This route receives the <code className="font-mono text-ink">title</code>,{" "}
          <code className="font-mono text-ink">text</code> and{" "}
          <code className="font-mono text-ink">url</code> parameters declared in{" "}
          <code className="font-mono text-ink">manifest.share_target</code>.
        </p>

        <div className="mt-8">
          <Suspense fallback={<ShareTargetFallback />}>
            <ShareTargetView />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
