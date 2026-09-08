/**
 * Canonical public origin for URLs that OUTLIVE the current browsing
 * session — flyer QR destinations and anything else baked into a
 * persistent artifact (DB row, rendered PNG shared on WhatsApp).
 *
 * Why: a QR generated from `window.location.origin` while a distributor
 * works on localhost permanently embeds a localhost URL in a public
 * marketing asset. Deployment surfaces must win over the browsing origin.
 *
 * Priority:
 *   1. VITE_PUBLIC_SITE_URL — set on the deploy host (e.g. Render), the
 *      production domain (no trailing slash).
 *   2. window.location.origin — correct for session-scoped links and for
 *      development when no deploy URL is configured.
 *   3. http://localhost:3000 — build-time/SSR fallback only.
 */
export function publicSiteOrigin(): string {
  const fromEnv = (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
