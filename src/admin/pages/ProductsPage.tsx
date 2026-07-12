import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { AdminProduct } from '../types';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, X, Save } from 'lucide-react';

const EMPTY: Omit<AdminProduct, 'created_at' | 'updated_at'> = {
  id: '', name_en: '', name_sw: '', category: 'health-wellness',
  price: 0, price_usd: 0, description_en: '', description_sw: '',
  usage_en: '', usage_sw: '', image: '', badge: null, in_stock: true, stock_qty: 0,
};

export function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState<Partial<AdminProduct> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('category').order('name_en');
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => setEditing({ ...EMPTY });
  const openEdit = (p: AdminProduct) => setEditing({ ...p });
  const close    = () => { setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');

    const payload = {
      id: editing.id || editing.name_en!.toLowerCase().replace(/\s+/g, '-'),
      name_en: editing.name_en,
      name_sw: editing.name_sw,
      category: editing.category,
      price: Number(editing.price),
      price_usd: Number(editing.price_usd),
      description_en: editing.description_en,
      description_sw: editing.description_sw,
      usage_en: editing.usage_en,
      usage_sw: editing.usage_sw,
      image: editing.image || `/products/${editing.id}.png`,
      badge: editing.badge || null,
      in_stock: editing.in_stock,
      stock_qty: Number(editing.stock_qty),
    };

    const isNew = !products.find(p => p.id === payload.id);
    const { error: err } = isNew
      ? await supabase.from('products').insert(payload)
      : await supabase.from('products').update(payload).eq('id', payload.id);

    if (err) { setError(err.message); setSaving(false); return; }
    await load();
    close();
    setSaving(false);
  };

  const toggleStock = async (p: AdminProduct) => {
    await supabase.from('products').update({ in_stock: !p.in_stock }).eq('id', p.id);
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, in_stock: !p.in_stock } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const CATEGORIES = ['p4-slimming', 'health-wellness', 'lifestyle-beverages'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-4">
              <img src={p.image} alt={p.name_en} className="w-12 h-12 object-contain rounded-lg bg-gray-800 flex-shrink-0" onError={e => { e.currentTarget.style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-white truncate">{p.name_en}</p>
                  {p.badge && <span className="text-[10px] font-bold text-indigo-300 bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded-full">{p.badge}</span>}
                  {p.stock_qty <= 5 && p.in_stock && <span className="text-[10px] font-bold text-amber-300 bg-amber-950 border border-amber-800 px-2 py-0.5 rounded-full">Low stock</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{p.category} · {formatPrice(p.price)} TZS · Stock: {p.stock_qty}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleStock(p)} className="text-gray-500 hover:text-white transition-colors" title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'}>
                  {p.in_stock ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-bold text-white">{editing.id && products.find(p => p.id === editing.id) ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={close} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-4 space-y-3">
              {([['name_en','Name (English)'],['name_sw','Name (Swahili)'],['image','Image path']] as [keyof AdminProduct, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
                  <input
                    value={(editing[field] as string) ?? ''}
                    onChange={e => setEditing(v => ({ ...v, [field]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Price (TZS)</label>
                  <input type="number" value={editing.price ?? 0} onChange={e => setEditing(v => ({ ...v, price: +e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Stock Qty</label>
                  <input type="number" value={editing.stock_qty ?? 0} onChange={e => setEditing(v => ({ ...v, stock_qty: +e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Category</label>
                <select value={editing.category ?? 'health-wellness'} onChange={e => setEditing(v => ({ ...v, category: e.target.value as AdminProduct['category'] }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Badge (optional)</label>
                <input value={editing.badge ?? ''} onChange={e => setEditing(v => ({ ...v, badge: e.target.value || null }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Bestseller" />
              </div>

              {([['description_en','Description (EN)'],['description_sw','Description (SW)'],['usage_en','Usage (EN)'],['usage_sw','Usage (SW)']] as [keyof AdminProduct, string][]).map(([field, label]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
                  <textarea rows={2} value={(editing[field] as string) ?? ''}
                    onChange={e => setEditing(v => ({ ...v, [field]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              ))}

              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-semibold text-gray-400">In Stock</label>
                <button type="button" onClick={() => setEditing(v => ({ ...v, in_stock: !v?.in_stock }))}>
                  {editing.in_stock ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">{error}</p>}
            </div>
            <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
              <button onClick={close} className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
