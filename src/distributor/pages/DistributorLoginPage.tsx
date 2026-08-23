import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Award,
  Globe,
  Chrome,
  Store,
  ChevronRight,
  Mail,
  Eye,
  EyeOff,
  X,
  KeyRound,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { useDistributorStore, DEFAULT_DISTRIBUTOR } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';

export function DistributorLoginPage() {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();

  const distributor = useDistributorStore((s) => s.getActiveDistributor()) || DEFAULT_DISTRIBUTOR;
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const loginWithEmail = useDistributorStore((s) => s.loginWithEmail);
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const verifyPin = useDistributorStore((s) => s.verifyPin);

  const [loginMethod, setLoginMethod] = useState<'pin' | 'email'>('pin');

  // Login form state
  const [pinInput, setPinInput] = useState('');
  const [emailInput, setEmailInput] = useState('mwanahamisi@edretail.tz');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Pull Up Twice Gesture State for Super Admin Dialog Modal ──
  const [showSuperAdminModal, setShowSuperAdminModal] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('admin@edretail.tz');
  const [adminPassInput, setAdminPassInput] = useState('admin123');
  const [adminError, setAdminError] = useState('');
  const lastPullTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);
  const secretClickCountRef = useRef<number>(0);

  // If already authenticated, redirect to portal dashboard
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/portal/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  // Handle pull-up gesture detection (Silently triggers modal on 2 upward pulls)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY; // positive when swiping UP
    touchStartYRef.current = null;

    // Check if upward swipe is significant (> 35px)
    if (deltaY > 35) {
      const now = Date.now();
      if (now - lastPullTimeRef.current < 2500) {
        // Second pull within 2.5 seconds!
        openSuperAdminModal();
        lastPullTimeRef.current = 0;
      } else {
        lastPullTimeRef.current = now;
      }
    }
  };

  const openSuperAdminModal = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // safe fallback
      }
    }
    setShowSuperAdminModal(true);
  };

  // Secret 3-tap trigger on security icon
  const handleSecretEmblemClick = () => {
    secretClickCountRef.current += 1;
    if (secretClickCountRef.current >= 3) {
      secretClickCountRef.current = 0;
      openSuperAdminModal();
    }
    setTimeout(() => {
      secretClickCountRef.current = 0;
    }, 2000);
  };

  // Keyboard shortcut fallback: Ctrl+Shift+A or Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setShowSuperAdminModal((prev) => !prev);
        return;
      }
      if (e.key === 'Escape') {
        setShowSuperAdminModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleVerifyPin = () => {
    if (!pinInput.trim()) return;
    const ok = verifyPin(pinInput.trim());
    if (ok) {
      setAdminAuthenticated(true);
      setLoginError('');
      navigate('/portal/dashboard');
    } else {
      setLoginError(lang === 'sw' ? 'PIN sio sahihi. Jaribu 2580 au Google.' : 'Incorrect PIN. Try 2580 or Google Sign-In.');
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setLoginError(lang === 'sw' ? 'Tafadhali weka barua pepe na nenosiri.' : 'Please enter email and password.');
      return;
    }

    const ok = loginWithEmail(emailInput, passwordInput);
    if (ok) {
      setLoginError('');
      navigate('/portal/dashboard');
    } else {
      setLoginError(
        lang === 'sw'
          ? 'Taarifa za kuingia sio sahihi. Jaribu tena au tumia PIN.'
          : 'Invalid login credentials. Please try PIN or Google.'
      );
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/portal/dashboard`,
        },
      });

      if (error) {
        // Fallback for local demo preview
        loginWithGoogle('mwanahamisi@edretail.tz', 'Mwanahamisi Lissu');
        setAdminAuthenticated(true);
        navigate('/portal/dashboard');
      }
    } catch {
      loginWithGoogle('mwanahamisi@edretail.tz', 'Mwanahamisi Lissu');
      setAdminAuthenticated(true);
      navigate('/portal/dashboard');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoUnlock = () => {
    setPinInput('2580');
    verifyPin('2580');
    setAdminAuthenticated(true);
    navigate('/portal/dashboard');
  };

  // Super Admin Direct Login from Modal
  const handleSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (
      (adminEmailInput.trim().toLowerCase() === 'admin@edretail.tz' ||
        adminEmailInput.trim().toLowerCase() === 'admin@edretail.com' ||
        adminEmailInput.trim().toLowerCase() === 'admin') &&
      (adminPassInput === 'admin123' || adminPassInput === '255' || adminPassInput === 'admin' || adminPassInput === '1234')
    ) {
      setShowSuperAdminModal(false);
      navigate('/admin/dashboard');
    } else {
      setAdminError(lang === 'sw' ? 'Taarifa za Super Admin sio sahihi.' : 'Invalid Super Admin credentials.');
    }
  };

  const handleQuickAdminDemo = () => {
    setShowSuperAdminModal(false);
    navigate('/admin/dashboard');
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07130F] text-stone-100 flex flex-col font-sans select-none antialiased"
    >
      {/* ── Top Navigation Bar (Clean & Professional) ── */}
      <header className="w-full px-4 sm:px-8 py-3.5 border-b border-emerald-900/40 bg-[#05140F]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink-0 group">
          <div
            onClick={handleSecretEmblemClick}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#C5A059] flex items-center justify-center shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform cursor-pointer"
            title="ED Retail Secure Gate"
          >
            <Store className="w-4 h-4 sm:w-5 sm:h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base tracking-tight text-white">
                ED <span className="text-[#E5C378]">Retail</span>
              </span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold">
                Back-Office
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-stone-400 font-medium truncate">
              {distributor.name} • {lang === 'sw' ? 'Msambazaji Mkuu' : 'Authorized Distributor'}
            </p>
          </div>
        </Link>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-[11px] sm:text-xs font-bold text-stone-200 hover:text-white transition-colors cursor-pointer"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'sw' ? 'SW' : 'EN'}</span>
          </button>

          {/* Return to Public Storefront */}
          <Link
            to="/"
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-stone-700/90 text-[11px] sm:text-xs font-bold text-stone-200 hover:text-white transition-colors"
          >
            <span>{lang === 'sw' ? 'Duka' : 'Store'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Main Content Layout ── */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* LEFT / DISTRIBUTOR BRANDING INTRO */}
          <div className="order-2 lg:order-1 lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>{lang === 'sw' ? 'Ofisi Binafsi ya Msambazaji' : 'Dedicated Distributor Back-Office'}</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <img
                  src={distributor.avatarUrl || '/logo/distributor-circle.png'}
                  alt={distributor.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-[#E5C378]/50 shadow-md shadow-emerald-950/60"
                />
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-1.5">
                    <span>{distributor.name}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </h2>
                  <p className="text-xs text-[#E5C378] font-bold">
                    {distributor.rank} • {distributor.city}
                  </p>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight pt-2">
                {lang === 'sw' ? (
                  <>
                    Usimamizi wa Mauzo, Madeni & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#E5C378] to-emerald-400">Pointi za SV</span>
                  </>
                ) : (
                  <>
                    Manage Daily Sales, Debts & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#E5C378] to-emerald-400">Monthly 2,000 SV</span>
                  </>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-normal">
                {lang === 'sw'
                  ? 'Fungua daftari lako la kidijitali la mauzo, dhibiti madeni ya wateja kupitia WhatsApp, na fuatilia maendeleo ya pointi za 2,000 SV kila mwezi.'
                  : 'Open your dedicated sales ledger, track customer credit and debt follow-ups on WhatsApp, and pace your monthly 2,000 SV qualification effortlessly.'}
              </p>
            </div>

            {/* 4 Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-emerald-900/40 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/25 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">2,000 SV Challenge</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {lang === 'sw' ? 'Pointi za SV & Maintenance' : 'Live SV pacing & qualification'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-emerald-900/40 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 shrink-0">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Daftari la Mauzo</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {lang === 'sw' ? 'Rekodi mauzo hata bila mtandao' : 'Offline-ready sales ledger'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-emerald-900/40 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-blue-500/15 text-blue-300 border border-blue-500/25 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Lipa Namba Zangu</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {lang === 'sw' ? 'M-Pesa 543210 & Tigo Pesa' : 'Custom Till & Mobile Money'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-emerald-900/40 flex items-start gap-3 shadow-xs">
                <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/25 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Vikumbusho vya Madeni</h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 leading-tight">
                    {lang === 'sw' ? 'Tuma kumbusho 1-tap WhatsApp' : '1-Tap WhatsApp debt alerts'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT / DIRECT AUTHENTICATION CARD */}
          <div className="order-1 lg:order-2 lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[420px] bg-stone-900/95 backdrop-blur-xl border border-emerald-800/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 text-center">
              
              {/* Form Header */}
              <div className="space-y-1">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-[#C5A059]/20 border border-[#C5A059]/30 flex items-center justify-center mx-auto text-[#E5C378] shadow-inner">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {lang === 'sw' ? 'Ingia Ofisi ya Msambazaji' : 'Distributor Back-Office Login'}
                </h3>
                <p className="text-[11px] sm:text-xs text-stone-400">
                  {lang === 'sw'
                    ? `Weka PIN ya usalama ya ${distributor.name}`
                    : `Enter owner security PIN for ${distributor.name}`}
                </p>
              </div>

              {/* Login Method Toggle: PIN vs Email/Google */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950 rounded-2xl border border-stone-800/90">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('pin');
                    setLoginError('');
                  }}
                  className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'pin'
                      ? 'bg-[#C5A059] text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>PIN (Haraka)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setLoginError('');
                  }}
                  className={`py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'email'
                      ? 'bg-emerald-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email / Google</span>
                </button>
              </div>

              {/* ── METHOD 1: QUICK PIN LOGIN (DEFAULT) ── */}
              {loginMethod === 'pin' && (
                <div className="space-y-3.5">
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-stone-300 text-left">
                      {lang === 'sw' ? 'Namba ya Siri (PIN)' : 'Security PIN'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        autoFocus
                        maxLength={16}
                        value={pinInput}
                        onChange={(e) => {
                          setPinInput(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                        placeholder="••••"
                        className="w-full text-center text-lg font-mono tracking-widest py-3 pl-9 pr-4 bg-stone-950 border border-stone-700/80 rounded-xl text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyPin}
                    className="w-full py-3 bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:from-[#d4ad60] hover:to-[#f0d48f] text-stone-950 font-black rounded-xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{lang === 'sw' ? 'Fungua Ofisi Yangu' : 'Unlock Back-Office'}</span>
                  </button>

                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-400 text-center"
                    >
                      {loginError}
                    </motion.p>
                  )}

                  {/* 1-Tap Demo helper */}
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <span>Default Owner PIN:</span>
                    <button
                      type="button"
                      onClick={handleQuickDemoUnlock}
                      className="font-mono font-black text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      1-Tap 2580
                    </button>
                  </div>
                </div>
              )}

              {/* ── METHOD 2: EMAIL / GOOGLE SIGN-IN ── */}
              {loginMethod === 'email' && (
                <div className="space-y-3">
                  {/* 1-Tap Google Sign In */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                  >
                    <Chrome className="w-4 h-4 text-[#4285F4]" />
                    <span>
                      {isGoogleLoading
                        ? 'Connecting Google...'
                        : lang === 'sw'
                        ? 'Ingia na Google (Gmail)'
                        : 'Sign In with Google'}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 py-0.5">
                    <div className="flex-1 h-px bg-stone-800" />
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      {lang === 'sw' ? 'au barua pepe' : 'or email'}
                    </span>
                    <div className="flex-1 h-px bg-stone-800" />
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-2.5 text-left">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        {lang === 'sw' ? 'Barua Pepe' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="mwanahamisi@edretail.tz"
                          className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        {lang === 'sw' ? 'Nenosiri' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2 bg-stone-950 border border-stone-700/80 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-1"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Ingia Ofisini' : 'Sign In to Back-Office'}</span>
                    </button>
                  </form>

                  {loginError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-400 text-center"
                    >
                      {loginError}
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── SUPER ADMIN POPUP DIALOG MODAL (Triggered silently by Pull-Up Twice gesture or Ctrl+Shift+A) ── */}
      <AnimatePresence>
        {showSuperAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuperAdminModal(false)}
              className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-md bg-stone-900 border border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-indigo-950/60 z-10 space-y-5"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowSuperAdminModal(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="text-left space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">Super Admin Control Hub</h3>
                  </div>
                  <p className="text-xs text-indigo-200 leading-snug">
                    {lang === 'sw'
                      ? 'Mlango mkuu wa usimamizi wa mfumo wa kitaifa.'
                      : 'Master administrative access & system governance.'}
                  </p>
                </div>
              </div>

              {/* Admin Sign-In Form */}
              <form onSubmit={handleSuperAdminSubmit} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Super Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="admin@edretail.tz"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 mb-1">
                    Password / Master PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminPassInput}
                      onChange={(e) => setAdminPassInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                {adminError && (
                  <p className="text-xs font-bold text-red-400">{adminError}</p>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{lang === 'sw' ? 'Ingia Super Admin' : 'Login as Super Admin'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickAdminDemo}
                    className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    1-Tap Admin Demo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Footer ── */}
      <footer className="w-full px-4 sm:px-8 py-3.5 border-t border-emerald-900/40 bg-[#05140F]/90 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ED Retail Tanzania • Authorized Edmark Distributor: {distributor.name}</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/" className="text-[#E5C378] hover:underline">Customer Storefront</Link>
        </div>
      </footer>
    </div>
  );
}
