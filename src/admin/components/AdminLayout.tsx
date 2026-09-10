import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  TrendingUp, LogOut, Menu, X, Star, Users, Settings,
  ShieldCheck, Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { can, Permission } from '../../lib/permissions';
import { useLang } from '../../context/LangContext';

/** Bilingual label (canonical terms per docs/i18n-glossary.md). */
type Bi = { en: string; sw: string };
const tr = (lang: 'en' | 'sw') => (s: Bi) => (lang === 'sw' ? s.sw : s.en);

type NavItem = { to: string; icon: typeof LayoutDashboard; label: Bi; permission: Permission };

const NAV_GROUPS: Array<{ label: Bi; items: NavItem[] }> = [
  {
    label: { en: 'Overview', sw: 'Muhtasari' },
    items: [{ to: '/admin/dashboard', icon: LayoutDashboard, label: { en: 'Dashboard', sw: 'Dashibodi' }, permission: 'VIEW_PLATFORM_DASHBOARD' }],
  },
  {
    label: { en: 'Catalog', sw: 'Katalogi' },
    items: [{ to: '/admin/products', icon: Package, label: { en: 'Products', sw: 'Bidhaa' }, permission: 'MANAGE_ALL_PRODUCTS' }],
  },
  {
    label: { en: 'Commerce', sw: 'Biashara' },
    items: [
      { to: '/admin/sales', icon: ShoppingBag, label: { en: 'Sales', sw: 'Mauzo' }, permission: 'VIEW_ALL_SALES' },
      { to: '/admin/cashflow', icon: TrendingUp, label: { en: 'Cash Flow', sw: 'Mtiririko wa Fedha' }, permission: 'MANAGE_CASH_FLOW' },
      { to: '/admin/loans', icon: CreditCard, label: { en: 'Loans', sw: 'Mikopo' }, permission: 'MANAGE_LOANS' },
    ],
  },
  {
    label: { en: 'People', sw: 'Watu' },
    items: [{ to: '/admin/distributors', icon: Users, label: { en: 'Distributors', sw: 'Wasambazaji' }, permission: 'MANAGE_ALL_DISTRIBUTORS' }],
  },
  {
    label: { en: 'Engagement', sw: 'Mahusiano' },
    items: [
      { to: '/admin/testimonials', icon: Star, label: { en: 'Reviews', sw: 'Maoni' }, permission: 'MANAGE_REVIEWS' },
      { to: '/admin/heroes', icon: ImageIcon, label: { en: 'Storefront Banners', sw: 'Mabango ya Duka' }, permission: 'MANAGE_STOREFRONT_CONTENT' },
    ],
  },
  {
    label: { en: 'System', sw: 'Mfumo' },
    items: [{ to: '/admin/settings', icon: Settings, label: { en: 'Settings & Backups', sw: 'Mipangilio & Hifadhi' }, permission: 'MANAGE_SYSTEM_SETTINGS' }],
  },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { to: '/admin/security', icon: ShieldCheck, label: { en: 'Security', sw: 'Usalama' }, permission: 'MANAGE_ADMIN_SECURITY' },
];

function NavItemLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const { lang } = useLang();
  return (
    <NavLink
      key={item.to}
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-colors outline-none ${
          isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {tr(lang)(item.label)}
    </NavLink>
  );
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { lang } = useLang();
  const t = tr(lang);
  return (
    <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto" aria-label={lang === 'sw' ? 'Sehemu za usimamizi' : 'Admin sections'}>
      {NAV_GROUPS.map((group) => {
        const visible = group.items.filter((item) => can('SUPER_ADMIN', item.permission));
        if (visible.length === 0) return null;
        return (
          <div key={group.label.en}>
            <p className="px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
              {t(group.label)}
            </p>
            <div className="space-y-0.5">
              {visible.map((item) => (
                <NavItemLink key={item.to} item={item} onClick={onNavigate} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0">
        <div className="px-5 py-5 border-b border-gray-100">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-8 w-auto" />
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">
            {lang === 'sw' ? 'Jopo la Usimamizi' : 'Admin Panel'}
          </p>
        </div>

        <NavItems />

        {/* Account section */}
        <div className="px-3 py-3 border-t border-gray-100">
          <p className="px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {lang === 'sw' ? 'Akaunti' : 'Account'}
          </p>
          {ACCOUNT_ITEMS.filter((item) => can('SUPER_ADMIN', item.permission)).map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}
          <div className="px-3 pt-2 pb-2">
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex min-h-[44px] items-center gap-3 px-3 py-2 w-full rounded-md text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors outline-none"
          >
            <LogOut className="w-4 h-4" />
            {lang === 'sw' ? 'Toka' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-7 w-auto" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
            {lang === 'sw' ? 'Usimamizi' : 'Admin'}
          </span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors outline-none"
          aria-label={open ? (lang === 'sw' ? 'Funga menyu' : 'Close menu') : (lang === 'sw' ? 'Fungua menyu' : 'Open menu')}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-72 h-full bg-white border-r border-gray-200 pt-16 px-3 pb-4 flex flex-col"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'sw' ? 'Menyu ya usimamizi' : 'Admin menu'}
          >
            <NavItems onNavigate={() => setOpen(false)} />
            <div className="px-3 py-3 border-t border-gray-100">
              <p className="px-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                {lang === 'sw' ? 'Akaunti' : 'Account'}
              </p>
              {ACCOUNT_ITEMS.filter((item) => can('SUPER_ADMIN', item.permission)).map((item) => (
                <NavItemLink key={item.to} item={item} onClick={() => setOpen(false)} />
              ))}
              <div className="px-3 pt-2 pb-2">
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex min-h-[44px] items-center gap-3 px-3 py-2 w-full rounded-md text-[13px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors outline-none"
              >
                <LogOut className="w-4 h-4" />
                {lang === 'sw' ? 'Toka' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 min-w-0 max-w-full overflow-x-hidden md:overflow-auto pt-14 md:pt-0 md:ml-60">
        {children}
      </main>
    </div>
  );
}