import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Leaf, Coffee, Activity, BadgeCheck } from 'lucide-react';
import { ProductCard } from './components/ProductCard';
import { HeroCarousel } from './components/HeroCarousel';
import { CheckoutSheet } from './components/CheckoutSheet';
import { CartBadge } from './components/CartBadge';
import { CategoryTabs } from './components/CategoryTabs';
import { Testimonials } from './components/Testimonials';
import { Bundles } from './components/Bundles';
import { DeliveryInfo } from './components/DeliveryInfo';
import { SearchBar } from './components/SearchBar';
import { SkeletonCard } from './components/SkeletonCard';
import { DistributorBio } from './components/DistributorBio';
import { P4GoalPicker } from './components/P4GoalPicker';
import { ReferralShareButton } from './components/ReferralShare';
import { PRODUCTS, CATEGORIES } from './types';
import { useCartStore } from './store/cartStore';
import { formatPrice, DISTRIBUTOR_NAME } from './utils/whatsappCompiler';
import { useLang } from './context/LangContext';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'p4-slimming':         <Activity className="w-4 h-4" />,
  'health-wellness':     <Leaf className="w-4 h-4" />,
  'lifestyle-beverages': <Coffee className="w-4 h-4" />,
};

// Simulate loading state — set to false once real API is wired up
const IS_LOADING = false;

function App() {
  const { lang, setLang, t } = useLang();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [search, setSearch] = useState('');

  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());

  const filteredProducts = useMemo(() => {
    let list = activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.en.toLowerCase().includes(q) ||
          p.name.sw.toLowerCase().includes(q) ||
          p.description.en.toLowerCase().includes(q) ||
          p.description.sw.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, search]);

  const activeCategoryData = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased pb-0">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100/80">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <img 
              src="/logo/wordmark.png" 
              alt="ED Retail" 
              className="h-10 w-auto"
            />

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
              className="px-2.5 py-1.5 rounded-[7px] bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
              aria-label={lang === 'en' ? 'Badilisha lugha kwenda Kiswahili' : 'Switch language to English'}
            >
              {lang === 'en' ? 'SW' : 'EN'}
            </button>

            {/* Cart button */}
            <motion.button
              className="relative p-2.5 bg-gray-100 rounded-[8px] hover:bg-gray-200 transition-colors outline-none [-webkit-tap-highlight-color:transparent]"
              onClick={() => setIsCartOpen(true)}
              whileTap={{ scale: 0.9 }}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" strokeWidth={2} />
              <CartBadge count={totalItems} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ── HERO CAROUSEL ── */}
      <HeroCarousel />

      {/* ── DISTRIBUTOR BIO ── */}
      <DistributorBio />

      {/* ── GOAL-BASED P4 PICKER ── */}
      <P4GoalPicker />

      {/* ── BUNDLES ── */}
      <Bundles />

      {/* ── PRODUCTS ── */}
      <section id="products" className="max-w-lg mx-auto px-4 pt-4 pb-2">
        <CategoryTabs
          categories={CATEGORIES}
          active={activeCategory}
          onChange={(id) => { setActiveCategory(id); setSearch(''); }}
        />
      </section>

      <section className="max-w-lg mx-auto px-4 pt-3 pb-2">
        <SearchBar value={search} onChange={setSearch} />
      </section>

      <section className="max-w-lg mx-auto px-4 py-2">
        <motion.div
          className="flex items-center gap-2"
          key={activeCategory}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeCategory !== 'all' && activeCategoryData && (
            <span className={`w-7 h-7 ${activeCategoryData.color} rounded-[7px] flex items-center justify-center text-white`}>
              {CATEGORY_ICONS[activeCategory]}
            </span>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 text-base">
              {activeCategory === 'all'
                ? (lang === 'sw' ? 'Bidhaa Zote' : 'All Products')
                : t(activeCategoryData!.label)}
            </h3>
            <p className="text-xs text-gray-400">
              {filteredProducts.length} {lang === 'sw' ? 'bidhaa zinapatikana' : `product${filteredProducts.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </motion.div>
      </section>

      <section className="max-w-lg mx-auto px-4 pb-8">
        {IS_LOADING ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div className="grid grid-cols-2 gap-4" layout>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {!IS_LOADING && filteredProducts.length === 0 && (
          <motion.div
            className="text-center py-14 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Coffee className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {search
                ? (lang === 'sw' ? `Hakuna matokeo kwa "${search}"` : `No results for "${search}"`)
                : (lang === 'sw' ? 'Hakuna bidhaa katika kikundi hiki' : 'No products in this category yet')}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-xs font-semibold text-indigo-600 underline outline-none [-webkit-tap-highlight-color:transparent]"
              >
                {lang === 'sw' ? 'Futa utafutaji' : 'Clear search'}
              </button>
            )}
          </motion.div>
        )}
      </section>

      {/* ── TESTIMONIALS ── */}
      <Testimonials />

      {/* ── DELIVERY INFO ── */}
      <DeliveryInfo />

      {/* ── TRUST BADGES ── */}
      <section className="max-w-lg mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Leaf className="w-5 h-5 text-green-600" />,        iconBg: 'bg-green-100',  en: '100% Authentic',  sw: '100% Halisi',      descEn: 'Genuine Edmark',      descSw: 'Edmark ya kweli'             },
            { icon: <ShoppingCart className="w-5 h-5 text-indigo-600" />, iconBg: 'bg-indigo-100', en: 'WhatsApp Order',   sw: 'Agiza WhatsApp',   descEn: 'Quick & Easy',        descSw: 'Haraka na Rahisi'            },
            { icon: <Activity className="w-5 h-5 text-amber-600" />,     iconBg: 'bg-amber-100',  en: 'Tanzania Wide',    sw: 'Tanzania Nzima',   descEn: 'Delivery Available',  descSw: 'Uwasilishaji Unapatikana'    },
          ].map((badge) => (
            <div key={badge.en} className="flex flex-col items-center text-center p-3.5 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 ${badge.iconBg} rounded-xl flex items-center justify-center mb-2.5`}>
                {badge.icon}
              </div>
              <span className="text-[11px] font-bold text-gray-900 leading-tight">{lang === 'sw' ? badge.sw : badge.en}</span>
              <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{lang === 'sw' ? badge.descSw : badge.descEn}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-white border-t border-gray-100 mt-2 px-6 pt-6 pb-6">
        {/* Row 1 — logo + distributor badge */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-7 w-auto opacity-90 flex-shrink-0" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full flex-shrink-0">
            <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-800 truncate">{DISTRIBUTOR_NAME}</span>
          </div>
        </div>

        {/* Row 2 — tagline + share button side by side */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <p className="text-xs text-gray-500 leading-snug">
            {lang === 'sw' ? 'Msambazaji Rasmi wa Edmark · Tanzania' : 'Authorized Edmark Distributor · Tanzania'}
          </p>
          <div className="flex-shrink-0">
            <ReferralShareButton />
          </div>
        </div>

        {/* Row 3 — copyright */}
        <p className="text-[10px] text-gray-400 text-center w-full">© 2026 ED Retail. All rights reserved.</p>
      </footer>

      {/* ── STICKY CART ── */}
      <AnimatePresence>
        {totalItems > 0 && !isCartOpen && (
          <motion.div
            className="fixed bottom-6 left-4 right-4 z-30 max-w-lg mx-auto"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <motion.button
              onClick={() => setIsCartOpen(true)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors outline-none shadow-lg [-webkit-tap-highlight-color:transparent]"
              whileTap={{ scale: 0.97 }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" strokeWidth={2.5} />
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold">
                    {totalItems}
                  </span>
                </div>
                <span className="font-semibold text-sm">
                  {lang === 'sw' ? 'Tazama Mkoba' : 'View Cart'}
                </span>
              </div>
              <span className="text-blue-100 text-sm font-semibold">
                {formatPrice(totalPrice)} TZS
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHECKOUT SHEET ── */}
      <CheckoutSheet isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

export default App;
