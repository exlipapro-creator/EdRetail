import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { ShoppingCart, ShieldCheck, ArrowLeft, LogOut, UserRound, Search, X } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useDistributorStore } from '../../store/distributorStore';
import { CartBadge } from '../CartBadge';
import { useLang } from '../../context/LangContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useCustomerAuth } from '../../context/CustomerAuthContext';

export type ScreenId =
  | 'home'
  | 'products'
  | 'goals'
  | 'delivery'
  | 'distributor-login'
  | 'favourites'
  | 'help'
  | 'flyers'
  | 'legal';

interface AppHeaderProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onOpenCustomerAuth?: () => void;
  /** Fired when the global search gains focus (may navigate to Products). */
  onSearchFocus?: () => void;
  /** Where header Back should return (origin screen when search-driven). */
  backTarget?: ScreenId;
}

export function AppHeader({
  currentScreen,
  onNavigate,
  onOpenCart,
  onOpenCustomerAuth,
  searchValue = '',
  onSearchChange,
  onSearchFocus,
  backTarget = 'home',
}: AppHeaderProps) {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);
  const { status, greetingName } = useCustomerAuth();

  // Contextual back label — honest about the destination instead of a hardcoded
  // "Home". Direct Products navigation (bottom nav, category links) still
  // returns Home via the default.
  const backLabel =
    backTarget === 'goals'
      ? (lang === 'sw' ? 'Rudi Malengo' : 'Back to Goals')
      : backTarget === 'delivery'
        ? (lang === 'sw' ? 'Rudi Uwasilishaji' : 'Back to Delivery')
        : (lang === 'sw' ? 'Rudi Nyumbani' : 'Back to Home');

  // The store flag is UI-only and never persisted; re-derive it from the real
  // Supabase session AND the server-side role on every header mount. A plain
  // session alone no longer flips the portal state — a CUSTOMER session must
  // not be presented as a distributor (role gate mirrors the server RLS).
  useEffect(() => {
    let cancelled = false;
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (cancelled) return;
        if (!data.session) {
          setAdminAuthenticated(false);
          return;
        }
        try {
          const { data: roleRow } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.session.user.id)
            .maybeSingle();
          const r = roleRow?.role;
          setAdminAuthenticated(r === 'distributor' || r === 'super_admin');
        } catch {
          setAdminAuthenticated(false);
        }
      })
      .catch(() => {
        /* offline — leave current state */
      });
    return () => {
      cancelled = true;
    };
  }, [setAdminAuthenticated]);

  // Primary navigation stays focused on customer journeys. Secondary pages
  // (Orders & Help, Delivery Info, Become a Distributor) live in the footer,
  // and the Distributor Portal is the utility button on the right.
  const navLinks: { id: ScreenId; labelEn: string; labelSw: string }[] = [
    { id: 'home', labelEn: 'Home', labelSw: 'Mwanzo' },
    { id: 'products', labelEn: 'Products', labelSw: 'Bidhaa' },
    { id: 'goals', labelEn: 'Goal Finder', labelSw: 'Lengo & Pakiti' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-neutral-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo or Back Button if in sub-screen */}
        <div className="flex items-center gap-3">
          {currentScreen !== 'home' && currentScreen !== 'distributor-login' && (
            <button
              id="header-back-btn"
              onClick={() => onNavigate(backTarget)}
              className="p-2 -ml-1 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors sm:hidden cursor-pointer"
              aria-label={backLabel}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <button
            id="brand-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 focus:outline-none text-left cursor-pointer group"
          >
            <img
              src="/logo/wordmark.png"
              alt="ED Retail Tanzania"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black text-success-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-success-600 inline" />
                {lang === 'sw' ? 'Msambazaji Rasmi' : 'Authorized Distributor'}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium leading-none">
                {distributor.name}
              </span>
            </div>
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
                onClick={() => onNavigate(link.id)}
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

        {/* Right: Actions (Language Segmented Toggle, Cart, Distributor Portal) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Clean Segmented Language Switcher */}
          <div
            id="language-switch-btn"
            className="flex items-center p-0.5 bg-neutral-100 rounded-xl border border-neutral-200/90 select-none shadow-2xs"
          >
            <button
              type="button"
              onClick={() => setLang('sw')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                lang === 'sw'
                  ? 'bg-[#123B6D] text-white shadow-xs font-black'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
              }`}
              title="Kiswahili"
            >
              SW
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#123B6D] text-white shadow-xs font-black'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Cart button */}
          <motion.button
            id="header-cart-btn"
            className="relative p-2 sm:px-3.5 sm:py-2 bg-[#123B6D] hover:bg-[#0D315D] text-white rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            onClick={onOpenCart}
            whileTap={{ scale: 0.92 }}
            aria-label={lang === 'sw' ? `Mkoba chenye bidhaa ${totalItems}` : `Cart with ${totalItems} items`}
          >
            <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
            <span className="hidden sm:inline text-xs font-black tracking-tight">
              {lang === 'sw' ? 'Mkoba' : 'Cart'}
            </span>
            <CartBadge count={totalItems} />
          </motion.button>

          {/* Customer account control — state-aware, never a fake greeting.
              restoring → neutral icon; anonymous → Sign in; authenticated →
              first name (+ Sign out). */}
          {status === 'authenticated' ? (
            <div
              id="header-account-authenticated"
              className="flex items-center gap-1.5 p-1 pl-2 rounded-xl border border-primary-200 bg-primary-50"
              title={greetingName || undefined}
            >
              <span className="hidden sm:flex w-6 h-6 rounded-full bg-primary-600 text-white items-center justify-center text-[10px] font-black uppercase">
                {(greetingName || 'E').slice(0, 1)}
              </span>
              <span className="hidden md:inline text-xs font-black text-primary-800 max-w-[90px] truncate">
                {greetingName || (lang === 'sw' ? 'Akaunti' : 'Account')}
              </span>
              <button
                id="header-customer-signout-btn"
                onClick={async () => {
                  try {
                    await supabase.auth.signOut();
                  } catch {
                    // session may already be gone
                  }
                }}
                className="p-1.5 rounded-lg text-primary-800 hover:bg-primary-100 transition-colors cursor-pointer"
                aria-label={lang === 'sw' ? 'Toka' : 'Sign out'}
                title={lang === 'sw' ? 'Toka' : 'Sign out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="header-account-btn"
              onClick={onOpenCustomerAuth}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer bg-neutral-100/80 border-neutral-300 hover:bg-neutral-200 text-neutral-800"
              aria-label={lang === 'sw' ? 'Ingia kwenye akaunti' : 'Account sign in'}
              title={lang === 'sw' ? 'Ingia / Fungua akaunti' : 'Sign in / Create account'}
            >
              <UserRound className={`w-4 h-4 ${status === 'restoring' ? 'text-neutral-400' : 'text-neutral-600'}`} />
              <span className="text-xs font-black">
                {status === 'restoring' ? '' : lang === 'sw' ? 'Ingia' : 'Sign in'}
              </span>
            </button>
          )}
          {/* Distributor portal entry intentionally removed from the customer
              header — hidden access via the Goals 3-pull gesture only. An
              authenticated distributor's sign-out remains available below. */}

          {/* Sign Out — visible at ALL breakpoints when authenticated. Mobile
              has no other account surface (the portal link is sm+ only), so an
              authenticated distributor must still be able to end their session
              from their phone. */}
          {isAdminAuthenticated && (
            <button
              id="header-sign-out-btn"
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                } catch {
                  // session may already be gone; local cleanup still proceeds
                }
                useDistributorStore.setState({
                  isAdminAuthenticated: false,
                  currentProfile: useDistributorStore.getState().getActiveDistributor(),
                });
                navigate('/');
              }}
              className="flex min-h-[44px] items-center gap-1.5 p-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
              title={lang === 'sw' ? 'Toka (Sign Out)' : 'Sign Out'}
              aria-label={lang === 'sw' ? 'Toka (Sign Out)' : 'Sign Out'}
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-xs font-black">
                {lang === 'sw' ? 'Toka' : 'Sign Out'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Layer 3 — search as a first-class commerce primitive. Always visible,
          submits into the Products screen (the existing catalog search there
          powers matching; no invented backend search). */}
      <form
        id="header-search-form"
        onSubmit={(e) => {
          e.preventDefault();
          onNavigate('products');
        }}
        className="max-w-6xl mx-auto px-4 pb-2.5"
        role="search"
      >
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            id="header-search-input"
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onFocus={() => onSearchFocus?.()}
            placeholder={
              lang === 'sw'
                ? 'Tafuta bidhaa... (Shake Off, Spirulina, MRT)'
                : 'Search products... (Shake Off, Spirulina, MRT)'
            }
            aria-label={lang === 'sw' ? 'Tafuta bidhaa' : 'Search products'}
            className="w-full pl-10 pr-10 py-2.5 bg-neutral-100/80 border border-transparent focus:bg-white focus:border-[#123B6D]/50 focus:ring-2 focus:ring-[#123B6D]/10 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all"
          />
          {searchValue ? (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
              aria-label={lang === 'sw' ? 'Futa utafutaji' : 'Clear search'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </form>
    </header>
  );
}

