"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useClientValue } from "@/lib/useClientValue";
import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type Feedback = { tone: NoticeTone; text: string };

export const PushCard = () => {
  const t = useTranslations("cards.push");
  const tCommon = useTranslations("common");
  const support = useSupport(() => "Notification" in window);

  const detectedPermission = useClientValue<NotificationPermission | "unknown">(
    () => ("Notification" in window ? Notification.permission : "unknown"),
    "unknown",
  );
  const hasPushManager = useClientValue(() => "PushManager" in window, null);
  const [updatedPermission, setUpdatedPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [swRegistered, setSwRegistered] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const permission = updatedPermission ?? detectedPermission;

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

  const permissionLabel =
    permission === "granted"
      ? t("granted")
      : permission === "denied"
        ? t("denied")
        : permission === "default"
          ? t("default")
          : tCommon("checkingValue");

  const requestPermission = async () => {
    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setUpdatedPermission(result);
      setFeedback({
        tone: result === "granted" ? "success" : result === "denied" ? "danger" : "info",
        text:
          result === "granted"
            ? t("grantedMessage")
            : result === "denied"
              ? t("deniedMessage")
              : t("dismissedMessage"),
      });
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: tCommon("browserError", { message: describeError(error) }),
      });
    } finally {
      setBusy(false);
    }
  };

  const sendTestNotification = async () => {
    setBusy(true);
    try {
      if (!("Notification" in window)) {
        throw new Error(t("unsupportedError"));
      }
      if (Notification.permission !== "granted") {
        throw new Error(t("needPermission"));
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification("PWA Toolbox", {
            body: t("title"),
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            tag: "pwa-toolbox-test",
          });
          setFeedback({ tone: "success", text: t("sentViaServiceWorker") });
          setBusy(false);
          return;
        }
      }

      new Notification("PWA Toolbox", {
        body: t("title"),
        icon: "/icons/icon-192.png",
      });
      setFeedback({ tone: "success", text: t("sentViaConstructor") });
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: error instanceof Error ? error.message : describeError(error),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card index={4} namespace="cards.push" api="Notification / PushManager" icon="push" support={support}>
      <DataList
        items={[
          { label: t("permission"), value: permissionLabel },
          {
            label: t("notificationApi"),
            value:
              support === "checking"
                ? "…"
                : support === "supported"
                  ? tCommon("available")
                  : tCommon("unavailable"),
          },
          {
            label: t("pushManager"),
            value:
              hasPushManager === null
                ? "…"
                : hasPushManager
                  ? tCommon("available")
                  : tCommon("unavailable"),
          },
          {
            label: t("serviceWorker"),
            value:
              swRegistered === null
                ? tCommon("checkingValue")
                : swRegistered
                  ? t("registered")
                  : t("notRegistered"),
          },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
      ) : null}

      {permission === "denied" ? <Notice tone="warn">{t("noticeDenied")}</Notice> : null}

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
          {permission === "granted"
            ? t("grantedButton")
            : busy
              ? t("enabling")
              : t("enable")}
        </Button>
        <Button
          onClick={() => void sendTestNotification()}
          disabled={support !== "supported" || busy || permission !== "granted"}
        >
          {t("test")}
        </Button>
      </div>
    </Card>
  );
};
