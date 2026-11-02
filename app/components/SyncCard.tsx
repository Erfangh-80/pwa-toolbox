"use client";

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
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  }, []);

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
          setFeedback({ tone: "danger", text: describeError(error) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
      throw new Error(`Mock sync endpoint responded with ${response.status}.`);
    }

    await clearPendingMessages();
    await refresh();
    return pending.length;
  }, [refresh]);

  useEffect(() => {
    const handleOnline = () => {
      void (async () => {
        setSyncing(true);
        try {
          const sent = await flush();
          if (sent > 0) {
            setFeedback({
              tone: "success",
              text: `Connection restored — flushed ${sent} pending item${sent === 1 ? "" : "s"} to ${SYNC_ENDPOINT}.`,
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
  }, [flush]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = draft.trim();

    if (!value) {
      setFeedback({ tone: "warn", text: "Type a message before saving." });
      return;
    }

    setBusy(true);
    try {
      await addPendingMessage(value);
      setDraft("");
      await refresh();

      let text = "Saved to IndexedDB.";
      if (navigator.onLine) {
        text += ' You are online — press "Sync now" to send it.';
      } else {
        const registered = await registerSync();
        text += registered
          ? ` Background sync "${SYNC_TAG}" registered; the service worker will flush it.`
          : " Background sync is unavailable here, so this card will flush the queue when the connection returns.";
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
      setFeedback(
        sent > 0
          ? { tone: "success", text: `Sent ${sent} item${sent === 1 ? "" : "s"} and cleared the queue.` }
          : { tone: "info", text: "The queue is already empty." },
      );
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
      setFeedback({ tone: "info", text: "Pending item removed locally." });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  };

  const handleClear = async () => {
    try {
      await clearPendingMessages();
      await refresh();
      setFeedback({ tone: "info", text: "Queue cleared." });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  };

  return (
    <Card
      index={3}
      title="Background sync"
      api="IndexedDB + SyncManager"
      icon="sync"
      support={support}
      description="Queue messages in IndexedDB while offline, ask the service worker for a background sync, and flush to a mock endpoint once the connection returns."
      footnote={`Tag: ${SYNC_TAG} · endpoint: ${SYNC_ENDPOINT}`}
    >
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <TextField
          id="sync-message"
          label="Message"
          placeholder="Queued while offline…"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={support === "unsupported"}
          autoComplete="off"
          maxLength={500}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={busy || support !== "supported"}>
            {busy ? "Saving…" : "Save offline"}
          </Button>
          <Button
            onClick={() => void handleFlush()}
            disabled={syncing || support !== "supported" || items.length === 0}
            aria-busy={syncing}
          >
            {syncing ? "Syncing…" : "Sync now"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void handleClear()}
            disabled={support !== "supported" || items.length === 0}
          >
            Clear
          </Button>
        </div>
      </form>

      <div className="rounded-lg border border-line">
        <div className="flex items-center justify-between border-b border-line px-3 py-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            Pending items
          </p>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">
            {items.length}
          </span>
        </div>
        {items.length === 0 ? (
          <p className="px-3 py-3 text-xs text-muted">The queue is empty.</p>
        ) : (
          <ul className="max-h-44 divide-y divide-line overflow-y-auto">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="break-words font-mono text-xs text-ink">{item.text}</p>
                  <time
                    dateTime={new Date(item.createdAt).toISOString()}
                    className="font-mono text-[10px] text-muted"
                  >
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </time>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(item.id)}
                  className="min-h-8 cursor-pointer rounded-md px-2 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors duration-200 hover:text-danger"
                  aria-label={`Delete pending message: ${item.text}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DataList
        items={[
          { label: "IndexedDB", value: support === "checking" ? "…" : support === "supported" ? "available" : "unavailable" },
          {
            label: "Background sync",
            value:
              backgroundSync === "checking"
                ? "checking…"
                : backgroundSync === "available"
                  ? "SyncManager available"
                  : backgroundSync === "no-registration"
                    ? "no service worker"
                    : "unsupported",
          },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">
          IndexedDB or fetch is unavailable, so offline queueing cannot run in this browser.
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
