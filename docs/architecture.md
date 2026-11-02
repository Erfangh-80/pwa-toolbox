# Technical Architecture – PWA Toolbox

## 1. Tech Stack

- **Framework**: Next.js (App Router) + TypeScript.
- **PWA Engine**: Serwist (`@serwist/next` and `serwist`) for Service Worker generation and caching.
- **Offline Storage**: `idb` (IndexedDB wrapper) for Background Sync data.
- **Styling**: Tailwind CSS (or CSS Modules, depending on the initial setup).
- **UI/UX**: Guided by `ui-ux-pro-max` design system output.

## 2. Folder Structure

- `app/page.tsx`: The main dashboard grid.
- `app/components/`: Contains all Client Components (one per feature/card).
- `app/sw.ts`: The source for the Service Worker (compiled by Serwist at build time).
- `public/manifest.json`: PWA manifest (icons, name, display mode).
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
