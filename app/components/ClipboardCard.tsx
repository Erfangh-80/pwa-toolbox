"use client";

import { useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button, TextField } from "./ui/Button";
import { Card } from "./ui/Card";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

const describeClipboardError = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Clipboard access denied. Grant permission in site settings and keep the tab focused.";
    }
    if (error.name === "SecurityError") {
      return "Clipboard access requires a secure (HTTPS) context.";
    }
    if (error.name === "NotFoundError") {
      return "The clipboard is empty or contains no text.";
    }
  }
  return describeError(error);
};

export const ClipboardCard = () => {
  const support = useSupport(
    () => "clipboard" in navigator && typeof navigator.clipboard.readText === "function",
  );
  const [draft, setDraft] = useState("Hello from PWA Toolbox");
  const [pasted, setPasted] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleCopy = async () => {
    setBusy(true);
    try {
      await navigator.clipboard.writeText(draft);
      setFeedback({ tone: "success", text: `Copied ${draft.length} character(s) to the clipboard.` });
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
      setFeedback(
        value
          ? { tone: "success", text: "Pasted the current clipboard text." }
          : { tone: "info", text: "The clipboard is empty." },
      );
    } catch (error) {
      setFeedback({ tone: "danger", text: describeClipboardError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      index={9}
      title="Clipboard"
      api="navigator.clipboard"
      icon="clipboard"
      support={support}
      description="Write text to the system clipboard and read it back. Both directions surface permission and security errors."
      footnote="Reading requires a user gesture plus clipboard-read permission in most browsers."
    >
      <TextField
        id="clipboard-text"
        label="Text to copy"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={support === "unsupported"}
        autoComplete="off"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          onClick={() => void handleCopy()}
          disabled={support !== "supported" || busy || draft.length === 0}
          aria-busy={busy}
        >
          Copy
        </Button>
        <Button
          onClick={() => void handlePaste()}
          disabled={support !== "supported" || busy}
        >
          Paste
        </Button>
      </div>

      <div className="rounded-lg border border-line">
        <p className="border-b border-line px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Clipboard content
        </p>
        <p className="min-h-16 px-3 py-2 break-words whitespace-pre-wrap font-mono text-xs text-ink">
          {pasted || <span className="text-muted">Nothing pasted yet.</span>}
        </p>
      </div>

      {support === "unsupported" ? (
        <Notice tone="warn">
          The async Clipboard API is unavailable. This usually means an insecure origin or
          an older browser.
        </Notice>
      ) : null}

      {feedback ? (
        <Notice tone={feedback.tone} announce>
          {feedback.text}
        </Notice>
      ) : null}
    </Card>
  );
};
