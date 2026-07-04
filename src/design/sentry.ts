import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

const dsn = import.meta.env.VITE_SENTRY_DSN || '';

if (dsn) {
  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    tracesSampleRate: 0.05,
    environment: import.meta.env.MODE || 'production',
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
  });
}
