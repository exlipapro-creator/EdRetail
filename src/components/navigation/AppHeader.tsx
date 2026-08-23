import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, ShieldCheck, ArrowLeft, Sparkles, Globe } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { CartBadge } from '../CartBadge';
import { useLang } from '../../context/LangContext';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const favouritesCount = useCartStore((s) => s.favourites.length);
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);

  const navLinks: { id: ScreenId; labelEn: string; labelSw: string; isPortal?: boolean }[] = [
    { id: 'home', labelEn: 'Home', labelSw: 'Mwanzo' },
    { id: 'products', labelEn: 'Products', labelSw: 'Bidhaa' },
    { id: 'goals', labelEn: 'Goal Finder', labelSw: 'Lengo & Pakiti' },
    { id: 'delivery', labelEn: 'Delivery Info', labelSw: 'Uwasilishaji' },
    { id: 'distributor', labelEn: 'Distributor', labelSw: 'Msambazaji', isPortal: true },
    { id: 'help', labelEn: 'Orders & Help', labelSw: 'Maagizo & Msaada' },
  ];

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
        <nav className="hidden lg:flex items-center gap-1 bg-neutral-100/90 p-1 rounded-xl border border-neutral-200/80">
          {navLinks.map((link) => {
            const isActive = currentScreen === link.id;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => {
                  if (link.isPortal) {
                    navigate('/portal');
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#123B6D] shadow-xs font-black border border-neutral-200/60'
                    : 'text-neutral-600 hover:text-[#123B6D] hover:bg-white/50'
                }`}
              >
                {lang === 'sw' ? link.labelSw : link.labelEn}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions (Search shortcut on mobile, Favourites, Language, Cart, Distributor) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile search icon trigger */}
          <button
            id="mobile-search-btn"
            onClick={() => onNavigate('products')}
            className="flex sm:hidden p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
            aria-label={lang === 'sw' ? 'Tafuta bidhaa' : 'Search products'}
          >
            <Search className="w-4 h-4" />
          </button>

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

          {/* Favourites button - visible on tablet and desktop */}
          <motion.button
            id="favourites-toggle-btn"
            onClick={() => onNavigate('favourites')}
            className={`hidden sm:flex relative p-2 rounded-xl transition-colors ${
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

          {/* Language toggle with clear label */}
          <button
            id="language-switch-btn"
            onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-xs font-bold text-neutral-800 transition-colors border border-neutral-200/50 flex items-center gap-1"
            aria-label={lang === 'en' ? 'Badilisha kwenda Kiswahili' : 'Switch to English'}
            title={lang === 'en' ? 'Switch language to Swahili' : 'Badilisha lugha kwenda Kiingereza'}
          >
            <span className="text-[10px] text-neutral-500 font-normal">Lang:</span>
            <span className="font-extrabold">{lang === 'en' ? 'SW' : 'EN'}</span>
          </button>

          {/* Cart button */}
          <motion.button
            id="header-cart-btn"
            className="relative p-2 sm:px-3.5 sm:py-2 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            onClick={onOpenCart}
            whileTap={{ scale: 0.92 }}
            aria-label={lang === 'sw' ? `Kikapu chenye bidhaa ${totalItems}` : `Cart with ${totalItems} items`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
            <span className="hidden sm:inline text-xs font-black tracking-tight">
              {lang === 'sw' ? 'Mkoba' : 'Cart'}
            </span>
            <CartBadge count={totalItems} />
          </motion.button>

          {/* Distributor Portal Link */}
          <Link
            to="/portal"
            id="distributor-portal-link"
            className="hidden sm:flex p-2 px-3 rounded-xl border border-emerald-800/40 bg-emerald-900/10 hover:bg-emerald-900/20 text-emerald-900 transition-all items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Distributor Back-Office"
            aria-label="Distributor Back-Office"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-black">
              {isAdminAuthenticated ? (lang === 'sw' ? 'Ofisi Yangu' : 'My Portal') : (lang === 'sw' ? 'Wasambazaji' : 'Distributor')}
            </span>
          </Link>

          {/* Super Admin Link */}
          <Link
            to="/admin"
            id="admin-portal-link"
            className="hidden lg:flex p-2 px-2.5 rounded-xl border border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-all items-center gap-1 cursor-pointer text-xs font-bold"
            title="Super Admin"
            aria-label="Super Admin"
          >
            <span className="text-stone-500 font-bold">Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

