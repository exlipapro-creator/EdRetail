-- ════════════════════════════════════════════════════════════════
-- ED Retail — Migration 0002: RLS hardening (role-aware policies)
-- Run AFTER supabase-schema.sql AND 0001_role_model.sql.
-- Idempotent: drops the old anon/authenticated policies and recreates
-- strict role/ownership-based ones. Destroys no data.
-- ════════════════════════════════════════════════════════════════
--
-- AUTHORIZATION MODEL
-- -------------------
-- CUSTOMER / anon   → storefront reads (products, visible testimonials,
--                     best-seller aggregates via RPC) + open checkout insert.
-- DISTRIBUTOR       → additionally owns rows tied to their distributor_profiles
--                     row (sales, loans). Cannot see or touch other
--                     distributors' rows. Cannot write platform data.
-- SUPER_ADMIN       → full platform management (products, sales, loans,
--                     payments, testimonials, roles, distributor profiles).
--
-- The client never supplies authorization inputs: ownership is resolved from
-- auth.uid() through distributor_profiles.user_id, and platform powers from
-- has_role() — both evaluated server-side by RLS.

-- Helper: rows owned by the caller's distributor profile.
create or replace function public.owns_distributor_row(_distributor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select _distributor_id is not null and exists (
    select 1 from public.distributor_profiles
    where id = _distributor_id and user_id = auth.uid()
  );
$$;

-- Policy expressions run with the CALLER's privileges: anon must be able to
-- execute owns_distributor_row() during RLS evaluation (it safely returns
-- false for unauthenticated callers because auth.uid() is null).
grant execute on function public.owns_distributor_row(uuid) to anon;
grant execute on function public.owns_distributor_row(uuid) to authenticated;

-- Helper: server-side best-seller aggregate for the public storefront.
-- Replaces the old public SELECT on sales (which would expose customer PII).
create or replace function public.public_best_sellers(_limit integer default 8)
returns table (product_id text, total_units bigint)
language sql
stable
security definer
set search_path = public
as $$
  select li.item->>'productId' as product_id,
         sum(coalesce((li.item->>'quantity')::int, 1)) as total_units
  from public.sales s,
       lateral (select jsonb_array_elements(s.items) as item) li
  where s.status <> 'cancelled'
  group by 1
  order by total_units desc
  limit greatest(coalesce(_limit, 8), 1);
$$;

-- Public storefront aggregate: executable by everyone (returns only
-- product ids + unit counts — no PII columns).
grant execute on function public.public_best_sellers(integer) to public, anon, authenticated;

-- ════════════════════════════════════════════════════════════════
-- PRODUCTS — public catalog; platform-managed
-- ════════════════════════════════════════════════════════════════
drop policy if exists "products_public_read"  on public.products;
drop policy if exists "products_auth_insert"  on public.products;
drop policy if exists "products_auth_update"  on public.products;
drop policy if exists "products_auth_delete"  on public.products;

create policy "products_public_read"
  on public.products for select using (true);

create policy "products_admin_insert"
  on public.products for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "products_admin_update"
  on public.products for update
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "products_admin_delete"
  on public.products for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ════════════════════════════════════════════════════════════════
-- SALES — open checkout insert; super_admin platform access;
-- distributors restricted to their OWN rows.
-- NOTE: no public SELECT — customer PII must not be world-readable.
-- Best-sellers go through public_best_sellers().
-- ════════════════════════════════════════════════════════════════
drop policy if exists "sales_anon_insert"   on public.sales;
drop policy if exists "sales_auth_select"   on public.sales;
drop policy if exists "sales_auth_update"   on public.sales;
drop policy if exists "sales_auth_delete"   on public.sales;
drop policy if exists "sales_auth_all"      on public.sales;

-- Storefront checkout (anon or any user): fresh pending app orders only.
create policy "sales_checkout_insert"
  on public.sales for insert
  with check (
    channel = 'app'
    and status = 'pending'
    and distributor_id is null
  );

-- Distributors: own rows only.
create policy "sales_owner_select"
  on public.sales for select
  using (public.owns_distributor_row(distributor_id));

create policy "sales_owner_insert"
  on public.sales for insert
  with check (public.owns_distributor_row(distributor_id));

create policy "sales_owner_update"
  on public.sales for update
  using (public.owns_distributor_row(distributor_id))
  with check (public.owns_distributor_row(distributor_id));

-- Super admin: full platform access.
create policy "sales_admin_select"
  on public.sales for select
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "sales_admin_insert"
  on public.sales for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "sales_admin_update"
  on public.sales for update
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "sales_admin_delete"
  on public.sales for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ════════════════════════════════════════════════════════════════
-- LOANS — financial data: super_admin + owning distributor
-- ════════════════════════════════════════════════════════════════
drop policy if exists "loans_auth_all" on public.loans;

create policy "loans_owner_select"
  on public.loans for select
  using (public.owns_distributor_row(distributor_id));

create policy "loans_owner_insert"
  on public.loans for insert
  with check (public.owns_distributor_row(distributor_id));

create policy "loans_owner_update"
  on public.loans for update
  using (public.owns_distributor_row(distributor_id))
  with check (public.owns_distributor_row(distributor_id));

create policy "loans_admin_all"
  on public.loans for all
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

-- ════════════════════════════════════════════════════════════════
-- LOAN PAYMENTS — financial log: super_admin writes; owner reads
-- payments against their own loans.
-- ════════════════════════════════════════════════════════════════
drop policy if exists "loan_payments_auth_all" on public.loan_payments;

create policy "loan_payments_owner_select"
  on public.loan_payments for select
  using (
    exists (
      select 1
      from public.loans l
      where l.id = loan_id
        and public.owns_distributor_row(l.distributor_id)
    )
  );

create policy "loan_payments_admin_insert"
  on public.loan_payments for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "loan_payments_admin_delete"
  on public.loan_payments for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ════════════════════════════════════════════════════════════════
-- TESTIMONIALS — public reads visible reviews; super_admin moderates
-- ════════════════════════════════════════════════════════════════
drop policy if exists "testimonials_public_read"  on public.testimonials;
drop policy if exists "testimonials_auth_insert"  on public.testimonials;
drop policy if exists "testimonials_auth_update"  on public.testimonials;
drop policy if exists "testimonials_auth_delete"  on public.testimonials;

create policy "testimonials_public_read"
  on public.testimonials for select
  using (visible = true);

create policy "testimonials_admin_select"
  on public.testimonials for select
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "testimonials_admin_insert"
  on public.testimonials for insert
  with check (public.has_role(auth.uid(), 'super_admin'));

create policy "testimonials_admin_update"
  on public.testimonials for update
  using (public.has_role(auth.uid(), 'super_admin'));

create policy "testimonials_admin_delete"
  on public.testimonials for delete
  using (public.has_role(auth.uid(), 'super_admin'));

-- ════════════════════════════════════════════════════════════════
-- Note: user_roles and distributor_profiles policies live in
-- 0001_role_model.sql (they belong to the tables defined there).
-- ════════════════════════════════════════════════════════════════
