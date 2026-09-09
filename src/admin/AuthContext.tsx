import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { DEMO_CREDENTIALS, DEMO_UNLOCK_ENABLED } from '../lib/devFlags';

type AuthEvent = 'INITIAL_SESSION' | 'PASSWORD_RECOVERY' | 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED' | null;

/** Mirrors the app_role enum in supabase/migrations/0001_role_model.sql. */
export type AppRole = 'customer' | 'distributor' | 'super_admin';

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Authoritative role fetched from the server's user_roles table (UI only). */
  role: AppRole | null;
  /** True only when the server reports the super_admin role. */
  isAdmin: boolean;
  /**
   * True once the server role lookup has completed for the current session.
   * Route decisions MUST wait for this: `user && !roleResolved` means the
   * role is still in flight, not that the user lacks the admin role.
   */
  roleResolved: boolean;
  /** Last auth event; PASSWORD_RECOVERY means the user arrived via a reset link. */
  lastEvent: AuthEvent;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<string | null>;
  resetPasswordForEmail: (email: string) => Promise<string | null>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, role: null, isAdmin: false, roleResolved: false, lastEvent: null,
  signIn: async () => null,
  signOut: async () => {},
  updatePassword: async () => null,
  resetPasswordForEmail: async () => null,
});

const VALID_ROLES: readonly AppRole[] = ['customer', 'distributor', 'super_admin'];

/** Fetch the caller's role row. RLS permits reading ONLY the caller's row. */
async function fetchRole(userId: string): Promise<AppRole | null> {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (error || !data) return null;
    const role = (data as { role: string }).role as AppRole;
    return VALID_ROLES.includes(role) ? role : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roleResolved, setRoleResolved] = useState(false);
  const [loading, setLoading]  = useState(true);
  const [lastEvent, setLastEvent] = useState<AuthEvent>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        setSession(data.session);
        setRole(data.session?.user ? await fetchRole(data.session.user.id) : null);
        setRoleResolved(true);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Supabase auth getSession offline or unconfigured:', err);
        setRoleResolved(true);
        setLoading(false);
      });

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
        setSession(s);
        setLastEvent(event as AuthEvent);
        // Re-fetch the authoritative role on session changes; SIGNED_OUT
        // clears it immediately so stale role state can never grant access.
        if (event === 'SIGNED_OUT' || !s?.user) {
          setRole(null);
          setRoleResolved(true);
        } else {
          // A NEW identity just signed in: re-gate routes until the fresh role
          // verdict arrives. Without this, roleResolved is still true from the
          // initial load while `user` is already set — so AdminLogin/Protected
          // evaluated the stale null role and bounced a genuine super_admin to
          // /portal (observed live on production form-login at /admin).
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') setRoleResolved(false);
          setRole(await fetchRole(s.user.id));
          setRoleResolved(true);
        }
      });
      return () => subscription.unsubscribe();
    } catch {
      // safe fallback
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback for demo admin credentials if Supabase is unconfigured or returns invalid credentials.
        // DEMO_CREDENTIALS is null in production builds, so this branch can never match there.
        if (DEMO_UNLOCK_ENABLED && DEMO_CREDENTIALS) {
          const cleanEmail = email.trim().toLowerCase();
          if (
            DEMO_CREDENTIALS.adminEmails.includes(cleanEmail) &&
            DEMO_CREDENTIALS.adminPasswords.includes(password)
          ) {
            const mockUser: User = {
              id: 'admin-demo-user',
              app_metadata: {},
              user_metadata: { name: 'ED Retail Administrator' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
              email: cleanEmail.includes('@') ? cleanEmail : DEMO_CREDENTIALS.superAdminEmail,
            } as User;
            setSession({
              access_token: 'demo-token',
              token_type: 'bearer',
              expires_in: 3600,
              refresh_token: 'demo-refresh-token',
              user: mockUser,
            });
            // Dev-only: the mock admin has no user_roles DB row, so grant the
            // role in-context for the demo session (never set in production —
            // this branch is unreachable when DEMO_UNLOCK_ENABLED is false).
            setRole('super_admin');
            setRoleResolved(true);
            return null;
          }
        }
        return error.message;
      }
      if (data.session) {
        setSession(data.session);
      }
      return null;
    } catch (e: any) {
      if (DEMO_UNLOCK_ENABLED && DEMO_CREDENTIALS) {
        const cleanEmail = email.trim().toLowerCase();
        if (
          DEMO_CREDENTIALS.adminEmails.includes(cleanEmail) &&
          DEMO_CREDENTIALS.adminPasswords.includes(password)
        ) {
          const mockUser: User = {
            id: 'admin-demo-user',
            app_metadata: {},
            user_metadata: { name: 'ED Retail Administrator' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            email: cleanEmail.includes('@') ? cleanEmail : DEMO_CREDENTIALS.superAdminEmail,
          } as User;
          setSession({
            access_token: 'demo-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'demo-refresh-token',
            user: mockUser,
          });
          setRole('super_admin');
          setRoleResolved(true);
          return null;
        }
      }
      return e?.message || 'Authentication failed';
    }
  };

  const signOut = async () => {
    setSession(null);
    setRole(null);
    setRoleResolved(true);
    try {
      await supabase.auth.signOut();
    } catch {
      // safe fallback
    }
  };

  /**
   * Change the signed-in user's password. The current password is verified by
   * re-authenticating with the auth provider before the update, so a stale or
   * wrong current password can never silently succeed. Supabase revokes other
   * sessions on password change; the client session stays valid until signOut.
   */
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    try {
      const email = session?.user?.email;
      if (!email) return 'No active session. Please sign in again.';

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (verifyError) {
        return verifyError.message || 'Your current password is incorrect.';
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) return updateError.message;
      return null;
    } catch (e: any) {
      return e?.message || 'Could not change your password.';
    }
  };

  /** Send a password-reset email (recovery link). */
  const resetPasswordForEmail = async (email: string): Promise<string | null> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/admin/security`,
      });
      return error?.message || null;
    } catch (e: any) {
      return e?.message || 'Could not send the reset email.';
    }
  };

  return (
    <Ctx.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        role,
        isAdmin: role === 'super_admin',
        roleResolved,
        lastEvent,
        signIn,
        signOut,
        updatePassword,
        resetPasswordForEmail,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
