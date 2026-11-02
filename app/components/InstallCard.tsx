"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useClientValue } from "@/lib/useClientValue";
import { useSupport } from "@/lib/useSupport";

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
  const t = useTranslations("cards.install");
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
      setFeedback({ tone: "success", text: t("installed") });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    standaloneQuery.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      standaloneQuery.removeEventListener("change", handleChange);
    };
  }, [t]);

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
      setFeedback({
        tone: choice.outcome === "accepted" ? "success" : "info",
        text: choice.outcome === "accepted" ? t("accepted") : t("dismissed"),
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: error instanceof Error ? error.message : t("whyDisabledNotice"),
      });
    } finally {
      setBusy(false);
    }
  };

  const canPrompt = support === "supported" && promptEvent !== null;

  return (
    <Card
      index={1}
      namespace="cards.install"
      api="beforeinstallprompt"
      icon="install"
      support={support}
    >
      <DataList
        items={[
          {
            label: t("displayMode"),
            value: installed ? t("standalone") : t("browser"),
          },
          {
            label: t("promptEvent"),
            value: promptEvent ? t("captured") : t("notCaptured"),
          },
        ]}
      />

      {installed ? (
        <Notice tone="success">{t("installed")}</Notice>
      ) : support === "unsupported" ? (
        <Notice tone="warn">{t("unsupported")}</Notice>
      ) : support === "supported" && !promptEvent && !dismissedIntro ? (
        <Notice>
          {t.rich("waiting", {
            code: (chunks) => <code className="font-mono">{chunks}</code>,
          })}
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
          {busy ? t("prompting") : t("install")}
        </Button>
        {!installed && support === "supported" ? (
          <Button
            variant="ghost"
            onClick={() => {
              setDismissedIntro(true);
              setFeedback({ tone: "info", text: t("whyDisabledNotice") });
            }}
          >
            {t("whyDisabled")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
};
