import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { Sale, SaleChannel, SaleStatus, SaleItem } from '../types';
import { Plus, X, Save, Loader2, ChevronDown, CheckCircle2, Truck, Clock, XCircle } from 'lucide-react';

const STATUS_CONFIG: Record<SaleStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   color: 'text-amber-400 bg-amber-950 border-amber-800',  icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: 'Confirmed', color: 'text-blue-400 bg-blue-950 border-blue-800',     icon: <CheckCircle2 className="w-3 h-3" /> },
  delivered: { label: 'Delivered', color: 'text-green-400 bg-green-950 border-green-800',  icon: <Truck className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-400 bg-red-950 border-red-800',        icon: <XCircle className="w-3 h-3" /> },
};

export function SalesPage() {
  const [sales, setSales]     = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<SaleChannel | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  // New sale form state
  const [form, setForm] = useState({
    channel: 'cash' as SaleChannel,
    customer_name: '', customer_phone: '', customer_location: '',
    amount_paid: 0, notes: '',
    items: [] as SaleItem[],
  });
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<{ id: string; name_en: string; price: number }[]>([]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
    setSales((data as Sale[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    supabase.from('products').select('id,name_en,price').then(({ data }) => setProducts(data ?? []));
  }, []);

  const filtered = filter === 'all' ? sales : sales.filter(s => s.channel === filter);

  const addItem = () => setForm(f => ({
    ...f,
    items: [...f.items, { product_id: products[0]?.id ?? '', product_name: products[0]?.name_en ?? '', quantity: 1, unit_price: products[0]?.price ?? 0, total: products[0]?.price ?? 0 }],
  }));

  const updateItem = (i: number, field: keyof SaleItem, val: string | number) => {
    setForm(f => {
      const items = [...f.items];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (items[i] as any)[field] = val;
      if (field === 'product_id') {
        const p = products.find(p => p.id === val);
        if (p) { items[i].product_name = p.name_en; items[i].unit_price = p.price; }
      }
      items[i].total = items[i].unit_price * items[i].quantity;
      return { ...f, items };
    });
  };

  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const subtotal = form.items.reduce((s, x) => s + x.total, 0);

  const handleSave = async () => {
    if (!form.customer_name || form.items.length === 0) return;
    setSaving(true);
    const { error } = await supabase.from('sales').insert({
      channel: form.channel, status: 'confirmed',
      customer_name: form.customer_name, customer_phone: form.customer_phone,
      customer_location: form.customer_location,
      items: form.items, subtotal,
      amount_paid: form.channel === 'loan' ? Number(form.amount_paid) : subtotal,
      notes: form.notes || null,
    });
    if (!error) {
      // If loan channel, create loan record too
      if (form.channel === 'loan') {
        await supabase.from('loans').insert({
          customer_name: form.customer_name, customer_phone: form.customer_phone,
          customer_location: form.customer_location,
          items: form.items, total_amount: subtotal,
          amount_paid: Number(form.amount_paid),
          status: Number(form.amount_paid) >= subtotal ? 'cleared' : Number(form.amount_paid) > 0 ? 'partial' : 'active',
          notes: form.notes || null,
        });
      }
      await load();
      setShowForm(false);
      setForm({ channel: 'cash', customer_name: '', customer_phone: '', customer_location: '', amount_paid: 0, notes: '', items: [] });
    }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: SaleStatus) => {
    await supabase.from('sales').update({ status }).eq('id', id);
    setSales(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Sales</h1>
          <p className="text-sm text-gray-500 mt-0.5">{sales.length} total sales</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Record Sale
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {(['all','app','cash','loan'] as const).map(ch => (
          <button key={ch} onClick={() => setFilter(ch)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${filter === ch ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {ch === 'all' ? 'All' : ch.charAt(0).toUpperCase() + ch.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div> : (
        <div className="space-y-2">
          {filtered.map(sale => {
            const sc = STATUS_CONFIG[sale.status];
            return (
              <div key={sale.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">{sale.customer_name}</p>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sc.color}`}>{sc.icon}{sc.label}</span>
                      <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{sale.channel}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatPrice(sale.subtotal)} TZS · {new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${expanded === sale.id ? 'rotate-180' : ''}`} />
                </div>
                {expanded === sale.id && (
                  <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
                    <div className="text-xs text-gray-400 space-y-1">
                      {sale.customer_phone && <p>📞 {sale.customer_phone}</p>}
                      {sale.customer_location && <p>📍 {sale.customer_location}</p>}
                    </div>
                    <div className="space-y-1">
                      {(sale.items as SaleItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-300">
                          <span>{item.quantity}× {item.product_name}</span>
                          <span>{formatPrice(item.total)} TZS</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold text-white border-t border-gray-800 pt-2 mt-1">
                        <span>Total</span><span>{formatPrice(sale.subtotal)} TZS</span>
                      </div>
                      {sale.amount_paid < sale.subtotal && (
                        <div className="flex justify-between text-xs text-red-400">
                          <span>Paid</span><span>{formatPrice(sale.amount_paid)} TZS</span>
                        </div>
                      )}
                    </div>
                    {sale.notes && <p className="text-xs text-gray-500 italic">{sale.notes}</p>}
                    <div className="flex gap-2 pt-1">
                      {(['pending','confirmed','delivered','cancelled'] as SaleStatus[]).filter(s => s !== sale.status).map(s => (
                        <button key={s} onClick={() => updateStatus(sale.id, s)}
                          className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center text-gray-600 py-12 text-sm">No sales recorded yet</p>}
        </div>
      )}

      {/* New Sale Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-bold text-white">Record Sale</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {/* Channel */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Channel</label>
                <div className="flex gap-2">
                  {(['cash','app','loan'] as SaleChannel[]).map(ch => (
                    <button key={ch} onClick={() => setForm(f => ({ ...f, channel: ch }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${form.channel === ch ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {ch.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              {[['customer_name','Customer Name *'],['customer_phone','Phone'],['customer_location','Location']].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">{l}</label>
                  <input value={(form as unknown as Record<string, string>)[f]} onChange={e => setForm(v => ({ ...v, [f]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-400">Items</label>
                  <button onClick={addItem} className="text-xs text-indigo-400 hover:text-indigo-300">+ Add item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none">
                        {products.map(p => <option key={p.id} value={p.id}>{p.name_en}</option>)}
                      </select>
                      <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', +e.target.value)}
                        className="w-14 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none" />
                      <span className="text-xs text-gray-400 w-20 text-right">{formatPrice(item.total)}</span>
                      <button onClick={() => removeItem(i)} className="text-gray-600 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
                {form.items.length > 0 && (
                  <div className="flex justify-between text-sm font-bold text-white mt-2 pt-2 border-t border-gray-800">
                    <span>Subtotal</span><span>{formatPrice(subtotal)} TZS</span>
                  </div>
                )}
              </div>

              {form.channel === 'loan' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Amount Paid Now (TZS)</label>
                  <input type="number" value={form.amount_paid} onChange={e => setForm(f => ({ ...f, amount_paid: +e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <p className="text-xs text-red-400 mt-1">Balance: {formatPrice(Math.max(0, subtotal - form.amount_paid))} TZS</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.customer_name || form.items.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Sale</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
