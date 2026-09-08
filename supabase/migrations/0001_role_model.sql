-- ════════════════════════════════════════════════════════════════
-- ED Retail — Migration 0001: Authoritative role model
-- Run in Supabase → SQL Editor, AFTER supabase-schema.sql (base).
-- Deterministic / re-runnable. Destroys no data.
-- ════════════════════════════════════════════════════════════════
--
-- ROLE REPRESENTATION
-- -------------------
-- Roles live in `public.user_roles`, keyed 1:1 to auth.users, and are read
-- through the SECURITY DEFINER helper `has_role()`. This follows the standard
-- Supabase pattern that avoids recursive RLS on a profile-like table.
--
-- The role is SERVER-SIDE and authoritative:
--   * clients may READ their own role (for UI only)
--   * only super_admin can INSERT/UPDATE/DELETE roles (promotion/demotion)
--   * normal users have NO policy to write the table → cannot self-promote
--   * new signups are auto-provisioned as 'customer' by a SECURITY DEFINER
--     trigger (definer is required: the trigger runs as the inserting auth
--     context which has no role row yet)
--
-- ESCALATION PROTECTION
-- ---------------------
-- A `customer`/`distributor` cannot change their own role through ANY table:
-- profiles do not exist as an updatable user table, and user_roles is writable
-- only by super_admin. Storage-side: Supabase Auth identities cannot be
-- self-modified via the anon/authenticated API keys.
--
-- ORDERING CONTRACT (do not reorder):
--   enum → user_roles TABLE → has_role() FUNCTION → policies.
--   * SQL function bodies are validated at CREATE FUNCTION time
--     (check_function_bodies), so has_role() must come AFTER its table.
--   * CREATE POLICY resolves referenced functions at creation time, so the
--     policies must come AFTER has_role().

-- ── 1. Role enum ─────────────────────────────────────────────────
do $$
begin
  create type public.app_role as enum ('customer', 'distributor', 'super_admin');
exception
  when duplicate_object then null; -- re-runnable
end $$;

-- ── 2. user_roles (1:1 with auth.users) ─────────────────────────
create table if not exists public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references auth.users(id) on delete cascade,
  role       public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- ── 3. has_role() helper ─────────────────────────────────────────
-- Created AFTER its table (SQL body validation) and BEFORE the policies
-- that call it (CREATE POLICY resolves functions at creation time).
-- SECURITY DEFINER so RLS policies can evaluate roles without recursive
-- policy evaluation on user_roles itself. search_path is pinned.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- Policy expressions run with the CALLER's privileges: anon must be able to
-- execute has_role() during RLS evaluation (it safely returns false for
-- unauthenticated callers because auth.uid() is null).
grant execute on function public.has_role(uuid, public.app_role) to anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

-- ── 4. user_roles policies ──────────────────────────────────────
-- Everyone may read ONLY their own role (UI convenience; not a boundary).
drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read"
  on public.user_roles for select
  using (auth.uid() = user_id);

-- Only super_admin can grant/revoke/promote roles.
-- No policies exist for normal users to insert/update/delete.
drop policy if exists "user_roles_admin_insert" on public.user_roles;
create policy "user_roles_admin_insert"
  on public.user_roles for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "user_roles_admin_update" on public.user_roles;
create policy "user_roles_admin_update"
  on public.user_roles for update
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists "user_roles_admin_delete" on public.user_roles;
create policy "user_roles_admin_delete"
  on public.user_roles for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ── 5. user_roles trigger ───────────────────────────────────────
-- Keep updated_at fresh on role changes.
drop trigger if exists user_roles_updated_at on public.user_roles;
create trigger user_roles_updated_at before update on public.user_roles
  for each row execute function update_updated_at();

-- ── 6. Auto-provision: every new auth user starts as 'customer' ──
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill: any users that existed before this migration.
insert into public.user_roles (user_id, role)
select id, 'customer'::public.app_role from auth.users
on conflict (user_id) do nothing;

-- ── 7. distributor_profiles (distributor identity anchor) ────────
-- 1:1 with an auth user. Public storefront data (store name, slug, city, bio)
-- is intentionally public; ownership of operational data links through
-- distributor_profiles.id.
create table if not exists public.distributor_profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  store_name  text not null default '',
  slug        text not null unique,
  phone       text not null default '',
  city        text not null default '',
  bio         text not null default '',
  is_verified boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.distributor_profiles enable row level security;

-- Public storefront directory read.
drop policy if exists "distributor_profiles_public_read" on public.distributor_profiles;
create policy "distributor_profiles_public_read"
  on public.distributor_profiles for select
  using (true);

-- A user with the distributor role may create their OWN profile only.
drop policy if exists "distributor_profiles_self_insert" on public.distributor_profiles;
create policy "distributor_profiles_self_insert"
  on public.distributor_profiles for insert
  with check (
    auth.uid() = user_id
    and (public.has_role(auth.uid(), 'distributor') or public.has_role(auth.uid(), 'super_admin'))
  );

-- Distributors may update ONLY their own profile, and cannot touch user_id.
drop policy if exists "distributor_profiles_self_update" on public.distributor_profiles;
create policy "distributor_profiles_self_update"
  on public.distributor_profiles for update
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'))
  with check (auth.uid() = user_id or public.has_role(auth.uid(), 'super_admin'));

-- Only super_admin deletes distributor profiles.
drop policy if exists "distributor_profiles_admin_delete" on public.distributor_profiles;
create policy "distributor_profiles_admin_delete"
  on public.distributor_profiles for delete
  using (public.has_role(auth.uid(), 'super_admin'));

drop trigger if exists distributor_profiles_updated_at on public.distributor_profiles;
create trigger distributor_profiles_updated_at before update on public.distributor_profiles
  for each row execute function update_updated_at();

-- ── 8. Ownership columns on sales / loans ────────────────────────
-- Nullable + forward-compatible: existing anon checkout rows keep
-- distributor_id NULL (platform-attributed); distributor-logged sales set it.
alter table public.sales add column if not exists distributor_id uuid
  references public.distributor_profiles(id) on delete set null;
alter table public.loans add column if not exists distributor_id uuid
  references public.distributor_profiles(id) on delete set null;

create index if not exists sales_distributor_id_idx on public.sales (distributor_id);
create index if not exists loans_distributor_id_idx on public.loans (distributor_id);
