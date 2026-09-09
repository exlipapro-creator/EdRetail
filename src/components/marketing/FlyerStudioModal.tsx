import { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  Share2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Trash2,
  EyeOff,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore } from '../../store/distributorStore';
import { supabase } from '../../lib/supabase';
import { publicSiteOrigin } from '../../lib/site';
import {
  DESIGN_FAMILIES,
  FLYER_FORMATS,
  runQualityGate,
  saveCampaignDraft,
  uploadRender,
  publishCampaign,
  deleteCampaign,
  fetchMyCampaigns,
  renderUrl,
  unpublishCampaign,
  type DesignFamily,
  type FlyerFormat,
  type FlyerCampaign,
} from '../../lib/flyers';
import {
  renderFlyer,
  renderFlyerPreview,
  canvasToBlob,
  type FlyerRenderInput,
} from './flyerEngine';
import { EdIcon } from '../brand/EdIcon';

interface FlyerStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage = 'gallery' | 'editor';

const emptyForm = {
  title: '',
  headline: '',
  description: '',
  offer: '',
  cta: 'Order Now',
  phone: '',
  qr: true,
};

export const FlyerStudioModal: React.FC<FlyerStudioModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLang();
  const sw = lang === 'sw';
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const getEffectiveProduct = useDistributorStore((s) => s.getEffectiveProduct);
  const getEffectiveProducts = useDistributorStore((s) => s.getEffectiveProducts);

  const [stage, setStage] = useState<Stage>('gallery');
  const [campaigns, setCampaigns] = useState<FlyerCampaign[]>([]);
  const [renderUrls, setRenderUrls] = useState<Record<string, string>>({});
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string>('');
  const [family, setFamily] = useState<DesignFamily>('editorial');
  const [format, setFormat] = useState<FlyerFormat>('status');
  const [form, setForm] = useState(emptyForm);
  const [priceOverride, setPriceOverride] = useState<string>('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [rendering, setRendering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gate, setGate] = useState<{ ok: boolean; problems: string[]; problemsSw: string[] } | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const products = getEffectiveProducts();
  const activeProduct = getEffectiveProduct(productId) || products[0];

  /* QR generation — real destination: /@slug product deep link */
  useEffect(() => {
    if (!form.qr || !distributor.slug) {
      setQrDataUrl('');
      return;
    }
    // Deploy-aware: QRs are baked into shared flyers, so they must point at
    // the production domain even when generated from localhost.
    const dest = `${publicSiteOrigin()}/@${distributor.slug}?product=${productId}`;
    import('qrcode')
      .then((QR) => QR.toDataURL(dest, { width: 480, margin: 1, color: { dark: '#111827', light: '#FFFFFF' } }))
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [form.qr, distributor.slug, productId]);

  const buildRenderInput = useCallback((): FlyerRenderInput | null => {
    if (!activeProduct) return null;
    return {
      family,
      format,
      productName: sw ? activeProduct.name.sw : activeProduct.name.en,
      productImage: activeProduct.image,
      productBadge: activeProduct.badge,
      headline: form.headline.trim(),
      description: form.description.trim(),
      price: priceOverride ? Number(priceOverride.replace(/[^\d]/g, '')) : activeProduct.price,
      offer: form.offer.trim(),
      cta: form.cta.trim() || (sw ? 'Agiza Sasa' : 'Order Now'),
      phone: form.phone.trim() || distributor.phone,
      distributorName: distributor.name,
      distributorRank: distributor.rank || 'Crown Manager',
      distributorCity: distributor.city,
      distributorAvatar: distributor.avatarUrl || '/logo/distributor-circle.png',
      qrDataUrl,
      lang,
    };
  }, [activeProduct, family, format, form, priceOverride, qrDataUrl, distributor, sw, lang]);

  /* Live preview (debounced) */
  useEffect(() => {
    if (stage !== 'editor' || !isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const input = buildRenderInput();
      if (!input || !previewRef.current) return;
      setRendering(true);
      try {
        await renderFlyerPreview(input, previewRef.current, 340);
      } catch {
        /* preview failure is non-fatal; publish re-renders at full res */
      } finally {
        setRendering(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stage, isOpen, buildRenderInput]);

  const loadCampaigns = useCallback(async () => {
    setLoadingCampaigns(true);
    try {
      const rows = await fetchMyCampaigns();
      setCampaigns(rows);
      // Signed URLs (bucket is private); owners resolve their own renders.
      const urls: Record<string, string> = {};
      await Promise.all(
        rows
          .filter((r) => r.render_path)
          .map(async (r) => {
            urls[r.id] = await renderUrl(r.render_path);
          })
      );
      setRenderUrls(urls);
    } catch (err: unknown) {
      // Never masquerade a load failure as an empty library.
      setCampaigns([]);
      setLoadError(err instanceof Error ? err.message : sw ? 'Imeshindikana kupakia kampeni.' : 'Could not load campaigns.');
    } finally {
      setLoadingCampaigns(false);
    }
  }, [sw]);

  useEffect(() => {
    if (isOpen && stage === 'gallery') void loadCampaigns();
  }, [isOpen, stage, loadCampaigns]);

  const resetForm = () => {
    setEditingId(null);
    setProductId(products[0]?.id ?? '');
    setFamily('editorial');
    setFormat('status');
    setForm({ ...emptyForm, phone: distributor.phone });
    setPriceOverride('');
    setGate(null);
    setStatusMsg('');
    setErrorMsg('');
  };

  const startNew = () => {
    resetForm();
    setStage('editor');
  };

  const editCampaign = (c: FlyerCampaign) => {
    setEditingId(c.id);
    setProductId(c.product_id);
    setFamily(c.design_family);
    setFormat(c.format);
    setForm({
      title: c.title,
      headline: c.headline,
      description: c.description,
      offer: c.offer,
      cta: c.cta || 'Order Now',
      phone: c.phone || distributor.phone,
      qr: !!c.qr_destination,
    });
    setPriceOverride(c.price != null ? String(c.price) : '');
    setGate(null);
    setStatusMsg('');
    setErrorMsg('');
    setStage('editor');
  };

  const buildCampaignPayload = () => {
    if (!activeProduct) return null;
    return {
      id: editingId ?? undefined,
      product_id: activeProduct.id,
      title: form.title.trim(),
      headline: form.headline.trim(),
      description: form.description.trim(),
      price: priceOverride ? Number(priceOverride.replace(/[^\d]/g, '')) : activeProduct.price,
      offer: form.offer.trim(),
      cta: form.cta.trim(),
      phone: form.phone.trim() || distributor.phone,
      design_family: family,
      format,
      qr_destination: qrDataUrl ? `${publicSiteOrigin()}/@${distributor.slug}?product=${productId}` : '',
    };
  };

  const handleSave = async (thenPublish: boolean) => {
    setErrorMsg('');
    setStatusMsg('');
    const payload = buildCampaignPayload();
    if (!payload) return;

    setSaving(true);
    let uploadedPath = ''; // for orphan cleanup if a later step fails
    try {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error(sw ? 'Tafadhali ingia kwanza.' : 'Please sign in first.');

      const { data: profile } = await supabase
        .from('distributor_profiles')
        .select('id')
        .eq('user_id', uid)
        .maybeSingle();
      if (!profile) throw new Error(sw ? 'Hakuna wasifu wa msambazaji.' : 'No distributor profile found.');

      /* ── 1. QUALITY GATE FIRST — no expensive work for invalid content.
       *      Publish requires a render; drafts may still save without one. */
      const localGate = runQualityGate(
        {
          ...payload,
          distributor_id: profile.id,
          render_path: 'pending', // rendered below when gate passes
        } as FlyerCampaign,
        !!activeProduct.image
      );
      if (thenPublish && !localGate.ok) {
        setGate(localGate);
        setErrorMsg(sw ? localGate.problemsSw.join(' · ') : localGate.problems.join(' · '));
        setSaving(false);
        return;
      }

      /* ── 2. Persist the draft row FIRST so the render path can be
       *      campaign-scoped (flyers/{profile}/{campaign}.png).
       *      Lifecycle status: a save must never silently change it —
       *      preserve the row's current status; only brand-new campaigns
       *      start as draft. (Publish/Unpublish are explicit actions.) */
      const existing = campaigns.find((c) => c.id === editingId);
      const saved = await saveCampaignDraft({
        ...payload,
        distributor_id: profile.id,
        status: existing?.status ?? ('draft' as const),
        render_path: existing?.render_path ?? '',
      });

      /* ── 3. Render + upload when needed. */
      let renderPath = existing?.render_path ?? '';
      const needsRender = thenPublish || !renderPath;
      if (needsRender) {
        const input = buildRenderInput();
        if (!input) throw new Error(sw ? 'Chagua bidhaa.' : 'Select a product.');
        setRendering(true);
        const canvas = await renderFlyer(input);
        const blob = await canvasToBlob(canvas);
        renderPath = await uploadRender(profile.id, saved.id, blob);
        uploadedPath = renderPath;
        setRendering(false);
      }

      /* ── 4. Attach the render path to the row. */
      await saveCampaignDraft({
        ...saved,
        render_path: renderPath,
      });

      /* ── 5. Publish only after: gate ✓, row saved ✓, asset uploaded ✓. */
      if (thenPublish) {
        await publishCampaign(saved.id);
        setStatusMsg(sw ? 'Kampeni imechapishwa.' : 'Campaign published.');
      } else {
        setStatusMsg(sw ? 'Rasimu imehifadhiwa.' : 'Draft saved.');
      }

      setEditingId(saved.id);
      await loadCampaigns();
    } catch (err: unknown) {
      // Orphan cleanup: if the upload succeeded but a later step failed,
      // remove the render so storage never holds unowned assets.
      if (uploadedPath) {
        try {
          await supabase.storage.from('flyer-renders').remove([uploadedPath]);
        } catch {
          /* best-effort cleanup; the path is owner-scoped so it is
             removable on the next successful save of this campaign */
        }
      }
      setErrorMsg(err instanceof Error ? err.message : sw ? 'Imeshindikana.' : 'Something went wrong.');
    } finally {
      setSaving(false);
      setRendering(false);
    }
  };

  const handleDownload = async () => {
    const input = buildRenderInput();
    if (!input) return;
    setRendering(true);
    try {
      const canvas = await renderFlyer(input);
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EdRetail_${activeProduct?.id ?? 'flyer'}_${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setRendering(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const input = buildRenderInput();
    if (!input) return;
    setRendering(true);
    try {
      const canvas = await renderFlyer(input);
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'edretail-flyer.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean; share?: (d: unknown) => Promise<void> };
      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({ files: [file], title: form.title || 'EdRetail', text: form.headline });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'edretail-flyer.png';
        a.click();
        URL.revokeObjectURL(url);
        setStatusMsg(
          sw
            ? 'Picha imepakuliwa — ambatanisha kwenye WhatsApp.'
            : 'Image downloaded — attach it in WhatsApp.'
        );
      }
    } finally {
      setRendering(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaign(id);
      await loadCampaigns();
    } catch {
      setErrorMsg(sw ? 'Imeshindikana kufuta.' : 'Could not delete.');
    }
  };

  if (!isOpen) return null;

  const statusLabel = (s: FlyerCampaign['status']) =>
    s === 'published' ? (sw ? 'Imechapishwa' : 'Published') : s === 'archived' ? (sw ? 'Imehifadhiwa' : 'Archived') : sw ? 'Rasimu' : 'Draft';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-6 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-5xl max-h-[95vh] overflow-hidden bg-white rounded-xl border border-gray-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {stage === 'editor' && (
              <button
                onClick={() => setStage('gallery')}
                className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors outline-none"
                aria-label={sw ? 'Rudi kwa kampeni' : 'Back to campaigns'}
              >
                <X className="w-4 h-4 rotate-45" />
              </button>
            )}
            <EdIcon name="flyer" className="w-5 h-5 text-primary-600 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">
                {stage === 'gallery' ? (sw ? 'Studio ya Kampeni' : 'Flyer Studio') : editingId ? (sw ? 'Hariri Kampeni' : 'Edit Campaign') : sw ? 'Kampeni Mpya' : 'Create Campaign'}
              </h2>
              <p className="text-[11px] text-gray-400">
                {stage === 'gallery'
                  ? sw
                    ? 'Tengeneza, chapisha na shiriki kampeni za bidhaa.'
                    : 'Create, publish and share real product campaigns.'
                  : activeProduct
                    ? activeProduct.name.en
                    : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors outline-none"
            aria-label={sw ? 'Funga' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GALLERY STAGE */}
        {stage === 'gallery' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-sm font-bold text-gray-900">{sw ? 'Kampeni Zangu' : 'My Campaigns'}</h3>
              <button
                onClick={startNew}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none"
              >
                + {sw ? 'Kampeni Mpya' : 'Create Campaign'}
              </button>
            </div>

            {loadingCampaigns ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : loadError ? (
              <div className="py-12 text-center">
                <AlertTriangle className="w-7 h-7 text-amber-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">{loadError}</p>
                <button
                  onClick={() => void loadCampaigns()}
                  className="mt-3 px-4 py-2 min-h-[44px] rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors outline-none"
                >
                  {sw ? 'Jaribu tena' : 'Try again'}
                </button>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="py-12 text-center">
                <EdIcon name="flyer" className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  {sw ? 'Hakuna kampeni bado.' : 'No campaigns yet.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {sw ? 'Tengeneza kampeni yako ya kwanza kutoka kwa bidhaa halisi.' : 'Create your first campaign from a real product.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {campaigns.map((c) => (
                  <div key={c.id} className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-gray-300 transition-colors">
                    <button onClick={() => editCampaign(c)} className="block w-full text-left">
                      <div className="aspect-[9/14] bg-gray-50 flex items-center justify-center overflow-hidden">
                        {c.render_path ? (
                          <img
                            src={renderUrls[c.id] ?? ''}
                            alt={c.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <EdIcon name="flyer" className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="p-2.5 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-900 truncate">{c.title || c.headline || 'Untitled'}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              c.status === 'published' ? 'bg-success' : c.status === 'archived' ? 'bg-gray-300' : 'bg-amber-400'
                            }`}
                          />
                          {statusLabel(c.status)} · {FLYER_FORMATS[c.format].label}
                        </p>
                      </div>
                    </button>
                    {/* Lifecycle actions: delete always; Unpublish for published rows. */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {c.status === 'published' && (
                        <button
                          onClick={async () => {
                            try {
                              await unpublishCampaign(c.id);
                              await loadCampaigns();
                            } catch (err: unknown) {
                              setErrorMsg(err instanceof Error ? err.message : 'Unpublish failed.');
                            }
                          }}
                          className="p-1.5 rounded-md bg-white/90 border border-gray-200 text-gray-400 hover:text-amber-600 transition-colors outline-none"
                          aria-label={sw ? 'Sitisha kuchapishwa' : 'Unpublish campaign'}
                          title={sw ? 'Sitisha kuchapishwa' : 'Unpublish'}
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-md bg-white/90 border border-gray-200 text-gray-400 hover:text-red-600 transition-colors outline-none"
                        aria-label={sw ? 'Futa kampeni' : 'Delete campaign'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDITOR STAGE — three-pane studio on desktop, single scroll on
            mobile with a sticky bottom action bar (44px targets) */}
        {stage === 'editor' && (
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
            {/* CENTER: dominant preview */}
            <div className="lg:flex-1 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 p-4 flex items-start justify-center overflow-y-auto min-h-[320px]">
              <canvas ref={previewRef} className="max-w-full lg:max-w-[380px] w-auto h-auto rounded-md shadow-md border border-gray-200 bg-white" />
            </div>

            {/* RIGHT: controls */}
            <div className="flex-1 lg:max-w-md overflow-y-auto p-4 sm:p-6 space-y-5 min-h-0 pb-24 lg:pb-6">
              {/* Product */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{sw ? 'Bidhaa (halisi)' : 'Product (real catalog)'}</label>
                <select
                  value={activeProduct?.id ?? ''}
                  onChange={(e) => setProductId(e.target.value)}
                  className="portal-input"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {sw ? p.name.sw : p.name.en} — {p.price.toLocaleString()} TZS
                    </option>
                  ))}
                </select>
                {activeProduct?.image && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={activeProduct.image} alt="" className="w-8 h-8 object-contain rounded border border-gray-200 bg-white" />
                    <span className="text-[10px] text-gray-400">{sw ? 'Picha halisi ya bidhaa itatumika.' : 'The real product asset will be used.'}</span>
                  </div>
                )}
              </div>

              {/* Design family */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{sw ? 'Mtindo wa Ubunifu' : 'Design family'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {DESIGN_FAMILIES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFamily(f.id)}
                      className={`px-2 py-2.5 min-h-[44px] rounded-md border text-[11px] font-semibold transition-colors outline-none ${
                        family === f.id
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {sw ? f.labelSw : f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{sw ? 'Ukubwa' : 'Output format'}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(FLYER_FORMATS) as FlyerFormat[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`px-1 py-2.5 min-h-[44px] rounded-md border text-[11px] font-semibold transition-colors outline-none ${
                        format === f
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {sw ? FLYER_FORMATS[f].labelSw : FLYER_FORMATS[f].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copy fields */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Jina la Kampeni' : 'Campaign title'}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="portal-input"
                    placeholder={sw ? 'mf. Ofa ya Mwezi' : 'e.g. Monthly Offer'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Kichwa cha Habari' : 'Headline'}</label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    className="portal-input"
                    placeholder={sw ? 'Ujumbe mkuu kwenye picha' : 'Main message on the flyer'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Maelezo' : 'Description'}</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="portal-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Ofa' : 'Offer tag'}</label>
                    <input
                      type="text"
                      value={form.offer}
                      onChange={(e) => setForm({ ...form, offer: e.target.value })}
                      className="portal-input"
                      placeholder={sw ? 'mf. BEI YA POA' : 'e.g. SPECIAL OFFER'}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Bei (binafsi)' : 'Price override'}</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={priceOverride}
                      onChange={(e) => setPriceOverride(e.target.value)}
                      className="portal-input"
                      placeholder={activeProduct ? activeProduct.price.toLocaleString() : ''}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Kitendo (CTA)' : 'Call to action'}</label>
                    <input
                      type="text"
                      value={form.cta}
                      onChange={(e) => setForm({ ...form, cta: e.target.value })}
                      className="portal-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{sw ? 'Simu / WhatsApp' : 'Phone / WhatsApp'}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="portal-input"
                      placeholder={distributor.phone}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.qr}
                    onChange={(e) => setForm({ ...form, qr: e.target.checked })}
                    className="w-4 h-4 accent-[#123B6D]"
                  />
                  <span className="text-xs text-gray-600">
                    {sw ? 'Onyesha QR (inasoma kiungo cha duka yako)' : 'Show QR (links to your storefront)'}
                  </span>
                </label>
              </div>

              {/* Status / errors / gate */}
              {statusMsg && (
                <div role="status" className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-xs text-success font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {statusMsg}
                </div>
              )}
              {errorMsg && (
                <div role="alert" className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{sw ? 'Imeshindikana kuchapisha:' : 'Publication blocked:'}</p>
                    <p className="mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}
              {gate && !gate.ok && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800">
                  <p className="font-semibold mb-1">{sw ? 'Kabla ya kuchapisha:' : 'Before publishing:'}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {(sw ? gate.problemsSw : gate.problems).map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Desktop actions row */}
              <div className="hidden lg:flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving || rendering}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors outline-none disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {sw ? 'Hifadhi Rasimu' : 'Save Draft'}
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || rendering}
                  className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-md bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-colors outline-none disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {sw ? 'Chapisha' : 'Publish'}
                </button>
                <span className="flex-1" />
                <button
                  onClick={handleDownload}
                  disabled={rendering}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-md text-gray-600 hover:bg-gray-100 text-xs font-semibold transition-colors outline-none disabled:opacity-50"
                >
                  {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {sw ? 'Pakua' : 'Download'}
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  disabled={rendering}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[44px] rounded-md text-success hover:bg-green-50 text-xs font-semibold transition-colors outline-none disabled:opacity-50"
                >
                  {rendering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE sticky action bar — always reachable, 44px targets */}
        {stage === 'editor' && (
          <div className="lg:hidden shrink-0 border-t border-gray-200 bg-white px-3 py-2.5 pb-[max(env(safe-area-inset-bottom),10px)] flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={rendering}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-md text-gray-600 hover:bg-gray-100 transition-colors outline-none disabled:opacity-50"
              aria-label={sw ? 'Pakua' : 'Download'}
            >
              {rendering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <Download className="w-4 h-4 mx-auto" />}
            </button>
            <button
              onClick={handleWhatsAppShare}
              disabled={rendering}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-md text-success hover:bg-green-50 transition-colors outline-none disabled:opacity-50"
              aria-label="WhatsApp"
            >
              {rendering ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <Share2 className="w-4 h-4 mx-auto" />}
            </button>
            <span className="flex-1" />
            <button
              onClick={() => handleSave(false)}
              disabled={saving || rendering}
              className="px-3.5 py-2 min-h-[44px] rounded-md bg-white border border-gray-300 text-gray-700 text-xs font-semibold transition-colors outline-none disabled:opacity-50"
            >
              {sw ? 'Rasimu' : 'Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || rendering}
              className="px-4 py-2 min-h-[44px] rounded-md bg-primary-600 text-white text-xs font-semibold transition-colors outline-none disabled:opacity-50"
            >
              {sw ? 'Chapisha' : 'Publish'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
