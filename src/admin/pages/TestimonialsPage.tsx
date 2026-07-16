import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, X, Save, Star } from 'lucide-react';

interface DBTestimonial {
  id: string;
  name: string;
  location: string;
  product: string;
  text: string;
  result: string;
  visible: boolean;
  created_at: string;
}

const EMPTY: Omit<DBTestimonial, 'id' | 'created_at'> = {
  name: '', location: '', product: '', text: '', result: '', visible: true,
};

export function TestimonialsPage() {
  const [items, setItems]     = useState<DBTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<DBTestimonial> | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });
    setItems((data as DBTestimonial[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew  = () => setEditing({ ...EMPTY });
  const openEdit = (t: DBTestimonial) => setEditing({ ...t });
  const close    = () => { setEditing(null); setError(''); };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.text?.trim()) {
      setError('Name and review text are required.');
      return;
    }
    setSaving(true);
    setError('');

    const isNew = !editing.id;
    const payload = {
      name: editing.name!.trim(),
      location: editing.location?.trim() ?? '',
      product: editing.product?.trim() ?? '',
      text: editing.text!.trim(),
      result: editing.result?.trim() ?? '',
      visible: editing.visible ?? true,
    };

    const { error: err } = isNew
      ? await supabase.from('testimonials').insert(payload)
      : await supabase.from('testimonials').update(payload).eq('id', editing.id!);

    if (err) { setError(err.message); setSaving(false); return; }
    await load();
    close();
    setSaving(false);
  };

  const toggleVisible = async (t: DBTestimonial) => {
    await supabase.from('testimonials').update({ visible: !t.visible }).eq('id', t.id);
    setItems(prev => prev.map(x => x.id === t.id ? { ...x, visible: !t.visible } : x));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    await supabase.from('testimonials').delete().eq('id', id);
    setItems(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Testimonials</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.filter(t => t.visible).length} visible · {items.length} total
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Review
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-gray-600 py-16 text-sm">No testimonials yet. Add the first one.</p>
      ) : (
        <div className="space-y-2">
          {items.map(t => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-start gap-3">
              {/* Stars */}
              <div className="flex gap-0.5 mt-0.5 flex-shrink-0">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-white">{t.name}</span>
                  {t.location && <span className="text-xs text-gray-500">{t.location}</span>}
                  {t.result && (
                    <span className="text-[10px] font-bold text-green-400 bg-green-950 border border-green-800 px-2 py-0.5 rounded-full">
                      {t.result}
                    </span>
                  )}
                  {!t.visible && (
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
                {t.product && <p className="text-[10px] text-gray-500 mb-1">{t.product}</p>}
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 italic">"{t.text}"</p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleVisible(t)} title={t.visible ? 'Hide' : 'Show'}>
                  {t.visible
                    ? <ToggleRight className="w-5 h-5 text-green-500" />
                    : <ToggleLeft className="w-5 h-5 text-gray-600" />}
                </button>
                <button onClick={() => openEdit(t)} className="p-1.5 text-gray-500 hover:text-indigo-400 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(t.id)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="text-base font-bold text-white">
                {editing.id ? 'Edit Review' : 'Add Review'}
              </h2>
              <button onClick={close} className="text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Customer Name *</label>
                <input
                  value={editing.name ?? ''}
                  onChange={e => setEditing(v => ({ ...v, name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Amina J."
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Location</label>
                <input
                  value={editing.location ?? ''}
                  onChange={e => setEditing(v => ({ ...v, location: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Dar es Salaam"
                />
              </div>

              {/* Product */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Product Used</label>
                <input
                  value={editing.product ?? ''}
                  onChange={e => setEditing(v => ({ ...v, product: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Splina Chlorophyll"
                />
              </div>

              {/* Result badge */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Result Badge</label>
                <input
                  value={editing.result ?? ''}
                  onChange={e => setEditing(v => ({ ...v, result: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. −8kg in 6 weeks"
                />
              </div>

              {/* Review text */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Review Text *</label>
                <textarea
                  rows={4}
                  value={editing.text ?? ''}
                  onChange={e => setEditing(v => ({ ...v, text: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Write what the customer said..."
                />
              </div>

              {/* Visible toggle */}
              <div className="flex items-center gap-3 pt-1">
                <label className="text-xs font-semibold text-gray-400">Visible on storefront</label>
                <button
                  type="button"
                  onClick={() => setEditing(v => ({ ...v, visible: !v?.visible }))}
                >
                  {editing.visible
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6 text-gray-500" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-800 flex gap-3">
              <button
                onClick={close}
                className="flex-1 py-2.5 border border-gray-700 text-gray-400 text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
