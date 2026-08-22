import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { AppHeader, ScreenId } from './components/navigation/AppHeader';
import { BottomNavigation } from './components/navigation/BottomNavigation';
import { OfflineBanner } from './components/feedback/OfflineBanner';
import { PwaInstallBanner } from './components/feedback/PwaInstallBanner';
import { HomePage } from './components/views/HomePage';
import { ProductsView } from './components/views/ProductsView';
import { GoalsBundlesView } from './components/views/GoalsBundlesView';
import { DeliveryView } from './components/views/DeliveryView';
import { DistributorView } from './components/views/DistributorView';
import { FavouritesView } from './components/views/FavouritesView';
import { OrdersHelpView } from './components/views/OrdersHelpView';
import { ProductDetailModal } from './components/views/ProductDetailModal';
import { CheckoutSheet } from './components/CheckoutSheet';
import { SmartAssistantModal } from './components/chat/SmartAssistantModal';
import { FloatingChatbotTrigger } from './components/chat/FloatingChatbotTrigger';
import { SplashScreen } from './components/splash/SplashScreen';
import { FlyerStudioModal } from './components/marketing/FlyerStudioModal';
import { DistributorAuthModal } from './components/auth/DistributorAuthModal';
import { DistributorStoreLinkModal } from './components/distributor/DistributorStoreLinkModal';
import { DistributorBackOfficeModal } from './components/distributor/DistributorBackOfficeModal';
import { Product } from './types';
import { useCartStore } from './store/cartStore';
import { useDistributorStore } from './store/distributorStore';
import { formatPrice } from './utils/whatsappCompiler';
import { useLang } from './context/LangContext';

function App() {
  const { lang } = useLang();
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isBackOfficeOpen, setIsBackOfficeOpen] = useState(false);
  const [isFlyerStudioOpen, setIsFlyerStudioOpen] = useState(false);
  const [isDistributorAuthOpen, setIsDistributorAuthOpen] = useState(false);
  const [isStoreLinkOpen, setIsStoreLinkOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const setActiveRefSlug = useDistributorStore((s) => s.setActiveRefSlug);

  // Auto-detect distributor referral slug from URL (e.g., ?ref=asha or /@fatuma)
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const refParam = searchParams.get('ref') || searchParams.get('distributor');
      if (refParam) {
        setActiveRefSlug(refParam);
      } else {
        const path = window.location.pathname;
        const match = path.match(/@([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          setActiveRefSlug(match[1]);
        }
      }
    } catch {
      // safe fallback
    }
  }, [setActiveRefSlug]);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentScreen]);

  if (showSplash) {
    return (
      <SplashScreen
        onDone={() => {
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased flex flex-col selection:bg-primary-100 selection:text-primary-900">
      {/* ── REAL-TIME CONNECTIVITY MONITOR ── */}
      <OfflineBanner />

      {/* ── MAIN HEADER NAVIGATION ── */}
      <AppHeader
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenFlyerStudio={() => setIsFlyerStudioOpen(true)}
        onOpenDistributorAuth={() => setIsDistributorAuthOpen(true)}
        onOpenBackOffice={() => setIsBackOfficeOpen(true)}
        onOpenStoreLinkModal={() => setIsStoreLinkOpen(true)}
      />

      {/* ── PWA INSTALLATION BANNER (MOBILE-FIRST) ── */}
      <div className="max-w-6xl mx-auto w-full px-4 pt-3">
        <PwaInstallBanner />
      </div>

      {/* ── PRIMARY SCREEN ROUTING CONTAINER ── */}
      <main className="flex-1 pb-24 lg:pb-12">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' && (
            <motion.div
              key="screen-home"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <HomePage
                onNavigate={setCurrentScreen}
                onSelectProduct={setSelectedProduct}
                onOpenFlyerStudio={() => setIsFlyerStudioOpen(true)}
                onOpenDistributorAuth={() => setIsDistributorAuthOpen(true)}
              />
            </motion.div>
          )}

          {currentScreen === 'products' && (
            <motion.div
              key="screen-products"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProductsView onSelectProduct={setSelectedProduct} />
            </motion.div>
          )}

          {currentScreen === 'goals' && (
            <motion.div
              key="screen-goals"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <GoalsBundlesView onSelectProduct={setSelectedProduct} />
            </motion.div>
          )}

          {currentScreen === 'delivery' && (
            <motion.div
              key="screen-delivery"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DeliveryView />
            </motion.div>
          )}

          {currentScreen === 'distributor' && (
            <motion.div
              key="screen-distributor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <DistributorView onOpenBackOffice={() => setIsBackOfficeOpen(true)} />
            </motion.div>
          )}

          {currentScreen === 'favourites' && (
            <motion.div
              key="screen-favourites"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <FavouritesView
                onSelectProduct={setSelectedProduct}
                onNavigateToProducts={() => setCurrentScreen('products')}
              />
            </motion.div>
          )}

          {currentScreen === 'help' && (
            <motion.div
              key="screen-help"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OrdersHelpView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <BottomNavigation
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* ── FLOATING STICKY CART (DESKTOP & TABLET VIEW) ── */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-40"
          >
            <button
              id="sticky-cart-floating-btn"
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-3.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white rounded-2xl shadow-xl flex items-center gap-3 font-bold text-xs sm:text-sm transition-transform active:scale-95 border border-primary-500/40"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 text-neutral-900 rounded-full text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              </div>
              <span className="hidden sm:inline">
                {lang === 'sw' ? 'Tazama Mkoba' : 'View Cart'}
              </span>
              <span className="text-primary-200">|</span>
              <span>{formatPrice(totalPrice)} TZS</span>
              <ArrowRight className="w-4 h-4 text-primary-200" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCT DETAIL MODAL ── */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ── FULL WHATSAPP CHECKOUT SHEET ── */}
      <CheckoutSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* ── FLOATING CHATBOT TRIGGER & PROACTIVE BUBBLE ── */}
      <FloatingChatbotTrigger onOpenChat={() => setIsChatOpen(true)} />

      {/* ── DEDICATED CUSTOMER WELLNESS SMART ASSISTANT MODAL ── */}
      <SmartAssistantModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onNavigateToScreen={(s) => setCurrentScreen(s as any)}
        onSelectProduct={setSelectedProduct}
        onOpenFlyerStudio={() => setIsFlyerStudioOpen(true)}
      />

      {/* ── DEDICATED DISTRIBUTOR LEADER BACK-OFFICE / PORTAL ── */}
      <DistributorBackOfficeModal
        isOpen={isBackOfficeOpen}
        onClose={() => setIsBackOfficeOpen(false)}
        onOpenFlyerStudio={() => setIsFlyerStudioOpen(true)}
      />

      {/* ── 1-TAP WHATSAPP STATUS FLYER STUDIO ── */}
      <FlyerStudioModal
        isOpen={isFlyerStudioOpen}
        onClose={() => setIsFlyerStudioOpen(false)}
      />

      {/* ── DISTRIBUTOR AUTH & MULTI-PROFILE MODAL ── */}
      <DistributorAuthModal
        isOpen={isDistributorAuthOpen}
        onClose={() => setIsDistributorAuthOpen(false)}
        onSuccess={() => setIsDistributorAuthOpen(false)}
      />

      {/* ── DISTRIBUTOR STOREFRONT LINK & REPLICATION MODAL ── */}
      <DistributorStoreLinkModal
        isOpen={isStoreLinkOpen}
        onClose={() => setIsStoreLinkOpen(false)}
      />
    </div>
  );
}

export default App;
