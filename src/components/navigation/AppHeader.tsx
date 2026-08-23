import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, ShieldCheck, ArrowLeft, Sparkles, Globe, MapPin, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { CartBadge } from '../CartBadge';
import { useLang } from '../../context/LangContext';
import { Link } from 'react-router-dom';

export type ScreenId = 'home' | 'products' | 'goals' | 'delivery' | 'distributor' | 'favourites' | 'help';

interface AppHeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onOpenFlyerStudio?: () => void;
  onOpenDistributorAuth?: () => void;
  onOpenBackOffice?: () => void;
  onOpenStoreLinkModal?: () => void;
}

export function AppHeader({
  currentScreen,
  onNavigate,
  onOpenCart,
  searchValue = '',
  onSearchChange,
  onOpenFlyerStudio,
  onOpenStoreLinkModal,
}: AppHeaderProps) {
  const { lang, setLang } = useLang();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const favouritesCount = useCartStore((s) => s.favourites.length);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const attributionDays = useDistributorStore((s) => s.getAttributionExpiryDays());
  const clearAttribution = useDistributorStore((s) => s.clearAttribution);

  const navLinks: { id: ScreenId; labelEn: string; labelSw: string }[] = [
    { id: 'home', labelEn: 'Home', labelSw: 'Mwanzo' },
    { id: 'products', labelEn: 'Products', labelSw: 'Bidhaa' },
    { id: 'goals', labelEn: 'Goal Finder', labelSw: 'Lengo & Pakiti' },
    { id: 'delivery', labelEn: 'Delivery Info', labelSw: 'Uwasilishaji' },
    { id: 'distributor', labelEn: 'Distributor', labelSw: 'Msambazaji' },
    { id: 'help', labelEn: 'Orders & Help', labelSw: 'Maagizo & Msaada' },
  ];

  const handleResetToCentral = () => {
    clearAttribution();
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      url.searchParams.delete('distributor');
      url.searchParams.delete('dist');
      window.history.replaceState({}, '', url.pathname);
    } catch {
      // safe fallback
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo or Back Button if in sub-screen */}
        <div className="flex items-center gap-3">
          {currentScreen !== 'home' && (
            <button
              id="header-back-btn"
              onClick={() => onNavigate('home')}
              className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors sm:hidden"
              aria-label={lang === 'sw' ? 'Rudi Nyumbani' : 'Back to Home'}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 focus:outline-none text-left cursor-pointer"
          >
            <img
              src="/logo/wordmark.png"
              alt="ED Retail"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </button>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60">
          {navLinks.map((link) => {
            const isActive = currentScreen === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => onNavigate(link.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-primary-600 shadow-xs font-bold'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
              >
                {lang === 'sw' ? link.labelSw : link.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Flyer Studio, Store Link, Search, Favourites, Language, Cart, Admin) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1-Tap Flyer Studio Generator button */}
          {onOpenFlyerStudio && (
            <button
              id="header-flyer-studio-btn"
              onClick={onOpenFlyerStudio}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold shadow-2xs transition-all"
              title={lang === 'sw' ? 'Tengeneza Picha ya WhatsApp Status' : 'Generate WhatsApp Status Flyer'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'sw' ? 'Picha za Status' : 'Flyer Studio'}</span>
            </button>
          )}

          {/* Distributor Storefront link button */}
          {onOpenStoreLinkModal && !distributor.isCentral && (
            <button
              id="header-store-link-btn"
              onClick={onOpenStoreLinkModal}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs transition-all"
              title="Share My Storefront"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>@{distributor.slug}</span>
            </button>
          )}

          {/* Desktop inline search */}
          {onSearchChange && (
            <div className="hidden xl:flex items-center relative w-44">
              <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400 pointer-events-none" />
              <input
                id="desktop-header-search"
                type="text"
                value={searchValue}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentScreen !== 'products' && e.target.value.trim().length > 0) {
                    onNavigate('products');
                  }
                }}
                placeholder={lang === 'sw' ? 'Tafuta bidhaa...' : 'Search products...'}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-100 border border-neutral-200 rounded-lg text-xs text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-200 transition-all"
              />
            </div>
          )}

          {/* Favourites button */}
          <motion.button
            id="favourites-toggle-btn"
            onClick={() => onNavigate('favourites')}
            className={`relative p-2 rounded-xl transition-colors ${
              currentScreen === 'favourites'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
            whileTap={{ scale: 0.92 }}
            aria-label={lang === 'sw' ? 'Vipendwa vyangu' : 'My Favourites'}
          >
            <Heart
              className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                favouritesCount > 0 && currentScreen === 'favourites' ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
            {favouritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {favouritesCount}
              </span>
            )}
          </motion.button>

          {/* Language toggle */}
          <button
            id="language-switch-btn"
            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
            className="px-2 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-colors border border-neutral-200/50"
            aria-label={lang === 'en' ? 'Badilisha kwenda Kiswahili' : 'Switch to English'}
          >
            {lang === 'en' ? 'SW' : 'EN'}
          </button>

          {/* Cart button */}
          <motion.button
            id="header-cart-btn"
            className="relative p-2 sm:px-3 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            onClick={onOpenCart}
            whileTap={{ scale: 0.92 }}
            aria-label={lang === 'sw' ? `Kikapu chenye bidhaa ${totalItems}` : `Cart with ${totalItems} items`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
            <span className="hidden sm:inline text-xs font-bold">
              {lang === 'sw' ? 'Mkoba' : 'Cart'}
            </span>
            <CartBadge count={totalItems} />
          </motion.button>

          {/* Distributor Leader Portal / Back-Office Cockpit Trigger */}
          <button
            id="distributor-auth-trigger-btn"
            onClick={() => onNavigate('distributor')}
            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              currentScreen === 'distributor'
                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                : isAdminAuthenticated
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs hover:bg-emerald-800'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200'
            }`}
            title={
              isAdminAuthenticated
                ? `${distributor.name} • ${lang === 'sw' ? 'Fungua Ofisi ya Msambazaji (Full Page)' : 'Leader Back-Office (Full Page)'}`
                : (lang === 'sw' ? 'Ofisi ya Msambazaji (Leader PIN)' : 'Distributor Leader Portal')
            }
            aria-label="Distributor Account & Back-Office"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="hidden xl:inline text-[11px] font-extrabold">
              {isAdminAuthenticated ? (lang === 'sw' ? 'Ofisi Yangu' : 'Back-Office') : (lang === 'sw' ? 'Msambazaji' : 'Distributor')}
            </span>
          </button>

          {/* Direct Admin link if verified */}
          <Link
            to="/admin"
            id="admin-portal-link"
            className="hidden sm:flex items-center gap-1 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
            title="Distributor Admin Portal"
            aria-label="Distributor Admin Portal"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Hub</span>
          </Link>
        </div>
      </div>

      {/* ── DYNAMIC CONTEXT BAR: REPLICATED STOREFRONT VS. CENTRAL NETWORK HUB ── */}
      <div className={`px-4 py-1.5 text-xs border-t transition-colors ${
        !distributor.isCentral
          ? 'bg-emerald-50/90 border-emerald-200/80 text-emerald-950'
          : 'bg-neutral-100/90 border-neutral-200/70 text-neutral-700'
      }`}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {!distributor.isCentral ? (
            <>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-bold truncate">
                    {lang === 'sw' ? 'Duka Rasmi la Msambazaji:' : 'Shopping with:'} {distributor.name}
                  </span>
                  <span className="text-[10px] text-emerald-700 hidden sm:inline">
                    ({distributor.rank || 'Certified Coach'} · {distributor.city})
                  </span>
                  {attributionDays > 0 && (
                    <span className="hidden md:inline-block px-2 py-0.2 bg-emerald-200/60 text-emerald-900 text-[10px] rounded-full font-semibold">
                      {attributionDays} {lang === 'sw' ? 'siku zilizobaki' : 'days left'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleResetToCentral}
                  className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                  title="Switch to Central Head Office"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{lang === 'sw' ? 'Rudi Makao Makuu' : 'Switch to Central'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm">🇹🇿</span>
                <span className="font-semibold text-[11px] sm:text-xs">
                  {lang === 'sw'
                    ? 'Kitovu Kikuu cha ED Retail Tanzania · Mtandao Rasmi wa Wasambazaji'
                    : 'ED Retail Tanzania Central Hub · Authorized National Distribution'}
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('regional-distributor-locator');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      onNavigate('home');
                      setTimeout(() => {
                        document.getElementById('regional-distributor-locator')?.scrollIntoView({ behavior: 'smooth' });
                      }, 250);
                    }
                  }}
                  className="text-[11px] font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-primary-600" />
                  <span>{lang === 'sw' ? 'Tafuta Msambazaji wa Mkoani' : 'Find Local Leader'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

