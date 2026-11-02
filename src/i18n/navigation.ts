import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

/**
 * Locale-aware replacements for Next.js navigation primitives.
 *
 * `Link` and `useRouter()` automatically keep the current locale prefix, which is
 * what the language switcher and the share-target links rely on.
 */
export const { Link, redirect, permanentRedirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
