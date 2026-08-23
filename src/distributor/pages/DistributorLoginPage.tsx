import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  UserPlus,
  Users,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Award,
  Globe,
  Chrome,
  Store,
  ChevronRight,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
  X,
  ChevronUp,
} from 'lucide-react';
import { useDistributorStore, DistributorProfile } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';

export function DistributorLoginPage() {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();

  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const loginWithEmail = useDistributorStore((s) => s.loginWithEmail);
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const registerNewDistributor = useDistributorStore((s) => s.registerNewDistributor);
  const verifyPin = useDistributorStore((s) => s.verifyPin);

  // Tab: 'login' | 'register' | 'switch'
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');
  const [loginMethod, setLoginMethod] = useState<'pin' | 'email'>('pin');

  // Login form state
  const [pinInput, setPinInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+255 ');
  const [regCity, setRegCity] = useState('Dar es Salaam');
  const [regSlug, setRegSlug] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // ── Pull Up Twice Gesture State for Super Admin Card ──
  const [showSuperAdminCard, setShowSuperAdminCard] = useState(false);
  const [pullCount, setPullCount] = useState(0);
  const lastPullTimeRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  // If already authenticated, redirect to portal dashboard
  useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/portal/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  // Handle pull-up gesture detection
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

    // Check if upward swipe is significant (> 45px)
    if (deltaY > 45) {
      const now = Date.now();
      if (now - lastPullTimeRef.current < 2000) {
        // Second pull within 2 seconds!
        toggleSuperAdminCard();
        lastPullTimeRef.current = 0;
        setPullCount(0);
      } else {
        lastPullTimeRef.current = now;
        setPullCount(1);
        setTimeout(() => {
          setPullCount(0);
        }, 2000);
      }
    }
  };

  const toggleSuperAdminCard = () => {
    setShowSuperAdminCard((prev) => {
      const next = !prev;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(next ? [50, 40, 50] : [40]);
      }
      return next;
    });
  };

  // Keyboard shortcut fallback: Ctrl+Shift+A or double 'a'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        toggleSuperAdminCard();
        return;
      }
      if (e.key === 'Escape') {
        setShowSuperAdminCard(false);
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
    const ok = loginWithEmail(emailInput.trim(), passwordInput);
    if (ok) {
      setAdminAuthenticated(true);
      setLoginError('');
      navigate('/portal/dashboard');
    } else {
      setLoginError(lang === 'sw' ? 'Barua pepe au nenosiri sio sahihi.' : 'Invalid email or password.');
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/portal/dashboard',
        },
      });
      if (error) throw error;
    } catch {
      // Fallback demo store connection
      loginWithGoogle('distributor@edretail.tz', distributor.name || 'Authorized Leader');
      setAdminAuthenticated(true);
      navigate('/portal/dashboard');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemoUnlock = () => {
    const ok = verifyPin('2580');
    if (ok) {
      setAdminAuthenticated(true);
      navigate('/portal/dashboard');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim()) {
      setRegError(lang === 'sw' ? 'Tafadhali jaza taarifa zote muhimu.' : 'Please fill in all required fields.');
      return;
    }

    const cleanPhone = regPhone.replace(/\D/g, '');
    const digits = cleanPhone.startsWith('0') ? '255' + cleanPhone.slice(1) : cleanPhone.startsWith('255') ? cleanPhone : '255' + cleanPhone;
    const cleanSlug = (regSlug || regName).toLowerCase().replace(/[^a-z0-9]/g, '');

    const newProfile = registerNewDistributor(
      {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        phone: regPhone.trim(),
        whatsappDigits: digits,
        slug: cleanSlug,
        rank: 'Wellness Consultant & Leader',
        city: regCity,
        lipaNumber: 'Lipa Namba: ' + Math.floor(100000 + Math.random() * 900000),
        bio: `Msambazaji Rasmi wa Edmark Tanzania (${regCity}). Wasiliana nami kwa ushauri wa afya na bidhaa asilia za Edmark.`,
      },
      regPass || 'password123'
    );

    setRegSuccess(
      lang === 'sw'
        ? `🎉 Hongera ${newProfile.name}! Duka lako limeundwa: edretail.store/@${newProfile.slug}`
        : `🎉 Welcome ${newProfile.name}! Store handle ready: edretail.store/@${newProfile.slug}`
    );

    setTimeout(() => {
      setAdminAuthenticated(true);
      navigate('/portal/dashboard');
    }, 900);
  };

  const handleSwitchDistributor = (target: DistributorProfile) => {
    useDistributorStore.setState({
      currentProfile: target,
      activeRefSlug: target.slug,
      isAdminAuthenticated: true,
    });
    navigate('/portal/dashboard');
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-[#071913] bg-gradient-to-b from-[#0B271E] via-[#071913] to-[#030C09] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950 font-sans"
    >
      {/* ── Top Bar ── */}
      <header className="px-4 sm:px-8 py-4 border-b border-emerald-900/60 bg-[#05140F]/90 backdrop-blur-md flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#C5A059] flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
              ED <span className="text-[#E5C378]">Retail</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                Msambazaji Suite
              </span>
            </span>
            <p className="text-[10px] text-stone-400 font-medium">Distributor Back-Office Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'sw' ? 'Swahili' : 'English'}</span>
          </button>

          {/* Super Admin Direct Button */}
          <button
            onClick={toggleSuperAdminCard}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showSuperAdminCard
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                : 'bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300'
            }`}
            title="Toggle Super Admin Access"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Super Admin</span>
          </button>

          {/* Return to Storefront */}
          <Link
            to="/"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-200 hover:text-white transition-colors"
          >
            <span>{lang === 'sw' ? 'Duka' : 'Store'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── TOGGLEABLE SUPER ADMIN GATEWAY CARD (Gesture / Click Triggered) ── */}
      <AnimatePresence>
        {showSuperAdminCard && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-indigo-950/90 border-b border-indigo-500/40 px-4 sm:px-8 py-5 shadow-2xl backdrop-blur-xl relative z-30"
          >
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">Super Admin Control Hub</h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider">
                      Gesture Unlocked
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
                    {lang === 'sw'
                      ? 'Mlango rasmi wa usimamizi mkuu wa mfumo. Dhibiti bidhaa, bei, hesabu za faida na akaunti zote za wasambazaji nchini kote.'
                      : 'Platform administrator gateway. Access catalog pricing, sales audits, distributor registry, and financial payouts.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Link
                  to="/admin"
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Fungua Super Admin' : 'Enter Super Admin'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setShowSuperAdminCard(false)}
                  className="p-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-900 text-indigo-300 hover:text-white border border-indigo-700/50 cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content Hero & Form Grid ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Leadership Hero & Feature Pillars */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-sm">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{lang === 'sw' ? 'Ofisi ya Msambazaji na Kiongozi' : 'Official Distributor Operations Portal'}</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {lang === 'sw' ? (
                <>
                  Dhibiti Mauzo, Stoo na <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#E5C378] to-emerald-400">Malengo Yako ya SV</span>
                </>
              ) : (
                <>
                  Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-[#E5C378] to-emerald-400">Edmark Leadership</span> & Sales
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed font-normal">
              {lang === 'sw'
                ? 'Ofisi ya kidijitali iliyojengwa mahususi kwa wasambazaji wa Edmark Tanzania. Rekodi mauzo hata bila mtandao, fuatilia madeni ya wateja, na simamia Lipa Namba zako zote.'
                : 'The dedicated digital back-office for Edmark leaders in Tanzania. Record transactions offline, track customer debts, automate WhatsApp receipts, and manage 2,000 SV monthly qualification.'}
            </p>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-900/50 shadow-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">2,000 SV Challenge</h4>
                <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                  {lang === 'sw' ? 'Ufuatiliaji wa pointi na maintenance ya kila mwezi' : 'Live SV pacing & manager qualification tracking'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-900/50 shadow-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Daftari la Mauzo & Stoo</h4>
                <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                  {lang === 'sw' ? 'Kumbukumbu kamili ya mauzo na idadi ya bidhaa' : 'Full offline-capable sales ledger & stock records'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-900/50 shadow-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Lipa Namba & Akaunti</h4>
                <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                  {lang === 'sw' ? 'M-Pesa, Tigo Pesa, Airtel Money na NMB' : 'Custom Till, Merchant & Mobile Money routing'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-900/90 border border-emerald-900/50 shadow-md flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Madeni & Wateja (CRM)</h4>
                <p className="text-[11px] text-stone-400 leading-snug mt-0.5">
                  {lang === 'sw' ? 'Usimamizi wa wateja na vikumbusho vya WhatsApp' : 'Customer records, debt tracking & follow-ups'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Dedicated Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-stone-900/95 backdrop-blur-xl border border-emerald-800/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            {/* Form Header */}
            <div className="space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-[#C5A059]/30 border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#E5C378] shadow-md">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {lang === 'sw' ? 'Kuingia Ofisi ya Msambazaji' : 'Distributor Back-Office Login'}
              </h3>
              <p className="text-xs text-stone-400">
                {lang === 'sw'
                  ? 'Fungua duka lako, rekodi mauzo na tazama ripoti zako'
                  : 'Access your dedicated store management back-office'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-stone-950 rounded-2xl border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'login'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Ingia' : 'Login'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setRegError('');
                  setRegSuccess('');
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'register'
                    ? 'bg-emerald-500 text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Jisajili' : 'Register'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('switch');
                  setLoginError('');
                }}
                className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'switch'
                    ? 'bg-[#C5A059] text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Badili' : 'Switch'}</span>
              </button>
            </div>

            {/* ── TAB 1: UNIFIED LOGIN ── */}
            {tab === 'login' && (
              <div className="space-y-4">
                {/* 1-Tap Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
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
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    {lang === 'sw' ? 'au chagua njia ya kuingia' : 'or choose authentication'}
                  </span>
                  <div className="flex-1 h-px bg-stone-800" />
                </div>

                {/* Sub-toggle: PIN vs Email/Password */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('pin');
                      setLoginError('');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      loginMethod === 'pin'
                        ? 'bg-stone-800 border-amber-500/50 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    PIN Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email');
                      setLoginError('');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      loginMethod === 'email'
                        ? 'bg-stone-800 border-amber-500/50 text-amber-300'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Email & Password
                  </button>
                </div>

                {/* PIN Form */}
                {loginMethod === 'pin' && (
                  <div className="space-y-3">
                    <input
                      type="password"
                      maxLength={16}
                      value={pinInput}
                      onChange={(e) => {
                        setPinInput(e.target.value);
                        if (loginError) setLoginError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                      placeholder={lang === 'sw' ? 'Weka PIN yako (mfano: 2580)' : 'Enter PIN (e.g. 2580)'}
                      className="w-full text-center text-sm font-mono tracking-wider py-3 px-4 bg-stone-950 border border-stone-700 rounded-2xl text-white placeholder:text-stone-400 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20"
                    />

                    <button
                      onClick={handleVerifyPin}
                      className="w-full py-3.5 bg-[#C5A059] hover:bg-[#d4ad60] text-stone-950 font-black rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Fungua Ofisi Yangu' : 'Open Dashboard'}</span>
                    </button>
                  </div>
                )}

                {/* Email / Password Form */}
                {loginMethod === 'email' && (
                  <form onSubmit={handleEmailLogin} className="space-y-2.5 text-left">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        {lang === 'sw' ? 'Barua Pepe' : 'Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="mwanahamisi@edretail.tz"
                          className="w-full pl-10 pr-3 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-300 mb-1">
                        {lang === 'sw' ? 'Nenosiri' : 'Password'}
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Ingia Ofisini' : 'Sign In to Back-Office'}</span>
                    </button>
                  </form>
                )}

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
                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-300">
                  <span>Demo Authorized PIN:</span>
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

            {/* ── TAB 2: REGISTER ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Chrome className="w-4 h-4 text-[#4285F4]" />
                  <span>{lang === 'sw' ? 'Jisajili Mara Moja na Google' : 'Quick Sign Up with Google'}</span>
                </button>

                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex-1 h-px bg-stone-800" />
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    {lang === 'sw' ? 'au jaza taarifa zako' : 'or manual registration'}
                  </span>
                  <div className="flex-1 h-px bg-stone-800" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {lang === 'sw' ? 'Jina Kamili la Kiongozi' : 'Full Name & Title'}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g., Mwanahamisi Lissu"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {lang === 'sw' ? 'Barua Pepe (Gmail)' : 'Email / Gmail'}
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {lang === 'sw' ? 'Namba ya Simu / WhatsApp' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="text"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+255 754 000 000"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {lang === 'sw' ? 'Mkoa / Jiji' : 'City / Region'}
                    </label>
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="Dar es Salaam"
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      {lang === 'sw' ? 'Anwani ya Duka (@handle)' : 'Custom Store Handle'}
                    </label>
                    <div className="flex items-center bg-stone-950 border border-stone-700 rounded-xl px-3 text-xs text-stone-400">
                      <span>/@</span>
                      <input
                        type="text"
                        value={regSlug}
                        onChange={(e) => setRegSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        placeholder="jina-lako"
                        className="w-full bg-transparent py-2.5 pl-1 text-white focus:outline-none placeholder:text-stone-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    {lang === 'sw' ? 'Nenosiri au PIN ya Kuingia' : 'Password or PIN'}
                  </label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {regError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-300 font-semibold">
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold">
                    {regSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black rounded-2xl text-xs shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{lang === 'sw' ? 'Unda Duka & Fungua Ofisi' : 'Create Store & Open Back-Office'}</span>
                </button>
              </form>
            )}

            {/* ── TAB 3: SWITCH ── */}
            {tab === 'switch' && (
              <div className="space-y-3 text-left">
                <p className="text-xs text-stone-300">
                  {lang === 'sw' ? 'Bofya msambazaji kuingia kwenye ofisi yake moja kwa moja:' : 'Select an active distributor to switch:'}
                </p>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {savedDistributors.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => handleSwitchDistributor(d)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        d.id === distributor.id
                          ? 'bg-amber-500/20 border-amber-500/40 text-white'
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={d.avatarUrl || '/logo/distributor-circle.png'}
                          alt={d.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-700 bg-stone-800"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white">{d.name}</span>
                            {d.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                          </div>
                          <span className="text-[11px] text-stone-400 block">{d.city} • @{d.slug}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-xl bg-white/10 text-[10px] font-bold text-amber-300">
                        {d.id === distributor.id ? 'Active' : 'Switch'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="w-full py-2.5 border border-dashed border-stone-700 hover:border-amber-400 text-stone-400 hover:text-amber-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Ongeza Msambazaji Mwingine' : 'Add Another Distributor Profile'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── Gesture Pull-Up Hint Bar (Mobile Friendly) ── */}
      <div className="max-w-md mx-auto px-4 py-2 text-center select-none">
        <button
          onClick={toggleSuperAdminCard}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900/60 border border-stone-800/80 hover:border-indigo-500/40 text-[11px] text-stone-400 hover:text-indigo-300 transition-colors cursor-pointer"
        >
          <ChevronUp className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
          <span>
            {pullCount === 1
              ? lang === 'sw' ? '👆 Vuta juu mara ya pili kufungua Super Admin' : '👆 Pull up once more for Super Admin'
              : lang === 'sw' ? 'Vuta juu mara 2 au bofya hapa kufungua Super Admin' : 'Pull up twice or tap for Super Admin access'}
          </span>
        </button>
      </div>

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-8 py-4 border-t border-emerald-900/60 bg-[#05140F]/90 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ED Retail Tanzania • Independent Distributor Management Platform</p>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={toggleSuperAdminCard}
            className="text-indigo-400 hover:underline cursor-pointer"
          >
            Super Admin Access
          </button>
          <span>•</span>
          <Link to="/" className="text-[#E5C378] hover:underline">Customer Storefront</Link>
        </div>
      </footer>
    </div>
  );
}
