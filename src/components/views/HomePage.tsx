import { useState, useMemo } from 'react';
import {
  Leaf,
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  Heart,
  Plus,
  Minus,
  MessageCircle,
  Activity,
  Coffee,
  Search,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { HeroCarousel } from '../HeroCarousel';
import { ReferralShareButton } from '../ReferralShare';
import { NativeAdBanner } from '../ads/NativeAdBanner';
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

  const liveProducts = getEffectiveProducts();

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const favourites = useCartStore((s) => s.favourites);

  const [searchQuery, setSearchQuery] = useState('');

  // 4 Top Best Sellers with high customer demand
  const popularProducts = useMemo(() => liveProducts.slice(0, 4), [liveProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('products');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-3 sm:py-6 space-y-6 sm:space-y-8 animate-fadeIn">
      {/* ── 1. GLOBAL CONTEXT & FREE ADVICE STRIP ── */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-black text-[#123B6D] leading-tight">
              ED Retail Tanzania
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#E7F4EE] text-[#0E6B52] text-[10px] font-extrabold uppercase border border-emerald-200/80 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-[#0E6B52]" />
              {lang === 'sw' ? 'Mwakilishi Rasmi' : 'Authorized Hub'}
            </span>
          </div>
          <p className="text-xs text-neutral-600 flex items-center gap-1.5 flex-wrap">
            <UserCheck className="w-3.5 h-3.5 text-[#0E6B52] inline" />
            <span>
              {lang === 'sw'
                ? `Kiongozi wa Eneo: ${distributor.name} (${distributor.city})`
                : `Leader: ${distributor.name} (${distributor.city})`}
            </span>
            <span className="text-neutral-300">•</span>
            <span className="text-[#0E6B52] font-bold">100% Genuine Edmark</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getActiveWhatsAppLink(
              `Habari ${distributor.name}, ninahitaji ushauri wa kitaalamu kuhusu bidhaa za Edmark:`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#E7F4EE] hover:bg-[#CDE9DE] text-[#0E6B52] border border-emerald-300/80 rounded-xl text-xs font-black transition-colors flex items-center gap-2 shadow-2xs cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-4 h-4 text-[#0E6B52]" />
            <span>{lang === 'sw' ? 'Ushauri WhatsApp' : 'Free Advice'}</span>
          </a>
        </div>
      </section>

      {/* ── 2. QUICK SEARCH BAR (Directly follows Free Advice) ── */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'sw'
              ? 'Tafuta bidhaa (Shake Off, Splina, MRT, Kahawa ya Ginseng...)'
              : 'Search products, benefits, or symptoms...'
          }
          className="w-full pl-10 pr-24 py-3 bg-white border border-neutral-200/90 rounded-2xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#123B6D] focus:ring-2 focus:ring-[#123B6D]/10 transition-all shadow-2xs"
        />
        <button
          type="button"
          onClick={() => onNavigate('products')}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-2xs"
        >
          {lang === 'sw' ? 'Tafuta' : 'Search'}
        </button>
      </form>

      {/* ── 3. SHOP BY CATEGORY ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black text-neutral-900">
            {lang === 'sw' ? 'Chagua kwa Makundi' : 'Shop by Category'}
          </h2>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-[#123B6D] hover:text-[#0D315D] flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Tazama Zote' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Leaf;
            const count = liveProducts.filter((p) => p.category === cat.id).length;

            const iconStyles: Record<string, string> = {
              'p4-slimming': 'bg-emerald-50 text-[#0E6B52] group-hover:bg-[#0E6B52] group-hover:text-white',
              'health-wellness': 'bg-teal-50 text-teal-800 group-hover:bg-teal-700 group-hover:text-white',
              'lifestyle-beverages': 'bg-[#E8EEF5] text-[#123B6D] group-hover:bg-[#123B6D] group-hover:text-white',
            };

            return (
              <button
                key={cat.id}
                id={`home-cat-tile-${cat.id}`}
                onClick={() => onNavigate('products')}
                className="text-left p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200/90 shadow-2xs hover:border-[#123B6D]/40 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${iconStyles[cat.id] || 'bg-neutral-100 text-neutral-800'} transition-colors flex items-center justify-center flex-shrink-0 shadow-2xs`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 group-hover:text-[#123B6D] transition-colors leading-tight">
                      {t(cat.label)}
                    </h3>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {count} {lang === 'sw' ? 'bidhaa' : `product${count !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-[#123B6D] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. TOP SELLING PRODUCTS ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-neutral-900">
              {lang === 'sw' ? 'Bidhaa Zinazonunuliwa Zaidi' : 'Top Selling Products'}
            </h2>
            <p className="text-xs text-neutral-500">
              {lang === 'sw' ? 'Matokeo ya haraka na uhakika wa ubora' : 'Customer favorites for fast, proven results'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-[#123B6D] hover:text-[#0D315D] flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Katalogi Kamili' : 'See All'}</span>
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
                className="bg-white rounded-2xl border border-neutral-200/90 p-3.5 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-[#123B6D]/40 transition-all relative group"
              >
                {/* Favourite trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(product.id);
                  }}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl border backdrop-blur-xs transition-colors z-10 cursor-pointer ${
                    isFav
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white/90 text-neutral-400 hover:text-neutral-700 border-neutral-200 shadow-2xs'
                  }`}
                  aria-label="Favourite toggle"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <div
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer space-y-2.5"
                >
                  <div className="relative bg-neutral-50 rounded-xl h-32 sm:h-40 flex items-center justify-center p-2.5 border border-neutral-200/60 overflow-hidden">
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-[#123B6D] font-extrabold text-[9px] rounded-md border border-[#C3D3E7] shadow-2xs uppercase tracking-tight">
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
                    {/* 2-line title support with no aggressive mid-word cutoffs */}
                    <h3 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                      {t(product.name)}
                    </h3>
                    <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                      {t(product.description)}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-neutral-100 mt-2.5 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-xs sm:text-sm font-black text-neutral-900 block leading-tight">
                      {formatPrice(product.price)} <span className="text-[9px] text-neutral-500 font-semibold">TZS</span>
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ({formatUsd(product.priceUsd)})
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addItem({ ...product, quantity: 1 })}
                      className="px-3 py-1.5 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl text-xs font-black shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{lang === 'sw' ? 'Weka' : 'Add'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center border border-[#123B6D]/30 bg-[#F0F4F9] rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-[#123B6D] font-black text-xs cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#123B6D]">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="w-5 h-5 bg-[#123B6D] text-white rounded-lg flex items-center justify-center font-black text-xs cursor-pointer shadow-2xs"
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

      {/* ── 5. CONSOLIDATED TRUST & GUARANTEE PANEL ── */}
      <section className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-7 shadow-2xs space-y-4">
        <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">
          {lang === 'sw' ? 'KWANINI UNUNUE NASI' : 'WHY SHOP WITH US'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E7F4EE] text-[#0E6B52] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {lang === 'sw' ? '100% Asili & Halisi' : '100% Genuine Edmark'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {lang === 'sw' ? 'Stika & mihuri halisi ya kiwandani' : 'Factory-sealed products'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#E7F4EE] text-[#0E6B52] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {lang === 'sw' ? 'Usafirishaji wa Haraka' : 'Fast Delivery'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {lang === 'sw' ? 'Dar es Salaam & mikoani yote' : 'Nationwide delivery options'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2 sm:p-0">
            <div className="w-10 h-10 rounded-xl bg-[#F8EFD9] text-[#C89D4D] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {lang === 'sw' ? 'Mwongozo wa Kitaalamu' : 'Certified Guidance'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {lang === 'sw' ? `Msaada wa moja kwa moja kutoka kwa kiongozi` : `Direct wellness support`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. NATIVE PARTNER SPONSOR BANNER (PASSIVE INCOME) ── */}
      <NativeAdBanner placement="storefront_hero" />

      {/* ── 7. FEATURED PROMOTIONAL HERO SLIDER (Full Width on Mobile) ── */}
      <section className="-mx-4 sm:mx-0 pt-2">
        <HeroCarousel onNavigate={onNavigate} />
      </section>

      {/* ── 8. STREAMLINED FOOTER ── */}
      <footer className="pt-4 pb-20 lg:pb-8 border-t border-neutral-200/90 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo/wordmark.png"
              alt="ED Retail Tanzania"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-xs text-neutral-300">|</span>
            <span className="text-xs font-extrabold text-neutral-600">
              {lang === 'sw' ? `Msambazaji Rasmi: ${distributor.name}` : `Authorized Leader: ${distributor.name}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ReferralShareButton />
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 text-center sm:text-left">
          © {new Date().getFullYear()} ED Retail Tanzania · {distributor.name}. Genuine Edmark product trademarks belong to Edmark International.
        </p>
      </footer>
    </div>
  );
}
