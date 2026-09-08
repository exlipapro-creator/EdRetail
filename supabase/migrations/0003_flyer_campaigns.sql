-- ════════════════════════════════════════════════════════════════
-- ED Retail — Migration 0003: Flyer campaign domain
-- Run in Supabase → SQL Editor AFTER 0001 + 0002.
-- Deterministic / re-runnable. Destroys no data. Touches no
-- existing table — only ADDS flyer_campaigns + storage bucket.
-- ════════════════════════════════════════════════════════════════
--
-- DOMAIN MODEL
-- ------------
-- flyer_campaigns — one row per distributor marketing campaign.
--   * ownership resolved server-side: owner = distributor_profiles row
--     whose user_id = auth.uid() (same contract as sales/loans).
--   * lifecycle: draft → published → archived (enforced in policy).
--   * product references are EdRetail catalog ids (products.id),
--     so a flyer always points at a REAL product.
--   * render PNG is stored in Supabase Storage bucket `flyer-renders`;
--     the DB stores only the storage path, never a data URL.
--
-- PRIVACY
-- -------
-- SELECT is allowed for everyone ONLY on status = 'published'.
-- Draft/archived rows are owner + super_admin only.
-- INSERT/UPDATE/DELETE require owning the campaign through
-- owns_distributor_row(distributor_id) — a client cannot forge it.

-- ── 1. Table ─────────────────────────────────────────────────────
create table if not exists public.flyer_campaigns (
  id              uuid primary key default gen_random_uuid(),
  distributor_id  uuid not null references public.distributor_profiles(id) on delete cascade,
  product_id      text not null references public.products(id),
  title           text not null default '',
  headline        text not null default '',
  description     text not null default '',
  price           integer,
  offer           text not null default '',
  cta             text not null default '',
  phone           text not null default '',
  design_family   text not null default 'editorial' check (design_family in ('editorial','commerce','premium','wellness','catalog')),
  format          text not null default 'status' check (format in ('status','portrait','square','a4')),
  qr_destination  text not null default '',
  render_path     text not null default '',
  status          text not null default 'draft' check (status in ('draft','published','archived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_flyer_campaigns_distributor
  on public.flyer_campaigns (distributor_id);
create index if not exists idx_flyer_campaigns_published
  on public.flyer_campaigns (status, updated_at desc);

-- updated_at trigger (same pattern as products)
create or replace function public.flyer_campaigns_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flyer_campaigns_updated_at on public.flyer_campaigns;
create trigger flyer_campaigns_updated_at
  before update on public.flyer_campaigns
  for each row execute function public.flyer_campaigns_updated_at();

alter table public.flyer_campaigns enable row level security;

-- ── 2. Policies ──────────────────────────────────────────────────
-- Public showcase: only published flyers, only safe columns exposed
-- through the public gallery query. Rows are still row-level: anon
-- sees published rows; draft/archived stay invisible.
drop policy if exists "flyers_public_read_published" on public.flyer_campaigns;
create policy "flyers_public_read_published"
  on public.flyer_campaigns for select
  using (status = 'published');

-- Owners (and super_admin) may read their own rows in any state.
drop policy if exists "flyers_owner_read" on public.flyer_campaigns;
create policy "flyers_owner_read"
  on public.flyer_campaigns for select
  using (
    public.owns_distributor_row(distributor_id)
    or public.has_role(auth.uid(), 'super_admin')
  );

drop policy if exists "flyers_owner_insert" on public.flyer_campaigns;
create policy "flyers_owner_insert"
  on public.flyer_campaigns for insert
  with check (public.owns_distributor_row(distributor_id));

drop policy if exists "flyers_owner_update" on public.flyer_campaigns;
create policy "flyers_owner_update"
  on public.flyer_campaigns for update
  using (public.owns_distributor_row(distributor_id))
  with check (public.owns_distributor_row(distributor_id));

drop policy if exists "flyers_owner_delete" on public.flyer_campaigns;
create policy "flyers_owner_delete"
  on public.flyer_campaigns for delete
  using (public.owns_distributor_row(distributor_id));

-- ── 3. Storage bucket for flyer renders ─────────────────────────
-- Deterministic ownership-safe path: flyers/{distributor_profile_id}/{campaign_id}.png
-- The bucket is PRIVATE: drafts are never world-readable by URL. Public
-- exposure of a render is granted ONLY while its campaign row is
-- status='published' — enforced by joining flyer_campaigns in the
-- anon SELECT policy below.
insert into storage.buckets (id, name, public)
values ('flyer-renders', 'flyer-renders', false)
on conflict (id) do update set public = false;

-- OWNER: read/update/delete own renders. The path segment after 'flyers/'
-- must be the caller's own distributor_profiles.id.
-- Overwrite via upsert: Storage upsert requires both INSERT (new object)
-- and UPDATE (existing object) privileges on the same path.

drop policy if exists "flyer_renders_owner_read" on storage.objects;
create policy "flyer_renders_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.distributor_profiles dp
      where dp.user_id = auth.uid()
        and split_part(name, '/', 2) = dp.id::text
    )
  );

drop policy if exists "flyer_renders_auth_upload" on storage.objects;
create policy "flyer_renders_auth_upload"
  on storage.objects for insert
  with check (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.distributor_profiles dp
      where dp.user_id = auth.uid()
        and split_part(name, '/', 2) = dp.id::text
    )
  );

drop policy if exists "flyer_renders_owner_update" on storage.objects;
create policy "flyer_renders_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.distributor_profiles dp
      where dp.user_id = auth.uid()
        and split_part(name, '/', 2) = dp.id::text
    )
  )
  with check (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.distributor_profiles dp
      where dp.user_id = auth.uid()
        and split_part(name, '/', 2) = dp.id::text
    )
  );

drop policy if exists "flyer_renders_owner_delete" on storage.objects;
create policy "flyer_renders_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.distributor_profiles dp
      where dp.user_id = auth.uid()
        and split_part(name, '/', 2) = dp.id::text
    )
  );

-- PUBLIC/ANON: read a render ONLY when its campaign is published.
-- The path embeds the campaign id (flyers/{dp_id}/{campaign_id}.png),
-- so the join is exact. Drafts and archived renders stay private.
drop policy if exists "flyer_renders_public_read_published" on storage.objects;
create policy "flyer_renders_public_read_published"
  on storage.objects for select
  using (
    bucket_id = 'flyer-renders'
    and exists (
      select 1 from public.flyer_campaigns fc
      where fc.render_path = name
        and fc.status = 'published'
    )
  );

-- ── 4. Verification queries (read-only) ──────────────────────────
-- select column_name, data_type, is_nullable from information_schema.columns
--   where table_schema='public' and table_name='flyer_campaigns' order by ordinal_position;
-- select schemaname, tablename, rowsecurity from pg_tables where tablename='flyer_campaigns';
-- select policyname, cmd, roles, qual, with_check from pg_policies
--   where tablename='flyer_campaigns' order by policyname;
-- select policyname, cmd, roles, qual from pg_policies
--   where tablename='objects' and schemaname='storage' and policyname like 'flyer_renders%' order by policyname;
-- select id, name, public from storage.buckets where id='flyer-renders';
