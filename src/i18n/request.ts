import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

/**
 * Message loaders are listed statically (instead of a template-literal import)
 * so bundlers can resolve them at build time and each catalog stays lazy.
 */
const loadMessages = {
  en: () => import("../../messages/en.json"),
  fa: () => import("../../messages/fa.json"),
} satisfies Record<
  (typeof routing.locales)[number],
  () => Promise<{ default: Record<string, unknown> }>
>;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await loadMessages[locale]()).default,
  };
});
