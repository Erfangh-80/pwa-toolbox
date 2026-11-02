"use client";

import { useEffect, useState } from "react";

import { useClientValue } from "./useClientValue";

/**
 * `navigator.onLine` plus live `online` / `offline` events.
 * Returns `null` until the browser value has been read after mount.
 */
export const useOnlineStatus = (): boolean | null => {
  const initial = useClientValue<boolean | null>(() => navigator.onLine, null);
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setLive(true);
    const handleOffline = () => setLive(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return live ?? initial;
};
