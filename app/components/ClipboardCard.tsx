"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button, TextField } from "./ui/Button";
import { Card } from "./ui/Card";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

export const ClipboardCard = () => {
  const t = useTranslations("cards.clipboard");
  const tCommon = useTranslations("common");
  const support = useSupport(
    () => "clipboard" in navigator && typeof navigator.clipboard.readText === "function",
  );
  const [draft, setDraft] = useState("Hello from PWA Toolbox");
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const describeClipboardError = (error: unknown): string => {
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        return t("errorDenied");
      }
      if (error.name === "SecurityError") {
        return t("errorSecurity");
      }
      if (error.name === "NotFoundError") {
        return t("errorEmpty");
      }
    }
    return tCommon("browserError", { message: describeError(error) });
  };

  const handleCopy = async () => {
    setBusy(true);
    try {
      await navigator.clipboard.writeText(draft);
      setFeedback({ tone: "success", text: t("copied", { count: draft.length }) });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeClipboardError(error) });
    } finally {
      setBusy(false);
    }
  };

  const handlePaste = async () => {
    setBusy(true);
    try {
      const value = await navigator.clipboard.readText();
      setPasted(value);
      setFeedback({
        tone: value ? "success" : "info",
        text: value ? t("pasted") : t("clipboardEmpty"),
      });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeClipboardError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      index={9}
      namespace="cards.clipboard"
      api="navigator.clipboard"
      icon="clipboard"
      support={support}
    >
      <TextField
        id="clipboard-text"
        label={t("label")}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={support === "unsupported"}
        autoComplete="off"
        dir="auto"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => void handleCopy()}
          disabled={support !== "supported" || busy || draft.length === 0}
          aria-busy={busy}
        >
          {t("copy")}
        </Button>
        <Button onClick={() => void handlePaste()} disabled={support !== "supported" || busy}>
          {t("paste")}
        </Button>
      </div>

      <div className="rounded-lg border border-line">
        <p className="border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {t("contentTitle")}
        </p>
        <p className="bidi-plain min-h-16 px-3 py-2 break-words whitespace-pre-wrap font-mono text-xs text-ink">
          {pasted || <span className="text-muted">{t("empty")}</span>}
        </p>
      </div>

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
      ) : null}

      {feedback ? (
        <Notice tone={feedback.tone} announce>
          {feedback.text}
        </Notice>
      ) : null}
    </Card>
  );
};
