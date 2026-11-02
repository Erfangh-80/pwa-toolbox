import createMiddleware from "next-intl/middleware";

import { routing } from "./src/i18n/routing";

/**
 * Locale negotiation for every non-asset request.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy` (the old name is
 * deprecated but still works); the next-intl handler is identical either way.
 * The file must sit next to `app/` — Next discovers it non-recursively at that
 * level, so it cannot live in `src/` while `app/` is at the repository root.
 * `createMiddleware` redirects `/` to the detected locale and keeps `/en` and
 * `/fa` prefixes in sync with the `NEXT_LOCALE` cookie.
 */
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, and anything with a file extension
  // (manifest.json, icons, service worker, …).
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
