import { ReactNode, useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
  ArrowUpRight,
  Globe,
  Store,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { LogOfflineSaleModal } from '../../components/distributor/LogOfflineSaleModal';

interface DistributorLayoutProps {
  children: ReactNode;
}

export function DistributorLayout({ children }: DistributorLayoutProps) {
  const { lang, setLang } = useLang();
  const navigate = useNavigate();

  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const logoutDistributor = useDistributorStore((s) => s.logoutDistributor);
  const setAdminAuthenticated = useDistributorStore((s) => s.setAdminAuthenticated);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const NAV_ITEMS = [
    {
      to: '/portal/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: lang === 'sw' ? 'Daftari la Mauzo' : 'Sales Ledger & Overview',
    },
    {
      to: '/portal/inventory',
      icon: <Package className="w-5 h-5" />,
      label: lang === 'sw' ? 'Stoo ya Bidhaa' : 'Inventory & Stock',
    },
    {
      to: '/portal/goals',
      icon: <TrendingUp className="w-5 h-5" />,
      label: lang === 'sw' ? '2,000 SV Challenge' : 'SV Goals & Pacing',
    },
    {
      to: '/portal/crm',
      icon: <Users className="w-5 h-5" />,
      label: lang === 'sw' ? 'Madeni & Wateja' : 'Debts & Customer CRM',
    },
    {
      to: '/portal/payments',
      icon: <CreditCard className="w-5 h-5" />,
      label: lang === 'sw' ? 'Lipa Namba Zangu' : 'Payment Accounts',
    },
    {
      to: '/portal/profile',
      icon: <User className="w-5 h-5" />,
      label: lang === 'sw' ? 'Duka Langu & Wasifu' : 'My Store & Profile',
    },
  ];

  const handleSignOut = () => {
    logoutDistributor();
    setAdminAuthenticated(false);
    navigate('/portal');
  };

  const handleCopyStoreLink = () => {
    const url = `${window.location.origin}/@${distributor.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col md:flex-row font-sans antialiased">
      {/* ── 1. DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 flex-col bg-[#071A14] border-r border-[#143B2E] shrink-0 select-none">
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-[#143B2E] flex items-center justify-between">
          <Link to="/portal/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-[#C5A059] flex items-center justify-center shadow-md">
              <Store className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">ED Retail Leader</p>
              <p className="text-[10px] text-[#C5A059] font-bold">Distributor Back-Office</p>
            </div>
          </Link>
        </div>

        {/* Active Distributor Snapshot Card */}
        <div className="p-3 mx-3 my-3 rounded-2xl bg-stone-900/90 border border-emerald-900/40 space-y-2">
          <div className="flex items-center gap-2.5">
            <img
              src={distributor.avatarUrl || '/logo/distributor-circle.png'}
              alt={distributor.name}
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40 bg-stone-800 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-black text-white truncate">{distributor.name}</p>
                {distributor.isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />}
              </div>
              <p className="text-[10px] text-[#C5A059] font-medium truncate">{distributor.city}</p>
            </div>
          </div>

          {/* Quick Copy Link Button */}
          <button
            onClick={handleCopyStoreLink}
            className="w-full py-1.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span className="truncate">/@{distributor.slug}</span>
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => setShowSaleModal(true)}
            className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'sw' ? 'Rekodi Mauzo Mapya' : 'Log New Sale'}</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#184837] text-white border border-[#2B735A] shadow-xs'
                    : 'text-stone-400 hover:bg-stone-900/80 hover:text-stone-200'
                }`
              }
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions & Sign Out */}
        <div className="p-3 border-t border-[#143B2E] space-y-2">
          <div className="flex items-center justify-between text-[11px] text-stone-400 px-2">
            <button
              onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>{lang === 'sw' ? 'Kiswahili' : 'English'}</span>
            </button>
            <Link to="/" className="text-emerald-400 hover:underline flex items-center gap-0.5">
              <span>{lang === 'sw' ? 'Duka' : 'Store'}</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white text-xs font-black transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{lang === 'sw' ? 'Toka Kwenye Ofisi' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>

      {/* ── 2. MOBILE TOPBAR ── */}
      <div className="md:hidden sticky top-0 z-40 bg-[#071A14] border-b border-[#143B2E] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Store className="w-4 h-4 text-stone-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-black text-xs text-white">ED Retail Leader</span>
            <p className="text-[10px] text-[#C5A059]">@{distributor.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaleModal(true)}
            className="p-2 bg-emerald-500 text-stone-950 font-black rounded-xl text-xs flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span className="text-[11px]">{lang === 'sw' ? 'Mauzo' : 'Sale'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── 3. MOBILE DRAWER OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-[#071A14] border-r border-[#143B2E] p-4 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#143B2E]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <Store className="w-4 h-4 text-stone-950 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white">ED Retail Leader</span>
                    <p className="text-[10px] text-[#C5A059]">Back-Office Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#184837] text-white border border-[#2B735A]'
                          : 'text-stone-300 hover:bg-stone-900/80'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-[#143B2E] space-y-2">
              <button
                onClick={() => setLang(lang === 'sw' ? 'en' : 'sw')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-stone-900 rounded-xl text-xs font-bold text-stone-300"
              >
                <Globe className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{lang === 'sw' ? 'Lugha: Kiswahili' : 'Language: English'}</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/20 border border-red-500/40 text-red-300 font-bold rounded-xl text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'sw' ? 'Toka Kwenye Ofisi' : 'Sign Out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. PRIMARY MAIN VIEWPORT ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-950 overflow-y-auto">
        {/* Top Operational Action Bar */}
        <header className="hidden md:flex px-6 py-3.5 bg-stone-900/60 border-b border-stone-800/80 items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-stone-300">
                {lang === 'sw' ? 'Mfumo Uko Hewani' : 'Portal Live Sync'}
              </span>
            </div>
            <span className="text-stone-600">|</span>
            <span className="text-xs text-stone-400">
              {distributor.name} ({distributor.rank})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/portal/inventory')}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'sw' ? 'Stoo & Bidhaa' : 'Inventory'}</span>
            </button>

            <button
              onClick={() => setShowSaleModal(true)}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>{lang === 'sw' ? 'Rekodi Mauzo' : 'Log Sale'}</span>
            </button>

            <Link
              to="/admin"
              className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-black transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1" />
              <span>Super Admin</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <LogOfflineSaleModal
          isOpen={showSaleModal}
          onClose={() => setShowSaleModal(false)}
        />
      )}
    </div>
  );
}
