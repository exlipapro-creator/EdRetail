import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from 'lucide-react';

interface Row {
  date: string;
  channel: string;
  customer_name: string;
  items_count: number;
  subtotal: number;
  amount_paid: number;
  status: string;
}

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

      let q = supabase.from('sales').select('created_at,channel,customer_name,items,subtotal,amount_paid,status').neq('status','cancelled').order('created_at',{ascending:false});
      if (from) q = q.gte('created_at', from.toISOString());

      const { data } = await q;
      const mapped: Row[] = (data ?? []).map((s: Record<string, unknown>) => ({
        date: new Date(s.created_at as string).toLocaleDateString(),
        channel: s.channel as string,
        customer_name: s.customer_name as string,
        items_count: Array.isArray(s.items) ? (s.items as unknown[]).reduce((sum: number, i: unknown) => sum + ((i as Record<string, number>).quantity ?? 1), 0) : 0,
        subtotal: s.subtotal as number,
        amount_paid: s.amount_paid as number,
        status: s.status as string,
      }));
      setRows(mapped);
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
    { label: 'Revenue Collected', value: `${formatPrice(totalRevenue)} TZS`, icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' },
    { label: 'Cash Sales',        value: `${formatPrice(cashSales)} TZS`,    icon: <DollarSign className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'App Orders',        value: `${formatPrice(appSales)} TZS`,     icon: <ShoppingBag className="w-5 h-5" />,color: 'text-indigo-400 bg-indigo-500/10'},
    { label: 'Loan Collected',    value: `${formatPrice(loanCollected)} TZS`,icon: <TrendingUp className="w-5 h-5" />, color: 'text-violet-400 bg-violet-500/10'},
    { label: 'Outstanding',       value: `${formatPrice(Math.max(0,outstanding))} TZS`, icon: <TrendingDown className="w-5 h-5" />, color: 'text-red-400 bg-red-500/10' },
    { label: 'Total Transactions',value: totalOrders.toString(),             icon: <ShoppingBag className="w-5 h-5" />,color: 'text-gray-400 bg-gray-700' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Cash Flow</h1>
          <p className="text-sm text-gray-500 mt-0.5">Revenue and transaction history</p>
        </div>
        <div className="flex gap-2">
          {(['today','week','month','all'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${period === p ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {summaryCards.map(c => (
          <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center mb-3`}>{c.icon}</div>
            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">{c.label}</p>
            <p className="text-sm font-bold text-white mt-0.5">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white">Transactions</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-600 py-10 text-sm">No transactions in this period</p>
        ) : (
          <div className="divide-y divide-gray-800">
            {rows.map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.customer_name}</p>
                  <p className="text-xs text-gray-500">{r.date} · {r.channel} · {r.items_count} item{r.items_count !== 1 ? 's' : ''}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-green-400">+{formatPrice(r.amount_paid)} TZS</p>
                  {r.amount_paid < r.subtotal && (
                    <p className="text-xs text-red-400">Owed: {formatPrice(r.subtotal - r.amount_paid)}</p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${
                  r.status === 'delivered' ? 'text-green-400 bg-green-950 border-green-800' :
                  r.status === 'cancelled' ? 'text-red-400 bg-red-950 border-red-800' :
                  'text-amber-400 bg-amber-950 border-amber-800'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
