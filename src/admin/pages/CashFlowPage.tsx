import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import {
  PageHeader, FilterPills, Badge, EmptyState, Spinner, cn,
} from '../../components/ui';

interface Row {
  date: string;
  channel: string;
  customer_name: string;
  items_count: number;
  subtotal: number;
  amount_paid: number;
  status: string;
}

const ICON_TONES: Record<string, string> = {
  success: 'bg-green-50 text-green-600',
  primary: 'bg-primary-50 text-primary-600',
  neutral: 'bg-gray-100 text-gray-500',
  warning: 'bg-amber-50 text-amber-600',
  danger:  'bg-red-50 text-red-600',
};

export function CashFlowPage() {
  const [rows, setRows]         = useState<Row[]>([]);
  const [loading, setLoading]   = useState(true);
  const [period, setPeriod]     = useState<'today' | 'week' | 'month' | 'all'>('month');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const now   = new Date();
      let from: Date | null = null;
      if (period === 'today') { from = new Date(now); from.setHours(0,0,0,0); }
      else if (period === 'week')  { from = new Date(now); from.setDate(now.getDate() - 7); }
      else if (period === 'month') { from = new Date(now.getFullYear(), now.getMonth(), 1); }

      let loadedFromDb = false;
      try {
        let q = supabase.from('sales').select('created_at,channel,customer_name,items,subtotal,amount_paid,status').neq('status','cancelled').order('created_at',{ascending:false});
        if (from) q = q.gte('created_at', from.toISOString());

        const { data, error } = await q;
        if (!error && data && data.length > 0) {
          const mapped: Row[] = data.map((s: Record<string, unknown>) => ({
            date: new Date(s.created_at as string).toLocaleDateString(),
            channel: s.channel as string,
            customer_name: s.customer_name as string,
            items_count: Array.isArray(s.items) ? (s.items as unknown[]).reduce((sum: number, i: unknown) => sum + ((i as Record<string, number>).quantity ?? 1), 0) : 0,
            subtotal: s.subtotal as number,
            amount_paid: s.amount_paid as number,
            status: s.status as string,
          }));
          setRows(mapped);
          loadedFromDb = true;
        }
      } catch {
        // Fallback
      }

      if (!loadedFromDb) {
        const localSales = useDistributorStore.getState().sales;
        const filtered = from
          ? localSales.filter((s) => new Date(s.createdAt) >= from!)
          : localSales;
        const mapped: Row[] = filtered.map((s) => ({
          date: new Date(s.createdAt).toLocaleDateString(),
          channel: s.source === 'web_whatsapp' ? 'app' : s.paymentType === 'credit' ? 'loan' : 'cash',
          customer_name: s.customerName,
          items_count: s.quantity,
          subtotal: s.totalAmount,
          amount_paid: s.amountPaid,
          status: s.balanceDue === 0 ? 'delivered' : 'pending',
        }));
        setRows(mapped);
      }

      setLoading(false);
    };
    load();
  }, [period]);

  const totalRevenue  = rows.filter(r => r.status === 'delivered').reduce((s, r) => s + r.amount_paid, 0);
  const totalOrders   = rows.length;
  const cashSales     = rows.filter(r => r.channel === 'cash').reduce((s, r) => s + r.amount_paid, 0);
  const appSales      = rows.filter(r => r.channel === 'app').reduce((s, r) => s + r.amount_paid, 0);
  const loanCollected = rows.filter(r => r.channel === 'loan').reduce((s, r) => s + r.amount_paid, 0);
  const outstanding   = rows.filter(r => r.channel === 'loan').reduce((s, r) => s + (r.subtotal - r.amount_paid), 0);

  const summaryCards = [
    { label: 'Revenue Collected',  value: `${formatPrice(totalRevenue)} TZS`,                    icon: <TrendingUp className="w-4 h-4" />,   tone: 'success' },
    { label: 'Cash Sales',         value: `${formatPrice(cashSales)} TZS`,                       icon: <DollarSign className="w-4 h-4" />,   tone: 'primary' },
    { label: 'App Orders',         value: `${formatPrice(appSales)} TZS`,                        icon: <ShoppingBag className="w-4 h-4" />,  tone: 'primary' },
    { label: 'Loan Collected',     value: `${formatPrice(loanCollected)} TZS`,                   icon: <TrendingUp className="w-4 h-4" />,   tone: 'success' },
    { label: 'Outstanding',        value: `${formatPrice(Math.max(0, outstanding))} TZS`,        icon: <TrendingDown className="w-4 h-4" />, tone: 'danger'  },
    { label: 'Total Transactions', value: totalOrders.toString(),                                icon: <ShoppingBag className="w-4 h-4" />,  tone: 'neutral' },
  ] as const;

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader title="Cash Flow" sub="Revenue and transaction history" />

      <FilterPills
        ariaLabel="Select period"
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'today', label: 'Today' },
          { value: 'week',  label: 'Week'  },
          { value: 'month', label: 'Month' },
          { value: 'all',   label: 'All'   },
        ]}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', ICON_TONES[c.tone])}>
                {c.icon}
              </div>
              <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{c.label}</p>
            </div>
            <p className="text-sm font-bold text-gray-900 mt-0.5 tabular-nums">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Transactions</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><Spinner /></div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<DollarSign className="w-5 h-5 text-gray-400" />}
            title="No transactions in this period"
            sub="Sales recorded during the selected period will appear here."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {rows.map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.customer_name}</p>
                  <p className="text-xs text-gray-500">{r.date} · {r.channel} · {r.items_count} item{r.items_count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right flex-shrink-0 tabular-nums">
                  <p className="text-sm font-bold text-green-600">+{formatPrice(r.amount_paid)} TZS</p>
                  {r.amount_paid < r.subtotal && (
                    <p className="text-xs text-red-600">Owed: {formatPrice(r.subtotal - r.amount_paid)}</p>
                  )}
                </div>
                <Badge
                  tone={r.status === 'delivered' ? 'success' : r.status === 'cancelled' ? 'danger' : 'warning'}
                  className="flex-shrink-0"
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
