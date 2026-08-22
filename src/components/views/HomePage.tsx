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
} from 'lucide-react';
import { HeroCarousel } from '../HeroCarousel';
import { Testimonials } from '../Testimonials';
import { ReferralShareButton } from '../ReferralShare';
import { BmiHealthCalculator } from '../calculator/BmiHealthCalculator';
import { RegionalDistributorLocator } from '../distributor/RegionalDistributorLocator';
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
  onOpenFlyerStudio,
  onOpenDistributorAuth,
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

  const popularProducts = liveProducts.slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-8 sm:space-y-10 animate-fadeIn">
      {/* ── 1. HERO CAROUSEL ── */}
      <HeroCarousel />

      {/* ── 2. THREE CORE TRUST CARDS ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
              {lang === 'sw' ? '100% Asili & Halisi' : '100% Authentic Products'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {lang === 'sw' ? 'Moja kwa moja kutoka Edmark' : 'Genuine sealed stock guarantee'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
              {lang === 'sw' ? 'Uwasilishaji Tanzania Nzima' : 'Fast Delivery Everywhere'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {lang === 'sw' ? 'Dar es Salaam, Mikoani & Zanzibar' : 'Doorstep & regional transit'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-neutral-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 leading-tight">
              {lang === 'sw' ? 'Ushauri wa Bure wa Afya' : 'Expert Personal Guidance'}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              {lang === 'sw' ? `Kutoka kwa ${distributor.name}` : `Certified coaching from ${distributor.name}`}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. SHOP BY CATEGORY TILES ── */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900">
              {lang === 'sw' ? 'Vipengele vya Bidhaa' : 'Shop by Category'}
            </h2>
            <p className="text-xs text-neutral-500">
              {lang === 'sw' ? 'Chagua kundi unalohitaji kuanzia kupunguza uzito hadi vinywaji vya afya' : 'Targeted solutions for slimming, cellular health, and daily vitality'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Zote' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Leaf;
            const count = liveProducts.filter((p) => p.category === cat.id).length;

            return (
              <button
                key={cat.id}
                id={`home-cat-tile-${cat.id}`}
                onClick={() => onNavigate('products')}
                className="text-left p-4 sm:p-5 rounded-2xl bg-white hover:bg-neutral-50 border border-neutral-200/80 shadow-xs hover:border-primary-300 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary-700 transition-colors">
                      {t(cat.label)}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {count} {lang === 'sw' ? 'bidhaa' : `product${count !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 4. POPULAR BEST SELLERS GRID ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {lang === 'sw' ? 'Zinazopendwa Zaidi' : 'Most Popular'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 mt-1">
              {lang === 'sw' ? 'Bidhaa Zinazonunuliwa Zaidi' : 'Customer Favorites & Best Sellers'}
            </h2>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'sw' ? 'Tazama Zote' : 'See All Products'}</span>
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
                className="bg-white rounded-2xl border border-neutral-200/80 p-3.5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-primary-300 transition-all relative group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(product.id);
                  }}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-xl border backdrop-blur-xs transition-colors z-10 ${
                    isFav
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white/90 text-neutral-400 hover:text-neutral-700 border-neutral-100 shadow-xs'
                  }`}
                  aria-label="Favourite toggle"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                </button>

                <div
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer space-y-2"
                >
                  <div className="relative bg-neutral-50 rounded-xl h-32 sm:h-40 flex items-center justify-center p-2.5 border border-neutral-200/60 overflow-hidden">
                    {product.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 text-primary-700 font-bold text-[9px] rounded-full border border-primary-200 shadow-xs uppercase">
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
                    <h3 className="text-xs font-bold text-neutral-900 truncate">
                      {t(product.name)}
                    </h3>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">
                      {t(product.description)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 mt-2 flex items-center justify-between gap-1">
                  <div>
                    <span className="text-xs font-extrabold text-neutral-900 block leading-tight">
                      {formatPrice(product.price)} <span className="text-[9px] text-neutral-500 font-semibold">TZS</span>
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      ({formatUsd(product.priceUsd)})
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addItem({ ...product, quantity: 1 })}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                      aria-label="Add to cart"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden sm:inline">{lang === 'sw' ? 'Weka' : 'Add'}</span>
                    </button>
                  ) : (
                    <div className="flex items-center border border-primary-300 bg-primary-50 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="w-5 h-5 bg-white rounded flex items-center justify-center text-primary-700 font-bold text-xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-4 text-center text-[11px] font-bold text-primary-900">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="w-5 h-5 bg-white rounded flex items-center justify-center text-primary-700 font-bold text-xs"
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

      {/* ── 5. GOAL FINDER & BUNDLES TEASER CARD ── */}
      <section className="bg-[#0C271E] rounded-3xl p-6 sm:p-8 text-stone-100 border border-[#1A3D31] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-[#E5C378] rounded-full text-xs font-bold border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Mtaalamu wa Malengo ya Afya' : 'Interactive Goal Matcher'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {lang === 'sw' ? 'Hujui pa kuanzia? Pata pakiti inayokufaa.' : 'Unsure where to begin? Match your personal goal.'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            {lang === 'sw'
              ? 'Jibu maswali 3 rahisi ili upate mchanganyiko sahihi wa bidhaa za kusafisha sumu, kupunguza uzito, au kuongeza nishati kwa punguzo la hadi 10%.'
              : 'Discover whether the P4 Slimming System, Detox Stack, or Vitality Duo matches your personal lifestyle goals with pre-calculated bundle savings.'}
          </p>
        </div>

        <button
          id="home-goal-finder-cta-btn"
          onClick={() => onNavigate('goals')}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#C5A059] hover:bg-[#d6b068] text-stone-950 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-transform active:scale-95 flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <span>{lang === 'sw' ? 'Anza Kutafuta Mpango Wako' : 'Open Goal Finder & Bundles'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* ── 5.5 BMI & P4 HEALTH CALCULATOR (INTERACTIVE TOOL) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 leading-tight">
                {lang === 'sw' ? 'Kikokotoo cha Afya & Uzito (BMI & Body Check)' : 'BMI & Body Health Assessment'}
              </h2>
              <p className="text-xs text-neutral-500">
                {lang === 'sw' ? 'Pima uzito wako, tambua hatua za usafi wa tumbo, na pata mpango unaokufaa' : 'Calculate BMI, discover health risks, and receive instant recommended regimen'}
              </p>
            </div>
          </div>
        </div>

        <BmiHealthCalculator
          onSelectProduct={onSelectProduct}
          onOpenGoalFinder={() => onNavigate('goals')}
        />
      </section>

      {/* ── 6. REGIONAL DISTRIBUTOR DIRECTORY & LOCATOR ── */}
      <section>
        <RegionalDistributorLocator
          onSelectDistributor={() => {
            // Distributor activated, state and URL updated
          }}
          onOpenJoinModal={onOpenDistributorAuth}
        />
      </section>

      {/* ── 7. ACTIVE DISTRIBUTOR / CENTRAL SUPPORT TEASER ── */}
      <section className={`rounded-3xl border p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-6 ${
        !distributor.isCentral
          ? 'bg-emerald-50/80 border-emerald-200'
          : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-neutral-200 p-0.5 flex-shrink-0 overflow-hidden shadow-2xs">
            <img
              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
              alt={distributor.name}
              className="w-full h-full object-cover rounded-[14px]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                !distributor.isCentral
                  ? 'text-emerald-900 bg-emerald-100 border-emerald-300'
                  : 'text-amber-900 bg-amber-50 border-amber-200'
              }`}>
                {!distributor.isCentral
                  ? `${distributor.rank || 'Official Edmark Leader'} · ${distributor.city}`
                  : 'Central Head Office Desk · Tanzania'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 mt-1">
              {distributor.name}
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              {lang === 'sw'
                ? `Msaada & Ushauri wa Moja kwa Moja · Simu / WhatsApp: ${distributor.phone}`
                : `Verified Consultation & Support · Phone / WhatsApp: ${distributor.phone}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {onOpenFlyerStudio && (
            <button
              onClick={onOpenFlyerStudio}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'sw' ? 'Tengeneza Tangazo' : 'Flyer Studio'}</span>
            </button>
          )}
          <button
            onClick={() => onNavigate('distributor')}
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-200 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            {lang === 'sw' ? 'Tazama Wasifu' : 'View Profile'}
          </button>
          <a
            href={getActiveWhatsAppLink(`Habari ${distributor.name}, nahitaji ushauri wa afya kuhusu bidhaa za Edmark:`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{lang === 'sw' ? 'Ongea WhatsApp' : 'WhatsApp'}</span>
          </a>
        </div>
      </section>

      {/* ── 8. TESTIMONIALS SLIDER ── */}
      <Testimonials />

      {/* ── 8. DELIVERY TIMELINE FOOTNOTE ── */}
      <section className="p-5 sm:p-6 bg-primary-50/70 rounded-3xl border border-primary-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center flex-shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-primary-950">
              {lang === 'sw' ? 'Uwasilishaji wa Siku Hiyo Hiyo Dar es Salaam' : 'Same-Day Delivery in Dar es Salaam'}
            </h4>
            <p className="text-[11px] text-primary-800">
              {lang === 'sw' ? 'Agiza kabla ya saa 6 mchana kupokea mzigo leo' : 'Orders before 12:00 PM dispatched same-day. Upcountry: 2-3 business days.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('delivery')}
          className="px-4 py-2 bg-white hover:bg-primary-50 text-primary-700 border border-primary-200 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          {lang === 'sw' ? 'Tazama Maeneo Yote ya Usafirishaji' : 'Check All Delivery Zones'}
        </button>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer className="pt-6 pb-20 lg:pb-8 border-t border-neutral-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo/wordmark.png" alt="ED Retail" className="h-7 w-auto" />
            <span className="text-xs text-neutral-400">|</span>
            <span className="text-xs font-bold text-neutral-600">
              {lang === 'sw' ? `Msambazaji Rasmi: ${distributor.name}` : `Authorized Distributor: ${distributor.name}`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ReferralShareButton />
          </div>
        </div>

        <p className="text-[11px] text-neutral-400 text-center sm:text-left">
          © {new Date().getFullYear()} ED Retail · {distributor.name}. All genuine Edmark product trademarks belong to Edmark International.
        </p>
      </footer>
    </div>
  );
}
