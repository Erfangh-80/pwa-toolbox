# PWA Toolbox – Task Checklist

## 🎯 Project Goal

Build a Next.js App Router PWA sandbox to test and demonstrate browser capabilities. Each feature will be implemented as a separate Client Component card on the main dashboard.

## 🏗️ Architecture & Rules

- **Framework**: Next.js App Router + TypeScript
- **PWA Engine**: Serwist
- **Offline Storage**: `idb`
- **Rule**: Each PR must implement exactly ONE section from this file.
- **Rule**: Do not modify `next.config.ts` or `app/sw.ts` without permission.
- **Rule**: All browser APIs must be called inside `'use client'` components.

---

## Phase 0: Project Setup (Pre-requisite)

- [ ] Initialize Next.js project with TypeScript and App Router.
- [ ] Install and configure Serwist (`@serwist/next`, `serwist`).
- [ ] Install `idb` for IndexedDB.
- [ ] Create `public/manifest.json` with icons (192x192, 512x512) and `display: "standalone"`.
- [ ] Link manifest and PWA meta tags in `app/layout.tsx`.
- [ ] Create the main dashboard layout in `app/page.tsx` with a responsive CSS grid for the cards.
- [ ] Deploy initial skeleton to Vercel (HTTPS required for testing).

---

## Section 1: Installability (InstallCard)

**Goal**: Allow the user to install the app to their home screen/desktop.

- [ ] Create `app/components/InstallCard.tsx` as a Client Component.
- [ ] Listen for the `beforeinstallprompt` event and store the event object in a state.
- [ ] Add an "Install App" button that triggers `promptEvent.prompt()`.
- [ ] Detect if the app is already installed using `window.matchMedia('(display-mode: standalone)')`.
- [ ] Hide the install button and show a success message if already installed.
- [ ] Show a "Not supported" message if the browser doesn't support installation.
- [ ] Add the card to the dashboard grid.

---

## Section 2: Offline Support (OfflineCard)

**Goal**: Ensure the app works without an internet connection.

- [ ] Create `app/components/OfflineCard.tsx` as a Client Component.
- [ ] Display the current network status (Online/Offline) using `navigator.onLine` and `window.addEventListener('online'/'offline')`.
- [ ] Ensure Serwist is caching static assets (JS, CSS, images) by default.
- [ ] (Optional) Create an offline fallback page (e.g., `app/_offline/page.tsx`).
- [ ] Add the card to the dashboard grid.
- [ ] Test: Open the app, turn off Wi-Fi, reload the page, and verify it loads.

---

## Section 3: Background Sync (SyncCard)

**Goal**: Store data while offline and send it automatically when the connection is restored.

- [ ] Create `app/components/SyncCard.tsx` as a Client Component.
- [ ] Create a helper function in `lib/db.ts` to save and retrieve pending items using `idb`.
- [ ] Add a form with an input field and a "Save Offline" button.
- [ ] When the button is clicked and the user is offline, save the input to IndexedDB.
- [ ] Register a sync tag (`sync-messages`) using `navigator.serviceWorker.ready.then(sw => sw.sync.register(...))`.
- [ ] In `app/sw.ts`, listen for the `sync` event. Read pending items from IndexedDB, send them to a mock API (or just log them), and clear them from IndexedDB.
- [ ] Display a list of "Pending Items" in the UI. Remove them from the UI when the sync is complete.
- [ ] Add the card to the dashboard grid.

---

## Section 4: Push Notifications (PushCard)

**Goal**: Request permission and receive push notifications.

- [ ] Create `app/components/PushCard.tsx` as a Client Component.
- [ ] Add an "Enable Notifications" button that calls `Notification.requestPermission()`.
- [ ] Show the current permission status (Granted, Denied, Default).
- [ ] (Optional for Sandbox) Use OneSignal or a simple VAPID setup to subscribe the user.
- [ ] In `app/sw.ts`, listen for the `push` event and display a notification using `self.registration.showNotification()`.
- [ ] Handle the `notificationclick` event in `sw.ts` to open the app.
- [ ] Add a "Test Notification" button (if using a backend/OneSignal) to trigger a test push.
- [ ] Add the card to the dashboard grid.

---

## Section 5: Geolocation (GeoCard)

**Goal**: Fetch and display the user's current coordinates.

- [ ] Create `app/components/GeoCard.tsx` as a Client Component.
- [ ] Check for support using `'geolocation' in navigator`.
- [ ] Add a "Get Location" button that calls `navigator.geolocation.getCurrentPosition()`.
- [ ] Display the latitude, longitude, and accuracy on success.
- [ ] Handle errors gracefully (Permission denied, Timeout, Position unavailable).
- [ ] Add the card to the dashboard grid.

---

## Section 6: Web Bluetooth (BluetoothCard)

**Goal**: Connect to a BLE device. (Note: Does not work on iOS).

- [ ] Create `app/components/BluetoothCard.tsx` as a Client Component.
- [ ] Check for support using `'bluetooth' in navigator`. Show a "Not Supported" message for iOS/Safari.
- [ ] Add a "Scan for Devices" button that calls `navigator.bluetooth.requestDevice({ acceptAllDevices: true })`.
- [ ] Connect to the selected device using `device.gatt.connect()`.
- [ ] Display the connected device's name and ID.
- [ ] Add a "Disconnect" button.
- [ ] Add the card to the dashboard grid.

---

## Section 7: WebUSB (UsbCard)

**Goal**: Connect to a USB device. (Note: Does not work on iOS/Safari).

- [ ] Create `app/components/UsbCard.tsx` as a Client Component.
- [ ] Check for support using `'usb' in navigator`.
- [ ] Add a "Connect USB" button that calls `navigator.usb.requestDevice({ filters: [] })`.
- [ ] Open the device and display its vendor ID, product ID, and name.
- [ ] Add a "Disconnect" button using `device.close()`.
- [ ] Add the card to the dashboard grid.

---

## Section 8: Share Target (ShareTargetCard)

**Goal**: Receive shared links or text from the operating system.

- [ ] Add the `share_target` configuration to `public/manifest.json` (method: GET, action: `/share-target`).
- [ ] Create `app/share-target/page.tsx` to handle the incoming data.
- [ ] Use `useSearchParams` to extract `title`, `text`, and `url` from the query string (wrap the component in `<Suspense>`).
- [ ] Display the received data on the screen.
- [ ] Add a link to this page from the main dashboard.
- [ ] Test: Share a link from Chrome Android to the app.

---

## Section 9: Clipboard (ClipboardCard)

**Goal**: Read from and write to the system clipboard.

- [ ] Create `app/components/ClipboardCard.tsx` as a Client Component.
- [ ] Check for support using `'clipboard' in navigator`.
- [ ] Add an input field and a "Copy" button using `navigator.clipboard.writeText()`.
- [ ] Add a "Paste" button using `navigator.clipboard.readText()` and display the result.
- [ ] Handle permission errors gracefully.
- [ ] Add the card to the dashboard grid.

---

## Section 10: File System Access (FileSystemCard)

**Goal**: Open and save local files. (Note: Desktop Chrome/Edge only).

- [ ] Create `app/components/FileSystemCard.tsx` as a Client Component.
- [ ] Check for support using `'showOpenFilePicker' in window`.
- [ ] Add an "Open File" button using `showOpenFilePicker()`. Read the file text and display it.
- [ ] Add a "Save File" button using `showSaveFilePicker()` and a writable stream to save the text.
- [ ] Add the card to the dashboard grid.

---

## Section 11: Network Info (NetworkCard)

**Goal**: Display real-time network connection status.

- [ ] Create `app/components/NetworkCard.tsx` as a Client Component.
- [ ] Listen to `online` and `offline` events on `window` to update the status.
- [ ] Display the status (Online/Offline).
- [ ] (Optional) Display the connection type using `navigator.connection.effectiveType`.
- [ ] Add the card to the dashboard grid.

---

## Section 12: Badging API (BadgeCard)

**Goal**: Set a badge number on the app icon.

- [ ] Create `app/components/BadgeCard.tsx` as a Client Component.
- [ ] Check for support using `'setAppBadge' in navigator`.
- [ ] Add an input field for the number and a "Set Badge" button using `navigator.setAppBadge(number)`.
- [ ] Add a "Clear Badge" button using `navigator.clearAppBadge()`.
- [ ] Add the card to the dashboard grid.

---

## Final Phase: Testing & Deployment

- [ ] Test all cards on Chrome Desktop.
- [ ] Test all cards on Chrome Android (especially Bluetooth, Share Target, Badging).
- [ ] Test basic features on Safari iOS (expect limitations for Bluetooth, USB, File System).
- [ ] Verify Lighthouse PWA audit score is high (Green).
- [ ] Ensure `npm run build` passes without errors.
- [ ] Deploy final version to Vercel.
