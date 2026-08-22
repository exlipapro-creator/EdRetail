import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Lock,
  Unlock,
  Award,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';
import { Product, PRODUCTS, BUNDLES } from '../../types';
import { WHATSAPP_LINK, DISTRIBUTOR_NAME, DISTRIBUTOR_PHONE } from '../../utils/whatsappCompiler';
import { MaintenanceTrackerPanel } from './MaintenanceTrackerPanel';
import { FieldLedgerPanel } from './FieldLedgerPanel';
import { AdminDashboardPanel } from './AdminDashboardPanel';

interface SmartAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen: (screen: any) => void;
  onSelectProduct: (product: Product) => void;
  onOpenFlyerStudio?: () => void;
}

export function SmartAssistantModal({
  isOpen,
  onClose,
  onNavigateToScreen,
  onSelectProduct,
  onOpenFlyerStudio,
}: SmartAssistantModalProps) {
  const { lang, t } = useLang();
  const addItem = useCartStore((s) => s.addItem);
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const addSale = useDistributorStore((s) => s.addSale);

  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard' | 'maintenance' | 'ledger'>('chat');
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Sub-forms for Admin quick actions
  const [saleFormOpen, setSaleFormOpen] = useState(false);
  const [saleCustomerName, setSaleCustomerName] = useState('');
  const [salePhone, setSalePhone] = useState('');
  const [saleProduct, setSaleProduct] = useState('shake-off-phyto');
  const [saleAmountPaid, setSaleAmountPaid] = useState('');
  const [saleType, setSaleType] = useState<'cash' | 'credit' | 'mobile_money'>('cash');
  const [saleDueDate, setSaleDueDate] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const initGreeting = parseCustomerOrDistributorIntent('hello', isAdminAuthenticated, lang);
      setMessages([initGreeting]);
    }
  }, [isAdminAuthenticated, lang]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, isOpen, activeTab]);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);
    setActiveTab('chat');

    setTimeout(() => {
      const response = parseCustomerOrDistributorIntent(query, isAdminAuthenticated, lang);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 380);
  };

  const handleOptionClick = (option: { label: string; action: string; payload?: any }) => {
    // 1. Navigation
    if (option.action === 'nav_products') {
      onClose();
      onNavigateToScreen('products');
      return;
    }
    if (option.action === 'open_url' && option.payload) {
      window.open(option.payload, '_blank');
      return;
    }
    if (option.action === 'open_flyer_studio' && onOpenFlyerStudio) {
      onClose();
      onOpenFlyerStudio();
      return;
    }
    if (option.action === 'open_whatsapp_consult') {
      window.open(`${WHATSAPP_LINK}?text=${encodeURIComponent('Habari Mwanahamisi, ninaomba ushauri kuhusu bidhaa za Edmark:')}`, '_blank');
      return;
    }

    // 2. Direct tabs
    if (option.action === 'cmd_admin_dashboard' || option.action === 'cmd_manage_catalog') {
      setActiveTab('dashboard');
      return;
    }
    if (option.action === 'cmd_maintenance_tracker') {
      setActiveTab('maintenance');
      return;
    }
    if (option.action === 'cmd_view_debts') {
      setActiveTab('ledger');
      return;
    }

    // 3. Add product to cart
    if (option.action === 'add_to_cart' && option.payload) {
      const product = option.payload as Product;
      addItem({ ...product, quantity: 1 });
      const confirmationMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text:
          lang === 'sw'
            ? `✅ *${t(product.name)}* imewekwa kwenye mkoba wako wa ununuzi!\n\nUngependa kuendelea kuagiza au kuangalia bidhaa nyingine?`
            : `✅ *${t(product.name)}* has been added to your cart!\n\nWould you like to proceed with checkout or add another item?`,
        options: [
          { label: lang === 'sw' ? '🛍️ Angalia Mkoba & Agiza WhatsApp' : '🛍️ View Cart & Checkout', action: 'checkout_now' },
          { label: lang === 'sw' ? '🔎 Tazama Maelezo Kamili ya Bidhaa' : '🔎 View Product Details', action: 'inspect_product', payload: product },
          { label: lang === 'sw' ? '➕ Ongeza Bidhaa Nyingine' : '➕ Explore More Products', action: 'goal_weight_loss' },
        ],
      };
      setMessages((prev) => [...prev, confirmationMsg]);
      return;
    }

    // 4. Add P4 bundle
    if (option.action === 'add_p4_bundle') {
      const p4Bundle = BUNDLES.find((b) => b.id === 'p4-complete');
      if (p4Bundle) {
        p4Bundle.productIds.forEach((pId) => {
          const p = PRODUCTS.find((item) => item.id === pId);
          if (p) addItem({ ...p, quantity: 1 });
        });
        const confirmationMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text:
            lang === 'sw'
              ? `🎁 *Pakiti Kamili ya P4 Slimming* (Shake Off + MRT) imewekwa kwenye mkoba wako na punguzo la 10%!\n\nTayari kuagiza moja kwa moja WhatsApp?`
              : `🎁 *Complete P4 Slimming Bundle* (Shake Off + MRT) has been added to your cart with 10% discount!\n\nReady to place order on WhatsApp?`,
          options: [
            { label: lang === 'sw' ? '🚀 Agiza Moja kwa Moja WhatsApp' : '🚀 Order on WhatsApp Now', action: 'checkout_now' },
            { label: lang === 'sw' ? '📋 Ratiba ya Dozi ya P4' : '📋 P4 Dosage Schedule', action: 'show_p4_schedule' },
          ],
        };
        setMessages((prev) => [...prev, confirmationMsg]);
      }
      return;
    }

    // 5. Checkout Now
    if (option.action === 'checkout_now') {
      onClose();
      useCartStore.getState().setCheckoutOpen(true);
      return;
    }

    if (option.action === 'inspect_product' && option.payload) {
      onClose();
      onSelectProduct(option.payload);
      return;
    }

    // 6. Admin authentication
    if (option.action === 'admin') {
      if (!isAdminAuthenticated) {
        setShowPinDialog(true);
      } else {
        handleSendMessage('admin');
      }
      return;
    }

    if (option.action === 'cmd_exit_admin') {
      setAdminAuthenticated(false);
      handleSendMessage('hello');
      return;
    }

    if (option.action === 'cmd_prompt_sale') {
      setSaleFormOpen(true);
      return;
    }

    if (option.action === 'cmd_send_debt_reminder') {
      const debts = useDistributorStore.getState().sales.filter((s) => s.balanceDue > 0);
      if (debts.length > 0) {
        const d = debts[0];
        const reminderText =
          `Habari ${d.customerName}! Ni ${DISTRIBUTOR_NAME} kutoka ED Retail. Natumai unaendelea vizuri. ` +
          `Nikukumbushe salio lako la ${d.productName} TZS ${d.balanceDue.toLocaleString()}` +
          `${d.dueDate ? ` linalotarajiwa tarehe ${d.dueDate}` : ''}. Lipa kupitia M-Pesa ${DISTRIBUTOR_PHONE}. Asante sana!`;

        const waUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(reminderText)}`;
        window.open(waUrl, '_blank');
      } else {
        handleSendMessage('madeni');
      }
      return;
    }

    if (option.action === 'cmd_send_refill_reminder') {
      const refills = useDistributorStore.getState().sales.filter((s) => s.refillStatus === 'pending');
      if (refills.length > 0) {
        const r = refills[0];
        const refillMsg =
          `Habari ${r.customerName}! Ni ${DISTRIBUTOR_NAME} kutoka ED Retail. ` +
          `Natumai unaendelea kupata matokeo mazuri na ${r.productName}. Je, box lako linaelekea kumalizika? ` +
          `Niambie nikuandalie mzigo mpya ili usipoteze mwendelezo wa dozi yako.`;

        const waUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(refillMsg)}`;
        window.open(waUrl, '_blank');
      }
      return;
    }

    // Default: pass as text prompt
    handleSendMessage(option.action);
  };

  const handleVerifyPin = () => {
    const success = useDistributorStore.getState().verifyPin(pinInput);
    if (success) {
      setShowPinDialog(false);
      setPinInput('');
      setPinError(false);
      handleSendMessage('admin');
    } else {
      setPinError(true);
    }
  };

  const handleSaveOfflineSale = (e: React.FormEvent) => {
    e.preventDefault();
    const prodObj = PRODUCTS.find((p) => p.id === saleProduct) || PRODUCTS[0];
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

    setSaleFormOpen(false);
    setSaleCustomerName('');
    setSalePhone('');
    setSaleAmountPaid('');
    setSaleDueDate('');

    const receiptText =
      `🧾 *RISITI YA MAUZO - ED RETAIL*\n` +
      `Mteja: ${saleCustomerName}\n` +
      `Bidhaa: ${prodObj.name.sw}\n` +
      `Jumla: TZS ${totalAmount.toLocaleString()}\n` +
      `Kiasi Kilicholipwa: TZS ${paid.toLocaleString()}\n` +
      `${balance > 0 ? `Salio Lililobaki: TZS ${balance.toLocaleString()}\nTarehe ya Malipo: ${saleDueDate}\n` : 'Hali: IMELIPWA YOTE ✅\n'}` +
      `Msambazaji: ${DISTRIBUTOR_NAME} (${DISTRIBUTOR_PHONE})`;

    const shareUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(receiptText)}`;

    const botResponse: ChatMessage = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text:
        lang === 'sw'
          ? `✅ *Mauzo Yamerekodiwa Kwenye Daftari!*\n\n${receiptText}\n\nUngependa kumtumia mteja risiti hii WhatsApp?`
          : `✅ *Offline Sale Successfully Logged!*\n\n${receiptText}`,
      options: [
        { label: lang === 'sw' ? '📲 Tuma Risiti kwa Mteja WhatsApp' : '📲 Send Receipt on WhatsApp', action: 'open_url', payload: shareUrl },
        { label: lang === 'sw' ? '📊 Angalia Ripoti ya Fedha' : '📊 View Financial Report', action: 'cmd_report_today' },
        { label: lang === 'sw' ? '➕ Rekodi Mauzo Mengine' : '➕ Log Another Sale', action: 'cmd_prompt_sale' },
      ],
    };

    setMessages((prev) => [...prev, botResponse]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.96 }}
        className="w-full sm:max-w-2xl h-[92vh] sm:h-[720px] bg-stone-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
      >
        {/* ── ED RETAIL BRANDED HEADER ── */}
        <div className="px-4 py-3.5 bg-[#0C271E] text-stone-100 flex items-center justify-between border-b border-[#1A3D31]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#164132] border border-[#235844] flex items-center justify-center text-emerald-300 shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                  ED-Assistant
                </h3>
                <span className="px-2 py-0.5 bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] text-[10px] font-extrabold rounded-md uppercase">
                  {isAdminAuthenticated ? 'Distributor OS' : 'Health Concierge'}
                </span>
              </div>
              <p className="text-[11px] text-stone-300 font-normal">
                {isAdminAuthenticated
                  ? `Mwanahamisi Lissu • Live Edmark Sync & Fund Pacing`
                  : `ED Retail • Authentic Edmark Guidance & Instant Ordering`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setAdminAuthenticated(false);
                  handleSendMessage('hello');
                } else {
                  setShowPinDialog(true);
                }
              }}
              title={isAdminAuthenticated ? 'Toka Mode ya Msambazaji' : 'Ingia Mode ya Msambazaji (PIN)'}
              className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isAdminAuthenticated
                  ? 'bg-amber-400 text-stone-950 hover:bg-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-stone-200'
              }`}
            >
              {isAdminAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── AUTHENTIC SEGMENTED TABS ── */}
        <div className="px-4 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between gap-1 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Mazungumzo' : 'Chat'}</span>
            </button>

            {isAdminAuthenticated && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'sw' ? 'Dashibodi Kuu' : 'Dashboard'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'maintenance'
                      ? 'bg-white text-emerald-900 shadow-xs border border-emerald-300'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lang === 'sw' ? '3-Month Funds' : 'Maintenance'}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ledger')}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'ledger'
                      ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{lang === 'sw' ? 'Daftari & Madeni' : 'Ledger'}</span>
                </button>
              </>
            )}
          </div>

          {isAdminAuthenticated && activeTab === 'chat' && (
            <button
              onClick={() => handleSendMessage('maintenance')}
              className="px-2.5 py-1 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-extrabold text-[11px] rounded-lg whitespace-nowrap transition-colors"
            >
              🏆 2,000 SV Challenge
            </button>
          )}
        </div>

        {/* ── TAB CONTENT ── */}
        {activeTab === 'dashboard' && (
          <AdminDashboardPanel
            onOpenSaleForm={() => setSaleFormOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            lang={lang}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceTrackerPanel
            onSendChatMessage={(text) => handleSendMessage(text)}
            lang={lang}
          />
        )}

        {activeTab === 'ledger' && (
          <FieldLedgerPanel
            onOpenSaleForm={() => setSaleFormOpen(true)}
            lang={lang}
          />
        )}

        {activeTab === 'chat' && (
          <>
            {/* ── MESSAGES CONTAINER ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/80">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'bg-[#0E2E23] text-stone-100 rounded-br-xs shadow-xs font-medium'
                          : 'bg-white text-stone-800 rounded-bl-xs shadow-xs border border-stone-200/90 font-normal'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Interactive Action Chips */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[95%]">
                        {msg.options.map((opt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleOptionClick(opt)}
                            className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all text-left flex items-center gap-1.5 shadow-2xs ${
                              opt.action === 'checkout_now' || opt.action.includes('whatsapp') || opt.action === 'cmd_maintenance_tracker'
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                                : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100 hover:text-stone-950'
                            }`}
                          >
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-stone-400 mt-1 px-1">{msg.timestamp}</span>
                  </motion.div>
                );
              })}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 bg-white p-3 rounded-2xl rounded-bl-xs border border-stone-200 shadow-xs w-20"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-emerald-700 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-emerald-800 animate-bounce [animation-delay:0.4s]" />
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── ADMIN QUICK ACTIONS BAR ── */}
            {isAdminAuthenticated && (
              <div className="px-3 py-2 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-xs">
                <span className="font-bold text-stone-700 text-[10px] uppercase whitespace-nowrap">
                  {lang === 'sw' ? 'Amri za Haraka:' : 'Admin Commands:'}
                </span>
                <button
                  onClick={() => handleSendMessage('maintenance')}
                  className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg whitespace-nowrap shadow-2xs flex items-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  <span>3-Month Challenge</span>
                </button>
                <button
                  onClick={() => handleSendMessage('ripoti')}
                  className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold rounded-lg whitespace-nowrap shadow-2xs"
                >
                  📊 Ripoti ya Leo
                </button>
                <button
                  onClick={() => setSaleFormOpen(true)}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg whitespace-nowrap shadow-2xs"
                >
                  📒 Rekodi Mauzo
                </button>
                <button
                  onClick={() => handleSendMessage('ushauri')}
                  className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold rounded-lg whitespace-nowrap shadow-2xs"
                >
                  💡 Ushauri wa Faida
                </button>
                <button
                  onClick={() => handleSendMessage('madeni')}
                  className="px-2.5 py-1 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold rounded-lg whitespace-nowrap shadow-2xs"
                >
                  📝 Madeni
                </button>
              </div>
            )}

            {/* ── INPUT FOOTER ── */}
            <div className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={
                  isAdminAuthenticated
                    ? (lang === 'sw' ? 'Andika: "maintenance", "weka shake off 40000", "ripoti"...' : 'Command: "maintenance", "set splina price 30000"...')
                    : (lang === 'sw' ? 'Uliza kuhusu kupunguza kitambi, vidonda vya tumbo, dozi...' : 'Ask about weight loss, ulcers, dosage, delivery...')
                }
                className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all"
              />

              <button
                id="chat-send-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputVal.trim()}
                className="p-2.5 sm:p-3 bg-[#0C271E] hover:bg-[#164132] disabled:opacity-40 disabled:hover:bg-[#0C271E] text-white rounded-2xl transition-transform active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* ── ADMIN PIN MODAL ── */}
      <AnimatePresence>
        {showPinDialog && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-bold text-base text-stone-900">
                  {lang === 'sw' ? 'Kuingia Chumba cha Msambazaji' : 'Distributor Admin Login'}
                </h3>
                <p className="text-xs text-stone-500">
                  {lang === 'sw' ? 'Weka PIN yako (Mfano: 255 au 1234)' : 'Enter your distributor PIN (e.g. 255 or 1234)'}
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
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:outline-none bg-stone-50"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-600 text-center font-semibold">
                    {lang === 'sw' ? 'PIN siyo sahihi. Jaribu 255' : 'Incorrect PIN. Try 255'}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPinDialog(false);
                    setPinInput('');
                    setPinError(false);
                  }}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs"
                >
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  onClick={handleVerifyPin}
                  className="flex-1 py-2.5 bg-[#0C271E] hover:bg-[#164132] text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  {lang === 'sw' ? 'Fungua' : 'Unlock'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── OFFLINE SALE QUICK LOGGER MODAL ── */}
      <AnimatePresence>
        {saleFormOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    {lang === 'sw' ? 'Rekodi Mauzo ya Mkononi (Field Sale)' : 'Log Offline / Credit Sale'}
                  </h3>
                </div>
                <button onClick={() => setSaleFormOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOfflineSale} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'sw' ? 'Jina la Mteja' : 'Customer Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={saleCustomerName}
                    onChange={(e) => setSaleCustomerName(e.target.value)}
                    placeholder="e.g. Mama Kelvin, Asha Kariakoo..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'sw' ? 'Namba ya Simu ya Mteja (WhatsApp)' : 'Customer Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={salePhone}
                    onChange={(e) => setSalePhone(e.target.value)}
                    placeholder="0783..."
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'sw' ? 'Bidhaa Iliyouzwa' : 'Product Sold'} *
                  </label>
                  <select
                    value={saleProduct}
                    onChange={(e) => setSaleProduct(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl bg-stone-50 font-semibold"
                  >
                    {PRODUCTS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {t(p.name)} - TZS {p.price.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    {lang === 'sw' ? 'Aina ya Malipo' : 'Payment Type'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: '💵 Cash' },
                      { id: 'mobile_money', label: '📱 M-Pesa' },
                      { id: 'credit', label: '📝 Mkopo' },
                    ].map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => setSaleType(type.id as any)}
                        className={`py-2 text-center rounded-xl font-bold border transition-all ${
                          saleType === type.id
                            ? 'bg-[#0C271E] text-white border-[#0C271E]'
                            : 'bg-stone-50 text-stone-700 border-stone-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {saleType === 'credit' && (
                  <div className="space-y-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                    <div>
                      <label className="block font-bold text-amber-900 mb-1">
                        {lang === 'sw' ? 'Kiasi Alichotanguliza (Advance Payment)' : 'Down Payment (TZS)'}
                      </label>
                      <input
                        type="number"
                        value={saleAmountPaid}
                        onChange={(e) => setSaleAmountPaid(e.target.value)}
                        placeholder="0"
                        className="w-full p-2 border border-amber-300 rounded-xl bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-900 mb-1">
                        {lang === 'sw' ? 'Tarehe ya Kulipa Salio Lililobaki' : 'Balance Due Date'}
                      </label>
                      <input
                        type="date"
                        value={saleDueDate}
                        onChange={(e) => setSaleDueDate(e.target.value)}
                        className="w-full p-2 border border-amber-300 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#0C271E] hover:bg-[#164132] text-white font-extrabold rounded-xl shadow-md transition-all text-xs"
                >
                  {lang === 'sw' ? 'Hifadhi Mauzo & Tengeneza Risiti' : 'Save Sale & Generate Receipt'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
