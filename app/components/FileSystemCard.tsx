"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

const MAX_PREVIEW = 20_000;

const TEXT_TYPES: ToolboxFilePickerType[] = [
  {
    description: "Text files",
    accept: {
      "text/plain": [".txt", ".md", ".json", ".csv", ".log"],
    },
  },
];

const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === "AbortError";

export const FileSystemCard = () => {
  const t = useTranslations("cards.fileSystem");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const support = useSupport(() => "showOpenFilePicker" in window);
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [busy, setBusy] = useState<"open" | "save" | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleOpen = async () => {
    setBusy("open");
    setFeedback(null);

    try {
      const picker = window.showOpenFilePicker;
      if (!picker) {
        throw new Error(t("unavailable"));
      }

      const [handle] = await picker({ multiple: false, types: TEXT_TYPES });
      if (!handle) {
        return;
      }

      const file = await handle.getFile();
      const text = await file.text();

      setFileName(file.name);
      setContent(text.slice(0, MAX_PREVIEW));
      setTruncated(text.length > MAX_PREVIEW);
      setFeedback({
        tone: "success",
        text: t("read", {
          name: file.name,
          size: format.number(file.size),
        }),
      });
    } catch (error) {
      setFeedback(
        isAbort(error)
          ? { tone: "info", text: t("openCancelled") }
          : {
              tone: "danger",
              text: tCommon("browserError", { message: describeError(error) }),
            },
      );
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async () => {
    setBusy("save");
    setFeedback(null);

    try {
      const picker = window.showSaveFilePicker;
      if (!picker) {
        throw new Error(t("unavailable"));
      }

      const handle = await picker({
        suggestedName: fileName ?? "pwa-toolbox.txt",
        types: TEXT_TYPES,
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      setFileName(handle.name);
      setFeedback({ tone: "success", text: t("saved", { name: handle.name }) });
    } catch (error) {
      setFeedback(
        isAbort(error)
          ? { tone: "info", text: t("saveCancelled") }
          : {
              tone: "danger",
              text: tCommon("browserError", { message: describeError(error) }),
            },
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card
      index={10}
      namespace="cards.fileSystem"
      api="showOpenFilePicker"
      icon="file"
      support={support}
    >
      <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2">
        <span className="bidi-plain truncate font-mono text-xs text-ink">
          {fileName ?? t("noFile")}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {t("chars", { count: content.length })}
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="file-content"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
        >
          {t("contentLabel")}
        </label>
        <textarea
          id="file-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          spellCheck={false}
          dir="auto"
          placeholder={t("placeholder")}
          disabled={support === "unsupported"}
          className="w-full resize-y rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-xs leading-relaxed text-ink transition-colors duration-200 placeholder:text-muted/50 focus:border-accent disabled:opacity-50"
        />
        {truncated ? (
          <p className="text-[11px] text-warn">
            {t("truncated", { count: format.number(MAX_PREVIEW) })}
          </p>
        ) : null}
      </div>

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
          onClick={() => void handleOpen()}
          disabled={support !== "supported" || busy !== null}
          aria-busy={busy === "open"}
        >
          {busy === "open" ? t("opening") : t("open")}
        </Button>
        <Button
          onClick={() => void handleSave()}
          disabled={support !== "supported" || busy !== null}
        >
          {busy === "save" ? t("saving") : t("save")}
        </Button>
      </div>
    </Card>
  );
};
