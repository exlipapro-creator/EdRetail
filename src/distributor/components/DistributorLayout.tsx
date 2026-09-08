import { ReactNode, Suspense, lazy, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Package,
  TrendingUp,
  Users,
  CreditCard,
  Store,
  User,
  LogOut,
  Menu,
  X,
  Globe,
  ExternalLink,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';
import { can, Permission } from '../../lib/permissions';
import { LogOfflineSaleModal } from '../../components/distributor/LogOfflineSaleModal';
import { EdIcon } from '../../components/brand/EdIcon';

// Flyer Studio is distributor functionality: it lives inside the authenticated
// portal (Store & Account) and is no longer exposed on the public storefront.
const FlyerStudioModal = lazy(() =>
  import('../../components/marketing/FlyerStudioModal').then((m) => ({ default: m.FlyerStudioModal }))
);

interface DistributorLayoutProps {
  children: ReactNode;
}

/* ── Primary destinations (sidebar on desktop, Home/Sales/Inventory/Goals on mobile bottom nav) ──
 * Every destination is gated by the centralized permission model; the portal
 * is distributor-scoped, so this currently allows the full operations set. */
const PRIMARY_NAV: Array<{ to: string; icon: typeof LayoutDashboard; label: { en: string; sw: string }; permission: Permission }> = [
  { to: '/portal/dashboard', icon: LayoutDashboard, label: { en: 'Overview', sw: 'Muhtasari' }, permission: 'MANAGE_OWN_SALES' },
  { to: '/portal/ledger', icon: Receipt, label: { en: 'Sales', sw: 'Mauzo' }, permission: 'MANAGE_OWN_SALES' },
  { to: '/portal/inventory', icon: Package, label: { en: 'Inventory', sw: 'Stoo' }, permission: 'MANAGE_OWN_INVENTORY' },
  { to: '/portal/goals', icon: TrendingUp, label: { en: 'Goals', sw: 'Malengo' }, permission: 'VIEW_OWN_GOALS' },
  { to: '/portal/crm', icon: Users, label: { en: 'CRM', sw: 'CRM' }, permission: 'VIEW_OWN_CRM' },
  { to: '/portal/payments', icon: CreditCard, label: { en: 'Payments', sw: 'Malipo' }, permission: 'MANAGE_PAYMENT_ACCOUNT' },
];

const SECONDARY_NAV: Array<{ to: string; icon: typeof LayoutDashboard; label: { en: string; sw: string }; permission: Permission }> = [
  { to: '/portal/storefront', icon: Store, label: { en: 'Storefront', sw: 'Duka' }, permission: 'MANAGE_OWN_STORE' },
  { to: '/portal/profile', icon: User, label: { en: 'Profile', sw: 'Wasifu' }, permission: 'VIEW_OWN_PROFILE' },
];

const ALLOWED = (item: { permission: Permission }) => can('DISTRIBUTOR', item.permission);

function NavItem({
  to,
  icon: Icon,
  label,
  onClick,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors outline-none ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

export function DistributorLayout({ children }: DistributorLayoutProps) {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();

  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const logoutDistributor = useDistributorStore((s) => s.logoutDistributor);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showFlyerStudio, setShowFlyerStudio] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const t = (s: { en: string; sw: string }) => s[lang];

  // Sign out terminates the REAL Supabase session first — clearing only the
  // local store would leave the session in localStorage and the login page's
  // getSession() effect would immediately sign the user back in.
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // session may already be gone; local cleanup still proceeds
    }
    logoutDistributor();
    setAdminAuthenticated(false);
    navigate('/portal', { replace: true });
  };

  const handleCopyStoreLink = () => {
    const url = `${window.location.origin}/@${distributor.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <Link to="/portal/dashboard" className="flex items-center gap-2 min-w-0">
            <img src="/logo/wordmark.png" alt="ED Retail" className="h-7 w-auto" />
          </Link>
        </div>

        {/* Active distributor */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-md bg-gray-50 border border-gray-200">
            <img
              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
              alt={distributor.name}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 bg-white shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate flex items-center gap-1">
                {distributor.name}
                {distributor.isVerified && <CheckCircle2 className="w-3 h-3 text-success shrink-0" />}
              </p>
              <p className="text-[11px] text-gray-400 truncate">{distributor.city}</p>
            </div>
            <button
              onClick={handleCopyStoreLink}
              title={copiedLink ? 'Copied' : `Copy store link /@${distributor.slug}`}
              aria-label={copiedLink ? 'Store link copied' : `Copy store link /@${distributor.slug}`}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors outline-none"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Primary navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" aria-label="Distributor sections">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {lang === 'sw' ? 'Biashara' : 'Operations'}
          </p>
          {PRIMARY_NAV.filter(ALLOWED).map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.label)} />
          ))}

          <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {lang === 'sw' ? 'Duka & Akaunti' : 'Store & Account'}
          </p>
          {SECONDARY_NAV.filter(ALLOWED).map((item) => (
            <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.label)} />
          ))}
          <button
            onClick={() => setShowFlyerStudio(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors outline-none"
          >
            <EdIcon name="flyer" className="w-4 h-4 shrink-0 text-primary-600" />
            <span className="truncate">{lang === 'sw' ? 'Picha za Status' : 'Flyer Studio'}</span>
          </button>
        </nav>

        {/* Bottom: support + sign out */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-0.5">
          <a
            href="mailto:support@edretail.tz"
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors outline-none"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>{lang === 'sw' ? 'Msaada' : 'Help & Support'}</span>
          </a>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors outline-none"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{lang === 'sw' ? 'Toka' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ═══ DESKTOP TOP CONTEXT BAR ═══ */}
      <div className="hidden md:flex fixed top-0 right-0 left-60 z-20 h-14 items-center justify-end gap-2 bg-white/90 backdrop-blur border-b border-gray-200 px-6">
        <button
          onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors outline-none"
          aria-label="Toggle language"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'sw' ? 'English' : 'Kiswahili'}
        </button>
        <Link
          to="/"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors outline-none"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          {lang === 'sw' ? 'Duka' : 'View Store'}
        </Link>
      </div>

      {/* ═══ MOBILE TOP BAR ═══ (fixed so content padding is exact — a sticky
          bar plus pt-14 on <main> created a double 56px gap on mobile) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <Link to="/portal/dashboard" className="flex items-center gap-2 min-w-0">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-6 w-auto" />
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors outline-none"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ═══ MOBILE MENU SHEET ═══ */}
      {/* z-50: must sit ABOVE the z-40 bottom nav and top bar so the drawer's
          fixed Sign Out footer can never be covered by persistent chrome. */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMobileMenuOpen(false)}>
          <div
            className="w-72 h-full bg-white border-r border-gray-200 pt-14 flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Portal menu"
          >
            {/* Scrollable navigation region — the only scrolling part of the drawer */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 min-h-0">
              <div className="px-0 py-3 border-b border-gray-100 flex items-center gap-2.5">
                <img
                  src={distributor.avatarUrl || '/logo/distributor-circle.png'}
                  alt={distributor.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 bg-white"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{distributor.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">@{distributor.slug}</p>
                </div>
              </div>

              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {lang === 'sw' ? 'Biashara' : 'Operations'}
              </p>
              {PRIMARY_NAV.filter(ALLOWED).map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.label)} onClick={() => setMobileMenuOpen(false)} />
              ))}

              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {lang === 'sw' ? 'Duka & Akaunti' : 'Store & Account'}
              </p>
              {SECONDARY_NAV.filter(ALLOWED).map((item) => (
                <NavItem key={item.to} to={item.to} icon={item.icon} label={t(item.label)} onClick={() => setMobileMenuOpen(false)} />
              ))}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowFlyerStudio(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors outline-none"
              >
                <EdIcon name="flyer" className="w-4 h-4 shrink-0 text-primary-600" />
                <span className="truncate">{lang === 'sw' ? 'Picha za Status' : 'Flyer Studio'}</span>
              </button>

              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {lang === 'sw' ? 'Msaada' : 'Support'}
              </p>
              <button
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors outline-none"
              >
                <Globe className="w-4 h-4" />
                {lang === 'sw' ? 'English' : 'Kiswahili'}
              </button>
              <a
                href="mailto:support@edretail.tz"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors outline-none"
              >
                <HelpCircle className="w-4 h-4" />
                {lang === 'sw' ? 'Msaada' : 'Help & Support'}
              </a>
              <Link
                to="/"
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 hover:bg-gray-100 transition-colors outline-none"
              >
                <ShieldCheck className="w-4 h-4" />
                {lang === 'sw' ? 'Duka' : 'View Store'}
              </Link>
            </div>

            {/* FIXED account footer — never scrolls, always reachable */}
            <div className="shrink-0 border-t border-gray-100 p-3 bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full min-h-[44px] flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors outline-none"
              >
                <LogOut className="w-4 h-4" />
                {lang === 'sw' ? 'Toka' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="md:pl-60 pt-14 md:pt-14">
        <div className="pb-24 md:pb-10">{children}</div>
      </main>

      {/* ═══ MOBILE BOTTOM NAVIGATION ═══ */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 grid grid-cols-5"
        aria-label="Primary"
      >
        {[
          { to: '/portal/dashboard', icon: LayoutDashboard, label: { en: 'Home', sw: 'Nyumbani' } },
          { to: '/portal/ledger', icon: Receipt, label: { en: 'Sales', sw: 'Mauzo' } },
          { to: '/portal/inventory', icon: Package, label: { en: 'Stock', sw: 'Stoo' } },
          { to: '/portal/goals', icon: TrendingUp, label: { en: 'Goals', sw: 'Malengo' } },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors outline-none ${
                isActive ? 'text-primary-700' : 'text-gray-400 hover:text-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {t(item.label)}
          </NavLink>
        ))}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-gray-400 hover:text-gray-700 transition-colors outline-none"
          aria-label="More menu"
        >
          <Menu className="w-5 h-5" />
          {lang === 'sw' ? 'Zaidi' : 'More'}
        </button>
      </nav>

      {/* Offline sale modal */}
      {showSaleModal && <LogOfflineSaleModal isOpen={showSaleModal} onClose={() => setShowSaleModal(false)} />}

      {/* Flyer Studio — distributor marketing tool, portal-only (lazy) */}
      {showFlyerStudio && (
        <Suspense fallback={null}>
          <FlyerStudioModal isOpen={showFlyerStudio} onClose={() => setShowFlyerStudio(false)} />
        </Suspense>
      )}
    </div>
  );
}