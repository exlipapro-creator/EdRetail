import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../context/LangContext';

/**
 * Customer password recovery landing (/account/reset-password).
 *
 * Supabase emails a recovery link; the embedded hash carries a recovery
 * session. This page detects it (PASSWORD_RECOVERY event or an existing
 * session), lets the customer set a new password via supabase.auth.updateUser,
 * then returns them to the storefront — signed in.
 */
export function CustomerResetPasswordPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false); // recovery session established
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' && session) {
        setReady(true);
        setChecking(false);
      }
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        // A recovery link carries a session even if the event already fired
        // before this page mounted.
        if (data.session) setReady(true);
        setChecking(false);
      })
      .catch(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      setError(lang === 'sw' ? 'Neno la siri lina herufi 8 au zaidi.' : 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError(lang === 'sw' ? 'Maneno ya siri hayafanani.' : 'Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSuccess(true);
    // Redirect to the storefront once the success state has been read.
    setTimeout(() => navigate('/', { replace: true }), 1800);
  };

  const inputBase =
    'w-full pl-10 pr-11 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#123B6D] focus:ring-2 focus:ring-[#123B6D]/10 outline-none transition-all';

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Brand header — same anchor as the storefront */}
      <header className="border-b border-neutral-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo/wordmark.png" alt="ED Retail Tanzania" className="h-8 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className="text-xs font-bold text-neutral-500 hover:text-[#123B6D] transition-colors"
          >
            {lang === 'sw' ? '? Rudi Duka' : '? Back to Shop'}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-neutral-200/70 shadow-xs p-6 sm:p-8">
            {checking ? (
              <div className="py-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
              </div>
            ) : !ready ? (
              /* No recovery session — the link is missing, expired, or used. */
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h1 className="text-lg font-extrabold text-neutral-900">
                  {lang === 'sw' ? 'Kiungo Hakipatikani' : 'Link not valid'}
                </h1>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {lang === 'sw'
                    ? 'Kiungo cha kubadilisha neno la siri kimeisha au kimetumika. Omba kingine.'
                    : 'This password reset link has expired or was already used. Request a new one.'}
                </p>
                <Link
                  to="/"
                  className="inline-block w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors"
                >
                  {lang === 'sw' ? 'Rudi Dukani' : 'Back to Shop'}
                </Link>
              </div>
            ) : success ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h1 className="text-lg font-extrabold text-neutral-900">
                  {lang === 'sw' ? 'Neno la Siri Limebadilishwa' : 'Password updated'}
                </h1>
                <p className="text-xs text-neutral-500">
                  {lang === 'sw' ? 'Inakuleta dukani...' : 'Taking you back to the shop...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <h1 className="text-lg font-extrabold text-neutral-900">
                    {lang === 'sw' ? 'Weka Neno Jipya la Siri' : 'Set a new password'}
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {lang === 'sw'
                      ? 'Chagua neno jipya la siri kwa akaunti yako.'
                      : 'Choose a new password for your account.'}
                  </p>
                </div>

                {error && (
                  <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                    {error}
                  </p>
                )}

                <div>
                  <label htmlFor="cust-reset-pw" className="block text-xs font-bold text-neutral-700 mb-1.5">
                    {lang === 'sw' ? 'Neno jipya la siri' : 'New password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="cust-reset-pw"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={lang === 'sw' ? 'Herufi 8+' : '8+ characters'}
                      className={inputBase}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 cursor-pointer"
                    >
                      {showPw ? (lang === 'sw' ? 'Ficha' : 'Hide') : lang === 'sw' ? 'Onyesha' : 'Show'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="cust-reset-pw2" className="block text-xs font-bold text-neutral-700 mb-1.5">
                    {lang === 'sw' ? 'Thibitisha neno la siri' : 'Confirm password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="cust-reset-pw2"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputBase}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {lang === 'sw' ? 'Hifadhi Neno la Siri' : 'Save new password'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[11px] text-neutral-400 mt-4">
            {lang === 'sw' ? 'Usiwahi shiriki neno lako la siri na mtu yeyote.' : 'Never share your password with anyone.'}
          </p>
        </div>
      </main>
    </div>
  );
}
