"use client";

import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type ConnectedDevice = {
  id: string;
  name: string;
  connected: boolean;
};

type Feedback = { tone: NoticeTone; text: string };

export const BluetoothCard = () => {
  const t = useTranslations("cards.bluetooth");
  const tCommon = useTranslations("common");
  const support = useSupport(() => "bluetooth" in navigator);
  const deviceRef = useRef<ToolboxBluetoothDevice | null>(null);
  const [device, setDevice] = useState<ConnectedDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleGattDisconnected = useCallback(() => {
    setDevice((current) => (current ? { ...current, connected: false } : current));
    setFeedback({ tone: "info", text: t("gattDisconnected") });
  }, [t]);

  const handleScan = async () => {
    setBusy(true);
    setFeedback(null);

    try {
      const bluetooth = navigator.bluetooth;
      if (!bluetooth) {
        throw new Error(t("unavailable"));
      }

      const selected = await bluetooth.requestDevice({ acceptAllDevices: true });
      deviceRef.current = selected;
      selected.addEventListener("gattserverdisconnected", handleGattDisconnected);

      let connected = false;
      if (selected.gatt) {
        await selected.gatt.connect();
        connected = selected.gatt.connected;
      }

      setDevice({
        id: selected.id,
        name: selected.name?.trim() || t("unnamed"),
        connected,
      });

      setFeedback({
        tone: connected ? "success" : "warn",
        text: connected ? t("gattConnected") : t("noGatt"),
      });
    } catch (error) {
      setFeedback({
        tone: error instanceof DOMException && error.name === "NotFoundError" ? "info" : "danger",
        text:
          error instanceof DOMException && error.name === "NotFoundError"
            ? t("noDevice")
            : tCommon("browserError", { message: describeError(error) }),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDisconnect = () => {
    try {
      deviceRef.current?.gatt?.disconnect();
      deviceRef.current?.removeEventListener("gattserverdisconnected", handleGattDisconnected);
      deviceRef.current = null;
      setDevice(null);
      setFeedback({ tone: "info", text: t("released") });
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: tCommon("browserError", { message: describeError(error) }),
      });
    }
  };

  return (
    <Card
      index={6}
      namespace="cards.bluetooth"
      api="navigator.bluetooth"
      icon="bluetooth"
      support={support}
    >
      {device ? (
        <DataList
          items={[
            { label: t("device"), value: device.name },
            { label: t("id"), value: device.id },
            {
              label: t("gatt"),
              value: device.connected ? t("connected") : t("disconnected"),
            },
          ]}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center font-mono text-xs text-muted">
          {t("empty")}
        </p>
      )}

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
          onClick={() => void handleScan()}
          disabled={support !== "supported" || busy}
          aria-busy={busy}
        >
          {busy ? t("scanning") : device ? t("scanAgain") : t("scan")}
        </Button>
        <Button variant="danger" onClick={handleDisconnect} disabled={!device}>
          {t("disconnect")}
        </Button>
      </div>
    </Card>
  );
};
