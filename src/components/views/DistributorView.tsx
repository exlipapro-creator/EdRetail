import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Star,
  Phone,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  MapPin,
  Lock,
  Unlock,
  TrendingUp,
  CreditCard,
  BookOpen,
  Bot,
  Plus,
  Store,
  ArrowLeft,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { getActiveWhatsAppLink } from '../../utils/whatsappCompiler';
import { TESTIMONIALS } from '../../types';
import { useLang } from '../../context/LangContext';
import { RegionalDistributorLocator } from '../distributor/RegionalDistributorLocator';
import { AdminDashboardPanel } from '../chat/AdminDashboardPanel';
import { FieldLedgerPanel } from '../chat/FieldLedgerPanel';
import { MaintenanceTrackerPanel } from '../chat/MaintenanceTrackerPanel';
import { PaymentAccountsManager } from '../distributor/PaymentAccountsManager';
import { LogOfflineSaleModal } from '../distributor/LogOfflineSaleModal';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';
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

  // Sub-tabs inside BackOffice
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'payments' | 'maintenance' | 'automations' | 'storefront'>('overview');

  // PIN state
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Sale Modal state
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Follow-up Simulator states
  const [simQuery, setSimQuery] = useState('Nina vidonda vya tumbo nitumie nini?');
  const [simResult, setSimResult] = useState<ChatMessage | null>(null);
  const [customClientName, setCustomClientName] = useState('Mama Sarah');
  const [customClientPhone, setCustomClientPhone] = useState('0712345678');
  const [customClientProduct, setCustomClientProduct] = useState('Shake Off & MRT Complex');

  const summary = getFinancialSummary('month');
  const maintenance = getMaintenanceAnalysis();

  const totalSalesCount = sales.length;
  const pendingDebtsTotal = summary.creditOutstanding;

  const waConsultLink = getActiveWhatsAppLink(
    `Habari ${distributor.name}, nina swali kuhusu bidhaa za Edmark na uwasilishaji:`
  );

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

  const handleRunSimulator = () => {
    if (!simQuery.trim()) return;
    const res = parseCustomerOrDistributorIntent(simQuery, false, lang);
    setSimResult(res);
  };

  const handleSendFollowUpWhatsApp = (sequenceType: 'day3_detox' | 'day7_ulcer' | 'day14_refill' | 'day30_review') => {
    let msg = '';
    const cleanPhone = customClientPhone.replace(/\D/g, '').replace(/^0/, '255');

    if (sequenceType === 'day3_detox') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name} kutoka ED Retail. ` +
        `Uko kwenye Siku ya 3 ya dozi yako ya ${customClientProduct}. ` +
        `Je, unakunywa maji ya kutosha (lita 2–3 kwa siku)? Utumbo unavyojisafisha unahitaji maji mengi kurahisisha kutoa sumu. Nambie jinsi unavyojisikia leo!`;
    } else if (sequenceType === 'day7_ulcer') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name}. ` +
        `Kwenye Siku ya 7 ya kutumia Splina Liquid Chlorophyll & Shake Off: Je, maumivu ya gesi na kuwaka moto kifuani yamepungua? Kumbuka kunywa Splina kwenye maji baridi au ya uvuguvugu asubuhi kabla ya kula.`;
    } else if (sequenceType === 'day14_refill') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name}. ` +
        `Uko katikati ya mzunguko wako wa siku 14 na ${customClientProduct}. ` +
        `Kama unahitaji boksi la kuendeleza dozi yako ili matokeo yasikatike, nambie nikuletee au nikutumie leo kabla stoo haijafungwa!`;
    } else if (sequenceType === 'day30_review') {
      msg =
        `Hongera sana ${customClientName}! 🎉 Ni ${distributor.name}. ` +
        `Umetimiza Siku 30 tangu uanze safari yako ya afya na Edmark. ` +
        `Je, umepima uzito au maendeleo ya afya yako? Ningependa kusikia ushuhuda wako ili tukuwekee mpango wa afya endelevu.`;
    }

    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-stone-100 text-stone-900 pb-16">
      {/* ── 1. FULL-PAGE ENTERPRISE COMMAND HEADER ── */}
      <div className="bg-[#0C271E] border-b border-[#1A3D31] text-stone-100 shadow-md sticky top-14 sm:top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back to Store + Title */}
          <div className="flex items-center gap-3">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold border border-white/10 cursor-pointer"
                title={lang === 'sw' ? 'Rudi Dukani kwa Wateja' : 'Back to Customer Store'}
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">{lang === 'sw' ? 'Dukani' : 'Shop'}</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#164132] border border-[#235844] flex items-center justify-center text-[#E5C378] shadow-xs flex-shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base text-white tracking-tight leading-tight">
                    {lang === 'sw' ? 'Ofisi Kuu ya Msambazaji' : 'Distributor Enterprise Portal'}
                  </h1>
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                    isAdminAuthenticated
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {isAdminAuthenticated ? 'Unlocked' : 'PIN Protected'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-300 hidden sm:block">
                  {distributor.name} • {distributor.rank || 'Crown Manager'} • {distributor.city}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2">
            {/* Log Offline Sale Trigger */}
            <button
              id="fullpage-log-sale-btn"
              onClick={() => setShowSaleModal(true)}
              className="px-3 sm:px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}</span>
            </button>

            {/* Flyer Studio trigger */}
            {onOpenFlyerStudio && (
              <button
                onClick={onOpenFlyerStudio}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title={lang === 'sw' ? 'Tengeneza Picha za Status' : 'Generate WhatsApp Status Flyers'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Flyer Studio</span>
              </button>
            )}

            {/* Storefront Link modal */}
            {onOpenStoreLinkModal && !distributor.isCentral && (
              <button
                onClick={onOpenStoreLinkModal}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-stone-200 border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Share Storefront URL"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>@{distributor.slug}</span>
              </button>
            )}

            {/* Lock / Unlock Toggle */}
            {isAdminAuthenticated ? (
              <button
                onClick={() => setAdminAuthenticated(false)}
                className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                title={lang === 'sw' ? 'Funga Ofisi (Lock with PIN)' : 'Lock Portal'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'sw' ? 'Funga' : 'Lock'}</span>
              </button>
            ) : (
              <button
                onClick={handleQuickDemoUnlock}
                className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Ingia PIN' : 'Enter PIN'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. MAIN FULL-PAGE CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* If PIN is Locked, show clean Full-Page Security Gateway */}
        {!isAdminAuthenticated ? (
          <div className="max-w-xl mx-auto py-8 sm:py-16">
            <div className="bg-gradient-to-br from-stone-900 via-[#0C271E] to-stone-950 rounded-3xl p-6 sm:p-10 text-white border border-[#1A3D31] shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-[#164132] border border-[#235844] text-[#E5C378] flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 rounded-full bg-[#C5A059]/20 text-[#E5C378] border border-[#C5A059]/30 text-xs font-black uppercase tracking-wider">
                  {lang === 'sw' ? 'Ofisi ya Msambazaji (Leader Gateway)' : 'Distributor Enterprise Gateway'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {lang === 'sw' ? 'Ingiza PIN ya Kiongozi Kufungua' : 'Unlock Leader Back-Office'}
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto">
                  {lang === 'sw'
                    ? `Weka PIN ya usalama ili kufikia Daftari la Mauzo, Akaunti za Lipa Namba, na 3-Month Fund (2,000 SV).`
                    : `Enter your leader security PIN to access the full sales ledger, payment accounts, and 2,000 SV quarterly pacing.`}
                </p>
              </div>

              <div className="space-y-3 max-w-xs mx-auto">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                    placeholder="Weka PIN (2580)"
                    className="w-full text-center text-xl font-mono tracking-widest py-3 px-4 bg-stone-950/90 border border-stone-700 rounded-2xl text-white placeholder:text-stone-600 focus:outline-none focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20"
                  />
                </div>

                {pinError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-red-400"
                  >
                    {lang === 'sw' ? 'PIN sio sahihi. Tafadhali jaribu tena.' : 'Incorrect PIN. Try again.'}
                  </motion.p>
                )}

                <button
                  onClick={handleVerifyPin}
                  className="w-full py-3 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black rounded-xl text-sm shadow-md transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4" />
                  <span>{lang === 'sw' ? 'Fungua Ofisi Yangu Sasa' : 'Unlock Portal'}</span>
                </button>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                  <span>{lang === 'sw' ? 'PIN ya majaribio:' : 'Demo quick PIN:'}</span>
                  <button
                    onClick={handleQuickDemoUnlock}
                    className="font-mono font-black text-amber-300 hover:text-amber-200 underline cursor-pointer"
                  >
                    2580 (Bofya Kuingia)
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── 3. UNLOCKED FULL ENTERPRISE BACK-OFFICE SUITE ── */
          <div className="space-y-6 animate-fadeIn">
            {/* Top Scoreboard: 4 Executive KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: 3-Month Fund SV Progress */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                    {lang === 'sw' ? 'SV ya Mwezi Huu' : 'Monthly SV Points'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black text-stone-900">
                      {maintenance.totalSv.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-stone-500">/ 2,000 SV</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 mt-2 overflow-hidden border border-stone-200">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, maintenance.percentComplete)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Gross Sales Revenue */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                    {lang === 'sw' ? 'Mauzo Ghafi (Mwezi)' : 'Monthly Gross Sales'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-stone-900 block truncate">
                    TZS {summary.totalRevenue.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-stone-500 mt-1 block">
                    {totalSalesCount} {lang === 'sw' ? 'miamala iliyorekodiwa' : 'sales recorded'}
                  </span>
                </div>
              </div>

              {/* Card 3: Retail Profit Margin */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                    {lang === 'sw' ? 'Faida ya Rejareja' : 'Retail Net Profit'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 block truncate">
                    TZS {summary.estimatedNetProfit.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-stone-500 mt-1 block">
                    TZS {summary.cashCollected.toLocaleString()} {lang === 'sw' ? 'taslimu' : 'cash received'}
                  </span>
                </div>
              </div>

              {/* Card 4: Outstanding Debts */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-stone-500 tracking-wider">
                    {lang === 'sw' ? 'Madeni ya Wateja' : 'Uncollected Debts'}
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xl sm:text-2xl font-black text-red-600 block truncate">
                    TZS {pendingDebtsTotal.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-stone-500 mt-1 block">
                    {summary.overdueDebtsCount} {lang === 'sw' ? 'wateja waliozidi muda' : 'overdue debts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Expansive Navigation Tabs */}
            <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'overview', labelSw: 'Muhtasari wa Mauzo & Bei', labelEn: 'Sales & Inventory Pricing', icon: TrendingUp },
                { id: 'ledger', labelSw: 'Daftari la Mauzo & Madeni', labelEn: 'Field Sales Ledger', icon: BookOpen },
                { id: 'payments', labelSw: 'Lipa Namba & Akaunti', labelEn: 'Payment Accounts', icon: CreditCard },
                { id: 'maintenance', labelSw: '3-Month Fund (2,000 SV)', labelEn: '3-Month Tracker', icon: Award },
                { id: 'automations', labelSw: 'Ufuatiliaji wa Wateja (CRM)', labelEn: 'WhatsApp Follow-ups', icon: Bot },
                { id: 'storefront', labelSw: 'Wasifu wa Umma & Mikoa', labelEn: 'Storefront & Branches', icon: Store },
              ].map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-[#0C271E] text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#E5C378]' : 'text-stone-400'}`} />
                    <span>{lang === 'sw' ? t.labelSw : t.labelEn}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENTS (Expansive Full Page Panels) */}
            <div className="bg-white rounded-3xl p-4 sm:p-7 border border-stone-200 shadow-xs">
              {/* TAB 1: OVERVIEW & INVENTORY */}
              {activeTab === 'overview' && (
                <AdminDashboardPanel
                  onOpenSaleForm={() => setShowSaleModal(true)}
                  onNavigateToTab={(tab) => setActiveTab(tab === 'chat' ? 'automations' : tab as any)}
                  lang={lang}
                />
              )}

              {/* TAB 2: FIELD SALES LEDGER */}
              {activeTab === 'ledger' && (
                <FieldLedgerPanel
                  onOpenSaleForm={() => setShowSaleModal(true)}
                  lang={lang}
                />
              )}

              {/* TAB 3: PAYMENT ACCOUNTS MANAGER */}
              {activeTab === 'payments' && (
                <PaymentAccountsManager lang={lang} />
              )}

              {/* TAB 4: 3-MONTH FUND 2,000 SV TRACKER */}
              {activeTab === 'maintenance' && (
                <MaintenanceTrackerPanel
                  onSendChatMessage={() => {}}
                  lang={lang}
                />
              )}

              {/* TAB 5: WHATSAPP RETENTION AUTOMATIONS & CRM */}
              {activeTab === 'automations' && (
                <div className="space-y-6 text-stone-900 text-xs">
                  <div className="bg-stone-50 p-5 sm:p-6 rounded-2xl border border-stone-200 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-stone-900 font-extrabold text-sm sm:text-base">
                        <Bot className="w-5 h-5 text-emerald-700" />
                        <span>{lang === 'sw' ? 'Arifa za WhatsApp za Ufuatiliaji wa Wateja' : 'Automated WhatsApp Retention Sequences'}</span>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-black text-xs">
                        1-Tap WhatsApp Dispatch
                      </span>
                    </div>

                    <p className="text-stone-600 text-xs leading-relaxed">
                      {lang === 'sw'
                        ? 'Weka maelezo ya mteja wako hapa chini ili kutuma ujumbe rasmi wa ufuatiliaji kwa mbofyo mmoja moja kwa moja kwenye WhatsApp.'
                        : 'Enter your customer details below to trigger personalized follow-up sequences on WhatsApp in 1-tap.'}
                    </p>

                    {/* Customer Info Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-stone-200">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{lang === 'sw' ? 'Jina la Mteja:' : 'Client Name:'}</label>
                        <input
                          type="text"
                          value={customClientName}
                          onChange={(e) => setCustomClientName(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{lang === 'sw' ? 'Simu (WhatsApp):' : 'Phone (WhatsApp):'}</label>
                        <input
                          type="tel"
                          value={customClientPhone}
                          onChange={(e) => setCustomClientPhone(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">{lang === 'sw' ? 'Bidhaa Aliyonunua:' : 'Product Used:'}</label>
                        <input
                          type="text"
                          value={customClientProduct}
                          onChange={(e) => setCustomClientProduct(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* 4 Follow-up Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Day 3 */}
                      <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                              {lang === 'sw' ? '📅 Siku ya 3: Kikumbusho cha Maji' : '📅 Day 3: Hydration Check'}
                            </span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">Detox Phase</span>
                          </div>
                          <p className="text-stone-500 text-[11px] mt-1.5">
                            {lang === 'sw' ? 'Humhimiza mteja kunywa lita 2-3 za maji kusukuma sumu zilizofumuliwa na Shake Off.' : 'Encourages proper hydration while colon is cleansing.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day3_detox')}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Tuma WhatsApp (Siku ya 3)' : 'Send Day-3 Prompt'}</span>
                        </button>
                      </div>

                      {/* Day 7 */}
                      <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                              {lang === 'sw' ? '📅 Siku ya 7: Matokeo ya Vidonda' : '📅 Day 7: Ulcer & Relief Check'}
                            </span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Relief Phase</span>
                          </div>
                          <p className="text-stone-500 text-[11px] mt-1.5">
                            {lang === 'sw' ? 'Hufuatilia maumivu ya tumbo, gesi, na maelekezo ya matumizi ya Splina Chlorophyll.' : 'Monitors acid reflux and Splina dosage compliance.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day7_ulcer')}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Tuma WhatsApp (Siku ya 7)' : 'Send Day-7 Prompt'}</span>
                        </button>
                      </div>

                      {/* Day 14 */}
                      <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                              {lang === 'sw' ? '📅 Siku ya 14: Kuongeza Dozi (Refill)' : '📅 Day 14: Refill CRM'}
                            </span>
                            <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">Repeat Sale</span>
                          </div>
                          <p className="text-stone-500 text-[11px] mt-1.5">
                            {lang === 'sw' ? 'Humkumbusha mteja kuagiza boksi la pili kabla la kwanza halijaisha ili matokeo yawe endelevu.' : 'Triggers repeat order before first pack finishes.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day14_refill')}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Tuma WhatsApp (Siku ya 14 Refill)' : 'Send Day-14 Refill'}</span>
                        </button>
                      </div>

                      {/* Day 30 */}
                      <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                              {lang === 'sw' ? '📅 Siku ya 30: Tathmini ya Ushuhuda' : '📅 Day 30: Testimonial & Review'}
                            </span>
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Advocacy</span>
                          </div>
                          <p className="text-stone-500 text-[11px] mt-1.5">
                            {lang === 'sw' ? 'Hukusanya ushuhuda wa mteja na kumpendekezea uanachama au mpango wa maisha.' : 'Collects verified review and invites to membership.'}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day30_review')}
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lang === 'sw' ? 'Tuma WhatsApp (Siku ya 30)' : 'Send Day-30 Review'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AI Simulator */}
                  <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 font-extrabold text-sm">
                      <Bot className="w-5 h-5 text-emerald-700" />
                      <span>{lang === 'sw' ? 'Jaribu Ushauri wa Afya (AI Health Simulator)' : 'AI Health Advisor Simulator'}</span>
                    </div>
                    <p className="text-stone-500 text-xs">
                      {lang === 'sw'
                        ? 'Jaribu maswali ya kawaida ya wateja ili kuona jinsi roboti inavyowajibu kwa weledi na kuelekeza kwenye WhatsApp yako.'
                        : 'Test customer health inquiries to preview automated replies and guidance.'}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={simQuery}
                        onChange={(e) => setSimQuery(e.target.value)}
                        placeholder="Andika swali la mteja..."
                        className="flex-1 p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold"
                      />
                      <button
                        onClick={handleRunSimulator}
                        className="px-4 py-2.5 bg-[#0C271E] hover:bg-[#164132] text-white font-bold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {lang === 'sw' ? 'Jaribu Sasa' : 'Run Test'}
                      </button>
                    </div>

                    {simResult && (
                      <div className="p-4 bg-white rounded-xl border border-emerald-300 space-y-2">
                        <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                          {lang === 'sw' ? 'Majibu Yanayotumwa kwa Mteja:' : 'Generated Response:'}
                        </span>
                        <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed font-medium">
                          {simResult.text}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: PUBLIC STOREFRONT & REGIONAL NETWORK */}
              {activeTab === 'storefront' && (
                <div className="space-y-8">
                  {/* Hero Profile Card */}
                  <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                      {/* Avatar / Portrait Badge */}
                      <div className="relative flex-shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-300 to-amber-200 p-1 shadow-xl">
                          <div className="w-full h-full bg-primary-900 rounded-[22px] overflow-hidden flex items-center justify-center relative">
                            <img
                              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
                              alt={distributor.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                                if (fb) fb.style.display = 'flex';
                              }}
                            />
                            <div className="hidden w-full h-full bg-gradient-to-br from-primary-600 to-indigo-800 items-center justify-center text-white font-extrabold text-3xl">
                              {distributor.name.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-lg border-2 border-white" title="Verified Distributor Leader">
                          <Award className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                          <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 flex items-center gap-1.5 border border-white/10">
                            <Sparkles className="w-3.5 h-3.5" />
                            {distributor.rank || 'Crown Manager'}
                          </span>
                          <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-bold text-emerald-300 flex items-center gap-1.5 border border-emerald-400/20">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            {lang === 'sw' ? 'Msambazaji Aliyeidhinishwa' : 'Authorized Distributor'}
                          </span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                          {distributor.name}
                        </h1>

                        <p className="text-xs sm:text-sm text-primary-100 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary-300" />
                          <span>{distributor.city}, Tanzania</span>
                          <span>·</span>
                          <span className="text-emerald-300 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            {lang === 'sw' ? 'Majibu ndani ya dakika 30' : 'Replies within 30 min'}
                          </span>
                        </p>

                        <p className="text-xs text-primary-100/90 mt-3 leading-relaxed max-w-xl">
                          {distributor.bio || (lang === 'sw'
                            ? `Karibu! Mimi ni ${distributor.name}, Msambazaji Mkuu wa Edmark nchini Tanzania. Niko hapa kukusaidia kupata bidhaa halisi 100%, ratiba sahihi ya matumizi, na ushauri wa bure wa safari yako ya afya.`
                            : `Welcome! I am ${distributor.name}, an authorized Edmark distributor leader in Tanzania. I am dedicated to providing you with 100% genuine wellness solutions, customized dosage coaching, and fast nationwide delivery.`)}
                        </p>

                        {/* CTAs */}
                        <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <a
                            id="distributor-whatsapp-cta-btn"
                            href={waConsultLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 bg-secondary-green hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg transition-transform active:scale-95 cursor-pointer"
                          >
                            <Phone className="w-4 h-4" />
                            <span>{lang === 'sw' ? `Ongea na ${distributor.name.split(' ')[0]} WhatsApp` : `Chat on WhatsApp with ${distributor.name.split(' ')[0]}`}</span>
                          </a>

                          <span className="text-xs text-primary-200 font-medium">
                            {distributor.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Stats Bar */}
                  <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-stone-900 block leading-tight">{distributor.experienceYears || '5+'} Years</span>
                        <span className="text-[11px] text-stone-500">{lang === 'sw' ? 'Uzoefu wa Edmark' : 'Edmark Experience'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-stone-900 block leading-tight">500+</span>
                        <span className="text-[11px] text-stone-500">{lang === 'sw' ? 'Wateja Waliohudumiwa' : 'Clients Guided'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-stone-900 block leading-tight">{distributor.rating || '4.95'} / 5.0</span>
                        <span className="text-[11px] text-stone-500">{lang === 'sw' ? 'Kiwango cha Kuridhika' : 'Customer Rating'}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-lg font-extrabold text-stone-900 block leading-tight">100%</span>
                        <span className="text-[11px] text-stone-500">{lang === 'sw' ? 'Uhalisi Uliothibitishwa' : 'Genuine Products'}</span>
                      </div>
                    </div>
                  </section>

                  {/* Regional Network Directory */}
                  <section>
                    <RegionalDistributorLocator />
                  </section>

                  {/* Customer Testimonials */}
                  <section className="bg-stone-50 rounded-3xl border border-stone-200 p-6 sm:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                          {lang === 'sw' ? 'Ushuhuda wa Wateja' : 'Customer Stories'}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                          {lang === 'sw' ? 'Matokeo Halisi ya Wateja Wetu' : 'Real Results from Real Clients'}
                        </h2>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                        <Star className="w-5 h-5 fill-amber-400" />
                        <span>4.95 / 5.0</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {TESTIMONIALS.map((test) => (
                        <div
                          key={test.id}
                          className="p-5 rounded-2xl bg-white border border-stone-200 flex flex-col justify-between space-y-3 shadow-2xs"
                        >
                          <p className="text-xs text-stone-700 italic leading-relaxed">
                            &ldquo;{lang === 'sw' ? test.text.sw : test.text.en}&rdquo;
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">{test.name}</span>
                              <span className="text-[10px] text-stone-500">{test.location}</span>
                            </div>
                            <span className="text-[10px] font-bold text-secondary-green bg-emerald-50 px-2 py-0.5 rounded-full">
                              {test.product}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 4. STANDALONE SOLID LOG OFFLINE SALE MODAL ── */}
      <LogOfflineSaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
      />
    </div>
  );
}
