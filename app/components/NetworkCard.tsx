"use client";

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

const readConnection = (): ConnectionSnapshot => {
  const connection = navigator.connection;
  if (!connection) {
    return EMPTY_CONNECTION;
  }

  return {
    type: connection.type ?? "unknown",
    effectiveType: connection.effectiveType ?? "unknown",
    downlink:
      typeof connection.downlink === "number" ? `${connection.downlink} Mb/s` : "unknown",
    rtt: typeof connection.rtt === "number" ? `${connection.rtt} ms` : "unknown",
    saveData: typeof connection.saveData === "boolean" ? String(connection.saveData) : "unknown",
  };
};

export const NetworkCard = () => {
  const support = useSupport(() => "onLine" in navigator);
  const online = useOnlineStatus();
  const initialConnection = useClientValue<ConnectionSnapshot>(readConnection, EMPTY_CONNECTION);
  const hasConnectionApi = useClientValue<boolean | null>(
    () => Boolean(navigator.connection),
    null,
  );
  const [liveConnection, setLiveConnection] = useState<ConnectionSnapshot | null>(null);
  const [events, setEvents] = useState(0);

  useEffect(() => {
    const handleChange = () => {
      setLiveConnection(readConnection());
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
  }, []);

  const connection = liveConnection ?? initialConnection;

  return (
    <Card
      index={11}
      title="Network information"
      api="navigator.connection"
      icon="network"
      support={support}
      description="Watch connectivity events and read the Network Information API's estimate of the current connection."
      footnote="effectiveType and rtt are coarse estimates; Firefox and Safari expose little beyond navigator.onLine."
    >
      <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-raised px-3 py-2">
        <span
          className={`size-2 rounded-full ${online ? "bg-accent" : online === false ? "bg-warn" : "bg-muted"}`}
          aria-hidden="true"
        />
        <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink">
          {online === null ? "Detecting…" : online ? "Online" : "Offline"}
        </span>
        <span className="ml-auto font-mono text-[11px] text-muted">
          {events} change event{events === 1 ? "" : "s"}
        </span>
      </div>

      <DataList
        items={[
          { label: "navigator.onLine", value: online === null ? "…" : String(online) },
          { label: "type", value: connection.type },
          { label: "effectiveType", value: connection.effectiveType },
          { label: "downlink", value: connection.downlink },
          { label: "rtt", value: connection.rtt },
          { label: "saveData", value: connection.saveData },
        ]}
      />

      {support === "unsupported" ? (
        <Notice tone="warn">
          navigator.onLine is unavailable, so connectivity cannot be reported.
        </Notice>
      ) : null}

      {hasConnectionApi === false ? (
        <Notice tone="warn">
          The Network Information API is not exposed by this browser — only the
          online/offline flag is available.
        </Notice>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        <Button
          onClick={() => setLiveConnection(readConnection())}
          disabled={support !== "supported"}
        >
          Re-read status
        </Button>
      </div>
    </Card>
  );
};
