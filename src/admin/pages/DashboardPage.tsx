import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { TrendingUp, ShoppingBag, CreditCard, Package, AlertTriangle } from 'lucide-react';

interface Stats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  totalSales: number;
  pendingSales: number;
  outstandingLoans: number;
  activeLoans: number;
  lowStockCount: number;
}

export function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [salesRes, loansRes, productsRes] = await Promise.all([
        supabase.from('sales').select('subtotal,amount_paid,status,created_at').neq('status','cancelled'),
        supabase.from('loans').select('balance,status'),
        supabase.from('products').select('stock_qty,in_stock'),
      ]);

      const sales = salesRes.data ?? [];
      const loans = loansRes.data ?? [];
      const products = productsRes.data ?? [];

      const delivered = sales.filter(s => s.status === 'delivered');
      setStats({
        totalRevenue:    delivered.reduce((s, x) => s + (x.amount_paid ?? 0), 0),
        todayRevenue:    delivered.filter(s => new Date(s.created_at) >= today).reduce((s, x) => s + (x.amount_paid ?? 0), 0),
        monthRevenue:    delivered.filter(s => new Date(s.created_at) >= monthStart).reduce((s, x) => s + (x.amount_paid ?? 0), 0),
        totalSales:      sales.length,
        pendingSales:    sales.filter(s => s.status === 'pending').length,
        outstandingLoans: loans.filter(l => l.status !== 'cleared').reduce((s, x) => s + (x.balance ?? 0), 0),
        activeLoans:     loans.filter(l => l.status !== 'cleared').length,
        lowStockCount:   products.filter(p => p.in_stock && p.stock_qty <= 5).length,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  const s = stats!;

  const cards = [
    { label: 'Total Revenue',      value: `${formatPrice(s.totalRevenue)} TZS`,  icon: <TrendingUp className="w-5 h-5" />,  color: 'bg-green-500/10 text-green-400',  border: 'border-green-900/50' },
    { label: 'This Month',         value: `${formatPrice(s.monthRevenue)} TZS`,  icon: <TrendingUp className="w-5 h-5" />,  color: 'bg-blue-500/10 text-blue-400',    border: 'border-blue-900/50'  },
    { label: 'Today',              value: `${formatPrice(s.todayRevenue)} TZS`,  icon: <TrendingUp className="w-5 h-5" />,  color: 'bg-indigo-500/10 text-indigo-400',border: 'border-indigo-900/50'},
    { label: 'Total Sales',        value: s.totalSales.toString(),               icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-violet-500/10 text-violet-400', border: 'border-violet-900/50'},
    { label: 'Pending Orders',     value: s.pendingSales.toString(),             icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-400',   border: 'border-amber-900/50' },
    { label: 'Outstanding Loans',  value: `${formatPrice(s.outstandingLoans)} TZS`, icon: <CreditCard className="w-5 h-5" />, color: 'bg-red-500/10 text-red-400',    border: 'border-red-900/50'   },
    { label: 'Active Loans',       value: s.activeLoans.toString(),             icon: <CreditCard className="w-5 h-5" />,  color: 'bg-orange-500/10 text-orange-400', border: 'border-orange-900/50'},
    { label: 'Low Stock Items',    value: s.lowStockCount.toString(),           icon: <Package className="w-5 h-5" />,     color: s.lowStockCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-gray-800 text-gray-400', border: s.lowStockCount > 0 ? 'border-red-900/50' : 'border-gray-800' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your store performance</p>
      </div>

      {s.lowStockCount > 0 && (
        <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-900/60 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">{s.lowStockCount} product{s.lowStockCount > 1 ? 's' : ''} running low on stock. Check the Products page.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`bg-gray-900 border ${c.border} rounded-2xl p-4`}>
            <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              {c.icon}
            </div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className="text-base font-bold text-white mt-0.5 leading-tight">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
