import { useEffect, useRef, useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import {
  HeroSlide,
  HERO_DESTINATIONS,
  isProductDestination,
  validateHeroImage,
  validateHeroImageDimensions,
  uploadHeroImage,
  deleteHeroImage,
} from '../../lib/heroes';

interface HeroFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The hero being edited, or null for a new hero. */
  hero: HeroSlide | null;
  /** Owner scope for uploads. Global = super-admin managed banner. */
  scope: { kind: 'distributor'; profileId: string } | { kind: 'global' };
  /** Existing images for replacement cleanup. */
  onSaved: () => void;
}

interface FormState {
  image_path: string;
  headline_en: string;
  headline_sw: string;
  subhead_en: string;
  subhead_sw: string;
  cta_en: string;
  cta_sw: string;
  cta_destination: string;
  status: 'draft' | 'published';
}

const EMPTY: FormState = {
  image_path: '',
  headline_en: '',
  headline_sw: '',
  subhead_en: '',
  subhead_sw: '',
  cta_en: '',
  cta_sw: '',
  cta_destination: 'products',
  status: 'draft',
};

export function HeroFormModal({ isOpen, onClose, hero, scope, onSaved }: HeroFormModalProps) {
  const { lang } = useLang();
  const sw = lang === 'sw';
  const products = useDistributorStore((s) => s.getEffectiveProducts());

  const [form, setForm] = useState<FormState>(EMPTY);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  // Stable id for NEW heroes, generated before the image upload so the
  // storage path (heroes/{owner}/{hero_id}...) is deterministic and two
  // drafts can never overwrite each other's artwork.
  const [draftId, setDraftId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setBusy(false);
    setUploading(false);
    setDraftId(
      hero?.id ??
        (typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `hero_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`)
    );
    setForm(
      hero
        ? {
            image_path: hero.image_path,
            headline_en: hero.headline_en,
            headline_sw: hero.headline_sw,
            subhead_en: hero.subhead_en,
            subhead_sw: hero.subhead_sw,
            cta_en: hero.cta_en,
            cta_sw: hero.cta_sw,
            cta_destination: hero.cta_destination,
            status: hero.status === 'published' ? 'published' : 'draft',
          }
        : EMPTY
    );
    setPreviewUrl('');
  }, [isOpen, hero]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError('');
    const v = validateHeroImage(file);
    if (v) return setError(sw ? v.sw : v.en);
    const dims = await validateHeroImageDimensions(file);
    if (dims) return setError(sw ? dims.sw : dims.en);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);
    try {
      // Replacement: remove the old uploaded asset after the new one lands —
      // ONLY when the new upload landed at a DIFFERENT path. The storage path
      // is deterministic (heroes/{owner}/{hero_id}.{ext}), so replacing with
      // the same file type rewrites the SAME object via upsert; deleting the
      // "old" path here would delete the just-uploaded live asset and leave
      // the row pointing at a missing object.
      const oldPath = form.image_path;
      const newPath = await uploadHeroImage(scope, draftId || 'pending', file);
      if (oldPath && oldPath.startsWith('heroes/') && oldPath !== newPath) {
        await deleteHeroImage(oldPath);
      }
      setForm((f) => ({ ...f, image_path: newPath }));
    } catch {
      setError(
        sw
          ? 'Picha haikupakia. Tafadhali jaribu tena — hakikisha faili ni picha halali.'
          : 'The image could not be uploaded. Please try again with a valid image file.'
      );
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.image_path) {
      return setError(sw ? 'Chagua picha ya bango kwanza.' : 'Choose a banner image first.');
    }
    if (!form.headline_en.trim() && !form.headline_sw.trim()) {
      return setError(sw ? 'Andika kichwa cha habari (Kiingereza au Kiswahili).' : 'Write a headline (English or Kiswahili).');
    }
    if (!form.cta_en.trim() && !form.cta_sw.trim()) {
      return setError(sw ? 'Andika maandishi ya kitufe.' : 'Write button text.');
    }
    setBusy(true);
    try {
      const { saveHero } = await import('../../lib/heroes');
      const payload = {
        id: hero?.id ?? draftId,
        distributor_id: scope.kind === 'global' ? null : scope.profileId,
        image_path: form.image_path,
        headline_en: form.headline_en.trim(),
        headline_sw: form.headline_sw.trim(),
        subhead_en: form.subhead_en.trim(),
        subhead_sw: form.subhead_sw.trim(),
        cta_en: form.cta_en.trim(),
        cta_sw: form.cta_sw.trim(),
        cta_destination: form.cta_destination,
        sort_order: hero?.sort_order ?? 999,
        status: form.status,
      };
      await saveHero(payload);
      onSaved();
      onClose();
    } catch {
      setError(
        sw
          ? 'Imeshindikana kuhifadhi bango. Tafadhali jaribu tena.'
          : 'Could not save the hero banner. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  const fieldBase =
    'w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:bg-white focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 outline-none transition-all';
  const labelBase = 'block text-xs font-bold text-neutral-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-neutral-200/70 overflow-hidden max-h-[92dvh] sm:max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100 shrink-0">
          <h2 className="text-sm font-extrabold text-neutral-900">
            {hero ? (sw ? 'Hariri Bango' : 'Edit Banner') : (sw ? 'Bango Jipya' : 'New Banner')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label={sw ? 'Funga' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4">
          {/* Image */}
          <div>
            <label className={labelBase}>{sw ? 'Picha ya Bango' : 'Banner Image'}</label>
            <div className="relative rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 overflow-hidden">
              {previewUrl || (form.image_path.startsWith('/') ? form.image_path : '') ? (
                <img
                  src={previewUrl || form.image_path}
                  alt=""
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="h-36 flex flex-col items-center justify-center gap-2 text-neutral-400">
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-xs">{sw ? 'Hakuna picha bado' : 'No image yet'}</span>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-xl text-[11px] font-bold cursor-pointer disabled:opacity-60"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? (sw ? 'Inapakia...' : 'Uploading...') : sw ? 'Badilisha Picha' : 'Change Image'}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1.5">
              {sw ? 'JPG, PNG au WebP · hadi 2 MB · upana angalau 800px' : 'JPG, PNG or WebP · up to 2 MB · at least 800px wide'}
            </p>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          {/* Bilingual headline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>{sw ? 'Kichwa (Kiingereza)' : 'Headline (English)'}</label>
              <input className={fieldBase} value={form.headline_en} onChange={(e) => set('headline_en', e.target.value)} placeholder="Shake Off Phyto Fiber" />
            </div>
            <div>
              <label className={labelBase}>{sw ? 'Kichwa (Kiswahili)' : 'Headline (Kiswahili)'}</label>
              <input className={fieldBase} value={form.headline_sw} onChange={(e) => set('headline_sw', e.target.value)} placeholder="Shake Off Phyto Fiber" />
            </div>
          </div>

          {/* Bilingual subhead */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>{sw ? 'Maelezo (Kiingereza, hiari)' : 'Subtext (English, optional)'}</label>
              <input className={fieldBase} value={form.subhead_en} onChange={(e) => set('subhead_en', e.target.value)} placeholder={sw ? 'Maelezo mafupi ya ofa' : 'Short offer description'} />
            </div>
            <div>
              <label className={labelBase}>{sw ? 'Maelezo (Kiswahili, hiari)' : 'Subtext (Kiswahili, optional)'}</label>
              <input className={fieldBase} value={form.subhead_sw} onChange={(e) => set('subhead_sw', e.target.value)} placeholder={sw ? 'Maelezo mafupi ya ofa' : 'Short offer description'} />
            </div>
          </div>

          {/* CTA label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>{sw ? 'Kitufe (Kiingereza)' : 'Button (English)'}</label>
              <input className={fieldBase} value={form.cta_en} onChange={(e) => set('cta_en', e.target.value)} placeholder="Shop Shake Off" />
            </div>
            <div>
              <label className={labelBase}>{sw ? 'Kitufe (Kiswahili)' : 'Button (Kiswahili)'}</label>
              <input className={fieldBase} value={form.cta_sw} onChange={(e) => set('cta_sw', e.target.value)} placeholder="Nunua Shake Off" />
            </div>
          </div>

          {/* Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>{sw ? 'Mahali Kitufe Kinapopeleka' : 'Button Destination'}</label>
              <select
                className={fieldBase}
                value={isProductDestination(form.cta_destination) ? '__product__' : form.cta_destination}
                onChange={(e) => {
                  if (e.target.value === '__product__') {
                    // Reveal the product picker with the first catalog product
                    // pre-selected; the user can change it below.
                    set('cta_destination', `product:${products[0]?.id ?? ''}`);
                  } else {
                    set('cta_destination', e.target.value);
                  }
                }}
              >
                {HERO_DESTINATIONS.map((d) => (
                  <option key={d.id} value={d.id}>{sw ? d.sw : d.en}</option>
                ))}
                {products.length > 0 && <option value="__product__">{sw ? 'Bidhaa maalum...' : 'A specific product...'}</option>}
              </select>
            </div>
            {isProductDestination(form.cta_destination) ? (
              <div>
                <label className={labelBase}>{sw ? 'Chagua Bidhaa' : 'Choose Product'}</label>
                <select
                  className={fieldBase}
                  value={form.cta_destination.slice('product:'.length)}
                  onChange={(e) => set('cta_destination', `product:${e.target.value}`)}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{sw ? p.name.sw : p.name.en}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelBase}>{sw ? 'Hali' : 'Status'}</label>
                <select
                  className={fieldBase}
                  value={form.status}
                  onChange={(e) => set('status', e.target.value as 'draft' | 'published')}
                >
                  <option value="draft">{sw ? 'Rasimu' : 'Draft'}</option>
                  <option value="published">{sw ? 'Imechapishwa' : 'Published'}</option>
                </select>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            {sw ? 'Ghairi' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || uploading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {sw ? 'Hifadhi' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}