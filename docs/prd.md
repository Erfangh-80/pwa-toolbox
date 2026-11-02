# Product Requirements Document (PRD) – PWA Toolbox

## 1. Overview

PWA Toolbox is a Next.js-based Progressive Web App (PWA) designed as a **sandbox** for developers to test and interact with modern browser APIs. It is not a consumer product; it is a practical laboratory.

## 2. Target Audience

- Frontend developers learning PWA capabilities.
- The developer (you) testing API behaviors across different browsers (Chrome, Safari, Firefox) and devices (Desktop, Android, iOS).

## 3. Scope (Features)

The application will consist of a central dashboard with individual cards for:

1.  **Installability**: Triggering `beforeinstallprompt` and detecting standalone mode.
2.  **Offline**: Caching static assets and displaying online/offline status.
3.  **Background Sync**: Storing data in IndexedDB while offline and syncing when online.
4.  **Push Notifications**: Requesting permission and receiving push messages.
5.  **Geolocation**: Fetching current coordinates.
6.  **Web Bluetooth**: Connecting to BLE devices (Chrome/Android only).
7.  **WebUSB**: Connecting to USB devices (Chrome/Edge desktop only).
8.  **Share Target**: Receiving shared links/files from the OS.
9.  **Clipboard**: Reading from and writing to the clipboard.
10. **File System Access**: Opening and saving local files.
11. **Network Info**: Displaying connection type and status.
12. **Badging**: Setting the app icon badge number.

## 4. Non-Goals (Out of Scope)

- This is **not** a production-ready app. It doesn't need a backend database for user data (except a simple mock endpoint for Sync/Push).
- No authentication or user management.
- No complex state management (Redux, etc.).

## 5. Acceptance Criteria (Per Card)

Each card must:

- Clearly state if the API is supported in the current browser.
- Have a primary action button (e.g., "Get Location").
- Display the result or error message visually.
- Handle edge cases (e.g., permission denied).
