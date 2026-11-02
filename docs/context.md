# Coding Standards & Conventions – PWA Toolbox

## 1. Component Rules

- Every card in `app/components/` must start with the `'use client';` directive.
- Do not fetch browser APIs during the initial render. Use `useEffect` or event handlers (e.g., `onClick`) to prevent hydration errors.

## 2. Error Handling

- When interacting with browser APIs, always check for support first:
  `if (!('bluetooth' in navigator)) { return <p>Not supported</p>; }`
- Use `try...catch` blocks for async API calls (like `navigator.clipboard.writeText()`).
- Display user-friendly error messages in the UI (e.g., "Permission denied").

## 3. Styling & UI

- Follow the design system saved in `docs/design-system.md`.
- Keep cards visually consistent (same padding, border-radius, shadows).
- Use semantic HTML (e.g., `<button>` for actions, not `<div onClick>`).

## 4. Code Style

- Use functional components and hooks.
- Keep components focused on a single feature. Do not combine logic for Bluetooth and Clipboard in one file.
- Prefer named exports for components (e.g., `export const InstallCard = () => {}`).
