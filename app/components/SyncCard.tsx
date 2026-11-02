"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  addPendingMessage,
  clearPendingMessages,
  deletePendingMessage,
  listPendingMessages,
  SYNC_ENDPOINT,
  SYNC_TAG,
  type PendingMessage,
} from "@/lib/db";
import { describeError, useSupport } from "@/lib/useSupport";

import { Button, TextField } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type BackgroundSyncState = "checking" | "available" | "no-registration" | "unsupported";

type Feedback = { tone: NoticeTone; text: string };

type SyncRegistration = ServiceWorkerRegistration & {
  sync?: { register(tag: string): Promise<void> };
};

/**
 * `navigator.serviceWorker.ready` resolves only once a worker is active, which never
 * happens when no worker is registered — race it against a short timeout and fall
 * back to the current registration lookup.
 */
const getRegistration = async (): Promise<SyncRegistration | null> => {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  const timeout = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 1_500);
  });

  const registration = await Promise.race<SyncRegistration | null>([
    navigator.serviceWorker.ready as Promise<SyncRegistration>,
    timeout,
  ]);

  if (registration) {
    return registration;
  }

  return ((await navigator.serviceWorker.getRegistration()) as SyncRegistration | undefined) ?? null;
};

export const SyncCard = () => {
  const t = useTranslations("cards.sync");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const support = useSupport(
    () => typeof indexedDB !== "undefined" && typeof fetch === "function",
  );
  const [items, setItems] = useState<PendingMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [backgroundSync, setBackgroundSync] = useState<BackgroundSyncState>("checking");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const refresh = useCallback(async () => {
    try {
      setItems(await listPendingMessages());
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: tCommon("browserError", { message: describeError(error) }),
      });
    }
  }, [tCommon]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const pending = await listPendingMessages();
        if (!cancelled) {
          setItems(pending);
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            tone: "danger",
            text: tCommon("browserError", { message: describeError(error) }),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [tCommon]);

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      if (!("serviceWorker" in navigator)) {
        if (!cancelled) setBackgroundSync("unsupported");
        return;
      }

      try {
        const registration = await getRegistration();
        if (cancelled) return;

        if (!registration) {
          setBackgroundSync("no-registration");
        } else {
          setBackgroundSync("SyncManager" in window ? "available" : "unsupported");
        }
      } catch {
        if (!cancelled) setBackgroundSync("unsupported");
      }
    };

    void detect();

    return () => {
      cancelled = true;
    };
  }, []);

  const registerSync = async (): Promise<boolean> => {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    try {
      const registration = await getRegistration();
      if (!registration?.sync) {
        return false;
      }
      // Equivalent to navigator.serviceWorker.ready.then(sw => sw.sync.register(tag)),
      // but never hangs when no worker is controlling the page.
      await registration.sync.register(SYNC_TAG);
      return true;
    } catch {
      return false;
    }
  };

  const flush = useCallback(async (): Promise<number> => {
    const pending = await listPendingMessages();
    if (pending.length === 0) {
      return 0;
    }

    const response = await fetch(SYNC_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: pending }),
    });

    if (!response.ok) {
      throw new Error(t("endpointError", { status: format.number(response.status) }));
    }

    await clearPendingMessages();
    await refresh();
    return pending.length;
  }, [format, refresh, t]);

  useEffect(() => {
    const handleOnline = () => {
      void (async () => {
        setSyncing(true);
        try {
          const sent = await flush();
          if (sent > 0) {
            setFeedback({
              tone: "success",
              text: t("flushedOnReconnect", { count: sent, endpoint: SYNC_ENDPOINT }),
            });
          }
        } catch (error) {
          setFeedback({ tone: "danger", text: describeError(error) });
        } finally {
          setSyncing(false);
        }
      })();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flush, t]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();

    if (!value) {
      setFeedback({ tone: "warn", text: t("emptyDraft") });
      return;
    }

    setBusy(true);
    try {
      await addPendingMessage(value);
      setDraft("");
      await refresh();

      let text = t("savedOnline");
      if (!navigator.onLine) {
        const registered = await registerSync();
        text = registered
          ? t("savedOfflineWithSync", { tag: SYNC_TAG })
          : t("savedOfflineNoSync");
      }

      setFeedback({ tone: "success", text });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const handleFlush = async () => {
    setSyncing(true);
    try {
      const sent = await flush();
      setFeedback({ tone: sent > 0 ? "success" : "info", text: t("flushed", { count: sent }) });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deletePendingMessage(id);
      await refresh();
      setFeedback({ tone: "info", text: t("removed") });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  };

  const handleClear = async () => {
    try {
      await clearPendingMessages();
      await refresh();
      setFeedback({ tone: "info", text: t("cleared") });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  };

  const syncStateLabel =
    backgroundSync === "checking"
      ? tCommon("checkingValue")
      : backgroundSync === "available"
        ? t("syncManagerAvailable")
        : backgroundSync === "no-registration"
          ? t("noWorker")
          : tCommon("notSupported");

  return (
    <Card
      index={3}
      namespace="cards.sync"
      api="IndexedDB + SyncManager"
      icon="sync"
      support={support}
      footnoteValues={{ tag: SYNC_TAG, endpoint: SYNC_ENDPOINT }}
    >
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <TextField
          id="sync-message"
          label={t("messageLabel")}
          placeholder={t("placeholder")}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={support === "unsupported"}
          autoComplete="off"
          dir="auto"
          maxLength={500}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={busy || support !== "supported"}>
            {busy ? t("saving") : t("save")}
          </Button>
          <Button
            onClick={() => void handleFlush()}
            disabled={syncing || support !== "supported" || items.length === 0}
            aria-busy={syncing}
          >
            {syncing ? t("syncing") : t("syncNow")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleClear()}
            disabled={support !== "supported" || items.length === 0}
          >
            {tCommon("clear")}
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-line">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {t("pending")}
          </p>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">
            {format.number(items.length)}
          </span>
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-3 text-xs text-muted">{t("queueEmpty")}</p>
        ) : (
          <ul className="max-h-44 divide-y divide-line overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="bidi-plain break-words font-mono text-xs text-ink">{item.text}</p>
                  <time
                    dateTime={new Date(item.createdAt).toISOString()}
                    className="font-mono text-[10px] text-muted"
                  >
                    {format.dateTime(new Date(item.createdAt), { timeStyle: "medium" })}
                  </time>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="min-h-8 cursor-pointer rounded-md px-2 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors duration-200 hover:text-danger"
                  aria-label={t("deleteItem", { text: item.text })}
                >
                  {tCommon("delete")}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DataList
        items={[
          {
            label: t("indexedDb"),
            value:
              support === "checking"
                ? "…"
                : support === "supported"
                  ? tCommon("available")
                  : tCommon("unavailable"),
          },
          { label: t("backgroundSync"), value: syncStateLabel },
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
    </Card>
  );
};
