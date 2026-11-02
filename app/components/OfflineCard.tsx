"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice } from "./ui/Notice";

type ServiceWorkerInfo = {
  supported: boolean;
  registered: boolean;
  scope: string | null;
};

/** Byte values are rendered outside of ICU (units stay as SI symbols). */
const formatBytes = (bytes: number, number: (value: number) => string): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return `0 B`;
  }
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${number(exponent === 0 ? Math.round(value) : Math.round(value * 10) / 10)} ${units[exponent]}`;
};

const readServiceWorkerInfo = async (): Promise<ServiceWorkerInfo> => {
  if (!("serviceWorker" in navigator)) {
    return { supported: false, registered: false, scope: null };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return {
      supported: true,
      registered: Boolean(registration),
      scope: registration?.scope ?? null,
    };
  } catch {
    return { supported: true, registered: false, scope: null };
  }
};

const readCacheNames = async (): Promise<string[]> => {
  if (!("caches" in window)) {
    return [];
  }

  try {
    return await caches.keys();
  } catch {
    return [];
  }
};

const readStorageEstimate = async (): Promise<{ usage: number; quota: number } | null> => {
  try {
    if (!navigator.storage?.estimate) {
      return null;
    }
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
};

export const OfflineCard = () => {
  const t = useTranslations("cards.offline");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const support = useSupport(() => "onLine" in navigator);
  const online = useOnlineStatus();
  const [serviceWorker, setServiceWorker] = useState<ServiceWorkerInfo | null>(null);
  const [cacheNames, setCacheNames] = useState<string[]>([]);
  const [storage, setStorage] = useState<{ usage: number; quota: number } | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const info = await readServiceWorkerInfo();
      const names = await readCacheNames();
      const estimate = await readStorageEstimate();

      if (cancelled) {
        return;
      }

      setServiceWorker(info);
      setCacheNames(names);
      setStorage(estimate);
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const formatNumber = (value: number) => format.number(value);
  const storageValue = storage
    ? t("storageUsage", {
        used: formatBytes(storage.usage, formatNumber),
        quota: formatBytes(storage.quota, formatNumber),
      })
    : tCommon("unavailable");

  return (
    <Card
      index={2}
      namespace="cards.offline"
      api="navigator.onLine"
      icon="offline"
      support={support}
    >
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2">
        <span
          className={`size-2 rounded-full ${online ? "bg-accent" : online === false ? "bg-warn" : "bg-muted"}`}
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink">
          {online === null ? t("detecting") : online ? t("online") : t("offline")}
        </span>
        <span className="ms-auto font-mono text-[11px] text-muted">
          {t("onLineLabel", { value: online === null ? "…" : String(online) })}
        </span>
      </div>

      <DataList
        items={[
          {
            label: t("serviceWorker"),
            value:
              serviceWorker === null
                ? tCommon("checkingValue")
                : serviceWorker.registered
                  ? t("registered")
                  : serviceWorker.supported
                    ? t("notRegistered")
                    : tCommon("notSupported"),
          },
          {
            label: t("activeCaches"),
            value: cacheNames.length
              ? `${format.number(cacheNames.length)} · ${cacheNames.join(", ")}`
              : t("cachesNone"),
          },
          { label: t("storage"), value: storageValue },
        ]}
      />

      {online === false ? (
        <Notice tone="warn" announce>
          {t("noticeOffline")}
        </Notice>
      ) : null}

      {serviceWorker?.supported && !serviceWorker.registered ? (
        <Notice>{t("noticeNoWorker")}</Notice>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button variant="secondary" onClick={() => setReloadToken((token) => token + 1)}>
          {t("refresh")}
        </Button>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          disabled={online === null}
        >
          {t("reload")}
        </Button>
      </div>
    </Card>
  );
};
