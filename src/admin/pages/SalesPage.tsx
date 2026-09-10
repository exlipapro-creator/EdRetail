import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { Sale, SaleChannel, SaleStatus, SaleItem } from '../types';
import { Plus, X, Save, Loader2, ChevronDown, CheckCircle2, Truck, Clock, XCircle, Phone, MapPin } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import {
  PageHeader, Modal, Field, inputClasses, buttonClasses,
  FilterPills, Badge, EmptyState, Spinner, cn,
} from '../../components/ui';

const STATUS_CONFIG: Record<SaleStatus, { label: string; tone: 'warning' | 'primary' | 'success' | 'danger'; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   tone: 'warning', icon: <Clock className="w-3 h-3" /> },
  confirmed: { label: 'Confirmed', tone: 'primary', icon: <CheckCircle2 className="w-3 h-3" /> },
  delivered: { label: 'Delivered', tone: 'success', icon: <Truck className="w-3 h-3" /> },
  cancelled: { label: 'Cancelled', tone: 'danger',  icon: <XCircle className="w-3 h-3" /> },
};

export function SalesPage() {
  const { lang } = useLang();
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
    let loadedFromDb = false;
    try {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setSales(data as Sale[]);
        loadedFromDb = true;
      }
    } catch {
      // Fallback
    }

    if (!loadedFromDb) {
      const localSales = useDistributorStore.getState().sales;
      const mapped: Sale[] = localSales.map((s) => ({
        id: s.id,
        created_at: s.createdAt,
        updated_at: s.createdAt,
        channel: s.source === 'web_whatsapp' ? 'app' : s.paymentType === 'credit' ? 'loan' : 'cash',
        status: s.balanceDue === 0 ? 'delivered' : s.source === 'web_whatsapp' ? 'pending' : 'confirmed',
        customer_name: s.customerName,
        customer_phone: s.customerPhone,
        customer_location: s.customerLocation,
        subtotal: s.totalAmount,
        amount_paid: s.amountPaid,
        notes: s.notes || null,
        items: [
          {
            product_id: s.productId,
            product_name: s.productName,
            quantity: s.quantity,
            unit_price: s.unitPrice,
            total: s.totalAmount,
          },
        ],
      }));
      setSales(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const liveProds = useDistributorStore.getState().getEffectiveProducts();
    setProducts(
      liveProds.map((p) => ({
        id: p.id,
        name_en: typeof p.name === 'string' ? p.name : p.name.en,
        price: p.price,
      }))
    );
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

    const paidAmt = form.channel === 'loan' ? Number(form.amount_paid) : subtotal;

    // 1. Log to local reactive distributorStore
    form.items.forEach((item) => {
      useDistributorStore.getState().addSale({
        customerName: form.customer_name,
        customerPhone: form.customer_phone,
        customerLocation: form.customer_location || 'Tanzania',
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalAmount: item.total,
        paymentType: form.channel === 'loan' ? 'credit' : 'cash',
        amountPaid: paidAmt,
        balanceDue: Math.max(0, item.total - paidAmt),
        status: paidAmt >= item.total ? 'paid' : paidAmt > 0 ? 'partial' : 'unpaid',
        notes: form.notes,
        dueDate: form.channel === 'loan' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : undefined,
      });
    });

    try {
      await supabase.from('sales').insert({
        channel: form.channel, status: 'confirmed',
        customer_name: form.customer_name, customer_phone: form.customer_phone,
        customer_location: form.customer_location,
        items: form.items, subtotal,
        amount_paid: paidAmt,
        notes: form.notes || null,
      });
    } catch {
      // Offline safe
    }

    await load();
    setShowForm(false);
    setForm({ channel: 'cash', customer_name: '', customer_phone: '', customer_location: '', amount_paid: 0, notes: '', items: [] });
    setSaving(false);
  };

  const updateStatus = async (id: string, status: SaleStatus) => {
    if (status === 'delivered') {
      useDistributorStore.getState().markDebtPaid(id, 99999999);
    }
    try {
      await supabase.from('sales').update({ status }).eq('id', id);
    } catch {
      // Offline safe
    }
    setSales(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader
        title={lang === 'sw' ? 'Mauzo' : 'Sales'}
        sub={`${sales.length} total sales`}
        actions={
          <button onClick={() => setShowForm(true)} className={buttonClasses('primary')}>
            <Plus className="w-4 h-4" /> Record Sale
          </button>
        }
      />

      <FilterPills
        ariaLabel="Filter sales by channel"
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all',  label: 'All'  },
          { value: 'app',  label: 'App'  },
          { value: 'cash', label: 'Cash' },
          { value: 'loan', label: 'Loan' },
        ]}
      />

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={<Plus className="w-5 h-5 text-gray-400" />}
            title={lang === 'sw' ? 'Hakuna mauzo bado' : 'No sales recorded yet'}
            sub={filter === 'all'
              ? 'Record your first sale to see it here.'
              : 'No sales in this channel yet.'}
            action={
              <button onClick={() => setShowForm(true)} className={buttonClasses('primary')}>
                <Plus className="w-4 h-4" /> Record Sale
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(sale => {
            const sc = STATUS_CONFIG[sale.status];
            return (
              <div key={sale.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                  aria-expanded={expanded === sale.id}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 truncate">{sale.customer_name}</p>
                      <Badge tone={sc.tone}>{sc.icon}{sc.label}</Badge>
                      <Badge tone="neutral">{sale.channel}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 tabular-nums">
                      {formatPrice(sale.subtotal)} TZS · {new Date(sale.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0 transition-transform', expanded === sale.id && 'rotate-180')} />
                </div>
                {expanded === sale.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                    <div className="text-xs text-gray-500 space-y-1">
                      {sale.customer_phone && (
                        <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {sale.customer_phone}</p>
                      )}
                      {sale.customer_location && (
                        <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {sale.customer_location}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      {(sale.items as SaleItem[]).map((item, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-600 tabular-nums">
                          <span>{item.quantity}× {item.product_name}</span>
                          <span>{formatPrice(item.total)} TZS</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1 tabular-nums">
                        <span>{lang === 'sw' ? 'Jumla' : 'Total'}</span><span>{formatPrice(sale.subtotal)} TZS</span>
                      </div>
                      {sale.amount_paid < sale.subtotal && (
                        <div className="flex justify-between text-xs text-red-600 tabular-nums">
                          <span>{lang === 'sw' ? 'Imelipwa' : 'Paid'}</span><span>{formatPrice(sale.amount_paid)} TZS</span>
                        </div>
                      )}
                    </div>
                    {sale.notes && <p className="text-xs text-gray-500 italic">{sale.notes}</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(['pending','confirmed','delivered','cancelled'] as SaleStatus[]).filter(s => s !== sale.status).map(s => (
                        <button
                          key={s}
                          onClick={() => updateStatus(sale.id, s)}
                          className="text-xs px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-md transition-colors outline-none"
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Sale Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={lang === 'sw' ? 'Rekodi Mauzo' : 'Record Sale'}
        footer={
          <>
            <button onClick={() => setShowForm(false)} className={buttonClasses('secondary', 'flex-1')}>{lang === 'sw' ? 'Ghairi' : 'Cancel'}</button>
            <button
              onClick={handleSave}
              disabled={saving || !form.customer_name || form.items.length === 0}
              className={buttonClasses('primary', 'flex-1')}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Sale</>}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Channel */}
          <Field label={lang === 'sw' ? 'Njia' : 'Channel'}>
            <div className="flex gap-2">
              {(['cash','app','loan'] as SaleChannel[]).map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, channel: ch }))}
                  aria-pressed={form.channel === ch}
                  className={cn(
                    'flex-1 py-2 rounded-md text-xs font-bold transition-colors outline-none',
                    form.channel === ch
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50',
                  )}
                >
                  {ch.toUpperCase()}
                </button>
              ))}
            </div>
          </Field>

          {/* Customer */}
          <Field label={lang === 'sw' ? 'Jina la Mteja *' : 'Customer Name *'}>
            <input
              value={form.customer_name}
              onChange={e => setForm(v => ({ ...v, customer_name: e.target.value }))}
              className={inputClasses}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={lang === 'sw' ? 'Simu' : 'Phone'}>
              <input
                value={form.customer_phone}
                onChange={e => setForm(v => ({ ...v, customer_phone: e.target.value }))}
                className={inputClasses}
              />
            </Field>
            <Field label={lang === 'sw' ? 'Eneo' : 'Location'}>
              <input
                value={form.customer_location}
                onChange={e => setForm(v => ({ ...v, customer_location: e.target.value }))}
                className={inputClasses}
              />
            </Field>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500">{lang === 'sw' ? 'Bidhaa' : 'Items'}</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 outline-none"
              >
                + Add item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={item.product_id}
                    onChange={e => updateItem(i, 'product_id', e.target.value)}
                    className={cn(inputClasses, 'flex-1 py-1.5 text-xs')}
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name_en}</option>)}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', +e.target.value)}
                    aria-label={lang === 'sw' ? 'Kiasi' : 'Quantity'}
                    className={cn(inputClasses, 'w-14 py-1.5 text-xs text-center tabular-nums')}
                  />
                  <span className="text-xs text-gray-500 w-20 text-right tabular-nums">{formatPrice(item.total)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-600 transition-colors outline-none p-1"
                    aria-label={lang === 'sw' ? 'Ondoa bidhaa' : 'Remove item'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {form.items.length > 0 && (
              <div className="flex justify-between text-sm font-bold text-gray-900 mt-2 pt-2 border-t border-gray-100 tabular-nums">
                <span>{lang === 'sw' ? 'Jumla ndogo' : 'Subtotal'}</span><span>{formatPrice(subtotal)} TZS</span>
              </div>
            )}
          </div>

          {form.channel === 'loan' && (
            <Field label={lang === 'sw' ? 'Kiasi Kilicholipwa Sasa (TZS)' : 'Amount Paid Now (TZS)'}>
              <input
                type="number"
                value={form.amount_paid}
                onChange={e => setForm(f => ({ ...f, amount_paid: +e.target.value }))}
                className={cn(inputClasses, 'tabular-nums')}
              />
              <p className="text-xs text-red-600 mt-1 tabular-nums">
                Balance: {formatPrice(Math.max(0, subtotal - form.amount_paid))} TZS
              </p>
            </Field>
          )}

          <Field label={lang === 'sw' ? 'Maelezo' : 'Notes'}>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={cn(inputClasses, 'resize-none')}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
