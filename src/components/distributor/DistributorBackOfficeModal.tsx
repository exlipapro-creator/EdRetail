import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  TrendingUp,
  Award,
  BookOpen,
  CreditCard,
  Bot,
  Sparkles,
  Plus,
  Send,
  ArrowLeft,
  Zap,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { MaintenanceTrackerPanel } from '../chat/MaintenanceTrackerPanel';
import { FieldLedgerPanel } from '../chat/FieldLedgerPanel';
import { AdminDashboardPanel } from '../chat/AdminDashboardPanel';
import { PaymentAccountsManager } from './PaymentAccountsManager';
import { LogOfflineSaleModal } from './LogOfflineSaleModal';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

interface DistributorBackOfficeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFlyerStudio?: () => void;
}

export const DistributorBackOfficeModal: React.FC<DistributorBackOfficeModalProps> = ({
  isOpen,
  onClose,
  onOpenFlyerStudio,
}) => {
  const { lang } = useLang();
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const verifyPin = useDistributorStore((s) => s.verifyPin);

  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'maintenance' | 'ledger' | 'automations' | 'profile'>('overview');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Automation & Assistant Simulator States
  const [simQuery, setSimQuery] = useState('Nina vidonda vya tumbo nitumie nini?');
  const [simResult, setSimResult] = useState<ChatMessage | null>(null);
  const [customClientName, setCustomClientName] = useState('Mama Sarah');
  const [customClientPhone, setCustomClientPhone] = useState('0712345678');
  const [customClientProduct, setCustomClientProduct] = useState('Shake Off & MRT Complex');

  if (!isOpen) return null;

  const handleVerifyPin = () => {
    const success = verifyPin(pinInput);
    if (success) {
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
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
        `Hongera kwa kukamilisha wiki ya kwanza ya mpango wako wa ${customClientProduct}. ` +
        `Je, maumivu ya tumbo, kiungulia, au gesi vimepungua? Splina na Spirulina zinaendelea kutibu kuta za utumbo. Tuma mrejesho wako!`;
    } else if (sequenceType === 'day14_refill') {
      msg =
        `Habari ${customClientName}! Ni ${distributor.name}. ` +
        `Umefika nusu ya ratiba yako ya ${customClientProduct}. ` +
        `Ili usikatishe dozi yako na matokeo yaendelee kwa kasi, ungependa nikuwekee oda ya kifurushi cha pili mapema kabla ya stoo kuisha?`;
    } else {
      msg =
        `Habari ${customClientName}! Hongera sana kwa kukamilisha siku 30 za safari yako ya afya na ${customClientProduct}. ` +
        `Umeshuhudia mabadiliko makubwa! Je, ungependa kupata punguzo la 15% kwenye oda yako ijayo au kujiunga kama msambazaji mshirika?`;
    }

    const waUrl = customClientPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      className="fixed inset-0 z-50 bg-stone-100 flex flex-col overflow-hidden"
    >
      {/* ── FULL SCREEN TOP COMMAND BAR ── */}
      <header className="px-4 sm:px-6 py-3.5 bg-[#0C271E] text-stone-100 flex items-center justify-between border-b border-[#1A3D31] shadow-md z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-1 text-stone-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors flex items-center gap-1.5 font-bold text-xs"
            title={lang === 'sw' ? 'Rudi Dukani' : 'Back to Store'}
          >
            <ArrowLeft className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'sw' ? 'Rudi Dukani' : 'Back to Store'}</span>
          </button>

          <div className="h-6 w-px bg-white/20 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164132] border border-[#235844] flex items-center justify-center text-[#E5C378] shadow-xs flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-white leading-none">
                  {lang === 'sw' ? 'Ofisi Kuu ya Msambazaji (Distributor Portal)' : 'Distributor Enterprise Back-Office'}
                </h1>
                <span className="px-2 py-0.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] text-[10px] font-black rounded-md uppercase tracking-wider">
                  {isAdminAuthenticated ? 'Unlocked' : 'PIN Protected'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-300 mt-1 flex items-center gap-2">
                <span className="font-semibold text-white">{distributor.name}</span>
                <span>•</span>
                <span>{distributor.rank || 'Crown Manager'}</span>
                <span>•</span>
                <span className="text-emerald-400">{distributor.city}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {onOpenFlyerStudio && (
            <button
              onClick={onOpenFlyerStudio}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flyer Studio</span>
            </button>
          )}

          {isAdminAuthenticated && (
            <button
              onClick={() => setAdminAuthenticated(false)}
              title={lang === 'sw' ? 'Funga Ofisi (Lock)' : 'Lock Back-Office'}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">{lang === 'sw' ? 'Funga' : 'Lock'}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="Close Portal"
          >
            <X className="w-5 h-5" />
            <span className="hidden md:inline">{lang === 'sw' ? 'Toka' : 'Exit'}</span>
          </button>
        </div>
      </header>

      {/* ── SECURITY PIN CHECK IF LOCKED ── */}
      {!isAdminAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-stone-100 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-stone-200 text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-black text-stone-900">
                {lang === 'sw' ? 'Fungua Ofisi ya Msambazaji' : 'Unlock Distributor Portal'}
              </h2>
              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                {lang === 'sw'
                  ? 'Weka PIN yako ya msambazaji kutazama mauzo ya mtandaoni, kuweka Lipa Namba, daftari la stoo, na pointi za SV.'
                  : 'Enter your distributor security PIN to access the sales ledger, till number management, inventory, and SV pacing.'}
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleVerifyPin();
                }}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-black py-3.5 border border-stone-300 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-stone-50"
                autoFocus
              />
              {pinError && (
                <p className="text-xs text-red-600 font-bold">
                  {lang === 'sw' ? 'PIN siyo sahihi. PIN ya awali ni: 2024 au 255' : 'Incorrect PIN. Default is: 2024 or 255'}
                </p>
              )}
              <p className="text-[11px] text-stone-400">
                {lang === 'sw' ? 'PIN ya majaribio: 2024 au 1234 au 255' : 'Demo PIN: 2024 or 1234 or 255'}
              </p>
            </div>

            <button
              onClick={handleVerifyPin}
              className="w-full py-3.5 bg-[#0C271E] hover:bg-[#164132] text-white font-black text-sm rounded-2xl shadow-md transition-transform active:scale-98 cursor-pointer"
            >
              {lang === 'sw' ? 'Thibitisha & Ingia Ofisini' : 'Unlock Full Portal'}
            </button>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="text-xs text-stone-500 hover:text-stone-900 font-semibold"
              >
                {lang === 'sw' ? 'Rudi kwenye Duka la Wateja' : 'Return to Customer Store'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-stone-100">
          {/* ── ENTERPRISE SUB-NAVIGATION TABS ── */}
          <nav className="px-4 sm:px-6 py-2.5 bg-white border-b border-stone-200 flex items-center justify-between gap-3 overflow-x-auto flex-shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'sw' ? 'Muhtasari & Mauzo' : 'Financials & CRM'}</span>
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'payments'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>{lang === 'sw' ? 'Lipa Namba & Tills' : 'Payment Accounts'}</span>
              </button>

              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'sw' ? 'Daftari la Mauzo & Madeni' : 'Field Sales & Debts'}</span>
              </button>

              <button
                onClick={() => setActiveTab('maintenance')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'maintenance'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{lang === 'sw' ? '3-Month Funds (2,000 SV)' : '3-Month Maintenance'}</span>
              </button>

              <button
                onClick={() => setActiveTab('automations')}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === 'automations'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'sw' ? 'Automations & Msaidizi' : 'Automations & Concierge'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowSaleModal(true)}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}</span>
              </button>
            </div>
          </nav>

          {/* ── FULL SCREEN MAIN VIEWPORT CONTENT ── */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {activeTab === 'overview' && (
                <AdminDashboardPanel
                  onOpenSaleForm={() => setShowSaleModal(true)}
                  onNavigateToTab={(t) => setActiveTab(t === 'chat' ? 'automations' : t as any)}
                  lang={lang}
                />
              )}

              {activeTab === 'payments' && (
                <PaymentAccountsManager lang={lang} />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceTrackerPanel
                  onSendChatMessage={() => {}}
                  lang={lang}
                />
              )}

              {activeTab === 'ledger' && (
                <FieldLedgerPanel
                  onOpenSaleForm={() => setShowSaleModal(true)}
                  lang={lang}
                />
              )}

              {activeTab === 'automations' && (
                <div className="space-y-6">
                  {/* Overview Hero */}
                  <div className="p-6 bg-gradient-to-br from-[#0C271E] to-[#164132] rounded-3xl text-white shadow-lg space-y-3">
                    <div className="flex items-center gap-2 text-[#E5C378]">
                      <Bot className="w-6 h-6" />
                      <h3 className="text-lg font-black">
                        {lang === 'sw' ? 'Kituo cha Automations na Ufuatiliaji wa Wateja' : 'Client Follow-Up & WhatsApp Automation Center'}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-200 max-w-2xl leading-relaxed">
                      {lang === 'sw'
                        ? 'Dhibiti ratiba za ufuatiliaji wa wateja WhatsApp (Day 3, 7, 14, 30), jaribu injini ya maswali na majibu, na kagua jinsi wateja wanavyopokea majibu mtandaoni.'
                        : 'Manage 1-tap client follow-up sequences, test the automated health assistant NLP response engine, and prepare customer re-orders.'}
                    </p>
                  </div>

                  {/* ── MODULE 1: AUTOMATED WHATSAPP SEQUENCES ── */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-900">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {lang === 'sw' ? 'Ratiba za Ufuatiliaji wa Wateja (1-Tap WhatsApp Follow-ups)' : 'Automated Client Follow-up Sequences'}
                        </h4>
                      </div>
                    </div>

                    {/* Personalization Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">
                          {lang === 'sw' ? 'Jina la Mteja:' : 'Client Name:'}
                        </label>
                        <input
                          type="text"
                          value={customClientName}
                          onChange={(e) => setCustomClientName(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">
                          {lang === 'sw' ? 'Simu ya Mteja (WhatsApp):' : 'Client Phone:'}
                        </label>
                        <input
                          type="text"
                          value={customClientPhone}
                          onChange={(e) => setCustomClientPhone(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-stone-600 mb-1">
                          {lang === 'sw' ? 'Bidhaa / Kifurushi:' : 'Product / Regimen:'}
                        </label>
                        <input
                          type="text"
                          value={customClientProduct}
                          onChange={(e) => setCustomClientProduct(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-300 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Sequence Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 3 Detox Check
                            </span>
                          </div>
                          <h5 className="font-bold text-emerald-950 text-xs">
                            {lang === 'sw' ? 'Ufuatiliaji wa Maji & Utumbo' : 'Hydration & Motility'}
                          </h5>
                          <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                            Hukumbusha mteja kunywa maji ya kutosha na kuuliza maendeleo ya kutoa sumu.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day3_detox')}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma WhatsApp</span>
                        </button>
                      </div>

                      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 7 Milestone
                            </span>
                          </div>
                          <h5 className="font-bold text-blue-950 text-xs">
                            {lang === 'sw' ? 'Mrejesho wa Vidonda / Uzito' : 'Ulcer Relief & Weight'}
                          </h5>
                          <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                            Hufuatilia kama maumivu ya tumbo, kiungulia, au gesi vimepungua baada ya wiki moja.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day7_ulcer')}
                          className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma WhatsApp</span>
                        </button>
                      </div>

                      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 14 Refill Alert
                            </span>
                          </div>
                          <h5 className="font-bold text-amber-950 text-xs">
                            {lang === 'sw' ? 'Muda wa Refill ya Pili' : 'Restock / Refill Prompt'}
                          </h5>
                          <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                            Huandaa mteja kuagiza pakiti inayofuata kabla ya stoo kuisha ili asikatishe dozi.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day14_refill')}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma WhatsApp</span>
                        </button>
                      </div>

                      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 30 Review
                            </span>
                          </div>
                          <h5 className="font-bold text-purple-950 text-xs">
                            {lang === 'sw' ? 'Ushuhuda & Uanachama' : 'Testimonial & Partner'}
                          </h5>
                          <p className="text-[11px] text-purple-800 mt-1 leading-relaxed">
                            Hupongeza mteja, huomba ushuhuda, na kutoa punguzo la mteja mwaminifu.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day30_review')}
                          className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── MODULE 2: LIVE ASSISTANT NLP SIMULATOR ── */}
                  <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-900">
                        <Bot className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {lang === 'sw' ? 'Jaribu Majibu ya ED-Assistant (Live Simulator)' : 'ED-Assistant NLP Live Simulator'}
                        </h4>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={simQuery}
                        onChange={(e) => setSimQuery(e.target.value)}
                        placeholder="Andika swali la mteja (mfano: nina vidonda, bei ya shake off, nataka kupunguza uzito)..."
                        className="flex-1 p-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={handleRunSimulator}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{lang === 'sw' ? 'Jaribu' : 'Test'}</span>
                      </button>
                    </div>

                    {/* Pre-set prompt chips */}
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {[
                        'Nina vidonda vya tumbo nitumie nini?',
                        'Nataka kupunguza kitambi na uzito',
                        'Bei ya Hawaiian Spirulina ni ngapi?',
                        'Dozi ya Shake Off Phyto Fiber',
                        'Splina inafaa kwa mtoto mchanga?',
                        'Kahawa ipi inafaa kwa nguvu za kiume?',
                      ].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => {
                            setSimQuery(chip);
                            const res = parseCustomerOrDistributorIntent(chip, false, lang);
                            setSimResult(res);
                          }}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Simulator Result Preview */}
                    {simResult && (
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{lang === 'sw' ? 'Majibu Yaliyotolewa kwa Mteja:' : 'Simulated Response to Customer:'}</span>
                        </div>

                        <div className="p-4 bg-white rounded-xl border border-stone-200 text-xs leading-relaxed whitespace-pre-wrap text-stone-800 font-medium">
                          {simResult.text}
                        </div>

                        {simResult.options && simResult.options.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-stone-500 uppercase">
                              Vitufe Vya Moja kwa Moja (Buttons Shown to Customer):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {simResult.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-[11px] font-bold"
                                >
                                  {opt.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* ── STANDALONE SOLID LOG OFFLINE SALE MODAL ── */}
      <LogOfflineSaleModal
        isOpen={showSaleModal}
        onClose={() => setShowSaleModal(false)}
      />
    </motion.div>
  );
};
