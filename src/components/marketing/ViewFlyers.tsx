import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ExternalLink, Loader2, X } from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { fetchPublishedFlyers, type PublishedFlyer } from '../../lib/flyers';
import { EdIcon } from '../brand/EdIcon';

/**
 * View Flyers — the PUBLIC customer-facing campaign showcase.
 * Queries REAL published flyer_campaigns (RLS exposes published only).
 * No fake content: an empty gallery states it plainly and points
 * distributors to Flyer Studio.
 *
 * Primary experience is a restrained depth carousel: one dominant
 * flyer, neighbors dimmed/scaled at the edges, drag + keyboard +
 * pagination. Motion communicates selection only.
 */
export function ViewFlyers() {
  const { lang } = useLang();
  const sw = lang === 'sw';
  const distributor = useDistributorStore((s) => s.getActiveDistributor());

  const [flyers, setFlyers] = useState<PublishedFlyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [detail, setDetail] = useState<PublishedFlyer | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchPublishedFlyers();
      setFlyers(rows);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load flyers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => Math.min(flyers.length - 1, Math.max(0, i + dir)));
    },
    [flyers.length]
  );

  useEffect(() => {
    if (detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detail, go]);

  const active = flyers[index];

  /* Product page route for the featured product (real catalog id). */
  const productLink = (f: PublishedFlyer) => `/products?focus=${encodeURIComponent(f.product_id)}`;
  const distributorLink = (f: PublishedFlyer) => `/@${f.distributor.slug}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8">
        <EdIcon name="flyer" className="w-7 h-7 text-primary-600 mx-auto mb-3" />
        <h1 className="text-xl sm:text-2xl font-black text-[#123B6D] tracking-tight">
          {sw ? 'Kampeni za Bidhaa' : 'Campaigns from Our Distributors'}
        </h1>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
          {sw
            ? 'Ofa halisi kutoka kwa wasambazaji waliorithibitishwa wa EdRetail.'
            : 'Real offers published by verified EdRetail distributors.'}
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
        </div>
      ) : error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={load} className="mt-3 text-xs font-semibold text-primary-600 hover:underline">
            {sw ? 'Jaribu tena' : 'Try again'}
          </button>
        </div>
      ) : flyers.length === 0 ? (
        <div className="py-16 text-center">
          <EdIcon name="flyer" className="w-9 h-9 text-neutral-300 mx-auto mb-4" />
          <p className="text-sm font-semibold text-neutral-700">
            {sw ? 'Hakuna kampeni zilizochapishwa bado.' : 'No flyers have been published yet.'}
          </p>
          <p className="text-xs text-neutral-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {sw
              ? 'Msambazaji? Tengeneza kampeni yako ya kwanza kwenye Studio ya Kampeni ndani ya Portal.'
              : 'Are you a distributor? Create your first campaign in Flyer Studio inside the Distributor Portal.'}
          </p>
        </div>
      ) : (
        <>
          {/* ── Depth carousel ── */}
          <div
            className="relative select-none"
            onTouchStart={(e) => setDragStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (dragStart == null) return;
              const dx = e.changedTouches[0].clientX - dragStart;
              setDragStart(null);
              if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
            }}
            role="region"
            aria-roledescription="carousel"
            aria-label={sw ? 'Kampeni' : 'Campaigns'}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              {/* Prev edge preview */}
              <div className="hidden sm:block w-24 lg:w-36 shrink-0 opacity-40 scale-95 transition-all duration-300">
                {flyers[index - 1] && (
                  <button onClick={() => go(-1)} className="block w-full" aria-label={sw ? 'Iliyopita' : 'Previous'}>
                    <img
                      src={flyers[index - 1].renderUrl}
                      alt=""
                      className="w-full rounded-lg border border-neutral-200 shadow-sm object-cover"
                    />
                  </button>
                )}
              </div>

              {/* Dominant flyer */}
              <div className="w-full max-w-[320px] sm:max-w-[360px] shrink-0">
                {active && (
                  <button
                    onClick={() => setDetail(active)}
                    className="block w-full cursor-zoom-in"
                    aria-label={sw ? 'Fungua kampeni' : 'Open campaign'}
                  >
                    <img
                      src={active.renderUrl}
                      alt={active.title}
                      className="w-full rounded-xl border border-neutral-200 shadow-lg object-cover transition-transform duration-300"
                    />
                  </button>
                )}
              </div>

              {/* Next edge preview */}
              <div className="hidden sm:block w-24 lg:w-36 shrink-0 opacity-40 scale-95 transition-all duration-300">
                {flyers[index + 1] && (
                  <button onClick={() => go(1)} className="block w-full" aria-label={sw ? 'Ifuatayo' : 'Next'}>
                    <img
                      src={flyers[index + 1].renderUrl}
                      alt=""
                      className="w-full rounded-lg border border-neutral-200 shadow-sm object-cover"
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={() => go(-1)}
                disabled={index === 0}
                className="p-2.5 min-h-[44px] min-w-[44px] rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 disabled:opacity-30 transition-all outline-none"
                aria-label={sw ? 'Iliyopita' : 'Previous'}
              >
                <ChevronLeft className="w-4 h-4 mx-auto" />
              </button>
              <div className="flex items-center gap-1.5">
                {flyers.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    aria-label={`${sw ? 'Kampeni' : 'Campaign'} ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all outline-none ${i === index ? 'w-5 bg-[#123B6D]' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => go(1)}
                disabled={index === flyers.length - 1}
                className="p-2.5 min-h-[44px] min-w-[44px] rounded-full border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 disabled:opacity-30 transition-all outline-none"
                aria-label={sw ? 'Ifuatayo' : 'Next'}
              >
                <ChevronRight className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>

          {/* Distributor strip — real identity behind the featured flyer */}
          {active && (
            <div className="mt-8 max-w-md mx-auto text-center">
              <p className="text-sm font-bold text-neutral-900">{active.distributor.store_name || active.distributor.slug}</p>
              <p className="text-xs text-neutral-500">
                {active.distributor.city ? `${active.distributor.city} · ` : ''}
                {sw ? 'Msambazaji Alieverifikishwa' : 'Verified Distributor'}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Detail modal — the campaign bridge ── */}
      {detail && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDetail(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-xl border border-neutral-200 shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={detail.renderUrl} alt={detail.title} className="w-full object-cover max-h-[60vh]" />
              <button
                onClick={() => setDetail(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 border border-neutral-200 text-neutral-600 hover:text-neutral-900 outline-none"
                aria-label={sw ? 'Funga' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">{detail.title}</h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{detail.headline}</p>
              </div>

              <div className="flex items-center gap-3 py-3 border-y border-neutral-100">
                <img src="/logo/distributor-circle.png" alt="" className="w-10 h-10 rounded-full border border-neutral-200 object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">{detail.distributor.store_name || detail.distributor.slug}</p>
                  <p className="text-xs text-neutral-500">{detail.distributor.city}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <a
                  href={`https://wa.me/${(distributor.phone || '').replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] rounded-md bg-[#0E6B52] hover:bg-[#0a5442] text-white text-xs font-bold transition-colors outline-none"
                >
                  <MessageCircle className="w-4 h-4" />
                  {sw ? 'Wasiliana WhatsApp' : 'Chat on WhatsApp'}
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={productLink(detail)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors outline-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {sw ? 'Ona Bidhaa' : 'View Product'}
                  </a>
                  <a
                    href={distributorLink(detail)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 min-h-[44px] rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors outline-none"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {sw ? 'Msambazaji' : 'View Distributor'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
