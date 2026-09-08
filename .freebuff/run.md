# EdRetail — Preview Run Doc

## How to run the server

The app is a Vite SPA served through an Express server (`server.ts`, `npm run dev`)
which also hosts `/api/chat` (Gemini) and `/api/health`.

```bash
npm run dev
```

- Listens on **port 3000** (hardcoded in `server.ts`; `vite.config.ts` also uses 3000).
- Requires `.env` with `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (dev-only
  demo flags are optional; `VITE_ENABLE_DEMO_UNLOCK=true` enables demo logins).
- No build step needed — Vite serves the source in middleware mode.

## How to reproduce artifacts

No uncommitted artifacts are required. `.env` already exists at the repo root
with the Supabase project config. Dependencies are installed (`node_modules`).
If a fresh checkout is needed: copy `.env` from the main checkout and run
`npm install`.

## Preview registration

Detached start (Windows, PowerShell):

```
powershell -NoProfile -Command "(Start-Process -FilePath 'npm.cmd' -ArgumentList 'run','dev' -RedirectStandardOutput '<log>' -RedirectStandardError '<log>.err' -WindowStyle Hidden -PassThru).Id"
```

Then register the preview at `http://localhost:3000/` with that PID.
## UI/UX IA Refinement (this phase) — verification log
- /portal/dashboard = true Overview (KPIs, goal, concise debts, Recent Sales + View all → /portal/ledger); /portal/ledger = dedicated Sales page (full FieldLedgerPanel).
- Single Log Sale per context: Overview header (1), Sales ledger CTA (1); top-bar duplicates removed (desktop + mobile).
- Mobile header: fixed (was sticky) + pt-14 → content starts 20px below header (was 112px gap).
- Drawer: scrollable nav + FIXED Sign Out footer (shrink-0, min-h 44px); survives scroll/short viewports.
- Storefront: primary nav = Home/Products/Goal Finder; footer (new, StorefrontFooter.tsx) hosts Orders & Help, Delivery Info, Become a Distributor, Distributor Portal, language, referral share; old HomePage footer folded in (exactly 1 footer).
- Flyer Studio: removed from public navbar; accessible in portal (desktop sidebar + drawer), lazy-loaded.
- Bottom nav item renamed Distributor → Portal.
- DeliveryView modernized: restrained hero, zone table rows, accordion FAQ (2 existing Q&As only), compact pillars, WhatsApp CTAs preserved; search filters DELIVERY_ZONES.
- Live-verified: sign-out (session keys cleared, /portal redirect, guard holds on refresh), drawer Sign Out fixed at bottom, no horizontal overflow on Sales/Overview/storefront, checkout surface intact, FAQ/search interactive.
- tsc --noEmit ✓ · npm run build ✓ · git diff --check ✓ · no debug/conflict markers · no credentials in dist.

## Authenticated RLS Matrix — PASS (live, operator-executed)
- `supabase/tests/rls-authz.test.mjs`: 49 passed, 0 failed, exit 0 against tfqlhgtmjuuquxntqmiy.
- Four provisioned identities (customer / distributor A / distributor B / super_admin) via service-role (provisioning only); all assertions on real user JWTs.
- Proven live: profile self-management + WITH CHECK, sales tenant isolation + open checkout (app/pending/null) + PII read-denial, loans/payments isolation, product/testimonial write gates, role-escalation prevention, flyer_campaigns full lifecycle (draft invisibility → publish → public read → archive invisibility, forge-ownership denial), storage folder isolation (A/B + anon draft denial, owner CRUD).
- Cleanup verified: all test rows + 4 auth users removed in finally, even across the two earlier failing runs.
- Harness fixes during bring-up: explicit `onConflict: 'user_id'` (0001 signup trigger pre-inserts customer role); delete-filtered vs RLS-error semantics; `.maybeSingle()` for invisible-row reads; checkout insert without RETURNING (customers have no SELECT on sales by design); marker-based checkout-row cleanup.

## Residue cleanup — CONFIRMED 0 (operator-executed)
- `select count(*) from sales where customer_name like 'RLS-PROBE-%'` → 0.
- Run 2's orphaned checkout row removed. Project carries zero RLS-probe artifacts.

## RELEASE CHECKLIST FINAL STATE
- DONE: 0003 applied + live-verified; authenticated RLS matrix 49/49 PASS (exit 0); storage/tenancy/draft-privacy/escalation all proven live; logout + gesture + responsive + iconography verified; tsc/build/diff-check PASS; zero test residue.
- REMAINING (both credential-gated): (1) real malikhamis94@gmail.com session → live flyer lifecycle + View Flyers content proof; (2) super-admin bootstrap SQL for the intended admin account.

## REAL-SESSION FLYER LIFECYCLE — VERIFIED END-TO-END (live)
- Real Supabase session for malikhamis94@gmail.com verified (aud=authenticated, valid JWT, 2026-09-08 expiry).
- Operator provisioning applied: role customer→distributor; distributor_profiles row created (Mwanahamisi Lissu / mwanahamisi-lissu / real phone / Dar es Salaam / verified).
- Live lifecycle via real UI: Flyer Studio → real product mrt-complex (45,000 TZS) → real copy + her real phone → Save Draft →
  DB row exact (status=draft, render_path=flyers/4fa20f4d…/aba9ee27….png, deterministic owner-scoped path) →
  draft render OWNER-readable, ANON-denied (404 NoSuchKey, non-leaking) → QR enabled (real /@slug?product= deep link) →
  Publish (gate→render→upload→attach→flip order held) → status=published →
  ANON sees published row + obtains signed render URL (200) → View Flyers renders the real PNG with real attribution →
  Archive → anon gallery empty again → restored to published (campaign left live).
- Zero fake content created. One real campaign now exists in production.

## ADMIN LOGIN BUG — ROOT-CAUSED & FIXED (live-verified)
- Symptom: signing in as the new super_admin (isitmalik@gmail.com) at /admin landed on /portal/dashboard.
- Root cause: race in admin AuthContext — signIn/onAuthStateChange set `user` immediately while the server role
  fetch was still in flight; AdminLogin's `if (!isAdmin) → Navigate /portal` evaluated on stale null role.
  DB was always correct (his session read super_admin server-side).
- Fix: added `roleResolved` to AuthContext (set true only after fetchRole completes / SIGNED_OUT / demo path);
  AdminLogin + Protected now render the spinner until `roleResolved`, then apply the role verdict. tsc exit 0.
- Live re-verification: /admin with real super_admin session → /admin/dashboard (Admin Overview);
  hard refresh of /admin/dashboard persists; sign-out clears sb-* keys → cold /admin login restored.
- Non-admin redirect behavior unchanged (distributors still routed to /portal); no RLS/schema changes.

## QR ORIGIN — DEPLOY-AWARE FIX (tsc 0, build clean)
- New src/lib/site.ts: publicSiteOrigin() = VITE_PUBLIC_SITE_URL (trimmed, no trailing slash) → window.location.origin → localhost build fallback.
- Applied to BOTH persistent-artifact sites in FlyerStudioModal: QR data-URL generation + campaign qr_destination.
- Session-scoped links (OAuth redirects, reset links, copy-store-link buttons) intentionally untouched — they must follow the browsing origin.
- .env.example documents VITE_PUBLIC_SITE_URL for the deploy host.
- FOLLOW-UP (post-deploy): the live campaign aba9ee27… has a localhost QR baked into its rendered PNG. After deploy with
  VITE_PUBLIC_SITE_URL set, re-open the campaign in Flyer Studio and re-publish to regenerate the PNG with the production QR.
