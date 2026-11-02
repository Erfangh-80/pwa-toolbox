"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button, TextField } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

export const BadgeCard = () => {
  const t = useTranslations("cards.badge");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const support = useSupport(() => "setAppBadge" in navigator);
  const [value, setValue] = useState("3");
  const [activeBadge, setActiveBadge] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const describeBadgeError = (error: unknown): string => {
    if (error instanceof DOMException) {
      if (error.name === "NotAllowedError") {
        return t("errorRejected");
      }
      if (error.name === "NotSupportedError") {
        return t("errorUnsupported");
      }
    }
    return tCommon("browserError", { message: describeError(error) });
  };

  const handleSet = async () => {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 0) {
      setFeedback({ tone: "warn", text: t("errorInvalid") });
      return;
    }

    setBusy(true);
    try {
      if (!navigator.setAppBadge) {
        throw new Error(t("unavailable"));
      }
      await navigator.setAppBadge(parsed);
      setActiveBadge(parsed);
      setFeedback({
        tone: "success",
        text: parsed === 0 ? t("setZero") : t("setValue", { value: format.number(parsed) }),
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
        throw new Error(t("unavailable"));
      }
      await navigator.clearAppBadge();
      setActiveBadge(null);
      setFeedback({ tone: "success", text: t("cleared") });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeBadgeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card index={12} namespace="cards.badge" api="navigator.setAppBadge" icon="badge" support={support}>
      <TextField
        id="badge-value"
        label={t("valueLabel")}
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
            label: t("api"),
            value:
              support === "checking"
                ? tCommon("checkingValue")
                : support === "supported"
                  ? tCommon("available")
                  : tCommon("unavailable"),
          },
          {
            label: t("active"),
            value:
              activeBadge === null ? tCommon("none") : format.number(activeBadge),
          },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
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
          {t("set")}
        </Button>
        <Button
          variant="danger"
          onClick={() => void handleClear()}
          disabled={support !== "supported" || busy}
        >
          {t("clear")}
        </Button>
      </div>
    </Card>
  );
};
