"use client";

import { useClientValue } from "./useClientValue";

export type SupportState = "checking" | "supported" | "unsupported";

/**
 * Resolves browser-API support after mount.
 *
 * The check runs inside an effect (never during render / SSR) so the server and
 * the first client render both output "checking", which keeps hydration stable.
 */
export const useSupport = (check: () => boolean): SupportState =>
  useClientValue<SupportState>(() => {
    try {
      return check() ? "supported" : "unsupported";
    } catch {
      return "unsupported";
    }
  }, "checking");

export const describeError = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === "string" && error) {
    return error;
  }
  return "Something went wrong.";
};
