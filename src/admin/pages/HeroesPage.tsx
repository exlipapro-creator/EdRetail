import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Archive,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import { PageHeader, Spinner } from '../../components/ui';
import { useLang } from '../../context/LangContext';
import {
  HeroSlide,
  HERO_STATUS_LABEL,
  fetchAllHeroes,
  heroImageUrl,
  publishHero,
  unpublishHero,
  archiveHero,
  deleteHero,
  deleteHeroImage,
} from '../../lib/heroes';
import { HeroFormModal } from '../../components/marketing/HeroFormModal';

interface AdminHeroRow extends HeroSlide {
  imageUrl: string;
  store_name?: string;
  slug?: string;
}

export function HeroesPage() {
  const { lang } = useLang();
  const sw = lang === 'sw';

  const [heroes, setHeroes] = useState<AdminHeroRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AdminHeroRow | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = (await fetchAllHeroes()) as unknown as AdminHeroRow[];
      await Promise.all(
        rows.map(async (r) => {
          r.imageUrl = await heroImageUrl(r.image_path);
        })
      );
      setHeroes(rows);
      setError('');
    } catch {
      setError(sw ? 'Imeshindikana kupakia mabango. Tafadhali jaribu tena.' : 'Could not load hero banners. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [sw]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2600);
  };

  const togglePublish = async (h: AdminHeroRow) => {
    setBusyId(h.id);
    setError('');
    try {
      if (h.status === 'published') {
        await unpublishHero(h.id);
        flash(sw ? 'Bango limesitishwa.' : 'Banner unpublished.');
      } else {
        await publishHero(h.id);
        flash(sw ? 'Bango limechapishwa!' : 'Banner published!');
      }
      await refresh();
    } catch {
      setError(sw ? 'Imeshindikana kubadilisha hali.' : 'Could not change the banner status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleArchive = async (h: AdminHeroRow) => {
    setBusyId(h.id);
    setError('');
    try {
      await archiveHero(h.id);
      flash(sw ? 'Bango limehifadhiwa kumbukumbu.' : 'Banner archived.');
      await refresh();
    } catch {
      setError(sw ? 'Imeshindikana kuhifadhi kumbukumbu.' : 'Could not archive the banner.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    setError('');
    try {
      await deleteHeroImage(confirmDelete.image_path);
      await deleteHero(confirmDelete.id);
      setConfirmDelete(null);
      flash(sw ? 'Bango limefutwa.' : 'Banner deleted.');
      await refresh();
    } catch {
      setError(sw ? 'Imeshindikana kufuta bango.' : 'Could not delete the banner.');
    } finally {
      setBusyId(null);
    }
  };

  const statusBadge = (s: HeroSlide['status']) => {
    const label = HERO_STATUS_LABEL[s];
    const cls =
      s === 'published'
        ? 'bg-success-50 text-success-700 border-success-200'
        : s === 'archived'
          ? 'bg-neutral-100 text-neutral-500 border-neutral-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border ${cls}`}>
        {sw ? label.sw : label.en}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      <PageHeader
        title={sw ? 'Mabango ya Duka' : 'Storefront Banners'}
        sub={sw ? 'Mabango yote ya dukani — wasambazaji na mabango makubwa' : 'All storefront hero banners — distributor and global'}
        actions={
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {sw ? 'Bango Jipya la Kimataifa' : 'New Global Banner'}
          </button>
        }
      />

      {error && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs text-success-700 bg-success-50 border border-success-200 rounded-lg px-3.5 py-2.5 mb-4">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><Spinner /></div>
      ) : heroes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-extrabold text-gray-900">{sw ? 'Hakuna mabango bado' : 'No hero banners yet'}</h2>
        </div>
      ) : (
        <div className="space-y-2">
          {heroes.map((h) => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-24 h-14 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                {h.imageUrl ? (
                  <img src={h.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 truncate">
                    {sw ? h.headline_sw || h.headline_en : h.headline_en || h.headline_sw}
                  </h3>
                  {statusBadge(h.status)}
                </div>
                <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
                  {h.distributor_id === null ? (
                    <span className="inline-flex items-center gap-1 text-primary-600 font-semibold">
                      <Globe className="w-3 h-3" /> {sw ? 'Kimataifa (mabango yote)' : 'Global (all storefronts)'}
                    </span>
                  ) : (
                    <span>{h.store_name || (h.slug ? `@${h.slug}` : '—')}</span>
                  )}
                  <span className="text-gray-300">·</span>
                  <span>{h.sort_order}</span>
                  <span className="text-gray-300">·</span>
                  <span>{sw ? h.cta_sw || h.cta_en : h.cta_en || h.cta_sw}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setEditing(h);
                    setFormOpen(true);
                  }}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
                  aria-label={sw ? 'Hariri' : 'Edit'}
                  title={sw ? 'Hariri' : 'Edit'}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => togglePublish(h)}
                  disabled={busyId === h.id}
                  className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                    h.status === 'published'
                      ? 'text-amber-600 hover:bg-amber-50'
                      : 'text-success-600 hover:bg-success-50'
                  }`}
                  aria-label={h.status === 'published' ? (sw ? 'Sitisha' : 'Unpublish') : sw ? 'Chapisha' : 'Publish'}
                  title={h.status === 'published' ? (sw ? 'Sitisha' : 'Unpublish') : sw ? 'Chapisha' : 'Publish'}
                >
                  {busyId === h.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : h.status === 'published' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {h.status !== 'archived' && (
                  <button
                    onClick={() => handleArchive(h)}
                    disabled={busyId === h.id}
                    className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer disabled:opacity-50"
                    aria-label={sw ? 'Hifadhi kumbukumbu' : 'Archive'}
                    title={sw ? 'Hifadhi kumbukumbu' : 'Archive'}
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(h)}
                  disabled={busyId === h.id}
                  className="p-2 rounded-lg text-neutral-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label={sw ? 'Futa' : 'Delete'}
                  title={sw ? 'Futa' : 'Delete'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <HeroFormModal
          isOpen
          onClose={() => setFormOpen(false)}
          hero={editing}
          scope={editing?.distributor_id ? { kind: 'distributor', profileId: editing.distributor_id } : { kind: 'global' }}
          onSaved={refresh}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={sw ? 'Thibitisha kufuta' : 'Confirm delete'}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 p-5 space-y-4"
          >
            <h2 className="text-sm font-extrabold text-gray-900">{sw ? 'Futa bango hili?' : 'Delete this banner?'}</h2>
            <p className="text-xs text-gray-500">
              {sw
                ? 'Bango litaondolewa kabisa na halitaonekana tena. Hatua hii haiwezi kutenduliwa.'
                : 'The banner will be permanently removed and will no longer appear. This cannot be undone.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                {sw ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={busyId === confirmDelete.id}
                className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {busyId === confirmDelete.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sw ? 'Futa' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}