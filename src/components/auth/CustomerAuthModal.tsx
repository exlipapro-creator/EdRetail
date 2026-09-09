import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth, type CustomerAuthModalMode } from '../../context/CustomerAuthContext';
import { useLang } from '../../context/LangContext';

interface CustomerAuthModalProps {
  /** Controls visibility; presence is managed by the parent (latch pattern). */
  isOpen: boolean;
  onClose: () => void;
}

type Mode = CustomerAuthModalMode;

/**
 * Customer authentication surface. Calm, light, bilingual. Guest browsing is
 * always one tap away — authentication is an invitation, never a wall.
 * All transitions use the REAL Supabase auth flows from CustomerAuthContext;
 * nothing here fakes a session.
 */
export function CustomerAuthModal({ isOpen, onClose }: CustomerAuthModalProps) {
  const { lang } = useLang();
  const { modalMode, openAuth, signInWithPassword, signUp, signInWithGoogle, sendPasswordReset } =
    useCustomerAuth();

  const mode: Mode = modalMode;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  /** Signup email-confirmation notice (reset 'sent' is a context mode). */
  const [notice, setNotice] = useState('');

  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Fresh form per open/mode change; focus management mirrors CheckoutSheet.
  useEffect(() => {
    if (isOpen) {
      setError('');
      setNotice('');
      setBusy(false);
      setPassword('');
      setConfirmPassword('');
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    previouslyFocused.current?.focus?.();
  }, [isOpen, mode]);

  // Escape closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const switchMode = (next: Mode) => {
    // openAuth sets the modal mode in context; the effect above resets the
    // transient form state for the new mode.
    openAuth(next);
  };

  const resetAndClose = () => {
    setPassword('');
    setConfirmPassword('');
    // The PARENT owns visibility (isOpen prop) — always close through the
    // prop so App.tsx state and the context stay in sync.
    onClose();
  };

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const inputBase =
    'w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-[#123B6D] focus:ring-2 focus:ring-[#123B6D]/10 outline-none transition-all';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) return setError(lang === 'sw' ? 'Weka barua pepe sahihi.' : 'Enter a valid email address.');
    if (!password) return setError(lang === 'sw' ? 'Weka neno la siri.' : 'Enter your password.');
    setBusy(true);
    const res = await signInWithPassword(email, password);
    setBusy(false);
    if (res.error) {
      setError(
        /invalid login/i.test(res.error)
          ? lang === 'sw'
            ? 'Barua pepe au neno la siri si sahihi.'
            : 'Incorrect email or password.'
          : res.error
      );
      return;
    }
    resetAndClose();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) return setError(lang === 'sw' ? 'Weka jina lako.' : 'Enter your name.');
    if (!validateEmail(email)) return setError(lang === 'sw' ? 'Weka barua pepe sahihi.' : 'Enter a valid email address.');
    if (password.length < 8)
      return setError(lang === 'sw' ? 'Neno la siri lina herufi 8 au zaidi.' : 'Password must be at least 8 characters.');
    if (password !== confirmPassword)
      return setError(lang === 'sw' ? 'Maneno ya siri hayafanani.' : 'Passwords do not match.');
    setBusy(true);
    const res = await signUp(email, password, fullName);
    setBusy(false);
    if (res.error) {
      setError(
        /already registered/i.test(res.error)
          ? lang === 'sw'
            ? 'Akaunti hii ipo. Tafadhali ingia.'
            : 'This account already exists. Please sign in.'
          : res.error
      );
      return;
    }
    if (res.needsEmailConfirmation) {
      setNotice(
        lang === 'sw'
          ? 'Tumekutumia barua pepe ya uthibitisho. Fungua ili kuendelea.'
          : 'We sent you a confirmation email. Open it to activate your account.'
      );
      return;
    }
    resetAndClose();
  };

  const handleGoogle = async () => {
    setError('');
    setBusy(true);
    const res = await signInWithGoogle();
    setBusy(false);
    if (res.error) setError(res.error);
    // Success redirects to Google; nothing further to do here.
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) return setError(lang === 'sw' ? 'Weka barua pepe sahihi.' : 'Enter a valid email address.');
    setBusy(true);
    const res = await sendPasswordReset(email);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    switchMode('sent');
  };

  if (!isOpen) return null;

  const guestBtn = (
    <button
      type="button"
      onClick={resetAndClose}
      className="w-full py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
    >
      {lang === 'sw' ? 'Endelea kuvinjari bila akaunti' : 'Continue shopping as guest'}
    </button>
  );

  const errorBox = error && (
    <p role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
      {error}
    </p>
  );

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onClose}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'sw' ? 'Uthibitisho wa Akaunti' : 'Account Sign In'}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200/70 overflow-hidden"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Brand + close */}
          <div className="relative flex flex-col items-center pt-7 pb-5 px-6 border-b border-neutral-100">
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4.5 h-4.5" />
            </button>
            <img src="/logo/wordmark.png" alt="ED Retail Tanzania" className="h-8 w-auto object-contain" />
            <p className="text-[11px] text-neutral-500 mt-2">
              {lang === 'sw' ? 'Duka la Afya la Edmark Tanzania' : 'Edmark wellness, delivered in Tanzania'}
            </p>
          </div>

          <div className="p-6 sm:p-7">
            {notice ? (
              /* ── Signup email-confirmation notice ── */
              <div className="text-center space-y-4 py-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-extrabold text-neutral-900">
                  {lang === 'sw' ? 'Thibitisha Barua Pepe' : 'Check your email'}
                </h2>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">{notice}</p>
                <button
                  onClick={resetAndClose}
                  className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer"
                >
                  {lang === 'sw' ? 'Endelea kuvinjari' : 'Continue shopping'}
                </button>
              </div>
            ) : (
              <>
                {/* ── SIGN IN ── */}
                {mode === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-4" noValidate>
                    <div>
                      <h2 className="text-lg font-extrabold text-neutral-900">
                        {lang === 'sw' ? 'Karibu tena' : 'Welcome back'}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {lang === 'sw' ? 'Ingia kwenye akaunti yako ya EdRetail.' : 'Sign in to your EdRetail account.'}
                      </p>
                    </div>

                    {errorBox}

                    <div>
                      <label htmlFor="cust-auth-email" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Barua pepe' : 'Email'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-email"
                          ref={firstFieldRef}
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="amina@example.com"
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="cust-auth-pw" className="block text-xs font-bold text-neutral-700">
                          {lang === 'sw' ? 'Neno la siri' : 'Password'}
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode('forgot')}
                          className="text-[11px] font-bold text-[#123B6D] hover:text-[#0D315D] cursor-pointer"
                        >
                          {lang === 'sw' ? 'Umesahau?' : 'Forgot password?'}
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-pw"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`${inputBase} pr-16`}
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

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {lang === 'sw' ? 'Ingia' : 'Sign in'}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                      <span className="flex-1 h-px bg-neutral-200" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                        {lang === 'sw' ? 'au' : 'or'}
                      </span>
                      <span className="flex-1 h-px bg-neutral-200" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogle}
                      disabled={busy}
                      className="w-full py-3 bg-white hover:bg-neutral-50 border border-neutral-300 rounded-xl text-sm font-bold text-neutral-800 transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2.5"
                    >
                      <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.3 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.2 0 11.4-2 15.4-5.5l-7.5-5.8c-2.1 1.4-4.8 2.3-7.9 2.3-6.4 0-11.8-3.7-13.7-9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"
                        />
                      </svg>
                      {lang === 'sw' ? 'Endelea na Google' : 'Continue with Google'}
                    </button>

                    <p className="text-center text-xs text-neutral-500 pt-1">
                      {lang === 'sw' ? 'Mpya EdRetail? ' : 'New to EdRetail? '}
                      <button
                        type="button"
                        onClick={() => switchMode('signup')}
                        className="font-black text-[#123B6D] hover:text-[#0D315D] cursor-pointer"
                      >
                        {lang === 'sw' ? 'Fungua akaunti' : 'Create an account'}
                      </button>
                    </p>

                    {guestBtn}
                  </form>
                )}

                {/* ── SIGN UP ── */}
                {mode === 'signup' && (
                  <form onSubmit={handleSignUp} className="space-y-4" noValidate>
                    <div>
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 mb-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {lang === 'sw' ? 'Rudi' : 'Back'}
                      </button>
                      <h2 className="text-lg font-extrabold text-neutral-900">
                        {lang === 'sw' ? 'Fungua Akaunti' : 'Create account'}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {lang === 'sw'
                          ? 'Hifadhi maagizo yako na mapendeleo ya ununuzi.'
                          : 'Save your orders, profile and shopping preferences.'}
                      </p>
                    </div>

                    {errorBox}

                    <div>
                      <label htmlFor="cust-auth-name" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Jina kamili' : 'Full name'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-name"
                          ref={firstFieldRef}
                          type="text"
                          autoComplete="name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={lang === 'sw' ? 'Amina Juma' : 'Amina Juma'}
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cust-auth-email-su" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Barua pepe' : 'Email'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-email-su"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="amina@example.com"
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cust-auth-pw-su" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Neno la siri' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-pw-su"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={lang === 'sw' ? 'Herufi 8+' : '8+ characters'}
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cust-auth-pw2" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Thibitisha neno la siri' : 'Confirm password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-pw2"
                          type={showPw ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {lang === 'sw' ? 'Fungua Akaunti' : 'Create account'}
                    </button>

                    <p className="text-center text-xs text-neutral-500 pt-1">
                      {lang === 'sw' ? 'Una akaunti? ' : 'Already have an account? '}
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="font-black text-[#123B6D] hover:text-[#0D315D] cursor-pointer"
                      >
                        {lang === 'sw' ? 'Ingia' : 'Sign in'}
                      </button>
                    </p>

                    {guestBtn}
                  </form>
                )}

                {/* ── FORGOT PASSWORD ── */}
                {mode === 'forgot' && (
                  <form onSubmit={handleForgot} className="space-y-4" noValidate>
                    <div>
                      <button
                        type="button"
                        onClick={() => switchMode('signin')}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 hover:text-neutral-800 mb-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {lang === 'sw' ? 'Rudi' : 'Back'}
                      </button>
                      <h2 className="text-lg font-extrabold text-neutral-900">
                        {lang === 'sw' ? 'Weka Neno Jipya la Siri' : 'Reset your password'}
                      </h2>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {lang === 'sw'
                          ? 'Tutakutumia barua pepe ya kubadilisha neno la siri.'
                          : "We'll email you a secure link to set a new password."}
                      </p>
                    </div>

                    {errorBox}

                    <div>
                      <label htmlFor="cust-auth-email-fp" className="block text-xs font-bold text-neutral-700 mb-1.5">
                        {lang === 'sw' ? 'Barua pepe' : 'Email'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                          id="cust-auth-email-fp"
                          ref={firstFieldRef}
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="amina@example.com"
                          className={inputBase}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                      {lang === 'sw' ? 'Tuma Kiungo' : 'Send reset link'}
                    </button>

                    {guestBtn}
                  </form>
                )}

                {/* ── RESET EMAIL SENT ── */}
                {mode === 'sent' && (
                  <div className="text-center space-y-4 py-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-lg font-extrabold text-neutral-900">
                      {lang === 'sw' ? 'Angalia Barua Pepe' : 'Check your email'}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                      {lang === 'sw'
                        ? 'Tumekutumia kiungo cha kubadilisha neno la siri.'
                        : 'We sent you a password reset link.'}
                    </p>
                    <button
                      onClick={() => switchMode('signin')}
                      className="w-full py-3 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-sm font-black transition-colors cursor-pointer"
                    >
                      {lang === 'sw' ? 'Rudi kuingia' : 'Back to sign in'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
