import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  TrendingUp, LogOut, Menu, X, Star, Users, Settings,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const NAV = [
  { to: '/admin/dashboard',    icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard'    },
  { to: '/admin/products',     icon: <Package className="w-4 h-4" />,         label: 'Master Products' },
  { to: '/admin/distributors', icon: <Users className="w-4 h-4" />,           label: 'Distributors' },
  { to: '/admin/sales',        icon: <ShoppingBag className="w-4 h-4" />,      label: 'Sales'        },
  { to: '/admin/loans',        icon: <CreditCard className="w-4 h-4" />,       label: 'Loans'        },
  { to: '/admin/cashflow',     icon: <TrendingUp className="w-4 h-4" />,       label: 'Cash Flow'    },
  { to: '/admin/testimonials', icon: <Star className="w-4 h-4" />,             label: 'Reviews'      },
  { to: '/admin/settings',     icon: <Settings className="w-4 h-4" />,         label: 'Settings & Backups' },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Admin sections">
      {NAV.map(n => (
        <NavLink
          key={n.to}
          to={n.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors outline-none ${
              isActive
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          {n.icon}
          {n.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
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
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        <NavItems />

        <div className="px-3 py-4 border-t border-gray-100">
          <p className="px-3 pb-2 text-xs text-gray-400 truncate">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors outline-none"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/logo/wordmark.png" alt="ED Retail" className="h-7 w-auto" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Admin</span>
        </div>
        <button
          onClick={() => setOpen(v => !v)}
          className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors outline-none"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div
            className="w-64 h-full bg-white border-r border-gray-200 pt-16 px-3 py-4 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <NavItems onNavigate={() => setOpen(false)} />
            <div className="px-3 py-4 border-t border-gray-100">
              <p className="px-3 pb-2 text-xs text-gray-400 truncate">{user?.email}</p>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors outline-none"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
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
