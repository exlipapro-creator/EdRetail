import { supabase } from './supabase';

/* ── Domain model ───────────────────────────────────────────────
 * HeroSlide = one storefront carousel banner.
 *   * distributor_id: NULL = global (super-admin managed, every
 *     storefront); uuid = distributor-owned (that storefront only).
 *   * lifecycle: draft → published → archived (RLS-enforced).
 *   * image_path: same-origin '/hero/...' canonical assets OR a path
 *     in the private `hero-assets` bucket. The DB never stores image
 *     data — only the path.
 *   * cta_destination: real application destinations only
 *     ('products' | 'goals' | 'product:<catalog-id>' | 'whatsapp'). */

export type HeroStatus = 'draft' | 'published' | 'archived';

export interface HeroSlide {
  id: string;
  distributor_id: string | null;
  image_path: string;
  headline_en: string;
  headline_sw: string;
  subhead_en: string;
  subhead_sw: string;
  cta_en: string;
  cta_sw: string;
  cta_destination: string;
  sort_order: number;
  status: HeroStatus;
  created_at: string;
  updated_at: string;
}

export const HERO_STATUS_LABEL: Record<HeroStatus, { en: string; sw: string }> = {
  draft: { en: 'Draft', sw: 'Rasimu' },
  published: { en: 'Published', sw: 'Imechapishwa' },
  archived: { en: 'Archived', sw: 'Imehifadhiwa kumbukumbu' },
};

export interface HeroDestOption {
  id: string;
  en: string;
  sw: string;
}

/** Real destinations the storefront can route a hero CTA to. */
export const HERO_DESTINATIONS: HeroDestOption[] = [
  { id: 'products', en: 'Products page', sw: 'Ukurasa wa Bidhaa' },
  { id: 'goals', en: 'Goal Finder', sw: 'Kipataji Lengo' },
  { id: 'whatsapp', en: 'WhatsApp chat', sw: 'Mazungumzo ya WhatsApp' },
];

export function isProductDestination(dest: string): boolean {
  return dest.startsWith('product:');
}

/* ── Owner operations (RLS: owns_distributor_row + super_admin) ── */

/**
 * Resolve the signed-in distributor's own profile id (portal context).
 * The portal pages operate from the real Supabase session; the storefront's
 * hardcoded distributor registry is NOT a reliable owner identity here.
 */
export async function fetchMyProfileId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('distributor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

/**
 * Resolve a distributor's real profile id by their public storefront slug
 * (e.g. ?ref=mwanahamisi). The storefront's registry ids are presentation
 * ids — hero ownership is keyed to the real distributor_profiles.id.
 * Returns null when the slug has no DB profile (global-only storefront).
 */
export async function resolveProfileIdBySlug(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null;
  const clean = slug.replace(/^@/, '').trim().toLowerCase();
  if (!clean) return null;
  const { data, error } = await supabase
    .from('distributor_profiles')
    .select('id')
    .eq('slug', clean)
    .maybeSingle();
  if (error || !data) return null;
  return data.id as string;
}

export async function fetchMyHeroes(): Promise<HeroSlide[]> {
  const profileId = await fetchMyProfileId();
  if (!profileId) return [];

  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('distributor_id', profileId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as HeroSlide[];
}

interface HeroWithOwner extends HeroSlide {
  distributor_profiles?: { store_name?: string; slug?: string } | null;
}

/**
 * Super admin: all heroes (owned + global), newest first.
 * The embedded distributor_profiles row is flattened onto the hero so the
 * management UI can render the owner directly (store_name / slug).
 */
export async function fetchAllHeroes(): Promise<HeroSlide[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*, distributor_profiles!left(store_name, slug)')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as HeroWithOwner[]).map((r) => {
    const { distributor_profiles, ...hero } = r;
    return {
      ...hero,
      store_name: distributor_profiles?.store_name ?? '',
      slug: distributor_profiles?.slug ?? '',
    } as HeroSlide & { store_name: string; slug: string };
  });
}

/** Insert or update by id. Callers pass the current status for edits. */
export async function saveHero(
  hero: Partial<HeroSlide> & { status: HeroStatus; sort_order: number }
): Promise<HeroSlide> {
  const { data, error } = await supabase
    .from('hero_slides')
    .upsert(hero, { onConflict: 'id' })
    .select('*')
    .single();
  if (error) throw error;
  return data as HeroSlide;
}

/** Replace the sort_order of a hero (reorder). */
export async function reorderHero(id: string, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update({ sort_order: sortOrder })
    .eq('id', id);
  if (error) throw error;
}

/**
 * Persist the whole ordering in one pass (ascending list of ids).
 * Distributor-owned heroes sort AFTER the global (super-admin) block: the
 * canonical banners occupy the low range (seeded 1–4, admin adds above),
 * so the distributor block starts at an offset to never interleave with
 * global content. Storefront order = global block, then own block.
 */
export const DISTRIBUTOR_SORT_OFFSET = 100;

export async function persistHeroOrder(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => reorderHero(id, DISTRIBUTOR_SORT_OFFSET + i + 1)));
}

export async function publishHero(id: string): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update({ status: 'published' })
    .eq('id', id);
  if (error) throw error;
}

export async function unpublishHero(id: string): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update({ status: 'draft' })
    .eq('id', id);
  if (error) throw error;
}

export async function archiveHero(id: string): Promise<void> {
  const { error } = await supabase
    .from('hero_slides')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) throw error;
}

/** Delete the row (archived or draft) — no public reference remains. */
export async function deleteHero(id: string): Promise<void> {
  const { error } = await supabase.from('hero_slides').delete().eq('id', id);
  if (error) throw error;
}

/* ── Image upload (Part D validation) ─────────────────────────── */

export interface ImageValidationError {
  en: string;
  sw: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_WIDTH = 800;

export function validateHeroImage(file: File): ImageValidationError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      en: 'This image couldn\u2019t be uploaded. Please choose a JPG, PNG or WebP file.',
      sw: 'Picha hii haikuweza kupakiwa. Chagua faili la JPG, PNG au WebP.',
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      en: 'This image is larger than 2 MB. Please choose a smaller file.',
      sw: 'Picha hii ni kubwa kuliko 2 MB. Chagua faili dogo zaidi.',
    };
  }
  return null;
}

/** Loads the file and checks real dimensions (min 800px wide). */
export function validateHeroImageDimensions(file: File): Promise<ImageValidationError | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.naturalWidth < MIN_WIDTH) {
        resolve({
          en: 'This image is too small. Please use a banner at least 800px wide.',
          sw: 'Picha hii ni ndogo mno. Tumia bango lenye upana wa angalau 800px.',
        });
        return;
      }
      resolve(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        en: 'This image couldn\u2019t be read. Please choose another file.',
        sw: 'Picha hii haikusomeka. Chagua faili lingine.',
      });
    };
    img.src = url;
  });
}

/**
 * Upload the hero image to its deterministic, ownership-safe path:
 *   heroes/{distributor_profile_id}/{hero_id}.jpg   (distributor owned)
 *   heroes/global/{hero_id}.jpg                     (super admin global)
 * The storage RLS policy validates the folder segment server-side.
 */
export async function uploadHeroImage(
  scope: { kind: 'distributor'; profileId: string } | { kind: 'global' },
  heroId: string,
  file: File
): Promise<string> {
  const folder = scope.kind === 'global' ? 'global' : scope.profileId;
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `heroes/${folder}/${heroId}.${ext}`;
  const { error } = await supabase.storage
    .from('hero-assets')
    .upload(path, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  return path;
}

/** Remove an uploaded hero image (replacement/delete cleanup). */
export async function deleteHeroImage(imagePath: string): Promise<void> {
  if (!imagePath.startsWith('heroes/')) return; // canonical assets stay
  await supabase.storage.from('hero-assets').remove([imagePath]);
}

/**
 * Resolve a hero image to a displayable URL:
 *  - same-origin canonical assets ('/hero/...') are served directly
 *  - storage uploads come from the PRIVATE bucket via signed URL
 *    (RLS grants owners + published-public reads).
 */
export async function heroImageUrl(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('/')) return path;
  const { data, error } = await supabase.storage
    .from('hero-assets')
    .createSignedUrl(path, 60 * 60);
  if (error || !data) return '';
  return data.signedUrl;
}

/* ── Public storefront (anon-readable: RLS limits to published) ── */

export interface PublishedHero extends HeroSlide {
  imageUrl: string;
}

/**
 * Published heroes for the storefront being viewed. RLS returns published
 * rows only; this additionally scopes them to the active distributor
 * (global rows always qualify). Server-side RLS remains the authority
 * for what is published — this filter is presentation only.
 */
export async function fetchPublishedHeroes(activeDistributorId: string | null): Promise<PublishedHero[]> {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as HeroSlide[];
  const scoped = rows.filter(
    (h) => h.distributor_id === null || h.distributor_id === activeDistributorId
  );

  await Promise.all(
    scoped.map(async (h) => {
      (h as PublishedHero).imageUrl = await heroImageUrl(h.image_path);
    })
  );

  return scoped as PublishedHero[];
}