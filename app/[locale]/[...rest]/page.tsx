import { notFound } from "next/navigation";

/**
 * Catch-all inside `[locale]` so unknown paths render the localized `not-found.tsx`
 * (with the locale layout, translations and correct `dir`) instead of a bare 404.
 */
export default function CatchAllPage() {
  notFound();
}
