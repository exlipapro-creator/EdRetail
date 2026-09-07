import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/whatsappCompiler';
import { AdminProduct } from '../types';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Save } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { PRODUCTS } from '../../types';
import {
  PageHeader, Modal, Field, inputClasses, buttonClasses,
  Badge, EmptyState, Spinner, cn,
} from '../../components/ui';

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
    let loadedFromDb = false;
    try {
      const { data, error } = await supabase.from('products').select('*').order('category').order('name_en');
      if (!error && data && data.length > 0) {
        setProducts(data);
        loadedFromDb = true;
      }
    } catch {
      // Fallback
    }

    if (!loadedFromDb) {
      const live = useDistributorStore.getState().getEffectiveProducts();
      const mapped: AdminProduct[] = (live.length > 0 ? live : PRODUCTS).map((p) => ({
        id: p.id,
        name_en: typeof p.name === 'string' ? p.name : p.name.en,
        name_sw: typeof p.name === 'string' ? p.name : p.name.sw,
        category: p.category as any,
        price: p.price,
        price_usd: p.priceUsd,
        description_en: typeof p.description === 'string' ? p.description : p.description.en,
        description_sw: typeof p.description === 'string' ? p.description : p.description.sw,
        usage_en: typeof p.usage === 'string' ? p.usage : p.usage?.en || '',
        usage_sw: typeof p.usage === 'string' ? p.usage : p.usage?.sw || '',
        image: p.image,
        badge: (p.badge as any) || null,
        in_stock: p.inStock,
        stock_qty: p.inStock ? 20 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
      setProducts(mapped);
    }
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

    // 1. Sync directly to distributorStore so storefront sees changes immediately
    useDistributorStore.getState().updateProductPrice(payload.id, payload.price);
    useDistributorStore.getState().toggleProductStock(payload.id, Boolean(payload.in_stock));

    try {
      const isNew = !products.find(p => p.id === payload.id);
      await (isNew
        ? supabase.from('products').insert(payload)
        : supabase.from('products').update(payload).eq('id', payload.id));
    } catch {
      // Offline safe
    }

    await load();
    close();
    setSaving(false);
  };

  const toggleStock = async (p: AdminProduct) => {
    const nextStock = !p.in_stock;
    useDistributorStore.getState().toggleProductStock(p.id, nextStock);
    try {
      await supabase.from('products').update({ in_stock: nextStock }).eq('id', p.id);
    } catch {
      // Offline safe
    }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, in_stock: nextStock } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const CATEGORIES = ['p4-slimming', 'health-wellness', 'lifestyle-beverages'];
  const isEditing = Boolean(editing?.id && products.find(p => p.id === editing.id));

  return (
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader
        title="Products"
        sub={`${products.length} products in catalogue`}
        actions={
          <button onClick={openNew} className={buttonClasses('primary')}>
            <Plus className="w-4 h-4" /> Add Product
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={<Plus className="w-5 h-5 text-gray-400" />}
            title="No products yet"
            sub="Add your first product to start selling on the storefront."
            action={
              <button onClick={openNew} className={buttonClasses('primary')}>
                <Plus className="w-4 h-4" /> Add Product
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <img
                src={p.image}
                alt={p.name_en}
                className="w-12 h-12 object-contain rounded-md bg-gray-50 border border-gray-100 flex-shrink-0 self-start sm:self-center"
                onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name_en}</p>
                  {p.badge && <Badge tone="primary">{p.badge}</Badge>}
                  {p.stock_qty <= 5 && p.in_stock && <Badge tone="warning">Low stock</Badge>}
                  {!p.in_stock && <Badge tone="danger">Out of stock</Badge>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {p.category} · {formatPrice(p.price)} TZS · Stock: {p.stock_qty}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-center">
                <button
                  onClick={() => toggleStock(p)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-700 transition-colors outline-none"
                  title={p.in_stock ? 'Mark out of stock' : 'Mark in stock'}
                  aria-label={p.in_stock ? `Mark ${p.name_en} out of stock` : `Mark ${p.name_en} in stock`}
                >
                  {p.in_stock ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-md text-gray-400 hover:text-primary-600 transition-colors outline-none"
                  aria-label={`Edit ${p.name_en}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-md text-gray-400 hover:text-red-600 transition-colors outline-none"
                  aria-label={`Delete ${p.name_en}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={isEditing ? 'Edit Product' : 'New Product'}
        footer={
          <>
            <button onClick={close} className={buttonClasses('secondary', 'flex-1')}>Cancel</button>
            <button onClick={handleSave} disabled={saving} className={buttonClasses('primary', 'flex-1')}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Name (English)">
                <input
                  value={editing.name_en ?? ''}
                  onChange={e => setEditing(v => ({ ...v, name_en: e.target.value }))}
                  className={inputClasses}
                />
              </Field>
              <Field label="Name (Swahili)">
                <input
                  value={editing.name_sw ?? ''}
                  onChange={e => setEditing(v => ({ ...v, name_sw: e.target.value }))}
                  className={inputClasses}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Price (TZS)">
                <input
                  type="number"
                  value={editing.price ?? 0}
                  onChange={e => setEditing(v => ({ ...v, price: +e.target.value }))}
                  className={cn(inputClasses, 'tabular-nums')}
                />
              </Field>
              <Field label="Stock Qty">
                <input
                  type="number"
                  value={editing.stock_qty ?? 0}
                  onChange={e => setEditing(v => ({ ...v, stock_qty: +e.target.value }))}
                  className={cn(inputClasses, 'tabular-nums')}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Category">
                <select
                  value={editing.category ?? 'health-wellness'}
                  onChange={e => setEditing(v => ({ ...v, category: e.target.value as AdminProduct['category'] }))}
                  className={inputClasses}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Badge (optional)">
                <input
                  value={editing.badge ?? ''}
                  onChange={e => setEditing(v => ({ ...v, badge: e.target.value || null }))}
                  className={inputClasses}
                  placeholder="e.g. Bestseller"
                />
              </Field>
            </div>

            <Field label="Image path">
              <input
                value={editing.image ?? ''}
                onChange={e => setEditing(v => ({ ...v, image: e.target.value }))}
                className={inputClasses}
                placeholder="/products/example.png"
              />
            </Field>

            <div className="border-t border-gray-100 pt-3 space-y-3">
              <Field label="Description (English)">
                <textarea
                  rows={2}
                  value={editing.description_en ?? ''}
                  onChange={e => setEditing(v => ({ ...v, description_en: e.target.value }))}
                  className={cn(inputClasses, 'resize-none')}
                />
              </Field>
              <Field label="Description (Swahili)">
                <textarea
                  rows={2}
                  value={editing.description_sw ?? ''}
                  onChange={e => setEditing(v => ({ ...v, description_sw: e.target.value }))}
                  className={cn(inputClasses, 'resize-none')}
                />
              </Field>
              <Field label="Usage (English)">
                <textarea
                  rows={2}
                  value={editing.usage_en ?? ''}
                  onChange={e => setEditing(v => ({ ...v, usage_en: e.target.value }))}
                  className={cn(inputClasses, 'resize-none')}
                />
              </Field>
              <Field label="Usage (Swahili)">
                <textarea
                  rows={2}
                  value={editing.usage_sw ?? ''}
                  onChange={e => setEditing(v => ({ ...v, usage_sw: e.target.value }))}
                  className={cn(inputClasses, 'resize-none')}
                />
              </Field>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
              <label className="text-xs font-semibold text-gray-500">In Stock</label>
              <button
                type="button"
                onClick={() => setEditing(v => ({ ...v, in_stock: !v?.in_stock }))}
                aria-label={editing.in_stock ? 'Mark in stock' : 'Mark out of stock'}
              >
                {editing.in_stock
                  ? <ToggleRight className="w-6 h-6 text-green-600" />
                  : <ToggleLeft className="w-6 h-6 text-gray-400" />}
              </button>
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
