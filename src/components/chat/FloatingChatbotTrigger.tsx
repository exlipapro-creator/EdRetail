import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';

interface FloatingChatbotTriggerProps {
  onOpenChat: () => void;
}

export function FloatingChatbotTrigger({ onOpenChat }: FloatingChatbotTriggerProps) {
  const { lang } = useLang();
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const analysis = useDistributorStore((s) => s.getMaintenanceAnalysis());

  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Proactive trigger popup after 4 seconds
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
      {/* ── PROACTIVE BRAND POPUP BUBBLE ── */}
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
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-1.5 text-stone-900 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-extrabold text-xs">ED-Assistant</span>
              <span className="px-1.5 py-0.2 bg-stone-100 text-stone-600 text-[10px] rounded">
                {isAdminAuthenticated ? 'Admin OS' : 'Health Concierge'}
              </span>
            </div>

            <p className="text-stone-600 leading-snug text-[11px]">
              {isAdminAuthenticated
                ? (lang === 'sw'
                  ? `Mwezi huu una ${analysis.totalSv}/2,000 SV (${analysis.gapSv} SV zimebaki). Gusa kufungua dashibodi.`
                  : `Month SV: ${analysis.totalSv}/2,000 SV (${analysis.gapSv} SV gap). Tap to view pacing.`)
                : (lang === 'sw'
                  ? 'Habari! Karibu ED Retail. Je, unatafuta kupunguza kitambi, kutibu vidonda vya tumbo, au kuongeza nguvu?'
                  : 'Welcome to ED Retail. Looking for weight loss, ulcer care, or natural energy guidance?')}
            </p>

            <button
              onClick={() => {
                setShowBubble(false);
                onOpenChat();
              }}
              className="w-full py-1.5 bg-[#0C271E] hover:bg-[#164132] text-white font-bold rounded-xl text-center block transition-colors text-xs shadow-2xs"
            >
              {isAdminAuthenticated ? 'Fungua ED-Assistant' : (lang === 'sw' ? 'Ongea na Msaidizi' : 'Ask Assistant')}
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
        className={`p-3 sm:px-4 sm:py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-extrabold text-xs transition-all border ${
          isAdminAuthenticated
            ? 'bg-[#0C271E] hover:bg-[#164132] text-white border-[#235844]'
            : 'bg-[#0C271E] hover:bg-[#164132] text-white border-[#235844]'
        }`}
      >
        <div className="relative">
          <MessageCircle className="w-5 h-5 text-[#E5C378]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight">
          <span className="text-white font-black text-xs">ED-Assistant</span>
          <span className="text-[10px] text-[#E5C378] font-semibold">
            {isAdminAuthenticated ? 'Distributor OS' : 'Health Concierge'}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
