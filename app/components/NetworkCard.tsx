"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useClientValue } from "@/lib/useClientValue";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useSupport } from "@/lib/useSupport";

import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { DataList } from "./ui/DataList";
import { Notice } from "./ui/Notice";

type ConnectionSnapshot = {
  type: string;
  effectiveType: string;
  downlink: string;
  rtt: string;
  saveData: string;
};

const EMPTY_CONNECTION: ConnectionSnapshot = {
  type: "—",
  effectiveType: "—",
  downlink: "—",
  rtt: "—",
  saveData: "—",
};

const readConnection = (unknown: string): ConnectionSnapshot => {
  const connection = navigator.connection;
  if (!connection) {
    return EMPTY_CONNECTION;
  }

  return {
    type: connection.type ?? unknown,
    effectiveType: connection.effectiveType ?? unknown,
    downlink:
      typeof connection.downlink === "number"
        ? `${connection.downlink} Mb/s`
        : unknown,
    rtt: typeof connection.rtt === "number" ? `${connection.rtt} ms` : unknown,
    saveData: typeof connection.saveData === "boolean" ? String(connection.saveData) : unknown,
  };
};

export const NetworkCard = () => {
  const t = useTranslations("cards.network");
  const tCommon = useTranslations("common");
  const support = useSupport(() => "onLine" in navigator);
  const online = useOnlineStatus();
  const unknownLabel = tCommon("unknown");
  const initialConnection = useClientValue<ConnectionSnapshot>(
    () => readConnection(unknownLabel),
    EMPTY_CONNECTION,
  );
  const hasConnectionApi = useClientValue<boolean | null>(
    () => Boolean(navigator.connection),
    null,
  );
  const [liveConnection, setLiveConnection] = useState<ConnectionSnapshot | null>(null);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    const handleChange = () => {
      setLiveConnection(readConnection(unknownLabel));
      setEvents((count) => count + 1);
    };

    const networkConnection = navigator.connection;

    window.addEventListener("online", handleChange);
    window.addEventListener("offline", handleChange);
    networkConnection?.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("online", handleChange);
      window.removeEventListener("offline", handleChange);
      networkConnection?.removeEventListener("change", handleChange);
    };
  }, [unknownLabel]);

  const connection = liveConnection ?? initialConnection;

  return (
    <Card
      index={11}
      namespace="cards.network"
      api="navigator.connection"
      icon="network"
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
          {t("events", { count: events })}
        </span>
      </div>

      <DataList
        items={[
          { label: t("onLine"), value: online === null ? "…" : String(online) },
          { label: t("type"), value: connection.type },
          { label: t("effectiveType"), value: connection.effectiveType },
          { label: t("downlink"), value: connection.downlink },
          { label: t("rtt"), value: connection.rtt },
          { label: t("saveData"), value: connection.saveData },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">{t("noticeUnsupported")}</Notice>
      ) : null}

      {hasConnectionApi === false ? <Notice tone="warn">{t("noApi")}</Notice> : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          onClick={() => setLiveConnection(readConnection(unknownLabel))}
          disabled={support !== "supported"}
        >
          {t("reRead")}
        </Button>
      </div>
    </Card>
  );
};
