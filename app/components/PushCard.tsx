"use client";

import { useEffect, useState } from "react";

import { useClientValue } from "@/lib/useClientValue";
import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

const permissionLabels: Record<string, string> = {
  granted: "granted",
  denied: "denied",
  default: "not asked yet",
  unknown: "checking…",
};

export const PushCard = () => {
  const support = useSupport(() => "Notification" in window);
  const detectedPermission = useClientValue<NotificationPermission | "unknown">(
    () => ("Notification" in window ? Notification.permission : "unknown"),
    "unknown",
  );
  const [updatedPermission, setUpdatedPermission] = useState<NotificationPermission | null>(
    null,
  );
  const permission = updatedPermission ?? detectedPermission;
  const hasPushManager = useClientValue(() => "PushManager" in window, null);
  const [swRegistered, setSwRegistered] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const registration =
        "serviceWorker" in navigator
          ? await navigator.serviceWorker.getRegistration().catch(() => null)
          : null;

      if (!cancelled) {
        setSwRegistered(Boolean(registration));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const requestPermission = async () => {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setUpdatedPermission(result);
      setFeedback(
        result === "granted"
          ? { tone: "success", text: "Permission granted. Send a test notification." }
          : result === "denied"
            ? { tone: "danger", text: "Permission denied. Re-enable notifications in the browser's site settings." }
            : { tone: "info", text: "Permission was dismissed without a choice." },
      );
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  const sendTestNotification = async () => {
    setBusy(true);
    try {
      if (!("Notification" in window)) {
        throw new Error("Notifications are not supported in this browser.");
      }
      if (Notification.permission !== "granted") {
        throw new Error("Grant notification permission first.");
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification("PWA Toolbox", {
            body: "Sent through the service worker registration.",
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            tag: "pwa-toolbox-test",
          });
          setFeedback({
            tone: "success",
            text: "Notification delivered via registration.showNotification().",
          });
          setBusy(false);
          return;
        }
      }

      new Notification("PWA Toolbox", {
        body: "Sent with the Notification constructor (no service worker registered).",
        icon: "/icons/icon-192.png",
      });
      setFeedback({
        tone: "success",
        text: "Notification created with the Notification constructor.",
      });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      index={4}
      title="Push notifications"
      api="Notification / PushManager"
      icon="push"
      support={support}
      description="Request notification permission, inspect the current permission state, and fire a local test notification."
      footnote="Real push needs a VAPID key, a push subscription and a push handler in the service worker."
    >
      <DataList
        items={[
          { label: "Permission", value: permissionLabels[permission] ?? permission },
          {
            label: "Notification API",
            value: support === "checking" ? "…" : support === "supported" ? "available" : "unavailable",
          },
          {
            label: "PushManager",
            value: hasPushManager === null ? "…" : hasPushManager ? "available" : "unavailable",
          },
          {
            label: "Service worker",
            value: swRegistered === null ? "checking…" : swRegistered ? "registered" : "not registered",
          },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">
          The Notification API is missing. iOS Safari only exposes it for installed
          home-screen apps.
        </Notice>
      ) : null}

      {permission === "denied" ? (
        <Notice tone="warn">
          Permission is blocked for this origin. Reset it from the padlock menu in the
          address bar.
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
          onClick={() => void requestPermission()}
          disabled={support !== "supported" || busy || permission === "granted"}
        >
          {permission === "granted" ? "Permission granted" : busy ? "Requesting…" : "Enable notifications"}
        </Button>
        <Button
          onClick={() => void sendTestNotification()}
          disabled={support !== "supported" || busy || permission !== "granted"}
        >
          Test notification
        </Button>
      </div>
    </Card>
  );
};
