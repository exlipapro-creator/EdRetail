import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Unlock,
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
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
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
  const verifyPin = useDistributorStore((s) => s.verifyPin);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const getMaintenanceAnalysis = useDistributorStore((s) => s.getMaintenanceAnalysis);
  const sales = useDistributorStore((s) => s.sales);

  // Timeframe for global metrics
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Workspace sub-tabs
  const [activeTab, setActiveTab] = useState<'ledger' | 'inventory' | 'payments' | 'goals' | 'crm' | 'profile'>('ledger');

  // PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

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
                    {isAdminAuthenticated ? 'Active' : 'PIN Protected'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300">
                  {distributor.rank || 'Crown Manager'} • {distributor.city} • <span className="text-emerald-400 font-semibold">Live Sync</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Tools & Lock */}
          <div className="flex items-center gap-2">
            {/* Primary Action Button */}
            <button
              id="distributor-primary-log-sale-btn"
              onClick={() => setShowSaleModal(true)}
              className="px-3.5 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
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

            {/* Lock / Unlock */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => setAdminAuthenticated(false)}
                className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                title="Lock Portal"
              >
                <Lock className="w-3.5 h-3.5" />
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
        {/* If PIN is Locked, show clean Security Gateway */}
        {!isAdminAuthenticated ? (
          <div className="max-w-md mx-auto py-10 sm:py-16">
            <div className="bg-gradient-to-br from-stone-900 via-[#0C271E] to-stone-950 rounded-3xl p-6 sm:p-8 text-white border border-[#1A3D31] shadow-xl text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-[#164132] border border-[#235844] text-[#E5C378] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-1.5">
                <span className="px-3 py-0.5 rounded-full bg-[#C5A059]/20 text-[#E5C378] border border-[#C5A059]/30 text-[10px] font-black uppercase tracking-wider">
                  {lang === 'sw' ? 'Mlango wa Kiongozi' : 'Leader Gateway'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {lang === 'sw' ? 'Fungua Ofisi ya Msambazaji' : 'Unlock Distributor Dashboard'}
                </h2>
                <p className="text-xs text-stone-300 max-w-xs mx-auto">
                  {lang === 'sw'
                    ? 'Weka PIN ya usalama ili kufikia Daftari la Mauzo, Stoo ya Bidhaa, na 2,000 SV Challenge.'
                    : 'Enter PIN to manage live sales records, product stock, payment numbers, and SV pacing.'}
                </p>
              </div>

              <div className="space-y-3 max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={8}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    if (pinError) setPinError(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                  placeholder="PIN (2580)"
                  className="w-full text-center text-xl font-mono tracking-widest py-2.5 px-4 bg-stone-950/90 border border-stone-700 rounded-2xl text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20"
                />

                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-red-400"
                  >
                    {lang === 'sw' ? 'PIN sio sahihi. Jaribu 2580.' : 'Incorrect PIN. Try 2580.'}
                  </motion.p>
                )}

                <button
                  onClick={handleVerifyPin}
                  className="w-full py-2.5 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black rounded-xl text-xs shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Fungua Sasa' : 'Unlock Dashboard'}</span>
                </button>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Demo PIN:</span>
                  <button
                    onClick={handleQuickDemoUnlock}
                    className="font-mono font-black text-amber-300 hover:text-amber-200 underline cursor-pointer"
                  >
                    2580 (Bofya Hapa)
                  </button>
                </div>
              </div>
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
