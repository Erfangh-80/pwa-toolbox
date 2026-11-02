"use client";

import { useEffect, useState } from "react";

import { useClientValue } from "@/lib/useClientValue";
import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type Feedback = { tone: NoticeTone; text: string };
type DisplayMode = "standalone" | "browser";

export const InstallCard = () => {
  const support = useSupport(
    () => "onbeforeinstallprompt" in window || "BeforeInstallPromptEvent" in window,
  );
  const mediaMatches = useClientValue(
    () => window.matchMedia("(display-mode: standalone)").matches,
    false,
  );
  const iosStandalone = useClientValue(() => navigator.standalone === true, false);

  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [modeOverride, setModeOverride] = useState<DisplayMode | null>(null);
  const [dismissedIntro, setDismissedIntro] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const detectedMode: DisplayMode = mediaMatches || iosStandalone ? "standalone" : "browser";
  const displayMode = modeOverride ?? detectedMode;
  const installed = displayMode === "standalone";

  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setModeOverride("standalone");
      }
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setDismissedIntro(false);
    };

    const handleInstalled = () => {
      setModeOverride("standalone");
      setPromptEvent(null);
      setFeedback({
        tone: "success",
        text: "App installed. Launch it from your home screen or app launcher.",
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standaloneQuery.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standaloneQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) {
      return;
    }

    setBusy(true);
    const captured = promptEvent;
    setPromptEvent(null);

    try {
      await captured.prompt();
      const choice = await captured.userChoice;
      setFeedback(
        choice.outcome === "accepted"
          ? {
              tone: "success",
              text: "Install accepted — the browser is adding the app to your device.",
            }
          : {
              tone: "info",
              text: "Install dismissed. The browser decides when to offer the prompt again.",
            },
      );
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const canPrompt = support === "supported" && promptEvent !== null;

  return (
    <Card
      index={1}
      title="Installability"
      api="beforeinstallprompt"
      icon="install"
      support={support}
      description="Capture the browser's install prompt and detect whether the app is already running in standalone mode."
      footnote="The prompt only fires over HTTPS with a valid manifest, icons and a registered service worker."
    >
      <DataList
        items={[
          { label: "Display mode", value: installed ? "standalone" : "browser" },
          {
            label: "Prompt event",
            value: promptEvent ? "captured" : support === "checking" ? "…" : "not captured",
          },
        ]}
      />

      {installed ? (
        <Notice tone="success">
          Installed — this window is already running as a standalone app.
        </Notice>
      ) : support === "unsupported" ? (
        <Notice tone="warn">
          This browser does not support programmatic installation. On iOS use Share →
          &ldquo;Add to Home Screen&rdquo;; Firefox installs through its own menu.
        </Notice>
      ) : support === "supported" && !promptEvent && !dismissedIntro ? (
        <Notice>
          Waiting for the browser to fire <code className="font-mono">beforeinstallprompt</code>.
          It usually needs a reload over HTTPS and a satisfied install criteria check.
        </Notice>
      ) : null}

      {feedback ? (
        <Notice tone={feedback.tone} announce>
          {feedback.text}
        </Notice>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          variant="primary"
          onClick={() => void handleInstall()}
          disabled={!canPrompt || busy}
          aria-busy={busy}
        >
          {busy ? "Prompting…" : "Install app"}
        </Button>
        {!installed && support === "supported" ? (
          <Button
            variant="ghost"
            onClick={() => {
              setDismissedIntro(true);
              setFeedback({
                tone: "info",
                text: "Installability needs a service worker and manifest served over HTTPS.",
              });
            }}
          >
            Why disabled?
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
