import { useState } from 'react';
import {
  Leaf,
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  Heart,
  Plus,
  Minus,
  Sparkles,
  MessageCircle,
  Activity,
  Coffee,
  Calculator,
  Search,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { HeroCarousel } from '../HeroCarousel';
import { ReferralShareButton } from '../ReferralShare';
import { BmiHealthCalculatorModal } from '../calculator/BmiHealthCalculatorModal';
import { CATEGORIES, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { formatPrice, formatUsd, getActiveWhatsAppLink } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';
import { ScreenId } from '../navigation/AppHeader';

interface HomePageProps {
  onNavigate: (screen: ScreenId) => void;
  onSelectProduct: (product: Product) => void;
  onOpenFlyerStudio?: () => void;
  onOpenDistributorAuth?: () => void;
}

const CATEGORY_ICONS: Record<string, typeof Activity> = {
  'p4-slimming': Activity,
  'health-wellness': Leaf,
  'lifestyle-beverages': Coffee,
};

export function HomePage({
  onNavigate,
  onSelectProduct,
  onOpenFlyerStudio: _onOpenFlyerStudio,
  onOpenDistributorAuth: _onOpenDistributorAuth,
}: HomePageProps) {
  const { lang, t } = useLang();
  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const getFinancialSummary = useDistributorStore((s) => s.getFinancialSummary);
  const sales = useDistributorStore((s) => s.sales);

  const liveProducts = getEffectiveProducts();

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const favourites = useCartStore((s) => s.favourites);

  const [searchQuery, setSearchQuery] = useState('');
  const [isBmiModalOpen, setIsBmiModalOpen] = useState(false);

  // 4 Top Best Sellers with high customer demand
  const popularProducts = liveProducts.slice(0, 4);

  const summary = getFinancialSummary('today');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('products');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ── 1. COMPACT CONTEXTUAL GREETING & SEARCH STRIP ── */}
      <section className="bg-white rounded-3xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                {lang === 'sw' ? 'Habari, Karibu ED Retail 👋' : 'Welcome to ED Retail 👋'}
              </h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              <span>
                {lang === 'sw'
                  ? `Msambazaji: ${distributor.name} (${distributor.city})`
                  : `Distributor: ${distributor.name} (${distributor.city})`}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-emerald-700 font-bold">100% Authentic Edmark</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <a
              href={getActiveWhatsAppLink(`Habari ${distributor.name}, ninahitaji ushauri kuhusu bidhaa za Edmark:`)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'sw' ? 'Ushauri WhatsApp' : 'Free Advice'}</span>
            </a>
          </div>
        </div>

        {/* Quick Search Shortcut */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'sw'
                ? 'Tafuta bidhaa (Shake Off, Splina, MRT, Kahawa ya Ginseng...)'
                : 'Search products by name, symptom, or benefit...'
            }
            className="w-full pl-10 pr-24 py-2.5 bg-stone-50 border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all"
          />
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {lang === 'sw' ? 'Tafuta' : 'Search'}
          </button>
        </form>
      </section>

      {/* ── 2. STATE-AWARE PRIMARY HERO LAUNCHPAD ── */}
      {isAdminAuthenticated ? (
        /* DISTRIBUTOR STATE: Business Priority Summary */
        <section className="bg-gradient-to-br from-[#0C271E] via-stone-900 to-[#0C271E] text-white rounded-3xl p-5 sm:p-6 border border-[#1A3D31] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{lang === 'sw' ? 'Hali ya Biashara Leo' : "Today's Business Pulse"}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {lang === 'sw' ? `Muhtasari wa Mauzo: ${distributor.name}` : `Distributor Pulse: ${distributor.name}`}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('distributor')}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl font-black text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>{lang === 'sw' ? 'Ofisi ya Msambazaji' : 'Open Office'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'sw' ? 'Mauzo Leo' : 'Revenue Today'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-1 truncate">
                TZS {summary.totalRevenue.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{lang === 'sw' ? 'Cash Mkononi' : 'Cash Collected'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-emerald-300 mt-1 truncate">
                TZS {summary.cashCollected.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-[10px] text-stone-300 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span>{lang === 'sw' ? 'Faida Halisi' : 'Net Profit'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-amber-300 mt-1 truncate">
                TZS {summary.estimatedNetProfit.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-[10px] text-stone-300 font-medium">
                {lang === 'sw' ? 'Rekodi za Mauzo' : 'Sales Records'}
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-1">
                {sales.length} {lang === 'sw' ? 'jumla' : 'total'}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* CUSTOMER STATE: Interactive Goal & Wellness Launchpad */
        <section className="bg-[#0C271E] rounded-3xl p-5 sm:p-7 text-stone-100 border border-[#1A3D31] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5 relative overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-white/10 text-[#E5C378] rounded-full text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'sw' ? 'Mpango Binafsi wa Afya' : 'Personalized Wellness Path'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {lang === 'sw' ? 'Hujui pa kuanzia? Pata pakiti inayokufaa.' : 'Unsure where to begin? Match your personal goal.'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {lang === 'sw'
                ? 'Jibu maswali rahisi ili upate mchanganyiko sahihi wa bidhaa za kusafisha sumu, kupunguza kitambi, au kuongeza nishati kwa punguzo la pakiti.'
                : 'Discover whether the P4 Slimming System, Detox Stack, or Vitality Duo matches your health target with bundled savings.'}
            </p>

            {/* Quick Goal Tags */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { en: 'Slimming & P4', sw: 'Kupunguza Tumbo' },
                { en: 'Colon Detox', sw: 'Kusafisha Tumbo' },
                { en: 'Ulcer Relief', sw: 'Vidonda vya Tumbo' },
                { en: 'Vitality & Energy', sw: 'Nguvu & Kinga' },
              ].map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate('goals')}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {g[lang]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={() => onNavigate('goals')}
              className="px-5 py-3 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <span>{lang === 'sw' ? 'Tafuta Lengo Langu' : 'Find My Goal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* ── 3. HERO CAROUSEL ── */}
      <HeroCarousel />

      {/* ── 4. SHOP BY CATEGORY (REFINED FAST SHORTCUTS) ── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-stone-900">
              {lang === 'sw' ? 'Chagua kwa Makundi' : 'Shop by Category'}
            </h2>
            <p className="text-xs text-stone-500">
              {lang === 'sw'
                ? 'Bidhaa maalum za kupunguza uzito, usafi wa damu, na vinywaji vya afya'
                : 'Targeted solutions for slimming, cellular detox, and daily vitality'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Tazama Zote' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Leaf;
            const count = liveProducts.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                id={`home-cat-tile-${cat.id}`}
                onClick={() => onNavigate('products')}
                className="text-left p-4 rounded-2xl bg-white hover:bg-stone-50/80 border border-stone-200/90 shadow-2xs hover:border-emerald-400 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 group-hover:text-emerald-800 transition-colors">
                      {t(cat.label)}
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {count} {lang === 'sw' ? 'bidhaa dukani' : `product${count !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 5. BEST SELLERS & POPULAR PRODUCTS (UNCOMPRESSED, CLEAN GRID) ── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'sw' ? 'Zinazonunuliwa Zaidi' : 'Customer Favorites'}
            </span>
            <h2 className="text-base sm:text-lg font-black text-stone-900 mt-1">
              {lang === 'sw' ? 'Bidhaa Pendwa & Matokeo ya Haraka' : 'Top Selling Wellness Products'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Tazama Katalogi' : 'See Full Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {popularProducts.map((product) => {
            const inCart = cartItems.find((i) => i.id === product.id);
            const qty = inCart?.quantity ?? 0;
            const isFav = favourites.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all relative group"
              >
                {/* Favourite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(product.id);
                  }}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl border backdrop-blur-xs transition-colors z-10 ${
                    isFav
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white/90 text-stone-400 hover:text-stone-700 border-stone-200 shadow-2xs'
                  }`}
                  aria-label="Favourite toggle"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>

                <div
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="relative bg-stone-50 rounded-xl h-32 sm:h-40 flex items-center justify-center p-2.5 border border-stone-200/60 overflow-hidden">
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-emerald-800 font-extrabold text-[9px] rounded-md border border-emerald-200 shadow-2xs uppercase">
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={t(product.name)}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-stone-900 truncate">
                      {t(product.name)}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {t(product.description)}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-stone-100 mt-2 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                      {formatPrice(product.price)} <span className="text-[9px] text-stone-500 font-semibold">TZS</span>
                    </span>
                    <span className="text-[10px] text-stone-400">
                      ({formatUsd(product.priceUsd)})
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addItem({ ...product, quantity: 1 })}
                      className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'sw' ? 'Weka' : 'Add'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center border border-emerald-300 bg-emerald-50 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-emerald-900 font-black text-xs cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-emerald-950">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-emerald-900 font-black text-xs cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. PROGRESSIVE DISCLOSURE: BODY PROFILE & BMI ASSESSMENT TEASER ── */}
      <section className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center justify-center flex-shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xs sm:text-sm text-stone-900">
                {lang === 'sw' ? 'Kikokotoo cha Afya, Uzito & BMI' : 'Body Profile & BMI Assessment'}
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-extrabold rounded-md uppercase">
                Interactive
              </span>
            </div>
            <p className="text-xs text-stone-500 max-w-lg">
              {lang === 'sw'
                ? 'Pima uzito wako, tambua kiwango cha mafuta mwilini, na upate ratiba kamili ya dozi ya asubuhi, mchana na jioni.'
                : 'Calculate your BMI, identify metabolic risks, and unlock structured 4-phase dosage guidance.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBmiModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap"
        >
          <Calculator className="w-3.5 h-3.5 text-[#E5C378]" />
          <span>{lang === 'sw' ? 'Pima BMI & Ratiba' : 'Launch Body Check'}</span>
        </button>
      </section>

      {/* ── 7. THREE CORE TRUST & DELIVERY GUARANTEES ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
              {lang === 'sw' ? '100% Asili & Halisi' : '100% Genuine Edmark'}
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lang === 'sw' ? 'Stika & Mihuri Halisi' : 'Factory sealed guarantee'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
              {lang === 'sw' ? 'Usafirishaji Tanzania Nzima' : 'Fast Delivery Countrywide'}
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lang === 'sw' ? 'Dar es Salaam, Mikoani & Zanzibar' : 'Doorstep & regional transit'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
              {lang === 'sw' ? 'Ushauri wa Bure wa Afya' : 'Free Certified Coaching'}
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              {lang === 'sw' ? `Kutoka kwa ${distributor.name}` : `Direct support from leader`}
            </p>
          </div>
        </div>
      </section>

      {/* ── 8. CLEAN STREAMLINED FOOTER ── */}
      <footer className="pt-6 pb-16 lg:pb-8 border-t border-stone-200/90 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo/wordmark.png" alt="ED Retail" className="h-6 w-auto" />
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs font-extrabold text-stone-600">
              {lang === 'sw' ? `Msambazaji Rasmi: ${distributor.name}` : `Authorized Leader: ${distributor.name}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ReferralShareButton />
          </div>
        </div>

        <p className="text-[11px] text-stone-400 text-center sm:text-left">
          © {new Date().getFullYear()} ED Retail · {distributor.name}. Genuine Edmark product trademarks belong to Edmark International.
        </p>
      </footer>

      {/* ── BMI HEALTH ASSESSMENT MODAL (PROGRESSIVE DISCLOSURE) ── */}
      <BmiHealthCalculatorModal
        isOpen={isBmiModalOpen}
        onClose={() => setIsBmiModalOpen(false)}
        onSelectProduct={onSelectProduct}
        onOpenGoalFinder={() => {
          setIsBmiModalOpen(false);
          onNavigate('goals');
        }}
      />
    </div>
  );
}
