import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  Users,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  Award,
  Globe,
  Chrome,
  Store,
  ChevronRight,
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
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const registerNewDistributor = useDistributorStore((s) => s.registerNewDistributor);
  const verifyPin = useDistributorStore((s) => s.verifyPin);

  // Tab: 'login' | 'register' | 'switch'
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');

  // Login form state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
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

  // If already authenticated, redirect to portal dashboard
  React.useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/portal/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleVerifyPin = () => {
    if (!pinInput.trim()) return;
    const ok = verifyPin(pinInput.trim());
    if (ok) {
      setAdminAuthenticated(true);
      setPinError(false);
      navigate('/portal/dashboard');
    } else {
      setPinError(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setPinError(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/portal/dashboard',
        },
      });
      if (error) throw error;
    } catch {
      // Demo store fallback
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
    <div className="min-h-screen bg-radial from-[#0C2A20] via-[#081C15] to-[#040E0B] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">
      {/* ── Top Bar ── */}
      <header className="px-4 sm:px-8 py-4 border-b border-emerald-900/40 bg-black/30 backdrop-blur-md flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#C5A059] flex items-center justify-center shadow-lg shadow-emerald-950/50 group-hover:scale-105 transition-transform">
            <Store className="w-5 h-5 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
              ED <span className="text-[#E5C378]">Retail</span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Leader Suite
              </span>
            </span>
            <p className="text-[10px] text-stone-400 font-medium">Distributor Back-Office Portal</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700 text-xs font-bold text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'sw' ? 'Swahili' : 'English'}</span>
          </button>

          {/* Super Admin Direct Link */}
          <Link
            to="/admin"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-bold text-indigo-300 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Super Admin</span>
          </Link>

          {/* Return to Storefront */}
          <Link
            to="/"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-xs font-semibold text-stone-300 hover:text-white transition-colors"
          >
            <span>{lang === 'sw' ? 'Duka Kuu' : 'Store'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Main Content Hero & Form Grid ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Leadership Hero & Feature Pillars */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'sw' ? 'Mfumo Rasmi wa Viongozi na Wasambazaji' : 'Official Distributor Operations Portal'}</span>
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
            <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
              {lang === 'sw'
                ? 'Ofisi ya kidijitali iliyojengwa mahususi kwa wasambazaji wa Edmark Tanzania. Rekodi mauzo hata bila intaneti, fuatilia madeni ya wateja, na simamia Lipa Namba zako zote.'
                : 'The dedicated digital back-office for Edmark leaders in Tanzania. Record live transactions offline, track debtor balances, automate WhatsApp invoices, and manage 2,000 SV monthly maintenance.'}
            </p>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-emerald-900/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">2,000 SV Challenge</h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  {lang === 'sw' ? 'Ufuatiliaji wa pointi na maintenance ya kila mwezi' : 'Live SV pacing & manager qualification tracking'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-emerald-900/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Daftari la Mauzo & Stoo</h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  {lang === 'sw' ? 'Rekodi bidhaa, pata risiti za WhatsApp papo hapo' : 'Instant offline receipt compiler & inventory alerts'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-emerald-900/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Lipa Namba & Akaunti</h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  {lang === 'sw' ? 'M-Pesa, Tigo Pesa, Airtel Money na Benki' : 'Multi-channel mobile money & QR code generator'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-emerald-900/30 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Duka Binafsi (@handle)</h4>
                <p className="text-[11px] text-stone-400 leading-snug">
                  {lang === 'sw' ? 'Wateja wako wanaagiza moja kwa moja kupitia kiungo chako' : 'Share custom links with automatic WhatsApp checkout'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Portal Auth & Registration Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-stone-900/90 backdrop-blur-xl border border-[#1E4D3C] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
            {/* Form Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#143B2E] border border-[#276B53] text-[#E5C378] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {tab === 'register'
                    ? (lang === 'sw' ? 'Fungua Akaunti ya Msambazaji' : 'Create Distributor Account')
                    : tab === 'switch'
                    ? (lang === 'sw' ? 'Chagua Wasambazaji' : 'Select Distributor Profile')
                    : (lang === 'sw' ? 'Ingia Kwenye Ofisi Yako' : 'Distributor Back-Office Login')}
                </h3>
                <p className="text-xs text-stone-300">
                  {tab === 'register'
                    ? (lang === 'sw' ? 'Jaza fomu fupi kupata kiungo chako na daftari la biashara.' : 'Get your custom store handle & leadership suite.')
                    : (lang === 'sw' ? 'Weka nenosiri, PIN, au ingia na Google kufungua daftari.' : 'Sign in with Google, PIN, or password to manage your operations.')}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center bg-stone-950 p-1 rounded-2xl border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setRegError('');
                  setRegSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'login'
                    ? 'bg-[#C5A059] text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Ingia' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setRegError('');
                  setRegSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'register'
                    ? 'bg-[#C5A059] text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Jisajili Mpya' : 'Sign Up'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('switch');
                  setRegError('');
                  setRegSuccess('');
                }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tab === 'switch'
                    ? 'bg-[#C5A059] text-stone-950 shadow-md'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Badili' : 'Switch'}</span>
              </button>
            </div>

            {/* ── TAB 1: LOGIN ── */}
            {tab === 'login' && (
              <div className="space-y-4">
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                >
                  <Chrome className="w-4 h-4 text-[#4285F4]" />
                  <span>{isGoogleLoading ? 'Connecting Google...' : (lang === 'sw' ? 'Ingia na Google (Gmail)' : 'Sign In with Google')}</span>
                </button>

                <div className="flex items-center gap-2 py-0.5">
                  <div className="flex-1 h-px bg-stone-800" />
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                    {lang === 'sw' ? 'au Nenosiri / PIN' : 'or Password / PIN'}
                  </span>
                  <div className="flex-1 h-px bg-stone-800" />
                </div>

                <div className="space-y-2">
                  <input
                    type="password"
                    maxLength={16}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                    placeholder={lang === 'sw' ? 'Weka PIN (mfano: 2580)' : 'Enter PIN (e.g. 2580)'}
                    className="w-full text-center text-sm font-mono tracking-wider py-3 px-4 bg-stone-950 border border-stone-700 rounded-2xl text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20"
                  />

                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs font-bold text-red-400 text-center"
                    >
                      {lang === 'sw' ? 'Taarifa sio sahihi. Jaribu PIN 2580 au Google.' : 'Incorrect credentials. Try PIN 2580 or Google.'}
                    </motion.p>
                  )}

                  <button
                    onClick={handleVerifyPin}
                    className="w-full py-3 bg-[#C5A059] hover:bg-[#d4ad60] text-stone-950 font-black rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>{lang === 'sw' ? 'Fungua Ofisi Yangu' : 'Open Dashboard'}</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                  <span>Demo Authorized PIN:</span>
                  <button
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
                  <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
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
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                        className="w-full bg-transparent py-2.5 pl-1 text-white focus:outline-none"
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
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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

      {/* ── Footer ── */}
      <footer className="px-4 sm:px-8 py-4 border-t border-emerald-900/40 bg-black/40 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 ED Retail Tanzania • Independent Distributor Management Platform</p>
        <div className="flex items-center gap-4 text-[11px]">
          <Link to="/admin" className="text-indigo-400 hover:underline">Super Admin Hub</Link>
          <span>•</span>
          <Link to="/" className="text-[#E5C378] hover:underline">Customer Storefront</Link>
        </div>
      </footer>
    </div>
  );
}
