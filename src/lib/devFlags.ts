// Development feature flags and demo credentials gate
// This module centralizes dev-only flags so production bundles do not contain demo credentials.

export const DEMO_UNLOCK_ENABLED = Boolean(
  import.meta.env.DEV && (import.meta.env.VITE_ENABLE_DEMO_UNLOCK === 'true')
);

export const DEMO_PIN = DEMO_UNLOCK_ENABLED ? (import.meta.env.VITE_DEFAULT_ADMIN_PIN ?? '2580') : '';

export const USE_MOCK_SUPABASE = Boolean(
  import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_SUPABASE === 'true')
);
