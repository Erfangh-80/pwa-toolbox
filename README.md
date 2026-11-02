# PWA Toolbox

A sandbox for probing what the current browser actually supports — installability,
offline caching, background sync, notifications, geolocation, Bluetooth, USB, share
target, clipboard, file system access, network information and app badging.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · `idb`. No other runtime
dependencies were added.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build + type check
npm run lint
```

Most capabilities require a **secure context** (HTTPS or `localhost`) and some need an
**installed** PWA. Serve the build over HTTPS when testing on a phone.

## The twelve cards

| # | Card | API | Component |
| --- | --- | --- | --- |
| 1 | Installability | `beforeinstallprompt`, `display-mode` | `app/components/InstallCard.tsx` |
| 2 | Offline support | `navigator.onLine`, Cache Storage | `app/components/OfflineCard.tsx` |
| 3 | Background sync | IndexedDB (`idb`) + SyncManager | `app/components/SyncCard.tsx` |
| 4 | Push notifications | `Notification`, `PushManager` | `app/components/PushCard.tsx` |
| 5 | Geolocation | `navigator.geolocation` | `app/components/GeoCard.tsx` |
| 6 | Web Bluetooth | `navigator.bluetooth` | `app/components/BluetoothCard.tsx` |
| 7 | WebUSB | `navigator.usb` | `app/components/UsbCard.tsx` |
| 8 | Share target | `manifest.share_target` → `/share-target` | `app/components/ShareTargetCard.tsx` |
| 9 | Clipboard | `navigator.clipboard` | `app/components/ClipboardCard.tsx` |
| 10 | File system access | `showOpenFilePicker` / `showSaveFilePicker` | `app/components/FileSystemCard.tsx` |
| 11 | Network information | `navigator.connection` | `app/components/NetworkCard.tsx` |
| 12 | App badging | `navigator.setAppBadge` | `app/components/BadgeCard.tsx` |

Dashboard: `app/page.tsx` (responsive grid, one card per section).
Shared UI primitives: `app/components/ui/` (`Card`, `Button`, `TextField`, `DataList`,
`Notice`, inline SVG `Icon`). Browser helpers: `lib/useSupport.ts`,
`lib/useClientValue.ts`, `lib/useOnlineStatus.ts`, `lib/db.ts`, ambient API typings in
`types/web-apis.d.ts`.

Design tokens and interaction rules live in [`docs/design-system.md`](docs/design-system.md),
generated with the `ui-ux-pro-max` skill.

## Support detection

Browser APIs are never touched during render. Each card resolves support inside an
effect (via `useSupport`) and shows a `Checking → Supported / Not supported` pill.
Unsupported capabilities keep their action disabled **and** explain themselves in the
card body, so a missing API is never silent.

## Background sync / push caveat

`next.config.ts` and `app/sw.ts` are intentionally untouched by this iteration, so the
app runs without a generated Serwist worker. The sync card therefore works in two
layers:

1. items are queued in IndexedDB (`pwa-toolbox` → `pending-messages`) and listed in the UI;
2. it requests `registration.sync.register("sync-messages")` when a worker exists, and
   otherwise flushes the queue to the mock endpoint `POST /api/sync` as soon as the
   browser reports `online`.

Once the Serwist integration is wired up, the same IndexedDB store, tag and endpoint are
ready for a `sync` event handler in `app/sw.ts`.

## Docs

- [`docs/prd.md`](docs/prd.md) — product requirements
- [`docs/architecture.md`](docs/architecture.md) — structure and data flow
- [`docs/context.md`](docs/context.md) — coding standards
- [`docs/tasks.md`](docs/tasks.md) — the 12-section checklist
- [`docs/design-system.md`](docs/design-system.md) — visual system
