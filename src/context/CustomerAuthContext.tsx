import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Storefront customer identity — the CUSTOMER auth layer.
 *
 * Distinct from the distributor portal and admin portal auth: this context
 * lives only under the storefront routes, treats anonymous browsing as the
 * primary state, and never blocks a purchase (checkout stays guest-first —
 * `sales` rows are intentionally anonymous per the RLS model).
 *
 * Session truth: the Supabase session is the only authority. While the
 * initial `getSession()` is in flight, status is 'restoring' and the UI
 * renders anonymous-safe (no greeting, no name) so identity never flickers.
 * The role comes from the server-side `user_roles` table — never from the
 * JWT metadata or client guesswork.
 */

export type CustomerRole = 'customer' | 'distributor' | 'super_admin';

/** 'restoring' → anonymous-safe rendering while the session resolves. */
export type CustomerAuthStatus = 'restoring' | 'anonymous' | 'authenticated';

export type CustomerAuthModalMode = 'signin' | 'signup' | 'forgot' | 'sent' | 'account';

export interface CustomerIdentity {
  id: string;
  email: string;
  fullName: string;
  phone: string;
}

interface MethodResult {
  error: string | null;
  /** signUp only: true when the project requires email confirmation. */
  needsEmailConfirmation?: boolean;
}

interface CustomerAuthContextValue {
  status: CustomerAuthStatus;
  role: CustomerRole | null;
  customer: CustomerIdentity | null;
  /** Restrained greeting source — empty unless genuinely authenticated. */
  greetingName: string;
  modalOpen: boolean;
  modalMode: CustomerAuthModalMode;
  openAuth: (mode?: CustomerAuthModalMode) => void;
  closeAuth: () => void;
  signInWithPassword: (email: string, password: string) => Promise<MethodResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<MethodResult>;
  signInWithGoogle: () => Promise<MethodResult>;
  sendPasswordReset: (email: string) => Promise<MethodResult>;
  updatePassword: (newPassword: string) => Promise<MethodResult>;
  signOut: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

function identityFromUser(user: User): CustomerIdentity {
  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const fullName = typeof meta.full_name === 'string' ? meta.full_name.trim() : '';
  const phone = typeof meta.phone === 'string' ? meta.phone.trim() : '';
  return {
    id: user.id,
    email: user.email || '',
    fullName,
    phone,
  };
}

function greetingFromIdentity(identity: CustomerIdentity): string {
  if (identity.fullName) return identity.fullName.split(/\s+/)[0];
  const local = identity.email.split('@')[0] || '';
  if (!local) return '';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CustomerAuthStatus>('restoring');
  const [role, setRole] = useState<CustomerRole | null>(null);
  const [identity, setIdentity] = useState<CustomerIdentity | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<CustomerAuthModalMode>('signin');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Server-derived role for the signed-in user. owner-scoped select per RLS.
  const resolveRole = useCallback(async (userId: string): Promise<CustomerRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error || !data?.role) return 'customer';
      return data.role as CustomerRole;
    } catch {
      // Offline/unavailable — treat as customer (least privilege for UI).
      return 'customer';
    }
  }, []);

  const applySession = useCallback(
    async (session: Session | null) => {
      if (!session?.user) {
        if (mounted.current) {
          setStatus('anonymous');
          setRole(null);
          setIdentity(null);
        }
        return;
      }
      const nextIdentity = identityFromUser(session.user);
      const nextRole = await resolveRole(session.user.id);
      if (!mounted.current) return;
      setIdentity(nextIdentity);
      setRole(nextRole);
      setStatus('authenticated');
    },
    [resolveRole]
  );

  // Initial restore + live session changes. No flicker: status only leaves
  // 'restoring' once the real session verdict is in.
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        void applySession(session);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data.session))
      .catch(() => {
        if (mounted.current) setStatus('anonymous');
      });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const openAuth = useCallback((mode: CustomerAuthModalMode = 'signin') => {
    setModalMode(mode);
    setModalOpen(true);
  }, []);

  const closeAuth = useCallback(() => setModalOpen(false), []);

  const signInWithPassword = useCallback(async (email: string, password: string): Promise<MethodResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return { error: error ? error.message : null };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName: string): Promise<MethodResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: fullName.trim() ? { data: { full_name: fullName.trim() } } : undefined,
      });
      if (error) return { error: error.message };
      // Email confirmation enabled server-side → no session yet.
      return { error: null, needsEmailConfirmation: !data.session };
    },
    []
  );

  const signInWithGoogle = useCallback(async (): Promise<MethodResult> => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    return { error: error ? error.message : null };
  }, []);

  const sendPasswordReset = useCallback(async (email: string): Promise<MethodResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    return { error: error ? error.message : null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<MethodResult> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Session may already be gone; the SIGNED_OUT event still resets state.
    }
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      status,
      role,
      customer: identity,
      greetingName: identity ? greetingFromIdentity(identity) : '',
      modalOpen,
      modalMode,
      openAuth,
      closeAuth,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
    }),
    [
      status,
      role,
      identity,
      modalOpen,
      modalMode,
      openAuth,
      closeAuth,
      signInWithPassword,
      signUp,
      signInWithGoogle,
      sendPasswordReset,
      updatePassword,
      signOut,
    ]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
