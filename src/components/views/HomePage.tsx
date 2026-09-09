import { useState, useMemo, useEffect } from 'react';
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
  UserCheck,
  Target,
  Flame,
} from 'lucide-react';
import { HeroCarousel } from '../HeroCarousel';
import { NativeAdBanner } from '../ads/NativeAdBanner';
import { CATEGORIES, Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { supabase } from '../../lib/supabase';
import { fetchPublishedFlyers, type PublishedFlyer } from '../../lib/flyers';
import { formatPrice, formatUsd, getActiveWhatsAppLink } from '../../utils/whatsappCompiler';
import { useLang } from '../../context/LangContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { ScreenId } from '../navigation/AppHeader';
import { EdIcon } from '../brand/EdIcon';

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
}: HomePageProps) {
  const { lang, t } = useLang();
  const sw = lang === 'sw';
  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const { status, greetingName } = useCustomerAuth();

  const liveProducts = getEffectiveProducts();

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const cartItems = useCartStore((s) => s.items);
  const toggleFavourite = useCartStore((s) => s.toggleFavourite);
  const favourites = useCartStore((s) => s.favourites);

  /* ── DATA TRUTH: real best sellers ──────────────────────────────
   * The public_best_sellers RPC returns ranked {product_id, total_units}
   * aggregates from real sales (never PII). When it yields fewer than 2
   * qualifying products (e.g. a young store) the section falls back to an
   * HONEST "Featured products" label over the first catalog items —
   * never a fabricated popularity claim. */
  const [bestSellerIds, setBestSellerIds] = useState<string[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc('public_best_sellers', { _limit: 4 });
        if (cancelled) return;
        if (error) {
          setBestSellerIds([]);
          return;
        }
        const ids = (data ?? [])
          .map((row: { product_id: string; total_units: number | string }) => ({
            id: row.product_id as string,
            units: Number(row.total_units) || 0,
          }))
          .filter((e: { id: string; units: number }) => e.units > 0)
          .sort((a: { units: number }, b: { units: number }) => b.units - a.units)
          .map((e: { id: string }) => e.id);
        setBestSellerIds(ids);
      } catch {
        if (!cancelled) setBestSellerIds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isRealRanking = !!bestSellerIds && bestSellerIds.length >= 2;
  const rankProducts = useMemo(() => {
    if (isRealRanking) {
      const byId = new Map(liveProducts.map((p) => [p.id, p]));
      const ranked = bestSellerIds!.map((id) => byId.get(id)).filter(Boolean) as Product[];
      // RPC may reference products retired from the live catalog — top up so
      // the rail never renders thin, but keep real ranking order first.
      for (const p of liveProducts) {
        if (ranked.length >= 4) break;
        if (!ranked.some((r) => r.id === p.id)) ranked.push(p);
      }
      return ranked.slice(0, 4);
    }
    return liveProducts.slice(0, 4);
  }, [isRealRanking, bestSellerIds, liveProducts]);

  /* ── Published flyers (RLS: published only, real signed renders) ── */
  const [flyers, setFlyers] = useState<PublishedFlyer[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedFlyers()
      .then((rows) => {
        if (!cancelled) setFlyers(rows.slice(0, 6));
      })
      .catch(() => {
        // RLS-safe failure: the section simply doesn't render. The full
        // gallery screen surfaces real errors when the customer opens it.
        if (!cancelled) setFlyers([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-7 sm:space-y-9 animate-fadeIn">
      {/* ── 1. CONTEXT STRIP (leader + identity-aware greeting) ── */}
      <section className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-neutral-600 flex items-center gap-1.5 flex-wrap min-w-0">
          <UserCheck className="w-3.5 h-3.5 text-[#0E6B52] shrink-0" />
          <span className="truncate">
            {sw ? `Mwakilishi: ${distributor.name} · ${distributor.city}` : `Leader: ${distributor.name} · ${distributor.city}`}
          </span>
          <span className="text-neutral-300">•</span>
          <span className="text-[#0E6B52] font-bold shrink-0">100% Genuine Edmark</span>
          {status === 'authenticated' && greetingName && (
            <>
              <span className="text-neutral-300">•</span>
              <span className="text-neutral-700 font-bold">
                {sw ? `Habari, ${greetingName}` : `Hi, ${greetingName}`}
              </span>
            </>
          )}
        </p>

        <a
          href={getActiveWhatsAppLink(
            `Habari ${distributor.name}, ninahitaji ushauri wa kitaalamu kuhusu bidhaa za Edmark:`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 bg-[#E7F4EE] hover:bg-[#CDE9DE] text-[#0E6B52] border border-emerald-300/80 rounded-xl text-xs font-black transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer active:scale-98"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden xs:inline sm:inline">{sw ? 'Ushauri' : 'Free Advice'}</span>
        </a>
      </section>

      {/* ── 2. SHOP BY CATEGORY — compact discovery rail ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black text-neutral-900">
            {sw ? 'Chagua kwa Makundi' : 'Shop by Category'}
          </h2>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-[#123B6D] hover:text-[#0D315D] flex items-center gap-1 cursor-pointer"
          >
            <span>{sw ? 'Zote' : 'See all'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal rail — scrollable on mobile, roomy grid on desktop.
            Keyboard reachable: it is a native overflow container with
            focusable buttons inside (Tab/arrow scrolling works natively). */}
        <div
          className="flex gap-2.5 sm:grid sm:grid-cols-3 overflow-x-auto pb-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
          role="list"
          aria-label={sw ? 'Makundi ya bidhaa' : 'Product categories'}
        >
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const count = liveProducts.filter((p) => p.category === cat.id).length;
            const tint: Record<string, string> = {
              'p4-slimming': 'bg-blue-50 text-blue-700 border-blue-100',
              'health-wellness': 'bg-emerald-50 text-emerald-700 border-emerald-100',
              'lifestyle-beverages': 'bg-amber-50 text-amber-700 border-amber-100',
            };
            return (
              <button
                key={cat.id}
                role="listitem"
                onClick={() => onNavigate('products')}
                className="group flex flex-col items-center gap-1.5 w-[92px] sm:w-auto shrink-0 sm:shrink py-3 px-2 rounded-2xl bg-white border border-neutral-200/80 hover:border-[#123B6D]/40 hover:bg-neutral-50 transition-all cursor-pointer"
                aria-label={`${t(cat.label)} — ${count} ${sw ? 'bidhaa' : count === 1 ? 'product' : 'products'}`}
              >
                <span
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-active:scale-95 ${tint[cat.id] || 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}
                >
                  {Icon ? <Icon className="w-4.5 h-4.5" /> : <EdIcon name="leaf" className="w-4.5 h-4.5" />}
                </span>
                <span className="text-[11px] font-extrabold text-neutral-900 leading-tight text-center line-clamp-2">
                  {t(cat.label)}
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold leading-none">
                  {count} {sw ? 'bidhaa' : count === 1 ? 'item' : 'items'}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. HERO — canonical Edmark artwork, clean treatment ── */}
      <section className="-mx-4 sm:mx-0">
        <HeroCarousel onNavigate={onNavigate} />
      </section>

      {/* ── 4. TOP SELLING / FEATURED — real ranking, honest fallback ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-neutral-900 flex items-center gap-1.5">
              {isRealRanking && <Flame className="w-4 h-4 text-amber-500" />}
              {isRealRanking
                ? sw
                  ? 'Bidhaa Zinazouzwa Zaidi'
                  : 'Top selling'
                : sw
                  ? 'Bidhaa Zilizoteuliwa'
                  : 'Featured products'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isRealRanking
                ? sw
                  ? 'Kulingana na mauzo halisi ya hivi karibuni'
                  : 'Based on real recent orders'
                : sw
                  ? 'Chagua kutoka katalogi yetu ya Edmark'
                  : 'Handpicked from our Edmark catalog'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="text-xs font-black text-[#123B6D] hover:text-[#0D315D] flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{sw ? 'Zote' : 'See all'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile: horizontal rail with peeking next card; desktop: 4-col grid */}
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 scrollbar-hide"
          role="list"
          aria-label={isRealRanking ? (sw ? 'Bidhaa zinazouzwa zaidi' : 'Top selling products') : sw ? 'Bidhaa zilizoteuliwa' : 'Featured products'}
        >
          {rankProducts.map((product) => {
            const inCart = cartItems.find((i) => i.id === product.id);
            const qty = inCart?.quantity ?? 0;
            const isFav = favourites.includes(product.id);

            return (
              <div
                key={product.id}
                role="listitem"
                className="bg-white rounded-2xl border border-neutral-200/90 p-3 shadow-2xs flex flex-col w-[152px] sm:w-auto shrink-0 sm:shrink hover:shadow-md hover:border-[#123B6D]/40 transition-all relative group"
              >
                {/* Favourite trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavourite(product.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-xs transition-colors z-10 cursor-pointer ${
                    isFav
                      ? 'bg-rose-50 text-rose-600 border-rose-200'
                      : 'bg-white/90 text-neutral-400 hover:text-neutral-700 border-neutral-200 shadow-2xs'
                  }`}
                  aria-label={isFav ? (sw ? 'Ondoa kwenye vipendwa' : 'Remove from favourites') : sw ? 'Weka kwenye vipendwa' : 'Save to favourites'}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>

                <div onClick={() => onSelectProduct(product)} className="cursor-pointer space-y-2">
                  <div className="relative bg-neutral-50 rounded-xl h-32 flex items-center justify-center p-2.5 border border-neutral-200/60 overflow-hidden">
                    {product.badge && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/95 text-[#123B6D] font-extrabold text-[8px] rounded-md border border-[#C3D3E7] shadow-2xs uppercase tracking-tight">
                        {product.badge}
                      </span>
                    )}
                    <img
                      src={product.image}
                      alt={t(product.name)}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="text-[11px] sm:text-xs font-extrabold text-neutral-900 leading-snug line-clamp-2 min-h-[2rem]">
                    {t(product.name)}
                  </h3>
                </div>

                <div className="pt-2 mt-auto flex items-end justify-between gap-1">
                  <div className="min-w-0">
                    <span className="text-xs font-black text-neutral-900 block leading-tight">
                      {formatPrice(product.price)} <span className="text-[9px] text-neutral-500 font-semibold">TZS</span>
                    </span>
                    <span className="text-[9px] text-neutral-400">({formatUsd(product.priceUsd)})</span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addItem({ ...product, quantity: 1 })}
                      disabled={!product.inStock}
                      className="px-2.5 py-1.5 bg-[#123B6D] hover:bg-[#0D315D] disabled:bg-neutral-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black shadow-2xs transition-colors flex items-center cursor-pointer shrink-0"
                      aria-label={sw ? `Weka ${t(product.name)} kwenye mkoba` : `Add ${t(product.name)} to cart`}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  ) : (
                    <div className="flex items-center border border-[#123B6D]/30 bg-[#F0F4F9] rounded-xl p-0.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="w-5 h-5 bg-white rounded-lg flex items-center justify-center text-[#123B6D] font-black text-xs cursor-pointer shadow-2xs"
                        aria-label={sw ? 'Punguza' : 'Decrease quantity'}
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#123B6D]">{qty}</span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="w-5 h-5 bg-[#123B6D] text-white rounded-lg flex items-center justify-center font-black text-xs cursor-pointer shadow-2xs"
                        aria-label={sw ? 'Ongeza' : 'Increase quantity'}
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

      {/* ── 5. GOAL FINDER — signature EdRetail discovery module ── */}
      <section>
        <button
          onClick={() => onNavigate('goals')}
          className="w-full text-left bg-gradient-to-r from-[#0E6B52] to-[#0A5540] rounded-3xl p-5 sm:p-6 flex items-center justify-between gap-4 hover:from-[#0C5D47] hover:to-[#094A38] transition-colors cursor-pointer group shadow-sm"
          aria-label={sw ? 'Fungua Kipataji Lengo' : 'Open Goal Finder'}
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className="w-11 h-11 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-white" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                {sw ? 'Pata kinacholingana na lengo lako' : 'Find what fits your goal'}
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 mt-0.5 leading-snug">
                {sw
                  ? 'Chagua lengo lako la afya — tutaongoza katalogi.'
                  : 'Tell us your wellness goal — we guide the catalog.'}
              </p>
            </div>
          </div>
          <span className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#0E6B52] rounded-xl text-xs font-black shrink-0 group-hover:bg-emerald-50 transition-colors">
            {sw ? 'Fungua' : 'Explore'}
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <ArrowRight className="w-5 h-5 text-white sm:hidden shrink-0" />
        </button>
      </section>

      {/* ── 6. LATEST FLYERS — published-only discovery rail ── */}
      {flyers.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-black text-neutral-900 flex items-center gap-1.5">
                <EdIcon name="flyer" className="w-4 h-4 text-[#123B6D]" />
                {sw ? 'Kampeni Mpya' : 'Latest flyers'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {sw ? 'Ofa rasmi kutoka kwa wasambazaji wetu' : 'Real campaigns from our distributors'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('flyers')}
              className="text-xs font-black text-[#123B6D] hover:text-[#0D315D] flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>{sw ? 'Zote' : 'See all'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide"
            role="list"
            aria-label={sw ? 'Kampeni zilizochapishwa' : 'Published flyers'}
          >
            {flyers.map((f) => (
              <button
                key={f.id}
                role="listitem"
                onClick={() => onNavigate('flyers')}
                className="shrink-0 w-[136px] text-left group cursor-pointer"
                aria-label={`${f.title} — ${f.distributor.store_name}`}
              >
                <div className="w-[136px] h-[180px] rounded-2xl overflow-hidden border border-neutral-200/90 bg-neutral-100 shadow-2xs group-hover:shadow-md group-hover:border-[#123B6D]/40 transition-all">
                  <img
                    src={f.renderUrl}
                    alt={`${f.title} — campaign flyer`}
                    loading="lazy"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <p className="text-[11px] font-extrabold text-neutral-900 mt-1.5 line-clamp-1">{f.title}</p>
                <p className="text-[10px] text-neutral-500 line-clamp-1">{f.distributor.store_name}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── 7. SPONSORED SLOT (real placements only) ── */}
      <NativeAdBanner placement="storefront_hero" />

      {/* ── 8. TRUST PANEL ── */}
      <section className="bg-white rounded-3xl border border-neutral-200/90 p-5 sm:p-6 shadow-2xs">
        <div className="text-[11px] font-black text-neutral-400 uppercase tracking-wider mb-3.5">
          {sw ? 'KWANINI UNUNUE NASI' : 'WHY SHOP WITH US'}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E7F4EE] text-[#0E6B52] flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {sw ? '100% Asili & Halisi' : '100% Genuine Edmark'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {sw ? 'Stika & mihuri halisi ya kiwandani' : 'Factory-sealed products'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E7F4EE] text-[#0E6B52] flex items-center justify-center shrink-0 shadow-2xs">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {sw ? 'Usafirishaji wa Haraka' : 'Fast Delivery'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {sw ? 'Dar es Salaam & mikoani yote' : 'Nationwide delivery options'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F8EFD9] text-[#C89D4D] flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-neutral-900 leading-tight">
                {sw ? 'Mwongozo wa Kitaalamu' : 'Certified Guidance'}
              </h4>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                {sw ? 'Msaada wa moja kwa moja kutoka kwa kiongozi' : 'Direct wellness support'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="pb-2" />
    </div>
  );
}
