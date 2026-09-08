import { useState, FormEvent, useEffect } from 'react';
import { ExternalLink, Copy, Check, Loader2, Store } from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { useLang } from '../../context/LangContext';
import { supabase } from '../../lib/supabase';
import { EdIcon } from '../../components/brand/EdIcon';

/**
 * Storefront Management (/portal/storefront) — the distributor's control
 * surface for her PUBLIC storefront presence. Distinct from Profile:
 * Profile = her account/identity; Storefront = what customers see.
 *
 * Backed by the REAL distributor_profiles columns (store_name, bio, city,
 * phone) via the self-update RLS policy. Fields with no backend (product
 * presentation ordering, flyer presence toggles) are documented gaps, not
 * fake controls.
 */
export function DistributorStorefrontPage() {
  const { lang } = useLang();
  const sw = lang === 'sw';
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const updateCurrentProfile = useDistributorStore((s) => s.updateCurrentProfile);

  const [storeName, setStoreName] = useState(distributor.storeName || '');
  const [bio, setBio] = useState(distributor.bio || '');
  const [city, setCity] = useState(distributor.city || '');
  const [phone, setPhone] = useState(distributor.phone || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setStoreName(distributor.storeName || '');
    setBio(distributor.bio || '');
    setCity(distributor.city || '');
    setPhone(distributor.phone || '');
  }, [distributor.id]);

  const publicUrl = `${window.location.origin}/@${distributor.slug}`;

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Persist through the real self-update path (distributor_profiles RLS).
      const { error: dbError } = await supabase
        .from('distributor_profiles')
        .update({ store_name: storeName.trim(), bio: bio.trim(), city: city.trim(), phone: phone.trim() })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '');

      if (dbError) throw dbError;

      updateCurrentProfile({ storeName: storeName.trim(), bio: bio.trim(), city: city.trim(), phone: phone.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : sw ? 'Imeshindikana kuhifadhi.' : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="portal-page space-y-6">
      {/* ── Header ── */}
      <div className="panel-surface p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <Store className="w-4.5 h-4.5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900">{sw ? 'Dhibiti Duka Lako' : 'Storefront Management'}</h2>
              <p className="text-xs text-gray-500">
                {sw ? 'Jinsi wateja wanavyoona duka yako ya umma.' : 'How customers see your public storefront.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => window.open(publicUrl, '_blank', 'noopener')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors outline-none"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {sw ? 'Tazama Duka' : 'Preview Store'}
          </button>
        </div>

        <div className="mt-4 flex items-center gap-2 py-3 border-t border-gray-100">
          <code className="text-[11px] text-gray-500 truncate flex-1">{publicUrl}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold text-primary-600 hover:bg-primary-50 transition-colors outline-none"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? (sw ? 'Imenakiliwa' : 'Copied') : sw ? 'Nakili' : 'Copy'}
          </button>
        </div>
      </div>

      {/* ── Store identity ── */}
      <form onSubmit={handleSave} className="panel-surface p-5 sm:p-6 space-y-5">
        <h3 className="text-sm font-bold text-gray-900">{sw ? 'Utambulisho wa Duka' : 'Store Identity'}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="store-name" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Jina la Duka' : 'Store name'}
            </label>
            <input
              id="store-name"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder={sw ? 'mf. EdRetail {distributor.rank}' : 'e.g. EdRetail Wellness'}
              className="portal-input"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {sw ? 'Inaonekana kichwa cha duka yako ya umma.' : 'Shown at the top of your public storefront.'}
            </p>
          </div>
          <div>
            <label htmlFor="store-city" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Mkoa / Jiji' : 'City / Region'}
            </label>
            <input id="store-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} className="portal-input" />
          </div>
          <div>
            <label htmlFor="store-phone" className="block text-xs font-semibold text-gray-500 mb-1">
              {sw ? 'Simu / WhatsApp' : 'Phone / WhatsApp'}
            </label>
            <input id="store-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="portal-input" />
          </div>
        </div>

        <div>
          <label htmlFor="store-bio" className="block text-xs font-semibold text-gray-500 mb-1">
            {sw ? 'Maelezo ya Duka' : 'Public description'}
          </label>
          <textarea
            id="store-bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={sw ? 'Maelezo mafupi wateja watakayoyaona kwenye duka yako.' : 'A short description customers will see on your storefront.'}
            className="portal-input"
          />
        </div>

        {saved && (
          <div role="status" className="p-3 bg-green-50 border border-green-200 rounded-md text-xs text-success font-semibold">
            {sw ? 'Duka limesasishwa.' : 'Storefront updated.'}
          </div>
        )}
        {error && (
          <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 min-h-[44px] rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none disabled:opacity-50 inline-flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {sw ? 'Hifadhi Mabadiliko' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* ── Documented gaps — real backend absent, no fake controls ── */}
      <section className="panel-surface p-5 sm:p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-1">{sw ? 'Zinazokuja' : 'Coming to Storefront Management'}</h3>
        <ul className="space-y-2 mt-2">
          {[
            { icon: <EdIcon name="leaf" className="w-4 h-4" />, en: 'Product presentation ordering', sw: 'Mpangilio wa bidhaa kwenye duka' },
            { icon: <EdIcon name="flyer" className="w-4 h-4" />, en: 'Published flyer campaigns on your storefront', sw: 'Kampeni zilizochapishwa kwenye duka yako' },
          ].map((g) => (
            <li key={g.en} className="flex items-center gap-2.5 text-xs text-gray-500 py-1.5 border-b border-gray-50 last:border-0">
              <span className="text-gray-300">{g.icon}</span>
              {sw ? g.sw : g.en}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
