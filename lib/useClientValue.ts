"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reads a browser-only value once, after mount.
 *
 * Browser APIs (`navigator.*`, `window.matchMedia`, …) do not exist during SSR and
 * must not be touched while rendering, so the first render always returns
 * `fallback` and the real value is adopted inside an effect. That keeps server HTML
 * and the first client render identical (no hydration mismatch).
 */
export const useClientValue = <T>(read: () => T, fallback: T): T => {
  const [value, setValue] = useState<T>(fallback);
  const readRef = useRef(read);

  useEffect(() => {
    let next: T;
    try {
      next = readRef.current();
    } catch {
      return;
    }
    setValue(next);
  }, []);

  return value;
};
