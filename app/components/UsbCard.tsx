"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("cards.usb");
  const tCommon = useTranslations("common");
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
        throw new Error(t("unavailable"));
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
        productName: selected.productName?.trim() || t("notReported"),
        manufacturerName: selected.manufacturerName?.trim() || t("notReported"),
        serialNumber: selected.serialNumber?.trim() || t("notReported"),
      });
      setFeedback({ tone: "success", text: t("opened") });
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
      setFeedback({ tone: "info", text: t("closed") });
    } catch (error) {
      setFeedback({
        tone: "danger",
        text: tCommon("browserError", { message: describeError(error) }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card index={7} namespace="cards.usb" api="navigator.usb" icon="usb" support={support}>
      {device ? (
        <DataList
          items={[
            { label: t("vendorId"), value: device.vendorId },
            { label: t("productId"), value: device.productId },
            { label: t("product"), value: device.productName },
            { label: t("manufacturer"), value: device.manufacturerName },
            { label: t("serial"), value: device.serialNumber },
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
          onClick={() => void handleConnect()}
          disabled={support !== "supported" || busy}
          aria-busy={busy}
        >
          {busy ? t("working") : device ? t("connectAnother") : t("connect")}
        </Button>
        <Button
          variant="danger"
          onClick={() => void handleDisconnect()}
          disabled={!device || busy}
        >
          {t("disconnect")}
        </Button>
      </div>
    </Card>
  );
};
