-- ════════════════════════════════════════════════════════════════
-- ED Retail — Migration 0004: Persistent hero carousel content
-- Run in Supabase → SQL Editor AFTER 0001 + 0002 + 0003.
-- Deterministic / re-runnable. Destroys no data. Adds ONLY:
--   hero_slides table, hero-assets storage bucket, seeded canonicals.
-- ════════════════════════════════════════════════════════════════
--
-- DOMAIN MODEL
-- ------------
-- hero_slides — one row per storefront hero banner.
--   * distributor_id NULLABLE:
--       NULL  = GLOBAL hero (managed by super_admin; shown on every
--               storefront). Seeded with the canonical EdRetail
--               marketing artwork below.
--       uuid  = distributor-owned hero (owner = distributor_profiles.id,
--               resolved server-side via owns_distributor_row(), the
--               same contract as sales/loans/flyers). Shown only on
--               that distributor's storefront.
--   * lifecycle: draft → published → archived (enforced in policy).
--   * image_path is either:
--       - a same-origin static asset path ('/hero/...') for the seeded
--         canonical artwork (served by the app, no storage needed), or
--       - a path inside the PRIVATE `hero-assets` bucket for uploads
--         (the DB stores only the storage path, never image data).
--   * sort_order controls carousel order (ascending).
--   * bilingual headline/subhead/CTA + cta_destination. Destinations are
--     real application destinations: 'products', 'goals',
--     'product:<catalog-id>', 'whatsapp'. No '#' placeholders.
--
-- WHY A NEW TABLE (not flyer_campaigns reuse)
-- -------------------------------------------
-- flyer_campaigns models rendered-PNG WhatsApp/print campaigns with a
-- product anchor and a format/design pipeline. Hero banners have a
-- different shape (uploaded artwork, bilingual copy, carousel ordering,
-- destination routing) and a different storefront contract. Reusing the
-- campaign table would mix unrelated content types, break its quality
-- gate, and complicate the public query. The new table REUSES the proven
-- ownership helper and storage/publication pattern instead of inventing
-- a new security model.
--
-- PRIVACY
-- -------
-- Public SELECT: only status = 'published' rows (global AND distributor
-- heroes). Draft/archived rows are owner + super_admin only. The app
-- additionally filters distributor_id for the storefront being viewed,
-- but the *published* restriction is server-enforced.
-- Global (NULL) rows are writeable ONLY by super_admin: a distributor
-- cannot forge distributor_id = NULL (owns_distributor_row(NULL) = false).

-- ── 1. Table ─────────────────────────────────────────────────────
create table if not exists public.hero_slides (
  id                uuid primary key default gen_random_uuid(),
  distributor_id    uuid references public.distributor_profiles(id) on delete cascade,
  image_path        text not null default '',
  headline_en       text not null default '',
  headline_sw       text not null default '',
  subhead_en        text not null default '',
  subhead_sw        text not null default '',
  cta_en            text not null default '',
  cta_sw            text not null default '',
  cta_destination   text not null default 'products'
                    check (cta_destination in ('products','goals','whatsapp') or cta_destination like 'product:%'),
  sort_order        integer not null default 0,
  status            text not null default 'draft' check (status in ('draft','published','archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_hero_slides_storefront
  on public.hero_slides (status, sort_order, created_at);
create index if not exists idx_hero_slides_distributor
  on public.hero_slides (distributor_id);

-- updated_at trigger (same pattern as flyer_campaigns)
create or replace function public.hero_slides_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists hero_slides_updated_at on public.hero_slides;
create trigger hero_slides_updated_at
  before update on public.hero_slides
  for each row execute function public.hero_slides_updated_at();

alter table public.hero_slides enable row level security;

-- ── 2. Policies ──────────────────────────────────────────────────
-- Public: published only (global + distributor heroes alike).
drop policy if exists "heroes_public_read_published" on public.hero_slides;
create policy "heroes_public_read_published"
  on public.hero_slides for select
  using (status = 'published');

-- Owners (distributor_profiles.id) + super_admin read their rows in any state.
drop policy if exists "heroes_owner_read" on public.hero_slides;
create policy "heroes_owner_read"
  on public.hero_slides for select
  using (
    public.owns_distributor_row(distributor_id)
    or public.has_role(auth.uid(), 'super_admin')
  );

-- INSERT: super_admin (any scope incl. global NULL) or the owning distributor.
drop policy if exists "heroes_owner_insert" on public.hero_slides;
create policy "heroes_owner_insert"
  on public.hero_slides for insert
  with check (
    public.has_role(auth.uid(), 'super_admin')
    or public.owns_distributor_row(distributor_id)
  );

-- UPDATE: same rule. owns_distributor_row(NULL) is false, so a
-- distributor can never re-point a hero at another profile or at global.
drop policy if exists "heroes_owner_update" on public.hero_slides;
create policy "heroes_owner_update"
  on public.hero_slides for update
  using (
    public.has_role(auth.uid(), 'super_admin')
    or public.owns_distributor_row(distributor_id)
  )
  with check (
    public.has_role(auth.uid(), 'super_admin')
    or public.owns_distributor_row(distributor_id)
  );

drop policy if exists "heroes_owner_delete" on public.hero_slides;
create policy "heroes_owner_delete"
  on public.hero_slides for delete
  using (
    public.has_role(auth.uid(), 'super_admin')
    or public.owns_distributor_row(distributor_id)
  );

-- ── 3. Storage bucket for hero uploads ───────────────────────────
-- PRIVATE bucket: draft hero artwork is never world-readable by URL.
-- Paths: heroes/{distributor_profile_id}/{hero_id}.jpg (owned)
--        heroes/global/{hero_id}.jpg             (super admin)
-- Public exposure of an upload is granted ONLY while its hero row is
-- status='published' — enforced by joining hero_slides in the anon
-- SELECT policy (same pattern as flyer-renders).
insert into storage.buckets (id, name, public)
values ('hero-assets', 'hero-assets', false)
on conflict (id) do update set public = false;

drop policy if exists "hero_assets_owner_read" on storage.objects;
create policy "hero_assets_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'hero-assets'
    and (
      public.has_role(auth.uid(), 'super_admin')
      or exists (
        select 1 from public.distributor_profiles dp
        where dp.user_id = auth.uid()
          and split_part(name, '/', 2) = dp.id::text
      )
    )
  );

drop policy if exists "hero_assets_owner_upload" on storage.objects;
create policy "hero_assets_owner_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'hero-assets'
    and (
      public.has_role(auth.uid(), 'super_admin')
      or exists (
        select 1 from public.distributor_profiles dp
        where dp.user_id = auth.uid()
          and split_part(name, '/', 2) = dp.id::text
      )
    )
  );

drop policy if exists "hero_assets_owner_update" on storage.objects;
create policy "hero_assets_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'hero-assets'
    and (
      public.has_role(auth.uid(), 'super_admin')
      or exists (
        select 1 from public.distributor_profiles dp
        where dp.user_id = auth.uid()
          and split_part(name, '/', 2) = dp.id::text
      )
    )
  )
  with check (
    bucket_id = 'hero-assets'
    and (
      public.has_role(auth.uid(), 'super_admin')
      or exists (
        select 1 from public.distributor_profiles dp
        where dp.user_id = auth.uid()
          and split_part(name, '/', 2) = dp.id::text
      )
    )
  );

drop policy if exists "hero_assets_owner_delete" on storage.objects;
create policy "hero_assets_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'hero-assets'
    and (
      public.has_role(auth.uid(), 'super_admin')
      or exists (
        select 1 from public.distributor_profiles dp
        where dp.user_id = auth.uid()
          and split_part(name, '/', 2) = dp.id::text
      )
    )
  );

-- PUBLIC/ANON: read an uploaded hero image ONLY while its hero row is
-- published. The path embeds the hero id (heroes/{dp_id}/{hero_id}.jpg),
-- so the join is exact. Drafts and archived artwork stay private.
drop policy if exists "hero_assets_public_read_published" on storage.objects;
create policy "hero_assets_public_read_published"
  on storage.objects for select
  using (
    bucket_id = 'hero-assets'
    and exists (
      select 1 from public.hero_slides hs
      where hs.image_path = name
        and hs.status = 'published'
    )
  );

-- ── 4. Seed: canonical EdRetail hero artwork (published, global) ──
-- The four art-directed Edmark banners stay the storefront's default
-- until a distributor/super admin adds or replaces content. They point
-- at the same-origin static assets already served by the app — no
-- storage upload is needed and no fake promotional copy is invented.
insert into public.hero_slides (id, distributor_id, image_path, headline_en, headline_sw, subhead_en, subhead_sw, cta_en, cta_sw, cta_destination, sort_order, status)
values
  ('00000000-0000-4000-8000-000000000001', null, '/hero/hero-shakeoff.jpg', 'Shake Off Phyto Fiber', 'Shake Off Phyto Fiber', '', '', 'Shop Shake Off', 'Nunua Shake Off', 'product:shake-off-phyto', 1, 'published'),
  ('00000000-0000-4000-8000-000000000002', null, '/hero/hero-spirulina.jpg', 'Hawaiian Spirulina', 'Hawaiian Spirulina', '', '', 'Shop Spirulina', 'Nunua Spirulina', 'product:hawaiian-spirulina', 2, 'published'),
  ('00000000-0000-4000-8000-000000000003', null, '/hero/hero-troika.jpg', 'Café Troika Premium Coffee', 'Café Troika Kahawa Bora', '', '', 'Shop Troika', 'Nunua Troika', 'product:cafe-troika', 3, 'published'),
  ('00000000-0000-4000-8000-000000000004', null, '/hero/hero-cocollagen.jpg', 'CoCollagen Chocolate Drink', 'Kinywaji cha CoCollagen', '', '', 'Shop CoCollagen', 'Nunua CoCollagen', 'product:cocollagen', 4, 'published')
on conflict (id) do nothing;

-- ── 5. Verification queries (read-only) ──────────────────────────
-- select column_name, data_type from information_schema.columns
--   where table_schema='public' and table_name='hero_slides' order by ordinal_position;
-- select policyname, cmd, qual, with_check from pg_policies
--   where tablename='hero_slides' order by policyname;
-- select id, name, public from storage.buckets where id='hero-assets';
-- select id, status, sort_order, image_path from public.hero_slides order by sort_order;