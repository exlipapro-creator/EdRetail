import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Unlock,
  LogOut,
  UserPlus,
  Users,
  TrendingUp,
  CreditCard,
  BookOpen,
  Bot,
  Plus,
  ArrowLeft,
  Share2,
  Sparkles,
  Package,
  CheckCircle2,
  Phone,
  DollarSign,
  AlertTriangle,
  User,
  Star,
  MapPin,
  BadgeCheck,
  Award,
  Shield,
  Chrome,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { useDistributorStore, DistributorProfile } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';
import { RegionalDistributorLocator } from '../distributor/RegionalDistributorLocator';
import { FieldLedgerPanel } from '../chat/FieldLedgerPanel';
import { MaintenanceTrackerPanel } from '../chat/MaintenanceTrackerPanel';
import { PaymentAccountsManager } from '../distributor/PaymentAccountsManager';
import { InventoryManagerPanel } from '../distributor/InventoryManagerPanel';
import { ClientCareCrmPanel } from '../distributor/ClientCareCrmPanel';
import { LogOfflineSaleModal } from '../distributor/LogOfflineSaleModal';
import { TESTIMONIALS } from '../../types';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

interface DistributorViewProps {
  onNavigateHome?: () => void;
  onNavigateProducts?: () => void;
  onOpenFlyerStudio?: () => void;
  onOpenStoreLinkModal?: () => void;
}

export function DistributorView({
  onNavigateHome,
  onOpenFlyerStudio,
  onOpenStoreLinkModal,
}: DistributorViewProps) {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const logoutDistributor = useDistributorStore((s) => s.logoutDistributor);
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const registerNewDistributor = useDistributorStore((s) => s.registerNewDistributor);
  const verifyPin = useDistributorStore((s) => s.verifyPin);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);
  const sales = useDistributorStore((s) => s.sales);

  // Timeframe for global metrics
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Workspace sub-tabs
  const [activeTab, setActiveTab] = useState<'ledger' | 'inventory' | 'payments' | 'goals' | 'crm' | 'profile'>('ledger');

  // Gateway mode tabs when locked
  const [gatewayTab, setGatewayTab] = useState<'login' | 'register' | 'switch'>('login');

  // PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+255 ');
  const [regCity, setRegCity] = useState('Dar es Salaam');
  const [regSlug, setRegSlug] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Sale Modal state
  const [showSaleModal, setShowSaleModal] = useState(false);

  const summary = getFinancialSummary(timeframe);
  const maintenance = getMaintenanceAnalysis();

  const debtorSales = sales.filter((s) => s.balanceDue > 0);
  const pendingDebtsTotal = summary.creditOutstanding;

  const handleVerifyPin = () => {
    const success = verifyPin(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleQuickDemoUnlock = () => {
    verifyPin('2580');
    setPinError(false);
    setPinInput('');
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setPinError(false);
    try {
      // 1. Try real Supabase Google OAuth if configured
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/landing',
        },
      });
      if (error) {
        throw error;
      }
    } catch {
      // 2. Seamless local/demo store fallback if Supabase keys aren't set in environment
      loginWithGoogle('distributor@edretail.tz', distributor.name || 'Authorized Leader');
      setAdminAuthenticated(true);
    } finally {
      setIsGoogleLoading(false);
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
        ? `🎉 Hongera ${newProfile.name}! Duka lako la mtandaoni limeundwa: edretail.store/@${newProfile.slug}`
        : `🎉 Welcome ${newProfile.name}! Your store handle is ready: edretail.store/@${newProfile.slug}`
    );

    setTimeout(() => {
      setAdminAuthenticated(true);
      setGatewayTab('login');
    }, 1000);
  };

  const handleSwitchDistributor = (target: DistributorProfile) => {
    useDistributorStore.setState({
      currentProfile: target,
      activeRefSlug: target.slug,
      isAdminAuthenticated: true,
    });
    setGatewayTab('login');
  };

  const handleSignOut = () => {
    logoutDistributor();
    setAdminAuthenticated(false);
    setPinInput('');
  };

  const handleSendDebtReminder = (sale: (typeof sales)[0]) => {
    const msg =
      `Habari ${sale.customerName}! Ni ${distributor.name} kutoka ED Retail. ` +
      `Nikukumbushe salio lako la ${sale.productName} TZS ${sale.balanceDue.toLocaleString()}` +
      `${sale.dueDate ? ` linalotarajiwa tarehe ${sale.dueDate}` : ''}. ` +
      `Unaweza kulipa kupitia M-Pesa. Asante sana!`;

    const cleanPhone = sale.customerPhone.replace(/\D/g, '').replace(/^0/, '255');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[#F8F9FA] text-stone-900 pb-20">
      {/* ── 1. COMPACT CONTEXT HEADER ── */}
      <header className="bg-[#0C271E] border-b border-[#1A3D31] text-stone-100 shadow-md sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Identity & Status */}
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold border border-white/10 cursor-pointer"
                title={lang === 'sw' ? 'Rudi Dukani kwa Wateja' : 'Back to Storefront'}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{lang === 'sw' ? 'Dukani' : 'Shop'}</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#164132] border border-[#235844] flex items-center justify-center text-[#E5C378] shadow-xs flex-shrink-0 font-black text-sm">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-tight">
                    {distributor.name}
                  </h1>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                    isAdminAuthenticated
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isAdminAuthenticated ? (lang === 'sw' ? 'Umeingia' : 'Unlocked') : 'PIN Protected'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  {distributor.rank || 'Crown Manager'} • {distributor.city} • <span className="text-emerald-400 font-semibold">Live Sync</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Tools, Switcher & Sign Out */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action Button */}
            <button
              id="distributor-primary-log-sale-btn"
              onClick={() => setShowSaleModal(true)}
              className="px-3 sm:px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}</span>
            </button>

            {/* Flyer Studio */}
            {onOpenFlyerStudio && (
              <button
                onClick={onOpenFlyerStudio}
                className="hidden sm:flex items-center gap-1 px-3 py-2 bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Flyer Studio"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Flyers</span>
              </button>
            )}

            {/* Storefront Link */}
            {onOpenStoreLinkModal && !distributor.isCentral && (
              <button
                onClick={onOpenStoreLinkModal}
                className="hidden md:flex items-center gap-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Share Store Link"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>@{distributor.slug}</span>
              </button>
            )}

            {/* Switch Account */}
            <button
              onClick={() => {
                setGatewayTab('switch');
                if (isAdminAuthenticated) {
                  setAdminAuthenticated(false);
                }
              }}
              className="px-2.5 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Switch Distributor Account"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'sw' ? 'Badili' : 'Switch'}</span>
            </button>

            {/* Super Admin Direct Link */}
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-black transition-colors"
              title="Super Admin Central Hub"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Super Admin</span>
            </Link>

            {/* Prominent Sign Out / Lock Button */}
            {isAdminAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white border border-red-500/40 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                title="Sign Out / Toka Kwenye Ofisi"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>{lang === 'sw' ? 'Toka' : 'Sign Out'}</span>
              </button>
            ) : (
              <button
                onClick={handleQuickDemoUnlock}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>PIN (2580)</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. BODY CONTENT ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">
        {/* If PIN is Locked, show clean, comprehensive Security Gateway */}
        {!isAdminAuthenticated ? (
          <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-4">
            <div className="bg-gradient-to-br from-stone-900 via-[#0C271E] to-stone-950 rounded-3xl p-6 sm:p-8 text-white border border-[#1A3D31] shadow-2xl space-y-6">
              {/* Header Icon */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#164132] border border-[#235844] text-[#E5C378] flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="px-3 py-0.5 rounded-full bg-[#C5A059]/20 text-[#E5C378] border border-[#C5A059]/30 text-[10px] font-black uppercase tracking-wider">
                    {lang === 'sw' ? 'Mlango wa Kiongozi & Wasambazaji' : 'Leader & Distributor Gateway'}
                  </span>
                  <h2 className="text-xl font-black text-white">
                    {gatewayTab === 'register'
                      ? (lang === 'sw' ? 'Jisajili Kama Msambazaji Mpya' : 'Create Distributor Account')
                      : gatewayTab === 'switch'
                      ? (lang === 'sw' ? 'Chagua Msambazaji' : 'Select Distributor Account')
                      : (lang === 'sw' ? 'Fungua Ofisi ya Msambazaji' : 'Distributor Back-Office Sign In')}
                  </h2>
                  <p className="text-xs text-stone-300 max-w-sm mx-auto">
                    {gatewayTab === 'register'
                      ? (lang === 'sw' ? 'Pata duka lako binafsi la mtandaoni (edretail.store/@jina) na mfumo wa rekodi za mauzo.' : 'Get your custom store link and management back-office.')
                      : (lang === 'sw' ? 'Weka PIN au ingia na Google kufikia Daftari la Mauzo, Stoo ya Bidhaa, na 2,000 SV Challenge.' : 'Sign in with Google, PIN, or password to manage your sales and stock.')}
                  </p>
                </div>
              </div>

              {/* Gateway Navigation Tabs */}
              <div className="flex items-center bg-stone-950/80 p-1 rounded-2xl border border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayTab('login');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gatewayTab === 'login'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Ingia' : 'Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGatewayTab('register');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gatewayTab === 'register'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Jisajili Mpya' : 'Sign Up'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGatewayTab('switch');
                    setRegError('');
                    setRegSuccess('');
                  }}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    gatewayTab === 'switch'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Badili' : 'Switch'}</span>
                </button>
              </div>

              {/* ── TAB 1: LOGIN (Google & PIN/Password) ── */}
              {gatewayTab === 'login' && (
                <div className="space-y-4">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3 px-4 bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98]"
                  >
                    <Chrome className="w-4 h-4 text-[#4285F4]" />
                    <span>{isGoogleLoading ? 'Connecting...' : (lang === 'sw' ? 'Ingia na Google (Gmail)' : 'Sign In with Google')}</span>
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
                      placeholder={lang === 'sw' ? 'Weka PIN (mfano: 2580)' : 'Enter PIN (e.g., 2580)'}
                      className="w-full text-center text-sm font-mono tracking-wider py-3 px-4 bg-stone-950/90 border border-stone-700 rounded-2xl text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20"
                    />

                    {pinError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-bold text-red-400 text-center"
                      >
                        {lang === 'sw' ? 'Taarifa sio sahihi. Jaribu PIN 2580 au bofya Ingia na Google.' : 'Incorrect credentials. Try PIN 2580 or Google Sign-In.'}
                      </motion.p>
                    )}

                    <button
                      onClick={handleVerifyPin}
                      className="w-full py-3 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black rounded-2xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>{lang === 'sw' ? 'Fungua Ofisi Yangu' : 'Unlock Dashboard'}</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
                    <span>Demo 1-Tap Access:</span>
                    <button
                      onClick={handleQuickDemoUnlock}
                      className="font-mono font-black text-amber-300 hover:text-amber-200 underline cursor-pointer"
                    >
                      Unlock with 2580
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 2: REGISTER (Create New Distributor) ── */}
              {gatewayTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
                  {/* Google Quick Sign-Up */}
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
                      className="w-full bg-stone-950/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                        className="w-full bg-stone-950/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                        className="w-full bg-stone-950/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                        className="w-full bg-stone-950/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 mb-1">
                        {lang === 'sw' ? 'Anwani ya Duka Lako (@handle)' : 'Custom Store Handle'}
                      </label>
                      <div className="flex items-center bg-stone-950/90 border border-stone-700 rounded-xl px-3 text-xs text-stone-400">
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
                      className="w-full bg-stone-950/90 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-amber-400"
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
                    <span>{lang === 'sw' ? 'Unda Duka & Ingia Kwenye Ofisi' : 'Create Store & Open Back-Office'}</span>
                  </button>
                </form>
              )}

              {/* ── TAB 3: SWITCH (Choose existing profile) ── */}
              {gatewayTab === 'switch' && (
                <div className="space-y-3 text-left">
                  <p className="text-xs text-stone-300">
                    {lang === 'sw' ? 'Bofya msambazaji hapa chini kufungua ofisi yake mara moja:' : 'Select an active distributor to switch profile:'}
                  </p>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {savedDistributors.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => handleSwitchDistributor(d)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          d.id === distributor.id
                            ? 'bg-amber-500/20 border-amber-500/40 text-white'
                            : 'bg-stone-950/80 border-stone-800 hover:border-stone-700 text-stone-300'
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
                    onClick={() => setGatewayTab('register')}
                    className="w-full py-2.5 border border-dashed border-stone-700 hover:border-amber-400 text-stone-400 hover:text-amber-300 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'sw' ? 'Ongeza Msambazaji Mwingine Mpya' : 'Add Another Distributor Profile'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── DISTRIBUTOR DEDICATED PORTAL LAUNCH CARD ── */}
            <div className="bg-gradient-to-r from-[#0C2A20] via-[#10382B] to-[#081C15] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{lang === 'sw' ? 'Ofisi Kamili ya Msambazaji' : 'Dedicated Distributor Back-Office Portal'}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950 text-[10px] font-black">NEW</span>
                    </h3>
                    <p className="text-[11px] text-emerald-200/80">
                      {lang === 'sw' ? 'Fungua ofisi ya skrini nzima yenye menyu ya stoo, madeni, na malengo ya 2,000 SV.' : 'Launch the full-screen leadership suite with inventory, CRM, and 2,000 SV tracker.'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-stone-400 font-mono mt-1">
                  Portal URL: <span className="text-[#E5C378] underline font-bold">edretail.store/portal</span>
                </p>
              </div>

              <Link
                to="/portal"
                className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <span>{lang === 'sw' ? 'Fungua Portal' : 'Open Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* ── SUPER ADMIN PORTAL GATEWAY CARD ── */}
            <div className="bg-gray-900 border border-indigo-500/30 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">
                      Super Administrator Central Portal
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      Access national oversight: Master Products, All Distributors, Sales, Loans, Cash Flow & Reviews.
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-indigo-300/80 font-mono mt-1">
                  Portal URL: <span className="text-indigo-300 underline font-bold">edretail.store/admin</span> · Default Login: <span className="text-amber-300 font-bold">admin@edretail.tz / admin123</span>
                </p>
              </div>

              <Link
                to="/admin"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <span>Fungua Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* ── 3. UNLOCKED TASK-FIRST OPERATIONAL DASHBOARD ── */
          <div className="space-y-5 animate-fadeIn">
            {/* ── SECTION A: GLOBAL REPORTING PERIOD & 4 CORE SNAPSHOT METRICS ── */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    {lang === 'sw' ? "Muhtasari wa Biashara Leo" : "Business Priority Snapshot"}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">
                    ({sales.length} {lang === 'sw' ? 'mauzo jumla' : 'total sales logged'})
                  </span>
                </div>

                {/* Global Timeframe Filter */}
                <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl text-xs self-start sm:self-auto">
                  {(['today', 'week', 'month', 'all'] as const).map((tId) => {
                    const labels = {
                      today: { en: 'Today', sw: 'Leo' },
                      week: { en: 'Week', sw: 'Wiki' },
                      month: { en: 'Month', sw: 'Mwezi' },
                      all: { en: 'All Time', sw: 'Yote' },
                    };
                    const isActive = timeframe === tId;
                    return (
                      <button
                        key={tId}
                        onClick={() => setTimeframe(tId)}
                        className={`px-2.5 py-1 font-extrabold rounded-lg transition-all cursor-pointer ${
                          isActive
                            ? 'bg-white text-stone-900 shadow-2xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {labels[tId][lang]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Consolidated Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Total Revenue */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {lang === 'sw' ? 'Jumla ya Mauzo' : 'Total Revenue'}
                    </span>
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-base sm:text-xl font-black text-stone-900 truncate">
                    TZS {summary.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {summary.totalUnitsSold} {lang === 'sw' ? 'bidhaa zilizouzwa' : 'units sold'}
                  </div>
                </div>

                {/* 2. Cash Collected */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {lang === 'sw' ? 'Cash Mkononi' : 'Cash Collected'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base sm:text-xl font-black text-emerald-800 truncate">
                    TZS {summary.cashCollected.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">
                    {summary.totalRevenue > 0
                      ? `${Math.round((summary.cashCollected / summary.totalRevenue) * 100)}% ya mauzo yote`
                      : '100%'}
                  </div>
                </div>

                {/* 3. Pending Debts */}
                <div className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs space-y-1 ${
                  debtorSales.length > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-stone-200/90'
                }`}>
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                      {lang === 'sw' ? 'Madeni ya Wateja' : 'Credit / Debts'}
                    </span>
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="text-base sm:text-xl font-black text-amber-950 truncate">
                    TZS {summary.creditOutstanding.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-800 font-bold">
                    {debtorSales.length} {lang === 'sw' ? 'wateja wanadaiwa' : 'active debtors'}
                  </div>
                </div>

                {/* 4. Estimated Net Profit */}
                <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between text-stone-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      {lang === 'sw' ? 'Faida Halisi (Net)' : 'Est. Net Profit'}
                    </span>
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="text-base sm:text-xl font-black text-stone-900 truncate">
                    TZS {summary.estimatedNetProfit.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-500 font-medium">
                    {lang === 'sw' ? 'Baada ya gharama ya jumla' : 'After wholesale cost'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION B: 3-MONTH GOAL PACING (2,000 SV CHALLENGE) ── */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-stone-900">
                      {lang === 'sw'
                        ? `Lengo la Mwezi: ${maintenance.fundName} (2,000 SV Challenge)`
                        : `Month Goal: ${maintenance.fundName} (2,000 SV Challenge)`}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'sw'
                        ? `Mwezi wa ${maintenance.currentMonthIndex} kati ya 3 • Zimebaki siku ${maintenance.daysRemaining}`
                        : `Month ${maintenance.currentMonthIndex} of 3 consecutive • ${maintenance.daysRemaining} days remaining`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('goals')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-extrabold rounded-xl self-start sm:self-auto transition-colors cursor-pointer"
                >
                  <span>{lang === 'sw' ? 'Mbinu za Kufuzu' : 'Team Strategy & Legs'}</span>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-black">
                  <span className="text-stone-900">
                    {maintenance.totalSv.toLocaleString()} / {maintenance.targetSv.toLocaleString()} SV
                  </span>
                  <span className="text-emerald-800 font-extrabold">{maintenance.percentComplete}%</span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                  <div
                    className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, maintenance.percentComplete)}%` }}
                  />
                </div>
              </div>

              {/* Pacing Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Pengo la SV' : 'SV Gap'}</div>
                  <div className="text-xs font-black text-amber-900">{maintenance.gapSv.toLocaleString()} SV</div>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Kila Siku' : 'Daily Run Rate'}</div>
                  <div className="text-xs font-black text-stone-900">{maintenance.dailyPacingSv} SV/siku</div>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'P4 Slimming' : 'P4 Kits Needed'}</div>
                  <div className="text-xs font-black text-emerald-800">{maintenance.p4KitsNeeded} pakiti</div>
                </div>
                <div className="p-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
                  <div className="text-[10px] text-stone-500 font-semibold">{lang === 'sw' ? 'Shake Off' : 'Shake Off Boxes'}</div>
                  <div className="text-xs font-black text-stone-900">{maintenance.shakeOffBoxesNeeded} boxes</div>
                </div>
              </div>
            </div>

            {/* ── SECTION C: PRIORITY ATTENTION CALLOUTS (ALERTS) ── */}
            {debtorSales.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-950 font-extrabold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      {lang === 'sw'
                        ? `🚨 Madeni Yanayohitaji Kufuatiliwa (Wateja ${debtorSales.length} • TZS ${pendingDebtsTotal.toLocaleString()})`
                        : `🚨 Action Required: Uncollected Debts (${debtorSales.length} clients • TZS ${pendingDebtsTotal.toLocaleString()})`}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="text-xs font-black text-amber-900 hover:text-amber-950 underline cursor-pointer"
                  >
                    {lang === 'sw' ? 'Fungua Daftari' : 'Open Ledger'}
                  </button>
                </div>

                {/* Horizontal Quick Debt Reminders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {debtorSales.slice(0, 2).map((sale) => (
                    <div
                      key={sale.id}
                      className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-xs text-stone-900 truncate">{sale.customerName}</div>
                        <div className="text-[10px] text-amber-800 font-bold">
                          Anadaiwa: TZS {sale.balanceDue.toLocaleString()} ({sale.productName})
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendDebtReminder(sale)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Kumbusho</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECTION D: FOCUSED OPERATIONAL WORKSPACES (TABS) ── */}
            <div className="space-y-4">
              {/* Workspace Navigation Bar */}
              <div className="flex items-center gap-1 bg-stone-200/80 p-1.5 rounded-2xl overflow-x-auto">
                {[
                  { id: 'ledger', labelSw: 'Daftari la Mauzo', labelEn: 'Sales & Debts Ledger', icon: BookOpen },
                  { id: 'inventory', labelSw: 'Stoo & Bei', labelEn: 'Stock & Pricing', icon: Package },
                  { id: 'payments', labelSw: 'Lipa Namba', labelEn: 'Payment Accounts', icon: CreditCard },
                  { id: 'goals', labelSw: '3-Month Challenge', labelEn: '2,000 SV Goals', icon: Award },
                  { id: 'crm', labelSw: 'Ufuatiliaji & Refill', labelEn: 'Retention CRM', icon: Bot },
                  { id: 'profile', labelSw: 'Wasifu wa Umma', labelEn: 'Public Profile', icon: User },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id as any)}
                      className={`px-3 sm:px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                        isActive
                          ? 'bg-[#0C271E] text-white shadow-xs'
                          : 'text-stone-700 hover:text-stone-950 hover:bg-stone-300/60'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E5C378]' : 'text-stone-500'}`} />
                      <span>{lang === 'sw' ? t.labelSw : t.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Workspace Content Panels */}
              <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-2xs">
                {/* 1. SALES LEDGER */}
                {activeTab === 'ledger' && (
                  <FieldLedgerPanel
                    onOpenSaleForm={() => setShowSaleModal(true)}
                    lang={lang}
                  />
                )}

                {/* 2. INVENTORY & STOCK TOGGLES */}
                {activeTab === 'inventory' && (
                  <InventoryManagerPanel lang={lang} />
                )}

                {/* 3. PAYMENT ACCOUNTS */}
                {activeTab === 'payments' && (
                  <PaymentAccountsManager lang={lang} />
                )}

                {/* 4. 3-MONTH GOAL & TEAM LEGS */}
                {activeTab === 'goals' && (
                  <MaintenanceTrackerPanel
                    onSendChatMessage={() => {}}
                    lang={lang}
                  />
                )}

                {/* 5. RETENTION CRM & AI SIMULATOR */}
                {activeTab === 'crm' && (
                  <ClientCareCrmPanel lang={lang} />
                )}

                {/* 6. PUBLIC STOREFRONT PROFILE */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="w-20 h-20 rounded-2xl bg-[#0C271E] border-2 border-amber-400/50 text-[#E5C378] flex items-center justify-center font-black text-2xl shadow-md">
                          {distributor.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                            <h3 className="text-lg font-black text-stone-900">{distributor.name}</h3>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 rounded-md text-[10px] font-extrabold">
                              {distributor.rank || 'Crown Manager'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 flex items-center justify-center sm:justify-start gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <span>{distributor.city}, Tanzania</span> • <span>{distributor.phone}</span>
                          </p>
                          <p className="text-xs text-stone-600 max-w-lg mt-2 leading-relaxed">
                            {distributor.bio || (lang === 'sw'
                              ? `Msambazaji Mkuu wa Edmark Tanzania. Ninatoa huduma ya ushauri wa afya, upimaji, na bidhaa halisi 100%.`
                              : `Authorized Edmark distributor leader in Tanzania. Genuine wellness coaching and nationwide dispatch.`)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Regional Directory */}
                    <RegionalDistributorLocator />

                    {/* Testimonials */}
                    <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-4">
                      <h4 className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                        {lang === 'sw' ? 'Ushuhuda wa Wateja' : 'Customer Stories'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {TESTIMONIALS.map((t) => (
                          <div key={t.id} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-extrabold text-xs text-stone-900">{t.name}</span>
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-stone-600 italic leading-relaxed">
                              "{t.text[lang] || t.text.sw}"
                            </p>
                            <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3" />
                              <span>{t.product} • {t.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── 3. LOG OFFLINE SALE MODAL ── */}
      <LogOfflineSaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
      />
    </div>
  );
}
