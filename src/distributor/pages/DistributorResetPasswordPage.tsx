import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLang } from '../../context/LangContext';

type Strength = 0 | 1 | 2 | 3;

function passwordStrength(pw: string): Strength {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) s++;
  return s as Strength;
}

export function DistributorResetPasswordPage() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false); // recovery session established
  const [checking, setChecking] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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
        // A recovery flow carries a session with access_token even if the
        // PASSWORD_RECOVERY event already fired before mount.
        if (data.session) {
          setReady(true);
        }
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

  const strength = passwordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(lang === 'sw' ? 'Nenosiri lazima liwe na angalau herufi 8.' : 'Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError(lang === 'sw' ? 'Nenosiri hazifanani.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setSuccess(true);
      // Supabase revokes active sessions after a password change; signing out
      // here keeps the client state consistent with the auth provider.
      await supabase.auth.signOut().catch(() => {});
      setTimeout(() => navigate('/portal', { replace: true }), 1800);
    } catch (err: any) {
      setError(err?.message || 'Could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="w-full px-4 sm:px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <img src="/logo/wordmark.png" alt="ED Retail" className="h-8 w-auto" />
        <Link
          to="/portal"
          className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          {lang === 'sw' ? 'Rudi Kwenye Kuingia' : 'Back to Sign In'}
        </Link>
      </header>

      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-lg font-bold text-gray-900">
              {lang === 'sw' ? 'Weka Upya Nenosiri' : 'Reset Password'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {lang === 'sw'
                ? 'Weka nenosiri jipya la akaunti yako.'
                : 'Choose a new password for your account.'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-card p-6">
            {checking ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary-500 animate-spin" aria-label="Loading" />
              </div>
            ) : !ready ? (
              <div className="space-y-4 text-center py-4">
                <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600">
                  {lang === 'sw'
                    ? 'Kiungo hiki ni batili au kimeisha muda wake. Tafadhali omba kiungo kipya.'
                    : 'This link is invalid or has expired. Please request a new one.'}
                </p>
                <Link
                  to="/portal"
                  className="inline-block px-4 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors"
                >
                  {lang === 'sw' ? 'Ombia Kiungo Kipya' : 'Request a New Link'}
                </Link>
              </div>
            ) : success ? (
              <div className="space-y-4 text-center py-4">
                <CheckCircle2 className="w-10 h-10 text-success mx-auto" />
                <p className="text-xs text-gray-600">
                  {lang === 'sw'
                    ? 'Nenosiri lako limebadilishwa. Unaelekezwa kwenye kuingia…'
                    : 'Your password has been updated. Redirecting to sign in…'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'sw' ? 'Nenosiri Jipya' : 'New Password'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="new-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      className="portal-input pl-9 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors outline-none"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              strength >= i
                                ? i === 1
                                  ? 'bg-red-400'
                                  : i === 2
                                  ? 'bg-amber-400'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {lang === 'sw'
                          ? 'Angalau herufi 8, na mchanganyiko wa herufi na nambari.'
                          : 'At least 8 characters, mixing letters and numbers.'}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-gray-500 mb-1.5">
                    {lang === 'sw' ? 'Thibitisha Nenosiri' : 'Confirm New Password'}
                  </label>
                  <input
                    id="confirm-password"
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="••••••••"
                    className="portal-input"
                  />
                  {confirm.length > 0 && confirm !== newPassword && (
                    <p className="mt-1 text-[11px] text-red-600">
                      {lang === 'sw' ? 'Nenosiri hazifanani.' : 'Passwords do not match.'}
                    </p>
                  )}
                </div>

                {error && (
                  <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-semibold text-sm rounded-md transition-colors outline-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (lang === 'sw' ? 'Badilisha Nenosiri' : 'Update Password')}
                </button>
              </form>
            )}
          </div>

          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-gray-400 mt-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authorized distributors only · ED Retail
          </p>
        </div>
      </main>
    </div>
  );
}