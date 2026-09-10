import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Phone,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { parseCustomerOrDistributorIntent, ChatMessage } from '../../utils/chatbotEngine';
import { Product, BUNDLES } from '../../types';
import { WHATSAPP_LINK } from '../../utils/whatsappCompiler';

interface SmartAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToScreen: (screen: string) => void;
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
  const getEffectiveProduct = useDistributorStore((s) => s.getEffectiveProduct);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome greeting for customer
  useEffect(() => {
    if (messages.length === 0) {
      const initGreeting = parseCustomerOrDistributorIntent('hello', false, lang);
      setMessages([initGreeting]);
    }
  }, [lang]);

  // Escape closes the assistant.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // While the assistant is open the page behind it must not scroll.
  // Locking the body keeps the storefront still; the conversation area
  // scrolls independently (flex-1 + min-h-0 + overscroll-contain).
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string, userDisplayLabel?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const displayText = userDisplayLabel || query;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: displayText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    // 1. First check local knowledge base for high-confidence exact matches
    const localMatch = parseCustomerOrDistributorIntent(query, false, lang);
    const isDefaultFallback = localMatch.text.startsWith('Habari! Karibu sana ED Retail') ||
      localMatch.text.startsWith('Hello and welcome to ED Retail');

    // If it's not a generic fallback and user picked a known button or exact keyword, return immediately
    if (!isDefaultFallback && textToSend) {
      setTimeout(() => {
        setMessages((prev) => [...prev, localMatch]);
        setIsTyping(false);
      }, 300);
      return;
    }

    // 2. For freeform customer queries or complex multi-symptom inquiries, consult Gemini AI backend
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, lang }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const aiMsg: ChatMessage = {
            id: 'bot-' + Date.now(),
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: data.reply,
            options: [
              {
                label: lang === 'sw' ? 'Wasiliana na Kocha WhatsApp' : 'Chat with Coach on WhatsApp',
                action: 'open_whatsapp_consult',
              },
              {
                label: lang === 'sw' ? 'Tazama Bidhaa Zote' : 'Browse All Products',
                action: 'nav_products',
              },
            ],
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsTyping(false);
          return;
        }
      }
    } catch {
      // Graceful fallback on network glitch
    }

    // Fallback to local rule engine
    setTimeout(() => {
      setMessages((prev) => [...prev, localMatch]);
      setIsTyping(false);
    }, 200);
  };

  const handleOptionClick = (option: { label: string; action: string; payload?: unknown }) => {
    // 1. Navigation to products catalog
    if (option.action === 'nav_products') {
      onClose();
      onNavigateToScreen('products');
      return;
    }

    if (option.action === 'open_url' && typeof option.payload === 'string') {
      window.open(option.payload, '_blank');
      return;
    }

    if (option.action === 'open_flyer_studio' && onOpenFlyerStudio) {
      onClose();
      onOpenFlyerStudio();
      return;
    }

    // 2. WhatsApp Coach Consultation
    if (option.action === 'open_whatsapp_consult') {
      const waUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(
        `Habari ${distributor.name}, ninaomba ushauri wa bidhaa za afya za Edmark:`
      )}`;
      window.open(waUrl, '_blank');
      return;
    }

    // 3. Add single product to cart
    if (option.action === 'add_to_cart' && option.payload) {
      const p = option.payload as Product;
      const liveProduct = getEffectiveProduct(p.id) || p;
      addItem({ ...liveProduct, quantity: 1 });

      const confirmationMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text:
          lang === 'sw'
            ? `${t(liveProduct.name)} imewekwa kwenye mkoba wako wa ununuzi.\n\nUngependa kuendelea kukamilisha oda yako WhatsApp au kuangalia bidhaa nyingine?`
            : `${t(liveProduct.name)} has been added to your shopping cart.\n\nWould you like to complete your order on WhatsApp or browse more products?`,
        options: [
          { label: lang === 'sw' ? 'Angalia Mkoba & Agiza WhatsApp' : 'View Cart & Order on WhatsApp', action: 'checkout_now' },
          { label: lang === 'sw' ? 'Tazama Maelezo ya Bidhaa Hii' : 'View Product Details', action: 'inspect_product', payload: liveProduct },
          { label: lang === 'sw' ? 'Angalia Bidhaa Nyingine' : 'Explore More Solutions', action: 'Kupunguza Kitambi & Uzito' },
        ],
      };
      setMessages((prev) => [...prev, confirmationMsg]);
      return;
    }

    // 4. Add P4 Slimming Bundle to cart
    if (option.action === 'add_p4_bundle') {
      const p4Bundle = BUNDLES.find((b) => b.id === 'p4-complete');
      if (p4Bundle) {
        p4Bundle.productIds.forEach((pId) => {
          const p = getEffectiveProduct(pId);
          if (p) addItem({ ...p, quantity: 1 });
        });

        const confirmationMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text:
            lang === 'sw'
              ? `Pakiti Kamili ya P4 Slimming (Shake Off + MRT) imewekwa kwenye mkoba wako na punguzo la 10%!\n\nJe, uko tayari kukamilisha agizo lako moja kwa moja WhatsApp?`
              : `Complete P4 Slimming Bundle (Shake Off + MRT) added to cart with 10% bundle discount!\n\nReady to complete your WhatsApp order?`,
          options: [
            { label: lang === 'sw' ? 'Agiza Moja kwa Moja WhatsApp' : 'Order on WhatsApp Now', action: 'checkout_now' },
            { label: lang === 'sw' ? 'Ratiba ya Dozi ya P4' : 'P4 Dosage Schedule', action: 'show_p4_schedule' },
          ],
        };
        setMessages((prev) => [...prev, confirmationMsg]);
      }
      return;
    }

    // 5. Direct checkout
    if (option.action === 'checkout_now') {
      onClose();
      useCartStore.getState().setCheckoutOpen(true);
      return;
    }

    // 6. Inspect product modal
    if (option.action === 'inspect_product' && option.payload) {
      const prod = option.payload as Product;
      const liveProd = getEffectiveProduct(prod.id) || prod;
      onClose();
      onSelectProduct(liveProd);
      return;
    }

    // Default conversational routing
    handleSendMessage(option.action, option.label);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.98 }}
        className="w-full h-[min(70dvh,620px)] max-h-[calc(100dvh-72px)] sm:w-[460px] sm:max-w-[480px] sm:h-[min(580px,calc(100dvh-96px))] sm:max-h-[620px] bg-stone-50 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-stone-200"
      >
        {/* ── HEADER — EdRetail navy, not a generic wellness green ── */}
        <div className="px-4 py-3 sm:py-3.5 bg-primary-600 text-white flex items-center justify-between border-b border-primary-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xs shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight whitespace-nowrap">
                  ED-Assistant
                </h3>
                <span className="px-2 py-0.5 bg-white/15 border border-white/25 text-white text-[10px] font-black rounded-md uppercase whitespace-nowrap">
                  {lang === 'sw' ? 'Ushauri wa Afya' : 'Health Concierge'}
                </span>
              </div>
              <p className="text-[11px] text-primary-100 font-normal truncate">
                {lang === 'sw'
                  ? `Mshauri wa Afya • Bidhaa Asilia za Edmark & Mwongozo wa Dozi`
                  : `Wellness Consultant • 100% Genuine Edmark Guidance`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${WHATSAPP_LINK}?text=${encodeURIComponent(
                lang === 'sw'
                  ? 'Habari, ninaomba ushauri wa bidhaa za Edmark na ratiba ya matumizi:'
                  : 'Hello, I would like Edmark product guidance and a usage schedule:'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-success-600 hover:bg-success-700 text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={lang === 'sw' ? 'Ongea na Mtaalamu WhatsApp' : 'WhatsApp Consultation'}
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── QUICK HEALTH TOPIC PILLS ── */}
        <div className="px-3.5 py-2 bg-stone-100/90 border-b border-stone-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-hide text-[11px]">
          <span className="font-bold text-stone-500 whitespace-nowrap px-1 shrink-0">
            {lang === 'sw' ? 'Mada Maarufu:' : 'Popular Topics:'}
          </span>

          {[
            { label: lang === 'sw' ? 'Kupunguza Kitambi' : 'Weight Loss', query: 'Kupunguza Kitambi & Uzito' },
            { label: lang === 'sw' ? 'Vidonda vya Tumbo' : 'Ulcers Relief', query: 'Vidonda vya Tumbo' },
            { label: lang === 'sw' ? 'Kusafisha Utumbo' : 'Detox / Shake Off', query: 'Kusafisha Utumbo & Gesi' },
            { label: lang === 'sw' ? 'Nguvu & Stamina' : 'Energy / Stamina', query: 'Kuongeza Nguvu & Stamina' },
            { label: lang === 'sw' ? 'Mwongozo wa Dozi' : 'Dosage Schedules', query: 'Mwongozo wa Dozi' },
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(pill.query, pill.label)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-primary-50 hover:text-primary-800 text-stone-700 font-bold border border-stone-200/80 whitespace-nowrap transition-colors shadow-2xs"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* ── CHAT MESSAGES BODY ── */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4 bg-stone-50">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-primary-600 text-white rounded-br-xs shadow-xs font-medium'
                      : 'bg-white text-stone-900 rounded-bl-xs shadow-xs border border-stone-200/90 font-normal'
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
                          opt.action.includes('whatsapp')
                            ? 'bg-success-50 text-success-600 border-success-100 hover:bg-success-100'
                            : opt.action === 'checkout_now'
                              ? 'bg-primary-600 text-white border-primary-700 hover:bg-primary-700'
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
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── INPUT FOOTER ── */}
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={
              lang === 'sw'
                ? 'Uliza kuhusu kupunguza kitambi, vidonda vya tumbo, nguvu, bei...'
                : 'Ask about weight loss, ulcers, detox, stamina, prices, dosage...'
            }
            className="flex-1 bg-stone-100 border border-stone-200 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 transition-all"
          />

          <button
            id="chat-send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim()}
            className="p-2.5 sm:p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:hover:bg-primary-600 text-white rounded-2xl transition-transform active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
