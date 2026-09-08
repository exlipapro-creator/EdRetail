# EdRetail — Security Test Matrix (Role Authorization)

Authoritative role source: `public.user_roles` (see `supabase/migrations/0001_role_model.sql`).
RLS policies: `supabase/migrations/0002_rls_hardening.sql`.
UI permission model: `src/lib/permissions.ts` (**not** a security boundary).

**Applying the migrations:** run `supabase-schema.sql` (base) → `0001_role_model.sql` → `0002_rls_hardening.sql` in Supabase → SQL Editor. Both migrations are re-runnable and destroy no data.

## Apply & verify runbook (operator)

Prerequisites confirmed 2026-09-07 (update 2): the live project is now `tfqlhgtmjuuquxntqmiy.supabase.co` (reachable, anon key valid, role claim `anon`, auth health 200). **Live schema reconnaissance:** the project contains ONLY an unrelated `profiles` table (id/role/office — publicly readable by anon, including rows with `role='admin'` — pre-existing exposure belonging to another app, flag to the project owner). **None of the EdRetail base tables (products/sales/loans/loan_payments/testimonials) exist, and no migration objects exist** — i.e. the base schema AND both migrations are unapplied. No service-role key / CLI / DB URL exists in the environment, so nothing was applied from here. Operator sequence:

1. **SQL Editor → run `supabase-schema.sql`** (all statements are `create if not exists` / seed `on conflict do nothing`; it never touches the foreign `profiles` table). This creates the five EdRetail tables and their (weak) initial policies.
2. **SQL Editor → run `supabase/migrations/0001_role_model.sql`** (re-runnable).
3. **SQL Editor → run `supabase/migrations/0002_rls_hardening.sql`** (re-runnable) — this removes the weak policies from step 1.
4. **Bootstrap the super admin**:
   ```sql
   update public.user_roles set role = 'super_admin'
   where user_id = (select id from auth.users where email = '<ADMIN-EMAIL>');
   ```
5. **Run the live authorization tests** (provisions disposable test users via the service-role key, then tests every deny/allow path directly):
   ```bash
   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
   node supabase/tests/rls-authz.test.mjs
   ```
6. Re-verify the storefront (best-sellers RPC, checkout insert, testimonials) and review the foreign `profiles` table's public exposure with the project owner.

Until steps 1–5 complete, the live status is **BLOCKED — LIVE DATABASE TEST NOT EXECUTED**, and the authorization boundary does not exist on the project (no EdRetail tables = no RLS to verify).

## Apply status (live evidence, 2026-09-08)

| Stage | Status | Live evidence |
|---|---|---|
| A — base schema | **APPLIED + VERIFIED** | products (7 rows), sales/loans/loan_payments (empty), testimonials (3 rows) all return 200 to anon reads; `profiles` untouched (1 row) |
| B — role model (v2) | **APPLIED + VERIFIED** | `user_roles`/`distributor_profiles` exist (200, empty); `has_role()` RPC callable by anon → returns `false` for unknown user |
| C — RLS hardening | **APPLIED + VERIFIED (anon slice)** | probes below |

Stage C anon-behavior probes (all against the live project):

- anon `POST /products` → **401 42501** (RLS violation) — product writes denied ✅
- anon `POST /sales` with `channel='pos'` → **401 42501** — non-checkout inserts denied ✅
- anon `POST /sales` with exact checkout shape (`channel='app'`, `status='pending'`) → **201 Created** (with `Prefer: return=minimal`) — checkout works ✅
- anon `POST /sales` with `Prefer: return=representation` → **401** — expected: PostgREST re-reads the inserted row under SELECT policies and anon has no sales SELECT policy (by design). **Client impact: none** — `CheckoutSheet` does not request a return payload.
- anon `GET /sales` after the probe insert → `[]` — inserted checkout row is **invisible to anon** (no public sales SELECT) ✅
- anon `POST /testimonials` → **401 42501** — moderation/writes denied ✅
- anon `POST rpc/public_best_sellers {_limit:5}` → **200** (aggregate only) ✅

One probe checkout row (`customer_name='RLS-PROBE-DELETE-ME'`, channel=app, pending) was inserted and remains in `sales`; anon cannot see or delete it. **Operator cleanup (optional, via SQL Editor or service role):**

```sql
delete from sales where customer_name = 'RLS-PROBE-DELETE-ME' and channel = 'app' and status = 'pending';
```

Customer/distributor/super-admin authorization slices remain **BLOCKED** until step 5 (the test script needs `SUPABASE_SERVICE_ROLE_KEY` to provision the four test identities).

## Role matrix — UI visibility AND database enforcement

| Operation | CUSTOMER UI | DISTRIBUTOR UI | SUPER_ADMIN UI | DB enforcement (RLS) |
|---|---|---|---|---|
| Browse products / best sellers / visible reviews | ✅ storefront | ✅ | ✅ | `products_public_read`, `testimonials_public_read` (visible only), `public_best_sellers()` RPC |
| Checkout (insert sale) | ✅ | ✅ | ✅ | `sales_checkout_insert`: `channel='app' AND status='pending' AND distributor_id IS NULL` only |
| Read sales | ❌ | own rows only (via `distributor_id`) | ✅ all | `sales_owner_select` / `sales_admin_select`; **no public select** (customer PII) |
| Update sales status | ❌ | own rows only | ✅ | `sales_owner_update` / `sales_admin_update` |
| Loans / loan payments | ❌ | own loans only | ✅ | `loans_*` / `loan_payments_*` policies |
| Manage products | ❌ | ❌ | ✅ | write = `has_role(…,'super_admin')` |
| Moderate reviews | ❌ | ❌ | ✅ | `testimonials_admin_*` |
| Manage distributor profiles | ❌ | own profile only | ✅ | `distributor_profiles_*` |
| Change any user's role | ❌ | ❌ | ✅ | `user_roles_admin_*` — no write policy exists for anyone else |
| Reach `/admin` UI | ❌ redirected to `/portal` | ❌ redirected to `/portal` | ✅ | `AuthContext` reads own `user_roles` row (self-read only); DB independently blocks admin data via RLS |

## Role-escalation protection (critical)

- `user_roles` has **no insert/update/delete policy for non-super_admin** — a customer or distributor cannot change their own role through any API.
- New signups are auto-provisioned `customer` by a SECURITY DEFINER trigger (`handle_new_user`), which bypasses RLS in a controlled way and cannot be invoked to escalate.
- Roles are never read from localStorage, Zustand, URL params, or client-supplied fields; the client fetches its own role row solely for UI rendering.
- `has_role()` and `owns_distributor_row()` are `SECURITY DEFINER` with pinned `search_path = public`; `EXECUTE` is revoked from `public` where appropriate and re-granted to `authenticated`/`anon` explicitly.

## Local-storage (Zustand persist) findings

`distributorStore` now persists via a **whitelist** (`partialize`):

- **Persisted (business data, safe):** profiles registry, current profile, referral slug/attribution, master/custom products, platform settings, catalog overrides, offline sales ledger, tasks, fund-challenge data, downline legs, audit logs, ad/monetization config.
- **Never persisted:** `isAdminAuthenticated`, `adminPin`, `isSuperAdminAuthenticated`, `superAdminUser` — no passwords, tokens, PINs, or session credentials are stored. Supabase Auth remains the sole session authority; `/portal` access is re-verified against the real session on every cold load (`DistributorProtected` + login-page session restore).

## Direct database tests

Run with real credentials when a Supabase project is available:

```bash
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
SUPABASE_SERVICE_ROLE_KEY=... \
node supabase/tests/rls-authz.test.mjs
```

The script provisions four test identities (customer, distributor A, distributor B, super admin) via the service-role key, then attempts unauthorized operations **directly against the database** as each identity. Every "DENY" row must fail with an RLS error — hidden buttons are not acceptance criteria. It exits `SKIP` when env vars are absent (as in CI without a project); it is **not** a substitute for running against the real project.

### Expected results per identity

- **CUSTOMER:** storefront reads OK; `sales`/`loans`/`products`/`testimonials` writes DENIED; reading `sales` DENIED; own role row readable; writing `user_roles` DENIED.
- **DISTRIBUTOR A:** sees/edits only rows where `distributor_id` = own profile; **cannot** select/insert/update B's sales or loans; cannot write products/testimonials; cannot promote self; can update own `distributor_profiles` row but not `user_id`.
- **DISTRIBUTOR B:** symmetric to A — cross-tenant operations DENIED.
- **SUPER_ADMIN:** platform-wide reads/writes OK; can grant/revoke roles.
