import { supabase } from './supabase';

/* ── Domain model ───────────────────────────────────────────────
 * Campaign  = one marketing campaign owned by a distributor.
 * Flyer     = the rendered visual for one output format.
 * Asset     = the PNG in Supabase Storage (flyer-renders bucket).
 * Publication = lifecycle state: draft → published → archived.
 * The DB row + storage path together ARE the flyer; nothing is
 * fabricated client-side. */

export type FlyerFormat = 'status' | 'portrait' | 'square' | 'a4';

export type DesignFamily =
  | 'editorial' // Product Editorial — large photography, sophisticated type
  | 'commerce' // Promotional Commerce — product + offer + price + CTA
  | 'premium' // Premium — minimal typography, high-end presentation
  | 'wellness' // Wellness Editorial — calm storytelling, warm paper
  | 'catalog'; // Catalog / Informational — structured, print-ready

export const FLYER_FORMATS: Record<FlyerFormat, { w: number; h: number; label: string; labelSw: string }> = {
  status: { w: 1080, h: 1920, label: 'WhatsApp Status', labelSw: 'WhatsApp Status' },
  portrait: { w: 1080, h: 1350, label: 'Social Portrait', labelSw: 'Picha ya Mtandao' },
  square: { w: 1080, h: 1080, label: 'Square', labelSw: 'Mraba' },
  a4: { w: 1240, h: 1754, label: 'A4 Print', labelSw: 'A4 Kuchapisha' },
};

export const DESIGN_FAMILIES: Array<{ id: DesignFamily; label: string; labelSw: string }> = [
  { id: 'editorial', label: 'Product Editorial', labelSw: 'Kihadithi cha Bidhaa' },
  { id: 'commerce', label: 'Promotional Commerce', labelSw: 'Biashara na Ofa' },
  { id: 'premium', label: 'Premium', labelSw: 'Pevu' },
  { id: 'wellness', label: 'Wellness Editorial', labelSw: 'Hadithi ya Afya' },
  { id: 'catalog', label: 'Catalog / Print', labelSw: 'Katalogi / Chapisho' },
];

export interface FlyerCampaign {
  id: string;
  distributor_id: string;
  product_id: string;
  title: string;
  headline: string;
  description: string;
  price: number | null;
  offer: string;
  cta: string;
  phone: string;
  design_family: DesignFamily;
  format: FlyerFormat;
  qr_destination: string;
  render_path: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

function dbError(message: string): Error {
  return new Error(message);
}

/* ── Owner operations (RLS: owns_distributor_row) ─────────────── */

export async function fetchMyCampaigns(): Promise<FlyerCampaign[]> {
  const { data: profile, error: profileError } = await supabase
    .from('distributor_profiles')
    .select('id')
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return []; // no distributor profile → no campaigns

  const { data, error } = await supabase
    .from('flyer_campaigns')
    .select('*')
    .eq('distributor_id', profile.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as FlyerCampaign[];
}

/** Insert or update by id. Returns the saved row.
 *  IMPORTANT: lifecycle status is caller-owned. Callers that do not intend
 *  a transition MUST pass the row's current status — the default 'draft'
 *  is only correct for brand-new campaigns. */
export async function saveCampaignDraft(
  campaign: Partial<FlyerCampaign> & { distributor_id: string; product_id: string; title: string }
): Promise<FlyerCampaign> {
  const payload = {
    ...campaign,
    status: campaign.status ?? ('draft' as const),
    format: campaign.format ?? ('status' as FlyerFormat),
    design_family: campaign.design_family ?? ('editorial' as DesignFamily),
  };
  const { data, error } = await supabase
    .from('flyer_campaigns')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as FlyerCampaign;
}

/**
 * Upload the flyer PNG to its deterministic, ownership-safe path:
 *   flyers/{distributor_profile_id}/{campaign_id}.png
 * The storage RLS policy validates the folder segment against the
 * caller's distributor_profiles row — another distributor's folder is
 * rejected server-side.
 */
export async function uploadRender(
  distributorProfileId: string,
  campaignId: string,
  blob: Blob
): Promise<string> {
  const path = `flyers/${distributorProfileId}/${campaignId}.png`;
  const { error } = await supabase.storage
    .from('flyer-renders')
    .upload(path, blob, { contentType: 'image/png', upsert: true });
  if (error) throw error;
  return path;
}

/**
 * The render bucket is PRIVATE. Public gallery/preview uses a short-lived
 * signed URL; owners (Flyer Studio gallery) resolve their own signed URLs
 * via the same helper — RLS grants owners read on their own objects.
 */
export async function renderUrl(path: string): Promise<string> {
  if (!path) return '';
  const { data, error } = await supabase.storage
    .from('flyer-renders')
    .createSignedUrl(path, 60 * 60); // 1 hour
  if (error || !data) return '';
  return data.signedUrl;
}

/** Publish = flip status. Quality gate must pass BEFORE calling this. */
export async function publishCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('flyer_campaigns')
    .update({ status: 'published' })
    .eq('id', id);
  if (error) throw error;
}

/** Unpublish = return a published campaign to draft (no longer public). */
export async function unpublishCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('flyer_campaigns')
    .update({ status: 'draft' })
    .eq('id', id);
  if (error) throw error;
}

export async function archiveCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('flyer_campaigns')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('flyer_campaigns')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

/* ── Publication quality gate ────────────────────────────────────
 * Validates against the real campaign content — no placeholders. */

export interface QualityGateResult {
  ok: boolean;
  problems: string[];
  problemsSw: string[];
}

export function runQualityGate(c: FlyerCampaign, productImageExists: boolean): QualityGateResult {
  const problems: string[] = [];
  const problemsSw: string[] = [];
  const need = (cond: boolean, en: string, sw: string) => {
    if (!cond) {
      problems.push(en);
      problemsSw.push(sw);
    }
  };
  need(c.title.trim().length > 0, 'Campaign title is required', 'Jina la kampeni linahitajika');
  need(c.headline.trim().length > 0, 'Headline is required', 'Kichwa cha habari kinahitajika');
  need(c.cta.trim().length > 0, 'A call-to-action is required', 'Kitendo cha wateja kinahitajika');
  need(c.phone.trim().length >= 9, 'A contact phone/WhatsApp number is required', 'Namba ya simu/WhatsApp inahitajika');
  need(productImageExists, 'The selected product has no image asset', 'Bidhaa iliyochaguliwa haina picha');
  need(c.render_path.trim().length > 0, 'Export the flyer image before publishing', 'Hamisha picha ya kampeni kabla ya kuchapisha');
  need(
    /^(https?:\/\/|\/)/.test(c.qr_destination),
    'QR destination must be a valid path or URL',
    'Mahali pa QR lazima kiwe njia halali'
  );
  return { ok: problems.length === 0, problems, problemsSw };
}

/* ── Public gallery (anon-readable: RLS limits to published) ───── */

export interface PublishedFlyer {
  id: string;
  title: string;
  headline: string;
  render_path: string;
  product_id: string;
  created_at: string;
  distributor: {
    store_name: string;
    slug: string;
    city: string;
    bio: string;
  };
  renderUrl: string;
}

export async function fetchPublishedFlyers(): Promise<PublishedFlyer[]> {
  const { data, error } = await supabase
    .from('flyer_campaigns')
    .select(
      'id, title, headline, render_path, product_id, created_at, distributor_id, distributor_profiles!inner(store_name, slug, city, bio)'
    )
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(24);

  if (error) {
    //RLS-safe failure: a policy regression must surface, never be masked.
    throw dbError(error.message);
  }

  const rows = (data ?? []).map((row: Record<string, unknown>) => {
    const p = row.distributor_profiles as Record<string, unknown> | null;
    return {
      id: row.id as string,
      title: row.title as string,
      headline: row.headline as string,
      render_path: row.render_path as string,
      product_id: row.product_id as string,
      created_at: row.created_at as string,
      distributor: {
        store_name: (p?.store_name as string) ?? '',
        slug: (p?.slug as string) ?? '',
        city: (p?.city as string) ?? '',
        bio: (p?.bio as string) ?? '',
      },
      renderUrl: '',
    };
  });

  // Resolve signed URLs in parallel — renders are never public-by-path.
  await Promise.all(
    rows.map(async (r) => {
      r.renderUrl = await renderUrl(r.render_path);
    })
  );

  return rows;
}
