import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  TrendingUp,
  Award,
  BookOpen,
  Bot,
  Sparkles,
  Plus,
  Send,
  RefreshCw,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { MaintenanceTrackerPanel } from '../chat/MaintenanceTrackerPanel';
import { FieldLedgerPanel } from '../chat/FieldLedgerPanel';
import { AdminDashboardPanel } from '../chat/AdminDashboardPanel';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';
import { WHATSAPP_LINK, DISTRIBUTOR_PHONE, DISTRIBUTOR_NAME } from '../../utils/whatsappCompiler';

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
  const addSale = useDistributorStore((s) => s.addSale);
  const getLiveProducts = useDistributorStore((s) => s.getEffectiveProducts);

  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'ledger' | 'catalog' | 'automations'>('overview');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // Sale form states
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [saleProduct, setSaleProduct] = useState('shake-off-phyto');
  const [saleAmountPaid, setSaleAmountPaid] = useState('');
  const [saleType, setSaleType] = useState<'cash' | 'credit' | 'mobile_money'>('cash');
  const [saleDueDate, setSaleDueDate] = useState('');

  // Automation & Assistant Simulator States
  const [simQuery, setSimQuery] = useState('Nina vidonda vya tumbo nitumie nini?');
  const [simResult, setSimResult] = useState<ChatMessage | null>(null);
  const [customClientName, setCustomClientName] = useState('Mama Sarah');
  const [customClientPhone, setCustomClientPhone] = useState('0712345678');
  const [customClientProduct, setCustomClientProduct] = useState('Shake Off & MRT Complex');

  if (!isOpen) return null;

  const liveProducts = getLiveProducts();

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
        `Habari ${customClientName}! Ni ${DISTRIBUTOR_NAME} kutoka ED Retail. ` +
        `Uko kwenye Siku ya 3 ya dozi yako ya ${customClientProduct}. ` +
        `Je, unakunywa maji ya kutosha (lita 2–3 kwa siku)? Utumbo unavyojisafisha unahitaji maji mengi kurahisisha kutoa sumu. Nambie jinsi unavyojisikia leo!`;
    } else if (sequenceType === 'day7_ulcer') {
      msg =
        `Habari ${customClientName}! Ni ${DISTRIBUTOR_NAME}. ` +
        `Hongera kwa kukamilisha wiki ya kwanza ya mpango wako wa ${customClientProduct}. ` +
        `Je, maumivu ya tumbo, kiungulia, au gesi vimepungua? Splina na Spirulina zinaendelea kutibu kuta za utumbo. Tuma mrejesho wako!`;
    } else if (sequenceType === 'day14_refill') {
      msg =
        `Habari ${customClientName}! Ni ${DISTRIBUTOR_NAME}. ` +
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

  const handleSaveOfflineSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prodObj = liveProducts.find((p) => p.id === saleProduct) || liveProducts[0];
    const totalAmount = prodObj.price;
    const paid = saleType === 'cash' || saleType === 'mobile_money' ? totalAmount : parseInt(saleAmountPaid || '0', 10);
    const balance = Math.max(0, totalAmount - paid);
    const status = balance === 0 ? 'paid' : paid > 0 ? 'partial' : 'unpaid';

    addSale({
      customerName: saleCustomerName || 'Mteja wa Mkononi',
      customerPhone: salePhone,
      customerLocation: 'Dar es Salaam',
      productId: prodObj.id,
      productName: prodObj.name.sw,
      quantity: 1,
      unitPrice: prodObj.price,
      totalAmount,
      paymentType: saleType,
      amountPaid: paid,
      balanceDue: balance,
      dueDate: saleDueDate || undefined,
      status,
    });

    setShowSaleModal(false);
    setSaleCustomerName('');
    setSalePhone('');
    setSaleAmountPaid('');
    setSaleDueDate('');

    // Prompt receipt dispatch
    const receiptText =
      `🧾 *RISITI YA MAUZO - ED RETAIL*\n` +
      `Mteja: ${saleCustomerName}\n` +
      `Bidhaa: ${prodObj.name.sw}\n` +
      `Jumla: TZS ${totalAmount.toLocaleString()}\n` +
      `Kiasi Kilicholipwa: TZS ${paid.toLocaleString()}\n` +
      `${balance > 0 ? `Salio Lililobaki: TZS ${balance.toLocaleString()}\nTarehe ya Malipo: ${saleDueDate || 'Makubaliano'}\n` : 'Hali: IMELIPWA YOTE ✅\n'}` +
      `Msambazaji: ${DISTRIBUTOR_NAME} (${DISTRIBUTOR_PHONE})`;

    const cleanPhone = salePhone.replace(/\D/g, '').replace(/^0/, '255');
    const waUrl = salePhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptText)}`
      : `${WHATSAPP_LINK}?text=${encodeURIComponent(receiptText)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-950/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl h-[94vh] sm:h-[820px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
      >
        {/* ── LEADER PORTAL HEADER ── */}
        <div className="px-5 py-4 bg-[#0C271E] text-stone-100 flex items-center justify-between border-b border-[#1A3D31]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#164132] border border-[#235844] flex items-center justify-center text-[#E5C378] shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-white">
                  {lang === 'sw' ? 'Ofisi ya Msambazaji (Leader Back-Office)' : 'Distributor Leader Portal'}
                </h2>
                <span className="px-2 py-0.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] text-[10px] font-black rounded-md uppercase">
                  {isAdminAuthenticated ? 'Unlocked' : 'PIN Protected'}
                </span>
              </div>
              <p className="text-xs text-stone-300">
                {distributor.name} • {distributor.rank || 'Crown Manager'} • Live Fund Pacing & Automation Center
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── SECURITY PIN CHECK IF LOCKED ── */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-stone-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-lg border border-stone-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-stone-900">
                  {lang === 'sw' ? 'Fungua Ofisi ya Msambazaji' : 'Unlock Leader Back-Office'}
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  {lang === 'sw'
                    ? 'Weka PIN yako ya msambazaji kutazama 3-Month Fund, Daftari la Mauzo, na Katalogi.'
                    : 'Enter your distributor PIN to manage fund pacing, sales ledger, and automation.'}
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
                  placeholder="PIN..."
                  className="w-full text-center tracking-widest text-xl font-black py-3 border border-stone-300 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-stone-50"
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
                className="w-full py-3 bg-[#0C271E] hover:bg-[#164132] text-white font-extrabold rounded-xl shadow-xs transition-transform active:scale-98"
              >
                {lang === 'sw' ? 'Thibitisha & Ingia' : 'Unlock Back-Office'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── NAVIGATION TABS ── */}
            <div className="px-4 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-emerald-800" />
                  <span>{lang === 'sw' ? 'Muhtasari wa Fedha' : 'Financials & CRM'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                    activeTab === 'maintenance'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <Award className="w-4 h-4 text-emerald-800" />
                  <span>{lang === 'sw' ? '3-Month Funds (2,000 SV)' : '3-Month Maintenance'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                    activeTab === 'ledger'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-800" />
                  <span>{lang === 'sw' ? 'Daftari la Mauzo & Madeni' : 'Field Sales & Debts'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('automations')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                    activeTab === 'automations'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/60'
                  }`}
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>{lang === 'sw' ? 'Msaidizi & Automations' : 'Assistant & Automations'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowSaleModal(true)}
                  className="px-3 py-1.5 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}</span>
                </button>

                {onOpenFlyerStudio && (
                  <button
                    onClick={onOpenFlyerStudio}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Flyer Studio</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── TAB BODIES ── */}
            <div className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6">
              {activeTab === 'overview' && (
                <AdminDashboardPanel
                  onOpenSaleForm={() => setShowSaleModal(true)}
                  onNavigateToTab={(t) => setActiveTab(t === 'chat' ? 'automations' : t as any)}
                  lang={lang}
                />
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
                  <div className="p-5 sm:p-6 bg-gradient-to-br from-[#0C271E] to-[#164132] rounded-3xl text-white shadow-lg space-y-3">
                    <div className="flex items-center gap-2 text-[#E5C378]">
                      <Bot className="w-6 h-6" />
                      <h3 className="text-lg font-black">
                        {lang === 'sw' ? 'Kituo cha Automations na ED-Assistant' : 'ED-Assistant & WhatsApp Automation Center'}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-200 max-w-2xl leading-relaxed">
                      {lang === 'sw'
                        ? 'Hapa unadhibiti na kujaribu injini ya majibu ya msaidizi wa afya, ratiba za ufuatiliaji wa wateja WhatsApp (Day 3, 7, 14), na kurusha picha za masoko.'
                        : 'Manage and test the customer health concierge NLP engine, trigger 1-tap WhatsApp client follow-up sequences (Day 3, 7, 14), and launch marketing flyers.'}
                    </p>
                  </div>

                  {/* ── MODULE 1: AUTOMATED WHATSAPP SEQUENCES ── */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-900">
                        <Zap className="w-5 h-5 text-amber-500" />
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {lang === 'sw' ? 'Ratiba za Ufuatiliaji wa Wateja (1-Tap WhatsApp Follow-ups)' : 'Automated Client Follow-up Sequences'}
                        </h4>
                      </div>
                    </div>

                    {/* Personalization Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 3 Detox Check
                            </span>
                          </div>
                          <h5 className="font-bold text-emerald-950 text-xs">
                            {lang === 'sw' ? 'Ufuatiliaji wa Maji & Kusafisha Utumbo' : 'Hydration & Motility Follow-up'}
                          </h5>
                          <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                            Hukumbusha mteja kunywa maji ya kutosha na kuuliza maendeleo ya utumbo kutoa sumu.
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendFollowUpWhatsApp('day3_detox')}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Tuma kwa WhatsApp</span>
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
                            {lang === 'sw' ? 'Mrejesho wa Vidonda / Uzito' : 'Ulcer Relief & Weight Check'}
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
                          <span>Tuma kwa WhatsApp</span>
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
                            {lang === 'sw' ? 'Muda wa Kujaza Oda ya Pili (Refill)' : 'Restock / Refill Prompt'}
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
                          <span>Tuma kwa WhatsApp</span>
                        </button>
                      </div>

                      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="px-2 py-0.5 bg-purple-600 text-white rounded text-[10px] font-bold uppercase">
                              Day 30 Review & Loyalty
                            </span>
                          </div>
                          <h5 className="font-bold text-purple-950 text-xs">
                            {lang === 'sw' ? 'Ushuhuda & Ofa ya Uanachama' : 'Testimonial & Partner Invite'}
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
                          <span>Tuma kwa WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── MODULE 2: LIVE ASSISTANT NLP SIMULATOR ── */}
                  <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-stone-900">
                        <Bot className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {lang === 'sw' ? 'Jaribu Majibu ya ED-Assistant (Live Simulator)' : 'ED-Assistant NLP Live Simulator'}
                        </h4>
                      </div>
                      <span className="text-xs text-stone-400">
                        {lang === 'sw' ? 'Angalia jinsi chatbot inavyowajibu wateja' : 'Verify how the chatbot responds to buyers'}
                      </span>
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
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs"
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
                          className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
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

                        <div className="p-3.5 bg-white rounded-xl border border-stone-200 text-xs leading-relaxed whitespace-pre-wrap text-stone-800">
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
          </>
        )}

        {/* ── LOG OFFLINE SALE QUICK MODAL ── */}
        <AnimatePresence>
          {showSaleModal && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-stone-900">
                        {lang === 'sw' ? 'Rekodi Mauzo ya Mkononi' : 'Log Field Sale'}
                      </h3>
                      <p className="text-[10px] text-stone-500">
                        {lang === 'sw' ? 'Hurekodiwa kwenye stoo, ripoti, na alama za SV' : 'Saves to inventory, CRM, and calculates SV'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSaleModal(false)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveOfflineSale} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'sw' ? 'Jina la Mteja:' : 'Customer Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={saleCustomerName}
                      onChange={(e) => setSaleCustomerName(e.target.value)}
                      placeholder="Mfano: Baba Kelvin"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'sw' ? 'Namba ya Simu (WhatsApp):' : 'Phone Number:'}
                    </label>
                    <input
                      type="tel"
                      value={salePhone}
                      onChange={(e) => setSalePhone(e.target.value)}
                      placeholder="07XXXXXXXX"
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'sw' ? 'Bidhaa Iliyouzwa:' : 'Product Sold:'}
                    </label>
                    <select
                      value={saleProduct}
                      onChange={(e) => setSaleProduct(e.target.value)}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                    >
                      {liveProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name.sw} - TZS {p.price.toLocaleString()} ({Math.round(p.price / 3500)} SV)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">
                      {lang === 'sw' ? 'Njia ya Malipo:' : 'Payment Type:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cash', label: 'Cash' },
                        { id: 'mobile_money', label: 'M-Pesa' },
                        { id: 'credit', label: 'Deni' },
                      ].map((pt) => (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => setSaleType(pt.id as any)}
                          className={`py-2 rounded-xl font-bold border transition-all ${
                            saleType === pt.id
                              ? 'bg-[#0C271E] text-white border-[#0C271E]'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {pt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {saleType === 'credit' && (
                    <div className="grid grid-cols-2 gap-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">
                          {lang === 'sw' ? 'Kiasi Alichotoa:' : 'Deposit Paid:'}
                        </label>
                        <input
                          type="number"
                          value={saleAmountPaid}
                          onChange={(e) => setSaleAmountPaid(e.target.value)}
                          placeholder="0"
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-amber-900 mb-1">
                          {lang === 'sw' ? 'Tarehe ya Kumalizia:' : 'Due Date:'}
                        </label>
                        <input
                          type="date"
                          value={saleDueDate}
                          onChange={(e) => setSaleDueDate(e.target.value)}
                          className="w-full p-2 bg-white border border-amber-300 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSaleModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-100"
                    >
                      {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 font-bold text-white shadow-xs"
                    >
                      {lang === 'sw' ? 'Hifadhi & Tuma Risiti' : 'Save & Send Receipt'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
