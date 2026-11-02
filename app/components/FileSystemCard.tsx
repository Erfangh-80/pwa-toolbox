"use client";

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
        throw new Error("The File System Access API is not available.");
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
        text: `Read ${file.name} (${file.size.toLocaleString()} bytes).`,
      });
    } catch (error) {
      setFeedback(
        isAbort(error)
          ? { tone: "info", text: "File picker cancelled." }
          : { tone: "danger", text: describeError(error) },
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
        throw new Error("The File System Access API is not available.");
      }

      const handle = await picker({
        suggestedName: fileName ?? "pwa-toolbox.txt",
        types: TEXT_TYPES,
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();

      setFileName(handle.name);
      setFeedback({ tone: "success", text: `Saved ${handle.name}.` });
    } catch (error) {
      setFeedback(
        isAbort(error)
          ? { tone: "info", text: "Save dialog cancelled." }
          : { tone: "danger", text: describeError(error) },
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card
      index={10}
      title="File system access"
      api="showOpenFilePicker"
      icon="file"
      support={support}
      description="Open a local text file into the editor below and write it back through a FileSystemWritableFileStream."
      footnote="Chromium desktop only; requires a secure context and a direct user gesture."
    >
      <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2">
        <span className="truncate font-mono text-xs text-ink">
          {fileName ?? "No file open"}
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          {content.length.toLocaleString()} chars
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="file-content"
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted"
        >
          File content
        </label>
        <textarea
          id="file-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          spellCheck={false}
          placeholder="Open a file, or type text here and save it."
          disabled={support === "unsupported"}
          className="w-full resize-y rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-xs leading-relaxed text-ink transition-colors duration-200 placeholder:text-muted/50 focus:border-accent disabled:opacity-50"
        />
        {truncated ? (
          <p className="text-[11px] text-warn">
            Preview truncated to the first {MAX_PREVIEW.toLocaleString()} characters; saving
            writes the truncated text.
          </p>
        ) : null}
      </div>

      {support === "unsupported" ? (
        <Notice tone="warn">
          The File System Access API is unavailable here. Safari, Firefox and all mobile
          browsers lack it — use Chrome or Edge on desktop.
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
          onClick={() => void handleOpen()}
          disabled={support !== "supported" || busy !== null}
          aria-busy={busy === "open"}
        >
          {busy === "open" ? "Opening…" : "Open file"}
        </Button>
        <Button
          onClick={() => void handleSave()}
          disabled={support !== "supported" || busy !== null}
        >
          {busy === "save" ? "Saving…" : "Save file"}
        </Button>
      </div>
    </Card>
  );
};
