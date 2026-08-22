import { useState, useEffect } from 'react';
import { Download, X, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../../context/LangContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallBanner() {
  const { lang } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    // Check if user dismissed prompt recently
    const dismissed = localStorage.getItem('edmark-pwa-dismissed');
    if (dismissed && Date.now() - Number(dismissed) < 1000 * 60 * 60 * 24 * 7) {
      return;
    }

    // Check if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone;
    if (isStandalone) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show prompt on mobile browsers after 5 seconds if not standalone
    const timer = setTimeout(() => {
      if (!isStandalone && !dismissed) {
        setShowBanner(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
        setTimeout(() => setShowBanner(false), 2500);
      }
      setDeferredPrompt(null);
    } else {
      // Manual guide for iOS / browsers without beforeinstallprompt
      setShowManualGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('edmark-pwa-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.aside
        id="pwa-install-banner"
        aria-label="PWA install banner"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-20 sm:bottom-6 left-4 right-4 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border border-primary-200/80 rounded-2xl shadow-xl p-3.5"
      >
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-gray-900 leading-tight">
              {lang === 'sw' ? 'Sakinisha ED Retail App' : 'Install ED Retail App'}
            </h4>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
              {installed
                ? (lang === 'sw' ? 'App imesakinishwa kikamilifu!' : 'App installed successfully!')
                : (lang === 'sw'
                  ? 'Fungua kwa haraka, agiza bila shida, na pata mwongozo wa afya.'
                  : 'Faster access, offline browsing & 1-tap WhatsApp ordering.')}
            </p>

            {showManualGuide && (
              <div className="mt-2 p-2 bg-primary-50 rounded-lg text-[10px] text-primary-900 leading-relaxed border border-primary-100">
                {lang === 'sw'
                  ? 'Gusa kitufe cha "Kushiriki" (Share) kisha uchague "Ongeza kwenye Skrini ya Kwanza" (Add to Home Screen).'
                  : 'Tap the browser Share/Menu button and select "Add to Home Screen".'}
              </div>
            )}

            <div className="flex items-center gap-2 mt-2.5">
              {!installed ? (
                <>
                  <button
                    id="pwa-install-btn"
                    onClick={handleInstallClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {lang === 'sw' ? 'Sakinisha App' : 'Install App'}
                  </button>
                  <button
                    id="pwa-dismiss-btn"
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 text-gray-400 hover:text-gray-600 text-xs font-medium"
                  >
                    {lang === 'sw' ? 'Baadaye' : 'Not Now'}
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 text-green-600 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>{lang === 'sw' ? 'Imekamilika!' : 'Installed!'}</span>
                </div>
              )}
            </div>
          </div>

          <button
            id="pwa-close-btn"
            onClick={handleDismiss}
            aria-label="Close install banner"
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
