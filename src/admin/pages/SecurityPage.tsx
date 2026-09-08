import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, Mail, KeyRound, CheckCircle2, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { supabase } from '../../lib/supabase';

type Strength = 0 | 1 | 2 | 3;

function passwordStrength(pw: string): Strength {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 10) s++;
  return s as Strength;
}

export function SecurityPage() {
  const { user, lastEvent, signOut, updatePassword, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  const [recoveryMode, setRecoveryMode] = useState(false);
  const [checkingRecovery, setCheckingRecovery] = useState(true);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Detect password-recovery links. The AuthProvider records the first auth
  // event (PASSWORD_RECOVERY) before this page mounts, so arriving via a reset
  // link is reliably detected here.
  useEffect(() => {
    if (lastEvent === 'PASSWORD_RECOVERY') {
      setRecoveryMode(true);
    }
    setCheckingRecovery(false);
  }, [lastEvent]);

  const strength = passwordStrength(newPw);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPw !== confirmPw) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      let err: string | null;
      if (recoveryMode) {
        // Recovery flow: the recovery token already verified the account.
        const { error: updateError } = await supabase.auth.updateUser({ password: newPw });
        err = updateError?.message || null;
        if (!err) {
          await supabase.auth.signOut().catch(() => {});
          setSuccess(true);
          setTimeout(() => navigate('/admin', { replace: true }), 1800);
        }
      } else {
        err = await updatePassword(currentPw, newPw);
      }
      if (err) {
        setError(err);
      } else {
        setSuccess(true);
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
      }
    } catch (err: any) {
      setError(err?.message || 'Could not update your password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReset = async () => {
    if (!user?.email) return;
    setError('');
    setLoading(true);
    const err = await resetPasswordForEmail(user.email);
    if (err) {
      setError(err);
    } else {
      setResetSent(true);
      setSuccess(false);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Security</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your admin account password and active session.
          </p>
        </div>
      </div>

      {/* ── Session card ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-card p-5 mb-6 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-semibold text-gray-900">Active session</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-gray-400 font-medium">Email</dt>
            <dd className="text-gray-900 font-semibold mt-0.5">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400 font-medium">Member since</dt>
            <dd className="text-gray-900 font-semibold mt-0.5">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </dd>
          </div>
        </dl>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors outline-none"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>

      {/* ── Change password ── */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-card p-5 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {recoveryMode ? 'Set a new password' : 'Change password'}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {recoveryMode
              ? 'You arrived from a password-reset link. Choose a new password to continue.'
              : 'Your current password is verified before the change. Other sessions are revoked by the auth provider.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
          {!recoveryMode && (
            <div>
              <label htmlFor="admin-current-pw" className="block text-xs font-semibold text-gray-500 mb-1">
                Current password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-current-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={currentPw}
                  onChange={(e) => {
                    setCurrentPw(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className="portal-input pl-9"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="admin-new-pw" className="block text-xs font-semibold text-gray-500 mb-1">
              New password
            </label>
            <input
              id="admin-new-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={newPw}
              onChange={(e) => {
                setNewPw(e.target.value);
                if (error) setError('');
              }}
              placeholder="••••••••"
              className="portal-input"
            />
            {newPw.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength >= i ? (i === 1 ? 'bg-red-400' : i === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">At least 8 characters, mixing letters and numbers.</p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="admin-confirm-pw" className="block text-xs font-semibold text-gray-500 mb-1">
              Confirm new password
            </label>
            <input
              id="admin-confirm-pw"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPw}
              onChange={(e) => {
                setConfirmPw(e.target.value);
                if (error) setError('');
              }}
              placeholder="••••••••"
              className="portal-input"
            />
            {confirmPw.length > 0 && confirmPw !== newPw && (
              <p className="mt-1 text-[11px] text-red-600">Passwords do not match.</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors outline-none"
            >
              {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <div role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {recoveryMode
                ? 'Password updated. Redirecting to sign in…'
                : 'Password changed successfully.'}
            </div>
          )}
          {resetSent && (
            <div role="status" className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              A password-reset link has been sent to {user?.email}.
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {recoveryMode ? 'Set new password' : 'Change password'}
            </button>

            {!recoveryMode && (
              <button
                type="button"
                onClick={handleSendReset}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-colors outline-none disabled:opacity-50"
              >
                <Mail className="w-3.5 h-3.5" />
                Email me a reset link
              </button>
            )}
          </div>
        </form>
      </div>

      {checkingRecovery && (
        <div className="mt-6 text-center">
          <Loader2 className="w-5 h-5 text-primary-500 animate-spin mx-auto" aria-label="Loading" />
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6">
        <Link to="/admin" className="text-primary-600 hover:underline">Return to dashboard</Link>
      </p>
    </div>
  );
}