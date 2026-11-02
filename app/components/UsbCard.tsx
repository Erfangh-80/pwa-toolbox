"use client";

import { useRef, useState } from "react";

import { describeError, useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice, type NoticeTone } from "./ui/Notice";

type UsbDeviceInfo = {
  vendorId: string;
  productId: string;
  productName: string;
  manufacturerName: string;
  serialNumber: string;
};

type Feedback = { tone: NoticeTone; text: string };

const toHex = (value: number) => `0x${value.toString(16).padStart(4, "0")}`;

export const UsbCard = () => {
  const support = useSupport(() => "usb" in navigator);
  const deviceRef = useRef<ToolboxUsbDevice | null>(null);
  const [device, setDevice] = useState<UsbDeviceInfo | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const handleConnect = async () => {
    setBusy(true);
    setFeedback(null);

    try {
      const usb = navigator.usb;
      if (!usb) {
        throw new Error("WebUSB is not available in this browser.");
      }

      const selected = await usb.requestDevice({ filters: [] });
      await selected.open();

      const firstConfiguration = selected.configurations[0];
      if (firstConfiguration) {
        await selected.selectConfiguration(firstConfiguration.configurationValue);
      }

      deviceRef.current = selected;
      setDevice({
        vendorId: toHex(selected.vendorId),
        productId: toHex(selected.productId),
        productName: selected.productName?.trim() || "(not reported)",
        manufacturerName: selected.manufacturerName?.trim() || "(not reported)",
        serialNumber: selected.serialNumber?.trim() || "(not reported)",
      });
      setFeedback({ tone: "success", text: "USB device opened and configured." });
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

  const handleDisconnect = async () => {
    const current = deviceRef.current;
    if (!current) {
      return;
    }

    setBusy(true);
    try {
      await current.close();
      deviceRef.current = null;
      setDevice(null);
      setFeedback({ tone: "info", text: "USB device closed and released." });
    } catch (error) {
      setFeedback({ tone: "danger", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      index={7}
      title="WebUSB"
      api="navigator.usb"
      icon="usb"
      support={support}
      description="Pick a USB device with the browser chooser, open it, select its first configuration and read its descriptors."
      footnote="Chromium desktop only — Safari, Firefox and mobile browsers do not implement WebUSB."
    >
      {device ? (
        <DataList
          items={[
            { label: "Vendor ID", value: device.vendorId },
            { label: "Product ID", value: device.productId },
            { label: "Product", value: device.productName },
            { label: "Manufacturer", value: device.manufacturerName },
            { label: "Serial", value: device.serialNumber },
          ]}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center font-mono text-xs text-muted">
          No USB device connected.
        </p>
      )}

      {support === "unsupported" ? (
        <Notice tone="warn">
          WebUSB is not supported here. Use Chrome or Edge on desktop with a device that
          exposes a compatible interface.
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
          onClick={() => void handleConnect()}
          disabled={support !== "supported" || busy}
          aria-busy={busy}
        >
          {busy ? "Working…" : device ? "Connect another" : "Connect USB"}
        </Button>
        <Button
          variant="danger"
          onClick={() => void handleDisconnect()}
          disabled={!device || busy}
        >
          Disconnect
        </Button>
      </div>
    </Card>
  );
};
