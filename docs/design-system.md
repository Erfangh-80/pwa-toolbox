# Design System – PWA Toolbox

Generated with the `ui-ux-pro-max` skill (Python 3.11 available in the sandbox).

```bash
python3 .agents/skills/ui-ux-pro-max/scripts/search.py \
  "developer tools PWA browser API sandbox dashboard" \
  --design-system -p "PWA Toolbox" -f markdown --density 7
```

## 1. Direction

| Item | Decision |
| --- | --- |
| Pattern | Documentation/utility dashboard: hero → capability grid → footnote |
| Style | Minimalism & Swiss Style (grid-based, high contrast, no decoration) |
| Mood | Code, developer, precise, functional |
| Mode | Dark-only (`color-scheme: dark`). The source palette is a "code dark" palette. |
| Density | 7/10 — standard dashboard spacing (8/12/16/24/32 px scale) |
| Effects | 150–250 ms hover/focus transitions, flat surfaces, no large shadows |

## 2. Color tokens

Defined once in `app/globals.css` inside Tailwind v4's `@theme` block, so they are
usable as utilities (`bg-surface`, `text-muted`, `border-line`, `text-accent`, …).

| Role | Hex | Utility |
| --- | --- | --- |
| Canvas / background | `#020617` | `bg-canvas` |
| Card surface | `#0E1223` | `bg-surface` |
| Raised surface (inputs, icon chips) | `#151B2E` | `bg-surface-raised` |
| Border | `#263247` | `border-line` |
| Border (strong) | `#3A4A68` | `border-line-strong` |
| Foreground | `#F8FAFC` | `text-ink` |
| Muted foreground | `#94A3B8` | `text-muted` |
| Accent / CTA | `#22C55E` | `bg-accent` / `text-accent` |
| Accent foreground | `#04120A` | `text-accent-ink` |
| Info | `#38BDF8` | `text-info` |
| Warning / unsupported | `#F59E0B` | `text-warn` |
| Danger / error | `#EF4444` | `text-danger` |

Contrast: `#F8FAFC` on `#0E1223` ≈ 17:1, `#94A3B8` on `#0E1223` ≈ 7:1,
`#04120A` on `#22C55E` ≈ 10:1 — all above WCAG AA 4.5:1.

## 3. Typography

| Role | Font | Fallback stack |
| --- | --- | --- |
| Headings / data / labels | JetBrains Mono | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| Body | IBM Plex Sans | `system-ui, -apple-system, "Segoe UI", sans-serif` |

Fonts are referenced by family name only (no remote `@font-face`) so builds do not
depend on Google Fonts being reachable; installed fonts are used when present and
the stack degrades to system UI fonts otherwise.

Scale: `12px` labels (uppercase, `0.14em` tracking) · `14px` body · `15px` card
title · `clamp(28px, 4vw, 40px)` page title. Body line-height `1.5+`.

## 4. Spacing, radius, elevation

- Spacing: 4 / 8 / 12 / 16 / 24 / 32 px (`gap-1` … `gap-8`).
- Radius: `rounded-lg` (8px) controls, `rounded-2xl` (16px) cards, `rounded-full` pills.
- Elevation: one hairline border + `--shadow-card` (barely visible, dark-only).
- Touch targets: minimum 44×44 px (`min-h-11`), 8px minimum between controls.

## 5. Component anatomy

- **Card** (`app/components/ui/Card.tsx`): icon chip → eyebrow (`S03 · IndexedDB`) →
  title → support pill → description → body → footnote. Same padding, radius, border
  on every card.
- **Support pill**: `checking` (slate dot), `supported` (green dot), `unsupported`
  (amber dot). Support is resolved in `useEffect`, never during render, so SSR and
  hydration stay identical.
- **Buttons**: primary (accent fill), secondary (border), danger (red text/border),
  ghost. Always `<button type>`, always 44px tall, disabled state at 40% opacity.
- **Notice**: inline status line with `info` / `success` / `warn` / `danger` tones;
  `danger` uses `role="alert"`, others `role="status"` inside an `aria-live` region.
- **Data list**: two-column definition list with mono values for coordinates, IDs,
  permission states, etc.
- **Icons**: inline 24×24 stroke SVGs (`app/components/ui/icons.tsx`), never emoji.

## 6. Interaction & accessibility rules

- Hover/press feedback in 150–250 ms; `prefers-reduced-motion` collapses all motion.
- Visible focus ring (`outline: 2px solid accent`, 2px offset) on every interactive element.
- Every input has a real `<label>`; helper/error text sits next to its field.
- Busy actions set `aria-busy` + disabled buttons and announce the outcome.
- Unsupported APIs are never hidden silently: the card renders a "Not supported in
  this browser" notice and disables the action, keeping the explanation visible.
- Layout verified at 375 / 768 / 1024 / 1440 px; cards are one column below 640px.

## 7. Anti-patterns (rejected by the skill output)

- Buried endpoints, missing rate-limit/error states: every action surfaces its own
  result or error inline.
- No emoji icons, no mixed flat/skeuomorphic styles, no raw hex values in components
  (tokens only), no text below 12px.

## 8. Localization & RTL (en / fa)

| Concern | Decision |
| --- | --- |
| Direction | `<html dir>` is `rtl` for `fa`, `ltr` for `en` — set once in `app/[locale]/layout.tsx`. |
| Layout mirroring | Only logical utilities: `ms-*`/`me-*`, `ps-*`/`pe-*`, `text-start`/`text-end`, `start-*`/`end-*`. Flex/grid rows flip automatically with `dir`. |
| Directional icons | Arrows swap with the `rtl:` variant (`rtl:-scale-x-100`) instead of a second icon. |
| Latin values in RTL | `.bidi-plain` (`unicode-bidi: plaintext`) on data values, URLs and pasted text so identifiers keep their own direction while staying start-aligned. |
| Fonts | `[lang="fa"]` swaps `--font-sans`/`--font-mono` for a Persian stack (Vazirmatn → IRANSans → Noto Naskh Arabic → Segoe UI → Tahoma). No remote font loading. |
| Tracking | `[lang="fa"] [class*="tracking-"] { letter-spacing: normal }` — letter-spacing breaks connected Arabic script. |
| Line height | Persian body line-height is raised to `1.75`. |
| Numbers & dates | `useFormatter()` → Persian digits and Jalali dates on `fa` pages (byte units stay SI: KB/MB). |
| Labels | Uppercase/tracking eyebrows are kept in English and neutralised in Persian; card eyebrows become `بخش ۰۱ · API`. |
| Touch targets | unchanged: 44×44 px minimum, also in RTL. |
