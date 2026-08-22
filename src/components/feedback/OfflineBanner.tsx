import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LangContext';

export function OfflineBanner() {
  const { lang } = useLang();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOffline(false);
    } else {
      window.location.reload();
    }
  };

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.aside
          id="offline-banner"
          aria-label="Offline status banner"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="bg-amber-600 text-white px-4 py-2 text-xs font-medium sticky top-0 z-50 shadow-md flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse" />
            <span className="truncate">
              {lang === 'sw'
                ? 'Uko nje ya mtandao. Unaweza kutazama bidhaa zilizohifadhiwa.'
                : 'You are offline. Browsing cached products.'}
            </span>
          </div>
          <button
            id="offline-retry-btn"
            onClick={handleRetry}
            className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-md text-[11px] font-semibold transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            {lang === 'sw' ? 'Jaribu Tena' : 'Retry'}
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
