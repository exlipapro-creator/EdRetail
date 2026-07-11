/**
 * Observability stub — Phase 5
 *
 * To enable Sentry, install the packages and replace this file:
 *   npm install @sentry/react @sentry/tracing
 *
 * Then set VITE_SENTRY_DSN in your .env / Render env vars.
 * Until then this is a no-op so the build stays clean.
 */

export async function initObservability(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  // Dynamic import — only loads Sentry bundle when DSN is present at runtime.
  // Uncomment once @sentry/react and @sentry/tracing are installed:
  //
  // const [{ default: Sentry }, { BrowserTracing }] = await Promise.all([
  //   import('@sentry/react'),
  //   import('@sentry/tracing'),
  // ]);
  // Sentry.init({
  //   dsn,
  //   integrations: [new BrowserTracing()],
  //   tracesSampleRate: 0.05,
  //   environment: (import.meta.env.MODE as string) || 'production',
  //   release: (import.meta.env.VITE_SENTRY_RELEASE as string) || undefined,
  // });
}
