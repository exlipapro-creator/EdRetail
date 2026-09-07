import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { TrendingUp, ShoppingBag, CreditCard, Package, AlertTriangle, CircleAlert } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { PageHeader, Spinner, cn } from '../../components/ui';

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

type IconTone = 'success' | 'primary' | 'neutral' | 'warning' | 'danger';

const ICON_TONES: Record<IconTone, string> = {
  success: 'bg-green-50 text-green-600',
  primary: 'bg-primary-50 text-primary-600',
  neutral: 'bg-gray-100 text-gray-500',
  warning: 'bg-amber-50 text-amber-600',
  danger:  'bg-red-50 text-red-600',
};

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: IconTone;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', ICON_TONES[tone])}>
          {icon}
        </div>
        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-lg font-bold text-gray-900 leading-tight tabular-nums">{value}</p>
    </div>
  );
}

function MetricSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">{title}</h2>
      {children}
    </section>
  );
}

export function DashboardPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      let loadedFromDb = false;
      try {
        const [salesRes, loansRes, productsRes] = await Promise.all([
          supabase.from('sales').select('subtotal,amount_paid,status,created_at').neq('status','cancelled'),
          supabase.from('loans').select('balance,status'),
          supabase.from('products').select('stock_qty,in_stock'),
        ]);

        const sales = salesRes.data ?? [];
        const loans = loansRes.data ?? [];
        const products = productsRes.data ?? [];

        if (sales.length > 0 || loans.length > 0 || products.length > 0) {
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
          loadedFromDb = true;
        }
      } catch {
        // Fallback
      }

      if (!loadedFromDb) {
        const localSales = useDistributorStore.getState().sales;
        const financial = useDistributorStore.getState().getFinancialSummary('all');
        const prods = useDistributorStore.getState().getEffectiveProducts();

        const pendingCount = localSales.filter((s) => s.source === 'web_whatsapp' && s.balanceDue > 0).length;
        const activeCreditSales = localSales.filter((s) => s.balanceDue > 0);

        setStats({
          totalRevenue: financial.cashCollected,
          todayRevenue: financial.cashCollected,
          monthRevenue: financial.cashCollected,
          totalSales: localSales.length,
          pendingSales: pendingCount,
          outstandingLoans: financial.creditOutstanding,
          activeLoans: activeCreditSales.length,
          lowStockCount: prods.filter((p) => !p.inStock).length,
        });
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader title="Dashboard" sub="Overview of your store performance" />

      {s.lowStockCount > 0 && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            {s.lowStockCount} product{s.lowStockCount > 1 ? 's' : ''} running low on stock. Check the Products page.
          </p>
        </div>
      )}

      <MetricSection title="Revenue">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Total Revenue"     value={`${formatPrice(s.totalRevenue)} TZS`} icon={<TrendingUp className="w-4 h-4" />} tone="success" />
          <StatCard label="This Month"        value={`${formatPrice(s.monthRevenue)} TZS`} icon={<TrendingUp className="w-4 h-4" />} tone="primary" />
          <StatCard label="Today"             value={`${formatPrice(s.todayRevenue)} TZS`} icon={<TrendingUp className="w-4 h-4" />} tone="neutral" />
        </div>
      </MetricSection>

      <MetricSection title="Operations">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard label="Total Sales"       value={s.totalSales.toString()}   icon={<ShoppingBag className="w-4 h-4" />} tone="neutral" />
          <StatCard label="Pending Orders"    value={s.pendingSales.toString()} icon={<CircleAlert className="w-4 h-4" />}  tone="warning" />
          <StatCard label="Low Stock Items"   value={s.lowStockCount.toString()} icon={<Package className="w-4 h-4" />}    tone={s.lowStockCount > 0 ? 'warning' : 'neutral'} />
        </div>
      </MetricSection>

      <MetricSection title="Credit">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <StatCard label="Outstanding Loans" value={`${formatPrice(s.outstandingLoans)} TZS`} icon={<CreditCard className="w-4 h-4" />} tone="danger" />
          <StatCard label="Active Loans"      value={s.activeLoans.toString()}                icon={<CreditCard className="w-4 h-4" />} tone="neutral" />
        </div>
      </MetricSection>
    </div>
  );
}
