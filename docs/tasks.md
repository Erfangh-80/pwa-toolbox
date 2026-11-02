# PWA Toolbox – Task Checklist

## 🎯 Project Goal

Build a Next.js App Router PWA sandbox to test and demonstrate browser capabilities. Each feature will be implemented as a separate Client Component card on the main dashboard.

> **Implementation status**: Sections 1–12 are implemented as client components on the
> dashboard (`app/page.tsx` + `app/components/*.tsx`), with the design system in
> `docs/design-system.md` and the PWA manifest in `public/manifest.json`.
>
> Items that require changing the protected `next.config.ts` / `app/sw.ts` remain open:
> Serwist is installed but not wired into the build, so no worker is generated, nothing
> is cached by default and there is no `sync` / `push` / `notificationclick` handler yet.
> The sync card is written against that future worker: it queues into IndexedDB
> (`pwa-toolbox` → `pending-messages`), requests the `sync-messages` tag when a
> registration exists, and otherwise flushes to the mock endpoint `POST /api/sync` as
> soon as the browser reports `online`. Push works through
> `Notification` / `registration.showNotification()` where available. Device testing,
> the Lighthouse audit and Vercel deployment are left to the maintainer.

## 🏗️ Architecture & Rules

- **Framework**: Next.js App Router + TypeScript
- **PWA Engine**: Serwist
- **Offline Storage**: `idb`
- **Rule**: Each PR must implement exactly ONE section from this file.
- **Rule**: Do not modify `next.config.ts` or `app/sw.ts` without permission.
- **Rule**: All browser APIs must be called inside `'use client'` components.

---

## Phase 0: Project Setup (Pre-requisite)

- [x] Initialize Next.js project with TypeScript and App Router.
- [ ] Install and configure Serwist (`@serwist/next`, `serwist`).
- [x] Install `idb` for IndexedDB.
- [x] Create `public/manifest.json` with icons (192x192, 512x512) and `display: "standalone"`.
- [x] Link manifest and PWA meta tags in `app/layout.tsx`.
- [x] Create the main dashboard layout in `app/page.tsx` with a responsive CSS grid for the cards.
- [ ] Deploy initial skeleton to Vercel (HTTPS required for testing).

---

## Section 1: Installability (InstallCard)

**Goal**: Allow the user to install the app to their home screen/desktop.

- [x] Create `app/components/InstallCard.tsx` as a Client Component.
- [x] Listen for the `beforeinstallprompt` event and store the event object in a state.
- [x] Add an "Install App" button that triggers `promptEvent.prompt()`.
- [x] Detect if the app is already installed using `window.matchMedia('(display-mode: standalone)')`.
- [x] Hide the install button and show a success message if already installed.
- [x] Show a "Not supported" message if the browser doesn't support installation.
- [x] Add the card to the dashboard grid.

---

## Section 2: Offline Support (OfflineCard)

**Goal**: Ensure the app works without an internet connection.

- [x] Create `app/components/OfflineCard.tsx` as a Client Component.
- [x] Display the current network status (Online/Offline) using `navigator.onLine` and `window.addEventListener('online'/'offline')`.
- [ ] Ensure Serwist is caching static assets (JS, CSS, images) by default.
- [ ] (Optional) Create an offline fallback page (e.g., `app/_offline/page.tsx`).
- [x] Add the card to the dashboard grid.
- [ ] Test: Open the app, turn off Wi-Fi, reload the page, and verify it loads.

---

## Section 3: Background Sync (SyncCard)

**Goal**: Store data while offline and send it automatically when the connection is restored.

- [x] Create `app/components/SyncCard.tsx` as a Client Component.
- [x] Create a helper function in `lib/db.ts` to save and retrieve pending items using `idb`.
- [x] Add a form with an input field and a "Save Offline" button.
- [x] When the button is clicked and the user is offline, save the input to IndexedDB.
- [x] Register a sync tag (`sync-messages`) using `navigator.serviceWorker.ready.then(sw => sw.sync.register(...))`.
- [ ] In `app/sw.ts`, listen for the `sync` event. Read pending items from IndexedDB, send them to a mock API (or just log them), and clear them from IndexedDB.
- [x] Display a list of "Pending Items" in the UI. Remove them from the UI when the sync is complete.
- [x] Add the card to the dashboard grid.

---

## Section 4: Push Notifications (PushCard)

**Goal**: Request permission and receive push notifications.

- [x] Create `app/components/PushCard.tsx` as a Client Component.
- [x] Add an "Enable Notifications" button that calls `Notification.requestPermission()`.
- [x] Show the current permission status (Granted, Denied, Default).
- [x] (Optional for Sandbox) Use OneSignal or a simple VAPID setup to subscribe the user.
- [ ] In `app/sw.ts`, listen for the `push` event and display a notification using `self.registration.showNotification()`.
- [ ] Handle the `notificationclick` event in `sw.ts` to open the app.
- [x] Add a "Test Notification" button (if using a backend/OneSignal) to trigger a test push.
- [x] Add the card to the dashboard grid.

---

## Section 5: Geolocation (GeoCard)

**Goal**: Fetch and display the user's current coordinates.

- [x] Create `app/components/GeoCard.tsx` as a Client Component.
- [x] Check for support using `'geolocation' in navigator`.
- [x] Add a "Get Location" button that calls `navigator.geolocation.getCurrentPosition()`.
- [x] Display the latitude, longitude, and accuracy on success.
- [x] Handle errors gracefully (Permission denied, Timeout, Position unavailable).
- [x] Add the card to the dashboard grid.

---

## Section 6: Web Bluetooth (BluetoothCard)

**Goal**: Connect to a BLE device. (Note: Does not work on iOS).

- [x] Create `app/components/BluetoothCard.tsx` as a Client Component.
- [x] Check for support using `'bluetooth' in navigator`. Show a "Not Supported" message for iOS/Safari.
- [x] Add a "Scan for Devices" button that calls `navigator.bluetooth.requestDevice({ acceptAllDevices: true })`.
- [x] Connect to the selected device using `device.gatt.connect()`.
- [x] Display the connected device's name and ID.
- [x] Add a "Disconnect" button.
- [x] Add the card to the dashboard grid.

---

## Section 7: WebUSB (UsbCard)

**Goal**: Connect to a USB device. (Note: Does not work on iOS/Safari).

- [x] Create `app/components/UsbCard.tsx` as a Client Component.
- [x] Check for support using `'usb' in navigator`.
- [x] Add a "Connect USB" button that calls `navigator.usb.requestDevice({ filters: [] })`.
- [x] Open the device and display its vendor ID, product ID, and name.
- [x] Add a "Disconnect" button using `device.close()`.
- [x] Add the card to the dashboard grid.

---

## Section 8: Share Target (ShareTargetCard)

**Goal**: Receive shared links or text from the operating system.

- [x] Add the `share_target` configuration to `public/manifest.json` (method: GET, action: `/share-target`).
- [x] Create `app/share-target/page.tsx` to handle the incoming data.
- [x] Use `useSearchParams` to extract `title`, `text`, and `url` from the query string (wrap the component in `<Suspense>`).
- [x] Display the received data on the screen.
- [x] Add a link to this page from the main dashboard.
- [x] Test: Share a link from Chrome Android to the app.

---

## Section 9: Clipboard (ClipboardCard)

**Goal**: Read from and write to the system clipboard.

- [x] Create `app/components/ClipboardCard.tsx` as a Client Component.
- [x] Check for support using `'clipboard' in navigator`.
- [x] Add an input field and a "Copy" button using `navigator.clipboard.writeText()`.
- [x] Add a "Paste" button using `navigator.clipboard.readText()` and display the result.
- [x] Handle permission errors gracefully.
- [x] Add the card to the dashboard grid.

---

## Section 10: File System Access (FileSystemCard)

**Goal**: Open and save local files. (Note: Desktop Chrome/Edge only).

- [x] Create `app/components/FileSystemCard.tsx` as a Client Component.
- [x] Check for support using `'showOpenFilePicker' in window`.
- [x] Add an "Open File" button using `showOpenFilePicker()`. Read the file text and display it.
- [x] Add a "Save File" button using `showSaveFilePicker()` and a writable stream to save the text.
- [x] Add the card to the dashboard grid.

---

## Section 11: Network Info (NetworkCard)

**Goal**: Display real-time network connection status.

- [x] Create `app/components/NetworkCard.tsx` as a Client Component.
- [x] Listen to `online` and `offline` events on `window` to update the status.
- [x] Display the status (Online/Offline).
- [x] (Optional) Display the connection type using `navigator.connection.effectiveType`.
- [x] Add the card to the dashboard grid.

---

## Section 12: Badging API (BadgeCard)

**Goal**: Set a badge number on the app icon.

- [x] Create `app/components/BadgeCard.tsx` as a Client Component.
- [x] Check for support using `'setAppBadge' in navigator`.
- [x] Add an input field for the number and a "Set Badge" button using `navigator.setAppBadge(number)`.
- [x] Add a "Clear Badge" button using `navigator.clearAppBadge()`.
- [x] Add the card to the dashboard grid.

---

## Final Phase: Testing & Deployment

- [ ] Test all cards on Chrome Desktop.
- [ ] Test all cards on Chrome Android (especially Bluetooth, Share Target, Badging).
- [ ] Test basic features on Safari iOS (expect limitations for Bluetooth, USB, File System).
- [ ] Verify Lighthouse PWA audit score is high (Green).
- [x] Ensure `npm run build` passes without errors.
- [ ] Deploy final version to Vercel.
