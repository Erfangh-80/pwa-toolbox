"use client";

import { useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button, TextField } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

const describeBadgeError = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "The badge was rejected. Install the app first (badging needs an installed PWA).";
    }
    if (error.name === "NotSupportedError") {
      return "This platform does not display app badges.";
    }
  }
  return describeError(error);
};

export const BadgeCard = () => {
  const support = useSupport(() => "setAppBadge" in navigator);
  const [value, setValue] = useState("3");
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleSet = async () => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      setFeedback({ tone: "warn", text: "Enter a whole number of 0 or greater." });
      return;
    }

    setBusy(true);
    try {
      if (!navigator.setAppBadge) {
        throw new Error("The Badging API is not available.");
      }
      await navigator.setAppBadge(parsed);
      setActiveBadge(parsed);
      setFeedback({
        tone: "success",
        text: parsed === 0 ? "Badge cleared with setAppBadge(0)." : `Badge set to ${parsed}.`,
      });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeBadgeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleClear = async () => {
    setBusy(true);
    try {
      if (!navigator.clearAppBadge) {
        throw new Error("The Badging API is not available.");
      }
      await navigator.clearAppBadge();
      setActiveBadge(null);
      setFeedback({ tone: "success", text: "Badge cleared." });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeBadgeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      index={12}
      title="App badging"
      api="navigator.setAppBadge"
      icon="badge"
      support={support}
      description="Set or clear the numeric badge on the installed app icon — useful for unread counts."
      footnote="Supported on Chromium (desktop + Android) for installed PWAs; iOS Safari ignores it."
    >
      <TextField
        id="badge-value"
        label="Badge value"
        type="number"
        min={0}
        max={9999}
        step={1}
        inputMode="numeric"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={support === "unsupported"}
      />

      <DataList
        items={[
          {
            label: "Badging API",
            value:
              support === "checking"
                ? "checking…"
                : support === "supported"
                  ? "available"
                  : "unavailable",
          },
          { label: "Active badge", value: activeBadge === null ? "none" : String(activeBadge) },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">
          navigator.setAppBadge is unavailable. Badging requires an installed PWA on a
          supporting platform.
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
          onClick={() => void handleSet()}
          disabled={support !== "supported" || busy}
          aria-busy={busy}
        >
          Set badge
        </Button>
        <Button
          variant="danger"
          onClick={() => void handleClear()}
          disabled={support !== "supported" || busy}
        >
          Clear badge
        </Button>
      </div>
    </Card>
  );
};
