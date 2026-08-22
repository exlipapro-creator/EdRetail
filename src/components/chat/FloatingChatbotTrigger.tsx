import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useLang } from '../../context/LangContext';

interface FloatingChatbotTriggerProps {
  onOpenChat: () => void;
}

export function FloatingChatbotTrigger({ onOpenChat }: FloatingChatbotTriggerProps) {
  const { lang } = useLang();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Proactive trigger popup after 4.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bubbleDismissed) {
        setShowBubble(true);
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [bubbleDismissed]);

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-4 sm:left-6 z-40 flex items-end gap-3">
      {/* ── PROACTIVE CUSTOMER WELLNESS BUBBLE ── */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            className="bg-white rounded-2xl p-3.5 shadow-xl border border-stone-200 max-w-xs text-xs space-y-2 relative"
          >
            <button
              onClick={() => {
                setShowBubble(false);
                setBubbleDismissed(true);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center text-[10px]"
              aria-label="Dismiss message"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-1.5 text-stone-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-extrabold text-xs">ED-Assistant</span>
              <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] rounded font-semibold">
                {lang === 'sw' ? 'Mshauri wa Afya' : 'Health Concierge'}
              </span>
            </div>

            <p className="text-stone-600 leading-snug text-[11px]">
              {lang === 'sw'
                ? 'Habari! Je, unatafuta kupunguza kitambi, kutibu vidonda vya tumbo, au kuongeza nguvu na kinga?'
                : 'Welcome to ED Retail. Looking for natural weight loss, ulcer relief, or energy boost guidance?'}
            </p>

            <button
              onClick={() => {
                setShowBubble(false);
                onOpenChat();
              }}
              className="w-full py-1.5 bg-[#0C271E] hover:bg-[#164132] text-white font-bold rounded-xl text-center block transition-colors text-xs shadow-2xs cursor-pointer"
            >
              {lang === 'sw' ? 'Ongea na Msaidizi wa Afya' : 'Ask Wellness Assistant'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FLOATING BUTTON TRIGGER ── */}
      <motion.button
        id="floating-chatbot-launcher-btn"
        onClick={onOpenChat}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-extrabold text-xs transition-all border bg-[#0C271E] hover:bg-[#164132] text-white border-[#235844] cursor-pointer"
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-[#E5C378]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-white font-black text-xs">ED-Assistant</span>
          <span className="text-[10px] text-[#E5C378] font-semibold">
            {lang === 'sw' ? 'Ushauri wa Afya' : 'Health Concierge'}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
