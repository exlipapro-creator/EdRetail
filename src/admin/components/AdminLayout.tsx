import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, CreditCard,
  TrendingUp, LogOut, Menu, X, ChevronRight, Star,
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const NAV = [
  { to: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { to: '/admin/products',  icon: <Package className="w-5 h-5" />,         label: 'Products'  },
  { to: '/admin/sales',     icon: <ShoppingBag className="w-5 h-5" />,      label: 'Sales'     },
  { to: '/admin/loans',     icon: <CreditCard className="w-5 h-5" />,       label: 'Loans'     },
  { to: '/admin/cashflow',  icon: <TrendingUp className="w-5 h-5" />,       label: 'Cash Flow' },
  { to: '/admin/testimonials', icon: <Star className="w-5 h-5" />,          label: 'Reviews'   },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden md:flex w-60 flex-col bg-gray-900 border-r border-gray-800">
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ED Retail</p>
              <p className="text-[10px] text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Package className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">ED Retail Admin</span>
        </div>
        <button onClick={() => setOpen(v => !v)} className="text-gray-400 hover:text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-gray-900 border-r border-gray-800 pt-16 px-3 py-4" onClick={e => e.stopPropagation()}>
            <nav className="space-y-1">
              {NAV.map(n => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {n.icon}
                  {n.label}
                  <ChevronRight className="w-4 h-4 ml-auto opacity-30" />
                </NavLink>
              ))}
            </nav>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 mt-4 w-full rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 md:overflow-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  );
}
