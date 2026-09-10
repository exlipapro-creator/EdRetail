import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Loader2, Save, Star } from 'lucide-react';
import testimonialsData from '../../data/testimonials.json';
import { useLang } from '../../context/LangContext';
import {
  PageHeader, Modal, Field, inputClasses, buttonClasses,
  Badge, EmptyState, Spinner, cn,
} from '../../components/ui';

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
  const { lang } = useLang();
  const [items, setItems]     = useState<DBTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<DBTestimonial> | null>(null);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const load = async () => {
    setLoading(true);
    let loadedFromDb = false;
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setItems(data as DBTestimonial[]);
        loadedFromDb = true;
      }
    } catch {
      // safe fallback
    }

    if (!loadedFromDb) {
      const fallback: DBTestimonial[] = testimonialsData.map((t) => ({
        id: t.id,
        name: t.name,
        location: t.location,
        product: t.product,
        text: typeof t.text === 'string' ? t.text : t.text.en,
        result: t.result,
        visible: true,
        created_at: new Date().toISOString(),
      }));
      setItems(fallback);
    }
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
    <div className="p-4 md:p-6 max-w-5xl">
      <PageHeader
        title={lang === 'sw' ? 'Maoni' : 'Testimonials'}
        sub={`${items.filter(t => t.visible).length} visible · ${items.length} total`}
        actions={
          <button onClick={openNew} className={buttonClasses('primary')}>
            <Plus className="w-4 h-4" /> Add Review
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon={<Star className="w-5 h-5 text-gray-400" />}
            title={lang === 'sw' ? 'Hakuna maoni bado' : 'No testimonials yet'}
            sub="Add the first customer review — it will appear on the storefront once visible."
            action={
              <button onClick={openNew} className={buttonClasses('primary')}>
                <Plus className="w-4 h-4" /> Add Review
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(t => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex flex-col sm:flex-row sm:items-start gap-3"
            >
              {/* Stars */}
              <div className="flex gap-0.5 flex-shrink-0" aria-label={lang === 'sw' ? 'Alipima 5 kati ya 5' : 'Rated 5 out of 5'}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-gold-400 text-gold-400" />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-gray-900">{t.name}</span>
                  {t.location && <span className="text-xs text-gray-500">{t.location}</span>}
                  {t.result && <Badge tone="success">{t.result}</Badge>}
                  {!t.visible && <Badge tone="neutral">{lang === 'sw' ? 'Imefichwa' : 'Hidden'}</Badge>}
                </div>
                {t.product && <p className="text-[10px] text-gray-500 mb-1">{t.product}</p>}
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 italic">"{t.text}"</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-start">
                <button
                  onClick={() => toggleVisible(t)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-700 transition-colors outline-none"
                  title={t.visible ? 'Hide from storefront' : 'Show on storefront'}
                  aria-label={t.visible ? `Hide testimonial from ${t.name}` : `Show testimonial from ${t.name}`}
                >
                  {t.visible
                    ? <ToggleRight className="w-5 h-5 text-green-600" />
                    : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  className="p-2 rounded-md text-gray-400 hover:text-primary-600 transition-colors outline-none"
                  aria-label={`Edit testimonial from ${t.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 rounded-md text-gray-400 hover:text-red-600 transition-colors outline-none"
                  aria-label={`Delete testimonial from ${t.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={close}
        title={editing?.id ? 'Edit Review' : 'Add Review'}
        footer={
          <>
            <button onClick={close} className={buttonClasses('secondary', 'flex-1')}>{lang === 'sw' ? 'Ghairi' : 'Cancel'}</button>
            <button onClick={handleSave} disabled={saving} className={buttonClasses('primary', 'flex-1')}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
            </button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <Field label={lang === 'sw' ? 'Jina la Mteja *' : 'Customer Name *'}>
              <input
                value={editing.name ?? ''}
                onChange={e => setEditing(v => ({ ...v, name: e.target.value }))}
                className={inputClasses}
                placeholder={lang === 'sw' ? 'mf. Amina J.' : 'e.g. Amina J.'}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={lang === 'sw' ? 'Eneo' : 'Location'}>
                <input
                  value={editing.location ?? ''}
                  onChange={e => setEditing(v => ({ ...v, location: e.target.value }))}
                  className={inputClasses}
                  placeholder="e.g. Dar es Salaam"
                />
              </Field>
              <Field label={lang === 'sw' ? 'Bidhaa Iliyotumika' : 'Product Used'}>
                <input
                  value={editing.product ?? ''}
                  onChange={e => setEditing(v => ({ ...v, product: e.target.value }))}
                  className={inputClasses}
                  placeholder="e.g. Splina Chlorophyll"
                />
              </Field>
            </div>

            <Field label={lang === 'sw' ? 'Beji ya Matokeo' : 'Result Badge'}>
              <input
                value={editing.result ?? ''}
                onChange={e => setEditing(v => ({ ...v, result: e.target.value }))}
                className={inputClasses}
                placeholder="e.g. −8kg in 6 weeks"
              />
            </Field>

            <Field label={lang === 'sw' ? 'Maandishi ya Maoni *' : 'Review Text *'}>
              <textarea
                rows={4}
                value={editing.text ?? ''}
                onChange={e => setEditing(v => ({ ...v, text: e.target.value }))}
                className={cn(inputClasses, 'resize-none')}
                placeholder={lang === 'sw' ? 'Andika kile mteja alichosema...' : 'Write what the customer said...'}
              />
            </Field>

            <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
              <label className="text-xs font-semibold text-gray-500">{lang === 'sw' ? 'Inaonekana dukani' : 'Visible on storefront'}</label>
              <button
                type="button"
                onClick={() => setEditing(v => ({ ...v, visible: !v?.visible }))}
                aria-label={editing.visible ? 'Hide on storefront' : 'Show on storefront'}
              >
                {editing.visible
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
