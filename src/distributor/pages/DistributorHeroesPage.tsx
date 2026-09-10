import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Loader2,
  Image as ImageIcon,
  Globe,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import {
  HeroSlide,
  HERO_STATUS_LABEL,
  fetchMyHeroes,
  fetchMyProfileId,
  heroImageUrl,
  publishHero,
  unpublishHero,
  deleteHero,
  persistHeroOrder,
  deleteHeroImage,
} from '../../lib/heroes';
import { HeroFormModal } from '../../components/marketing/HeroFormModal';

export function DistributorHeroesPage() {
  const { lang } = useLang();
  const sw = lang === 'sw';

  // Owner scope comes from the REAL profile (session user_id → profile),
  // not the storefront registry — the store's getActiveDistributor() is
  // empty in the portal context and would silently degrade saves to global.
  const [profileId, setProfileId] = useState<string | null>(null);
  const [heroes, setHeroes] = useState<(HeroSlide & { imageUrl: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<HeroSlide | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProfileId(await fetchMyProfileId());
      const rows = await fetchMyHeroes();
      await Promise.all(
        rows.map(async (r) => {
          (r as HeroSlide & { imageUrl: string }).imageUrl = await heroImageUrl(r.image_path);
        })
      );
      setHeroes(rows as (HeroSlide & { imageUrl: string })[]);
      setError('');
    } catch {
      setError(sw ? 'Imeshindikana kupakia mabango yako. Tafadhali jaribu tena.' : 'Could not load your hero banners. Please try again.');
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

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= heroes.length) return;
    const next = [...heroes];
    [next[index], next[target]] = [next[target], next[index]];
    setHeroes(next);
    try {
      await persistHeroOrder(next.map((h) => h.id));
      flash(sw ? 'Mpangilio umehifadhiwa.' : 'Order saved.');
    } catch {
      await refresh();
      setError(sw ? 'Imeshindikana kubadilisha mpangilio.' : 'Could not save the new order.');
    }
  };

  const togglePublish = async (h: HeroSlide) => {
    setBusyId(h.id);
    setError('');
    try {
      if (h.status === 'published') {
        await unpublishHero(h.id);
        flash(sw ? 'Bango limesitishwa kuonekana.' : 'Banner unpublished.');
      } else {
        await publishHero(h.id);
        flash(sw ? 'Bango limechapishwa!' : 'Banner published!');
      }
      await refresh();
    } catch {
      setError(sw ? 'Imeshindikana kubadilisha hali. Tafadhali jaribu tena.' : 'Could not change the banner status. Please try again.');
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
    <div className="portal-page space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{sw ? 'Mabango ya Duka' : 'Storefront Banners'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {sw
              ? 'Mabango yanayoonekana juu ya duka lako kwa wateja.'
              : 'Banners shown at the top of your storefront to customers.'}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {sw ? 'Bango Jipya' : 'New Banner'}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-xs text-success-700 bg-success-50 border border-success-200 rounded-xl px-3.5 py-2.5">
          {notice}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
        </div>
      ) : heroes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-extrabold text-gray-900">{sw ? 'Hakuna mabango bado' : 'No hero banners yet'}</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {sw
              ? 'Ongeza bango lako la kwanza ili wateja waone bidhaa zako mara tu wanapofungua duka lako.'
              : 'Add your first banner so customers see your products the moment they open your store.'}
          </p>
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {sw ? 'Ongeza Bango' : 'Add Banner'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {heroes.map((h, idx) => (
            <div key={h.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              {/* Image preview — the artwork is the visual focus */}
              <div className="relative h-36 bg-neutral-100">
                {h.imageUrl ? (
                  <img src={h.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute top-2 left-2">{statusBadge(h.status)}</div>
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-neutral-700 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={sw ? 'Sogeza juu' : 'Move up'}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === heroes.length - 1}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-neutral-700 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={sw ? 'Sogeza chini' : 'Move down'}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-3.5 space-y-2.5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">
                    {sw ? h.headline_sw || h.headline_en : h.headline_en || h.headline_sw}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {sw ? h.cta_sw || h.cta_en : h.cta_en || h.cta_sw}
                    {h.distributor_id === null && (
                      <span className="inline-flex items-center gap-1 ml-1.5 text-primary-600 font-semibold">
                        <Globe className="w-3 h-3" /> {sw ? 'Zote' : 'Global'}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditing(h);
                      setFormOpen(true);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {sw ? 'Hariri' : 'Edit'}
                  </button>
                  <button
                    onClick={() => togglePublish(h)}
                    disabled={busyId === h.id}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
                      h.status === 'published'
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                        : 'bg-success-600 hover:bg-success-700 text-white'
                    }`}
                  >
                    {busyId === h.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : h.status === 'published' ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                    {h.status === 'published' ? (sw ? 'Sitisha' : 'Unpublish') : sw ? 'Chapisha' : 'Publish'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(h)}
                    disabled={busyId === h.id}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    aria-label={sw ? 'Futa bango' : 'Delete banner'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / edit */}
      {formOpen && (
        <HeroFormModal
          isOpen
          onClose={() => setFormOpen(false)}
          hero={editing}
          scope={profileId ? { kind: 'distributor', profileId } : { kind: 'global' }}
          onSaved={refresh}
        />
      )}

      {/* Delete confirm */}
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
                ? 'Bango litaondolewa kabisa na halitaonekana tena kwa wateja. Hatua hii haiwezi kutenduliwa.'
                : 'The banner will be permanently removed and will no longer appear to customers. This cannot be undone.'}
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