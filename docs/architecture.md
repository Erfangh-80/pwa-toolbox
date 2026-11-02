# Technical Architecture – PWA Toolbox

## 1. Tech Stack

- **Framework**: Next.js (App Router) + TypeScript.
- **PWA Engine**: Serwist (`@serwist/next` and `serwist`) for Service Worker generation and caching.
- **Offline Storage**: `idb` (IndexedDB wrapper) for Background Sync data.
- **Styling**: Tailwind CSS (or CSS Modules, depending on the initial setup).
- **UI/UX**: Guided by `ui-ux-pro-max` design system output.
- **i18n**: `next-intl` v4 with the App Router `[locale]` segment (English + Persian, RTL).

## 2. Folder Structure

- `app/[locale]/page.tsx`: The main dashboard grid (one route per language).
- `app/[locale]/layout.tsx`: Root layout — sets `<html lang>`/`<html dir>`, metadata and the `NextIntlClientProvider`.
- `app/[locale]/share-target/page.tsx`: Share Target landing route.
- `app/[locale]/not-found.tsx` + `app/[locale]/[...rest]/page.tsx`: localized 404.
- `app/components/`: All Client Components (one per feature/card) + shared UI primitives.
- `src/i18n/routing.ts`: locales, default locale, prefix strategy, `getDirection()`.
- `src/i18n/request.ts`: per-request locale + message catalog resolution.
- `src/i18n/navigation.ts`: locale-aware `Link`, `useRouter`, `usePathname`, `redirect`.
- `proxy.ts`: next-intl request handler (Next 16 name for `middleware.ts`).
- `messages/en.json`, `messages/fa.json`: translation catalogs (same key tree).
- `app/api/sync/route.ts`: mock Background Sync endpoint (not localized).
- `app/sw.ts`: The source for the Service Worker (compiled by Serwist at build time).
- `public/manifest.json`: PWA manifest (icons, name, display mode, share target).
- `docs/`: All project documentation (PRD, Architecture, Tasks).

## 3. Core Data Flow

### Background Sync Flow:

1. User submits data via `SyncCard` while offline.
2. The component saves the data to IndexedDB using `idb`.
3. The component registers a sync tag (e.g., `sync-messages`) with the Service Worker.
4. The Service Worker listens for the `sync` event. When online, it reads from IndexedDB and sends the data to a mock endpoint.
5. Upon success, the Service Worker deletes the data from IndexedDB.

## 4. Key Decisions

- **Why Serwist?**: It is the modern successor to `next-pwa`, offers better TypeScript support, and works seamlessly with Next.js App Router.
- **Why Client Components?**: Browser APIs (like `navigator.bluetooth`) are not available in Node.js (SSR). Therefore, all cards must be marked with `'use client'`.
- **Why `idb`?**: The native IndexedDB API is callback-based and hard to read. `idb` wraps it in Promises, making it much easier to use in React.

## 5. Internationalization

### Routing

`proxy.ts` runs next-intl's `createMiddleware(routing)` on every request except
API routes, Next internals and files with an extension. With
`localePrefix: "always"` every page lives under `/en/…` or `/fa/…`; `/` is
redirected to the negotiated locale (cookie → `Accept-Language` → default) and the
`NEXT_LOCALE` cookie is refreshed on every switch.

> The handler is named `proxy.ts`, not `middleware.ts`: Next.js 16 deprecated the
> `middleware` file convention (it renamed it to `proxy`). Next also discovers the
> file non-recursively in the directory that contains `app/`, so with `app/` at the
> repository root the handler lives at the root rather than in `src/`.

### Messages

`src/i18n/request.ts` validates the `[locale]` segment (`hasLocale`) and loads
`messages/<locale>.json` through a static map so bundlers can code-split the
catalogs. Both files share an identical key tree:

```
meta · common · languageSwitcher · dashboard · notFound · shareTargetPage
cards.{install,offline,sync,push,geo,bluetooth,usb,share,clipboard,fileSystem,network,badge}
```

Client components read them with `useTranslations(namespace)`; the `Card` shell owns
`title` / `description` / `footnote` for its namespace, so a card component only
passes `namespace` and its own body strings. Server components use
`getTranslations()`. Dynamic values use ICU (`{count, plural, …}`, `{name}`), and
dates/numbers go through `useFormatter()` — which also means Persian pages get
Persian digits and Jalali dates for free.

### RTL

`app/[locale]/layout.tsx` sets `<html lang={locale} dir={getDirection(locale)}>`.
Everything else relies on **logical** CSS: Tailwind's `ms-*` / `me-*` / `ps-*` /
`pe-*` / `text-start` / `text-end` and fl/grid direction flipping. Directional icons
use the `rtl:` variant (`rtl:-scale-x-100`). `app/globals.css` adds a small RTL layer:
a Persian font stack, a tracking reset (letter-spacing breaks Arabic script) and a
`bidi-plain` utility so Latin identifiers stay readable inside Persian text.

### Adding a language

1. Add the locale to `routing.locales` in `src/i18n/routing.ts`.
2. Create `messages/<locale>.json` with the same keys.
3. Add a loader entry in `src/i18n/request.ts`.
4. Add the locale to `alternates.languages` in the layout metadata (optional).
