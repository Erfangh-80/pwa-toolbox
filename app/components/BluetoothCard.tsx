"use client";

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
  const support = useSupport(() => "bluetooth" in navigator);
  const deviceRef = useRef<ToolboxBluetoothDevice | null>(null);
  const [device, setDevice] = useState<ConnectedDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleGattDisconnected = useCallback(() => {
    setDevice((current) => (current ? { ...current, connected: false } : current));
    setFeedback({ tone: "info", text: "GATT server disconnected." });
  }, []);

  const handleScan = async () => {
    setBusy(true);
    setFeedback(null);

    try {
      const bluetooth = navigator.bluetooth;
      if (!bluetooth) {
        throw new Error("Web Bluetooth is not available in this browser.");
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
        name: selected.name?.trim() || "(unnamed device)",
        connected,
      });

      setFeedback(
        connected
          ? { tone: "success", text: "GATT server connected." }
          : { tone: "warn", text: "Device selected, but no GATT server is available." },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        setFeedback({ tone: "info", text: "No device selected." });
      } else {
        setFeedback({ tone: "danger", text: describeError(error) });
      }
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
      setFeedback({ tone: "info", text: "Disconnected and released the device." });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    }
  };

  return (
    <Card
      index={6}
      title="Web Bluetooth"
      api="navigator.bluetooth"
      icon="bluetooth"
      support={support}
      description="Scan for a nearby BLE peripheral, connect to its GATT server and inspect the selected device identity."
      footnote="Chromium on desktop/Android only — Safari and Firefox do not implement Web Bluetooth."
    >
      {device ? (
        <DataList
          items={[
            { label: "Device", value: device.name },
            { label: "ID", value: device.id },
            { label: "GATT", value: device.connected ? "connected" : "disconnected" },
          ]}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center font-mono text-xs text-muted">
          No device connected.
        </p>
      )}

      {support === "unsupported" ? (
        <Notice tone="warn">
          Web Bluetooth is not supported here (iOS/Safari and Firefox never expose it).
          Use Chrome or Edge on desktop or Android.
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
          onClick={() => void handleScan()}
          disabled={support !== "supported" || busy}
          aria-busy={busy}
        >
          {busy ? "Scanning…" : device ? "Scan again" : "Scan for devices"}
        </Button>
        <Button variant="danger" onClick={handleDisconnect} disabled={!device}>
          Disconnect
        </Button>
      </div>
    </Card>
  );
};
