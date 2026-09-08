import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Chrome,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { useDistributorStore, DEFAULT_DISTRIBUTOR } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';
import { DEMO_UNLOCK_ENABLED, DEMO_PIN } from '../../lib/devFlags';

export function DistributorLoginPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const logoutDistributor = useDistributorStore((s) => s.logoutDistributor);
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const setCurrentProfile = (email: string) => {
    const clean = email.trim().toLowerCase();
    const match = savedDistributors.find((d) => d.email.toLowerCase() === clean);
    if (match) {
      useDistributorStore.setState({ currentProfile: match, activeRefSlug: match.slug });
    }
  };

  /* ── Super Admin pull gesture (restored) ─────────────────────────
   * Two upward pulls (>45px) within 2s — or a tap on the footer link —
   * reveal the Super Admin shortcut. NAVIGATION ONLY: it neither
   * authenticates nor grants any role. The admin app still requires a
   * real Supabase session with the server-verified super_admin role. */
  /* ── Super Admin triple-pull gesture (canonical product behavior) ──
   * THREE deliberate upward pulls (>45px) within 3s navigate to /admin.
   * NAVIGATION ONLY: it neither authenticates nor grants any role. The
   * admin app still requires real Supabase auth + server-verified
   * super_admin role. Not advertised in the login UI by design. */
  const [pullCount, setPullCount] = useState(0);
  const lastPullTimeRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const navigateToAdminLogin = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([50, 40, 50]);
    navigate('/admin');
  }, [navigate]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY; // >0 = swipe up
    touchStartYRef.current = null;
    if (deltaY <= 45) return;
    const now = Date.now();
    if (now - lastPullTimeRef.current < 3000) {
      const next = pullCount + 1;
      if (next >= 3) {
        navigateToAdminLogin();
        lastPullTimeRef.current = 0;
        setPullCount(0);
      } else {
        lastPullTimeRef.current = now;
        setPullCount(next);
      }
    } else {
      lastPullTimeRef.current = now;
      setPullCount(1);
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Session restore: a REAL Supabase session sends the user straight to the
  // portal; no session shows the login form. The store flag is UI-only state
  // (not persisted as an authority) — this effect is what re-establishes it.
  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.session) {
          setAdminAuthenticated(true);
          navigate('/portal/dashboard', { replace: true });
        } else if (isAdminAuthenticated && !DEMO_UNLOCK_ENABLED) {
          // Stale persisted flag with no real session → clear it.
          logoutDistributor();
          setAdminAuthenticated(false);
        }
      })
      .catch(() => {
        /* offline — leave state as-is */
      });
    return () => {
      cancelled = true;
    };
  }, [isAdminAuthenticated, logoutDistributor, navigate, setAdminAuthenticated]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetSent(false);

    if (!email.trim() || !password) {
      setError(lang === 'sw' ? 'Tafadhali weka barua pepe na nenosiri.' : 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // Dev-only convenience: demo distributor lookup while
        // VITE_ENABLE_DEMO_UNLOCK=true. Never matches in production.
        if (DEMO_UNLOCK_ENABLED) {
          const ok = useDistributorStore.getState().loginWithEmail(email.trim(), password);
          if (ok) {
            setAdminAuthenticated(true);
            navigate('/portal/dashboard', { replace: true });
            return;
          }
        }
        setError(
          signInError.message ||
            (lang === 'sw'
              ? 'Taarifa za kuingia sio sahihi. Jaribu tena.'
              : 'Invalid credentials. Please try again.')
        );
        return;
      }

      if (!data.session) {
        setError(lang === 'sw' ? 'Hakuna kipindi cha kuingia. Jaribu tena.' : 'No session returned. Please try again.');
        return;
      }

      setCurrentProfile(data.session.user.email || email);
      setAdminAuthenticated(true);
      navigate('/portal/dashboard', { replace: true });
    } catch (err: any) {
      if (DEMO_UNLOCK_ENABLED) {
        const ok = useDistributorStore.getState().loginWithEmail(email.trim(), password);
        if (ok) {
          setAdminAuthenticated(true);
          navigate('/portal/dashboard', { replace: true });
          return;
        }
      }
      setError(err?.message || (lang === 'sw' ? 'Imeshindikana kuingia. Jaribu tena.' : 'Sign-in failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error: sbErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/dashboard`,
        },
      });
      if (sbErr) {
        if (DEMO_UNLOCK_ENABLED) {
          useDistributorStore.getState().loginWithGoogle();
          setAdminAuthenticated(true);
          navigate('/portal/dashboard', { replace: true });
          return;
        }
        setError(sbErr.message || 'Google sign-in is unavailable. Use your email and password.');
      }
    } catch {
      if (DEMO_UNLOCK_ENABLED) {
        useDistributorStore.getState().loginWithGoogle();
        setAdminAuthenticated(true);
        navigate('/portal/dashboard', { replace: true });
        return;
      }
      setError('Google sign-in is unavailable. Use your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError(lang === 'sw' ? 'Tafadhali weka barua pepe yako kwanza.' : 'Enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/portal/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err?.message || 'Could not send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoUnlock = () => {
    if (!DEMO_UNLOCK_ENABLED || !DEMO_PIN) return;
    useDistributorStore.getState().verifyPin(DEMO_PIN);
    setAdminAuthenticated(true);
    navigate('/portal/dashboard', { replace: true });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top bar */}
      <header className="w-full px-4 sm:px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-8 w-auto" />
        </Link>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {lang === 'sw' ? 'Rudi Dukani' : 'Back to Store'}
        </Link>
      </header>

      {/* Auth card */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-gray-900">
              {lang === 'sw' ? 'Ofisi ya Msambazaji' : 'Distributor Portal'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'sw'
                ? 'Ingia kusimamia mauzo, stoo, malengo na CRM yako.'
                : 'Sign in to manage your sales, inventory, goals, and CRM.'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-card p-6 space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-900 font-semibold text-xs rounded-md flex items-center justify-center gap-2.5 transition-colors outline-none disabled:opacity-50"
            >
              <Chrome className="w-4 h-4 text-[#4285F4]" />
              {lang === 'sw' ? 'Ingia na Google' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                {lang === 'sw' ? 'au barua pepe' : 'or email'}
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label htmlFor="portal-email" className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {lang === 'sw' ? 'Barua Pepe' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="portal-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="you@edretail.tz"
                    className="portal-input pl-9"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="portal-password" className="block text-xs font-semibold text-gray-500 mb-1.5">
                  {lang === 'sw' ? 'Nenosiri' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="portal-input pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              {resetSent && (
                <div role="status" className="text-xs text-success bg-green-50 border border-green-200 rounded-md px-3 py-2">
                  {lang === 'sw'
                    ? 'Tumepeleka kiungo cha kuweka upya nenosiri kwa barua pepe yako.'
                    : 'A password reset link has been sent to your email.'}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-md transition-colors outline-none disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'sw' ? 'Ingia' : 'Sign In')}
              </button>
            </form>

            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-center text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors outline-none disabled:opacity-50"
            >
              {lang === 'sw' ? 'Umesahau nenosiri?' : 'Forgot password?'}
            </button>
          </div>

          {/* Dev-only demo access */}
          {DEMO_UNLOCK_ENABLED && (
            <button
              type="button"
              onClick={handleDemoUnlock}
              className="mt-4 w-full py-2 rounded-md border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:border-gray-400 transition-colors flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {lang === 'sw' ? 'Ufikiaji wa Demo (Maendeleo)' : 'Demo access (development only)'}
            </button>
          )}

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 mt-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authorized distributors only · ED Retail
          </p>

          {DEMO_UNLOCK_ENABLED && (
            <p className="text-center text-[10px] text-gray-300 mt-1">{DEFAULT_DISTRIBUTOR.name}</p>
          )}

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-white text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ED Retail Tanzania · Independent Distributor Platform</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/" className="hover:text-gray-600 transition-colors">
            {lang === 'sw' ? 'Duka la Wateja' : 'Customer Storefront'}
          </Link>
        </div>
      </footer>
    </div>
  );
}