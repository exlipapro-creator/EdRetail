// Development feature flags and demo credentials gate.
//
// Production builds statically replace `import.meta.env.DEV` with `false`, so
// the DEMO_CREDENTIALS object below (a literal-false ternary) is folded away
// by esbuild and NEVER ships in production JavaScript. Demo credentials must
// only ever be referenced through this module — never as raw literals in
// feature code.

export const DEMO_UNLOCK_ENABLED = Boolean(
  import.meta.env.DEV && (import.meta.env.VITE_ENABLE_DEMO_UNLOCK === 'true')
);

export interface DemoCredentials {
  /** Accepted admin sign-in emails (dev only). */
  adminEmails: string[];
  /** Accepted admin sign-in passwords (dev only). */
  adminPasswords: string[];
  /** Super-admin demo credentials (dev only). */
  superAdminEmail: string;
  superAdminPassword: string;
  /** Owner PIN for the distributor back-office demo (dev only). */
  pin: string;
}

/**
 * Demo credentials exist ONLY for development (VITE_ENABLE_DEMO_UNLOCK=true).
 * In production this constant is `null` and all credential strings are
 * eliminated from the bundle at build time.
 */
export const DEMO_CREDENTIALS: DemoCredentials | null = import.meta.env.DEV
  ? {
      adminEmails: ['admin@edretail.tz', 'admin@edretail.com', 'admin'],
      adminPasswords: ['admin123', 'admin', '255', '1234'],
      superAdminEmail: 'admin@edretail.tz',
      superAdminPassword: 'admin123',
      pin: import.meta.env.VITE_DEFAULT_ADMIN_PIN ?? '2580',
    }
  : null;

export const DEMO_PIN = DEMO_CREDENTIALS?.pin ?? '';

export const USE_MOCK_SUPABASE = Boolean(
  import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_SUPABASE === 'true')
);