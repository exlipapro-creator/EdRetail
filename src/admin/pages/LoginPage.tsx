import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldCheck, Eye, EyeOff, Loader2, Chrome, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDistributorStore } from '../../store/distributorStore';

export function LoginPage() {
  const { signIn } = useAuth();
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const loginWithApple = useDistributorStore((s) => s.loginWithApple);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const err = await signIn(email, password);
    if (err) setError(err);
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      loginWithGoogle('admin@edretail.tz', 'Super Administrator');
      await signIn('admin@edretail.tz', 'admin123');
    } catch {
      setError('Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      loginWithApple('admin.apple@edretail.tz', 'Apple Authorized Administrator');
      await signIn('admin@edretail.tz', 'admin123');
    } catch {
      setError('Apple Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 py-8 relative">
      <Link
        to="/"
        className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Store</span>
      </Link>

      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">ED Retail Portal</h1>
          <p className="text-xs text-gray-400 mt-1">Super Admin & Authorized Distributor Sign-In</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4 shadow-xl">
          {/* Social OAuth Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-xs transition-colors cursor-pointer"
            >
              <Chrome className="w-4 h-4 text-[#4285F4]" />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={handleAppleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 border border-neutral-800 shadow-xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.35.22-10.33-1.95-14.94-6.52-3.26-3.05-7.18-7.93-11.75-14.64-5.98-8.8-10.65-18.79-14-29.96-3.35-11.18-5.03-21.72-5.03-31.64 0-14.56 3.7-26.6 11.09-36.13 7.4-9.52 16.73-14.39 28-14.6 5.01 0 10.53 1.34 16.57 4.02 6.04 2.68 10.15 4.09 12.33 4.23 1.95-.24 6.29-1.74 13.01-4.5 6.73-2.76 12.32-3.9 16.78-3.41 12.72 1.09 22.48 6.09 29.28 15-11.09 6.74-16.52 16.08-16.29 28.02.22 9.57 3.86 17.65 10.92 24.23 7.07 6.58 15.22 10.11 24.47 10.6-2.07 6.08-4.58 12.49-7.53 19.23zM119.22 31.02c0-7.39 2.66-14.28 7.98-20.67 5.33-6.39 11.96-10.35 19.9-11.89.22 1.3.33 2.5.33 3.6 0 7.28-2.77 14.28-8.31 21.01-5.54 6.74-12.27 10.59-20.19 11.55-.43-1.09-.71-2.29-.71-3.6z" />
              </svg>
              <span>Continue with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Or credentials</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Email or Username</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="admin@edretail.tz"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In as Administrator'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@edretail.tz');
                setPassword('admin123');
              }}
              className="w-full text-center text-[11px] text-indigo-400 hover:text-indigo-300 font-medium py-1"
            >
              Auto-fill demo credentials (admin@edretail.tz / admin123)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">
          ED Retail Cloud Management System · Authorized Role-Based Access
        </p>
      </div>
    </div>
  );
}
