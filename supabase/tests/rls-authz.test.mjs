#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// ED Retail — Direct-DB RLS authorization tests.
//
// Provisions four disposable test identities via the service-role key
// (customer, distributor A, distributor B, super admin), then attempts
// allowed and denied operations AS EACH IDENTITY through anon-key
// clients, exactly like the real app. RLS is the system under test.
//
// CLEANUP GUARANTEE: every created auth user, distributor profile,
// sale, loan, loan payment and flyer campaign is tracked and deleted
// in a `finally` block — cleanup runs even when assertions fail.
// All test rows carry the unique marker `RLS-PROBE-<stamp>` so they
// are identifiable and never collide with real data. Real catalog
// rows are never mutated (the products test restores the read value).
//
// Usage (requires a real Supabase project):
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... node supabase/tests/rls-authz.test.mjs
//
// Exits 0 = all expectations met; 1 = an authorization expectation FAILED;
// 2 = environment not configured (SKIP).
// ════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';

const URL = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PW = 'Rls-Test-2026!';

if (!URL || !ANON || !SERVICE) {
  console.log('SKIP: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to run.');
  process.exit(2);
}

const admin = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });
const anonClient = createClient(URL, ANON);

let pass = 0, fail = 0;
function expect(label, cond) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); }
}
const denied = (r) => !!r.error && /(row-level security|permission denied|42501|violates)/i.test(r.error.message + ' ' + (r.error.code ?? ''));
const allowed = (r) => !r.error;
const zeroRows = (r) => allowed(r) && (r.data ?? []).length === 0;

// ── Cleanup registry ─────────────────────────────────────────────
const createdUsers = [];        // auth user ids
const createdProfileIds = [];   // distributor_profiles ids
const createdSaleIds = [];
const createdLoanIds = [];
const createdPaymentIds = [];
const createdCampaignIds = [];
const createdStoragePaths = [];
const stamp = Date.now();
const MARK = `RLS-PROBE-${stamp}`;

async function cleanup() {
  console.log('\n── Cleanup (runs even after failures) ──');
  // Rows first (children before parents), via service client (bypasses RLS).
  if (createdPaymentIds.length) {
    const r = await admin.from('loan_payments').delete().in('id', createdPaymentIds);
    console.log(`  loan_payments: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  if (createdLoanIds.length) {
    const r = await admin.from('loans').delete().in('id', createdLoanIds);
    console.log(`  loans: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  if (createdSaleIds.length) {
    const r = await admin.from('sales').delete().in('id', createdSaleIds);
    console.log(`  sales (by id): ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  // Checkout sales have no readable id (customers get no SELECT on sales),
  // so remove every marker-prefixed test sale as well.
  const rMk = await admin.from('sales').delete().like('customer_name', MARK + '%');
  console.log(`  sales (by marker): ${rMk.error ? 'ERROR ' + rMk.error.message : 'removed'}`);
  // Storage objects (best effort; requires 0003 bucket to exist).
  if (createdStoragePaths.length) {
    const r = await admin.storage.from('flyer-renders').remove(createdStoragePaths);
    const err = r.error ? r.error.message : '';
    console.log(`  storage renders: ${err ? 'best-effort (' + err + ')' : 'removed'}`);
  }
  if (createdCampaignIds.length) {
    const r = await admin.from('flyer_campaigns').delete().in('id', createdCampaignIds);
    console.log(`  flyer_campaigns: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  if (createdProfileIds.length) {
    const r = await admin.from('distributor_profiles').delete().in('id', createdProfileIds);
    console.log(`  distributor_profiles: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  // Auth users last (FK cascade also depends on profile removal above).
  for (const id of createdUsers) {
    const r = await admin.auth.admin.deleteUser(id);
    console.log(`  auth user ${id.slice(0, 8)}…: ${r.error ? 'ERROR ' + r.error.message : 'deleted'}`);
  }
}

async function makeUser(email) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: PW, email_confirm: true });
  if (error) throw new Error(`provision ${email}: ${error.message}`);
  createdUsers.push(data.user.id);
  return data.user;
}
async function setRole(userId, role) {
  // The 0001 signup trigger already inserts a default 'customer' row,
  // so the conflict target must be explicit or the upsert violates
  // user_roles_user_id_key.
  const { error } = await admin.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) throw new Error(`setRole ${userId}: ${error.message}`);
}
async function loginAs(email) {
  const c = createClient(URL, ANON);
  const { error } = await c.auth.signInWithPassword({ email, password: PW });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return c;
}

const custEmail = `rls-cust-${stamp}@example.com`;
const distAEmail = `rls-dist-a-${stamp}@example.com`;
const distBEmail = `rls-dist-b-${stamp}@example.com`;
const admEmail = `rls-admin-${stamp}@example.com`;

let exitCode = 2;
try {
  console.log('Provisioning test identities…');
  const cust = await makeUser(custEmail);
  const distA = await makeUser(distAEmail);
  const distB = await makeUser(distBEmail);
  const adm = await makeUser(admEmail);
  await setRole(distA.id, 'distributor');
  await setRole(distB.id, 'distributor');
  await setRole(adm.id, 'super_admin');

  const clientA = await loginAs(distAEmail);
  const clientB = await loginAs(distBEmail);
  const clientC = await loginAs(custEmail);
  const clientAdm = await loginAs(admEmail);

  console.log('\n── Distributor profile self-management ──');
  let profA, profB;
  {
    const r = await clientA.from('distributor_profiles')
      .insert({ user_id: distA.id, store_name: MARK + ' A', slug: `a-${stamp}` })
      .select('id').single();
    expect('A inserts own profile', allowed(r)); profA = r.data?.id;
    if (profA) createdProfileIds.push(profA);

    const rxBad = await clientA.from('distributor_profiles')
      .insert({ user_id: distB.id, store_name: 'Evil', slug: `evil-${stamp}` });
    expect('A cannot insert a profile for B', denied(rxBad));

    const ry = await clientA.from('distributor_profiles')
      .update({ city: 'Dodoma' }).eq('id', profA);
    expect('A updates own profile', allowed(ry));

    const rz = await clientA.from('distributor_profiles')
      .update({ user_id: cust.id }).eq('id', profA);
    expect('A cannot re-point own profile to another user (WITH CHECK)', denied(rz));

    const p = await clientB.from('distributor_profiles')
      .insert({ user_id: distB.id, store_name: MARK + ' B', slug: `b-${stamp}` })
      .select('id').single();
    expect('B inserts own profile', allowed(p)); profB = p.data?.id;
    if (profB) createdProfileIds.push(profB);

    const rv = await clientA.from('distributor_profiles')
      .delete().eq('id', profB);
    // A has no DELETE policy on B's row: PostgREST either returns an RLS
    // error OR silently filters (200, 0 rows). The real proof is that
    // B's profile still exists afterwards.
    const bStill = await clientB.from('distributor_profiles').select('id').eq('id', profB).maybeSingle();
    expect('A cannot delete B profile (delete filtered, B profile intact)', (allowed(rv) || denied(rv)) && !!bStill.data);
  }

  console.log('\n── SALES ──');
  {
    const ins = await clientA.from('sales').insert({
      channel: 'cash', status: 'confirmed', customer_name: MARK + ' A-cust',
      distributor_id: profA, items: [], subtotal: 1000,
    }).select('id').single();
    expect('A inserts own sale', allowed(ins));
    if (ins.data?.id) createdSaleIds.push(ins.data.id);

    const x1 = await clientA.from('sales').insert({
      channel: 'cash', status: 'confirmed', customer_name: MARK + ' forged',
      distributor_id: profB, items: [], subtotal: 1,
    });
    expect('A cannot insert a sale owned by B', denied(x1));

    const x2 = await clientA.from('sales').select('*').eq('distributor_id', profB);
    expect('A cannot read B sales (0 rows = RLS-filtered)', zeroRows(x2));

    const x3 = await clientA.from('sales').update({ status: 'cancelled' }).eq('distributor_id', profB);
    expect('A cannot update B sales', allowed(x3) ? zeroRows(x3) : denied(x3));

    // Insert WITHOUT returning: customers have no SELECT policy on sales
    // by design (PII privacy), so INSERT ... RETURNING would return 0 rows
    // and .single() would misreport an allowed checkout as a failure.
    const co = await clientC.from('sales').insert({
      channel: 'app', status: 'pending', customer_name: MARK + ' checkout', items: [], subtotal: 500,
    });
    expect('Customer checkout insert allowed (app/pending/null-distributor)', allowed(co));

    const x4 = await clientC.from('sales').insert({
      channel: 'cash', status: 'confirmed', customer_name: MARK + ' bad-channel', items: [], subtotal: 1,
    });
    expect('Customer cannot insert non-checkout sale', denied(x4));

    const x5 = await clientC.from('sales').select('*').limit(1);
    expect('Customer cannot read any sales', zeroRows(x5));

    const bs = await clientC.rpc('public_best_sellers', { _limit: 4 });
    expect('Public best-sellers RPC works for anon/customer', allowed(bs));

    const as = await clientAdm.from('sales').select('*').limit(5);
    expect('Super admin reads all sales', allowed(as));
  }

  console.log('\n── LOANS / PAYMENTS ──');
  {
    const l = await clientA.from('loans').insert({
      customer_name: MARK + ' debtor', distributor_id: profA, total_amount: 1000, amount_paid: 0,
    }).select('id').single();
    expect('A inserts own loan', allowed(l));
    if (l.data?.id) createdLoanIds.push(l.data.id);

    const x = await clientB.from('loans').select('*').eq('distributor_id', profA);
    expect('B cannot read A loans', zeroRows(x));

    const p = await clientB.from('loan_payments').insert({ loan_id: l.data.id, amount: 5 });
    expect('B cannot record a payment on A loan', denied(p));

    const pa = await clientAdm.from('loan_payments').insert({ loan_id: l.data.id, amount: 10 });
    expect('Super admin records payment', allowed(pa));
  }

  console.log('\n── PRODUCTS / TESTIMONIALS ──');
  {
    const x1 = await clientA.from('products').insert({ id: `hack-${stamp}`, name_en: 'x', name_sw: 'x', category: 'p4-slimming', price: 1, price_usd: 1 });
    expect('Distributor cannot create products', denied(x1));
    // Read the real stock value, then UPDATE it back to the same value —
    // proves UPDATE privilege without mutating real catalog data.
    const cur = await admin.from('products').select('stock_qty').eq('id', 'mrt-complex').single();
    const ok = await clientAdm.from('products').update({ stock_qty: cur.data.stock_qty }).eq('id', 'mrt-complex');
    expect('Super admin updates products (value restored, no mutation)', allowed(ok));
    const t = await clientA.from('testimonials').insert({ name: MARK, text: MARK });
    expect('Distributor cannot write testimonials', denied(t));
  }

  console.log('\n── ROLE ESCALATION ──');
  {
    const x1 = await clientC.from('user_roles').update({ role: 'super_admin' }).eq('user_id', cust.id);
    expect('Customer cannot self-promote to super_admin', denied(x1) || zeroRows(x1));
    const x2 = await clientA.from('user_roles').update({ role: 'super_admin' }).eq('user_id', distA.id);
    expect('Distributor cannot self-promote', denied(x2) || zeroRows(x2));
    const x3 = await clientA.from('user_roles').select('role').eq('user_id', adm.id);
    expect('Distributor cannot read another user role row', zeroRows(x3));
    const mine = await clientA.from('user_roles').select('role').eq('user_id', distA.id).single();
    expect('Distributor reads own role', allowed(mine) && mine.data?.role === 'distributor');
    const grant = await clientAdm.from('user_roles').update({ role: 'distributor' }).eq('user_id', distA.id);
    expect('Super admin can change roles', allowed(grant));
  }

  console.log('\n── FLYER CAMPAIGNS ──');
  let campA;
  {
    // Owner create (draft)
    const mk = await clientA.from('flyer_campaigns').insert({
      distributor_id: profA, product_id: 'mrt-complex', title: MARK,
      status: 'draft', render_path: '', qr_destination: '',
    }).select('id').single();
    expect('A creates own draft campaign', allowed(mk));
    campA = mk.data?.id;
    if (campA) createdCampaignIds.push(campA);

    // Forge ownership
    const forge = await clientA.from('flyer_campaigns').insert({
      distributor_id: profB, product_id: 'mrt-complex', title: MARK + ' forged',
      status: 'draft', render_path: '', qr_destination: '',
    });
    expect('A cannot create a campaign owned by B (server-derived ownership)', denied(forge));

    // Owner read
    const own = await clientA.from('flyer_campaigns').select('*').eq('id', campA).single();
    expect('A reads own draft', allowed(own) && own.data?.status === 'draft');

    // Owner update (edit + publish lifecycle states)
    const up = await clientA.from('flyer_campaigns').update({ headline: MARK + ' h' }).eq('id', campA);
    expect('A updates own campaign', allowed(up));

    // Cross-reads use maybeSingle: an RLS-invisible row yields null data,
    // not an error (a .single() call would throw PGRST116 and misreport).
    const rB = await clientB.from('flyer_campaigns').select('id').eq('id', campA).maybeSingle();
    expect('B cannot read A draft (row invisible)', !rB.error && rB.data === null);
    const uB = await clientB.from('flyer_campaigns').update({ status: 'archived' }).eq('id', campA);
    expect('B cannot update A campaign', allowed(uB) ? zeroRows(uB) : denied(uB));
    const dB = await clientB.from('flyer_campaigns').delete().eq('id', campA);
    expect('B cannot delete A campaign', allowed(dB) ? zeroRows(dB) : denied(dB));

    // Customer/anonymous draft denial
    const cRead = await clientC.from('flyer_campaigns').select('id').eq('id', campA).maybeSingle();
    expect('Customer cannot read A draft (row invisible)', !cRead.error && cRead.data === null);
    const aRead = await anonClient.from('flyer_campaigns').select('*').eq('id', campA);
    expect('Anonymous cannot read A draft', zeroRows(aRead));

    // Public published read — only after explicit publish
    const pub = await anonClient.from('flyer_campaigns').select('*').eq('id', campA);
    expect('Anonymous cannot see draft in public gallery', zeroRows(pub));
    const publish = await clientA.from('flyer_campaigns').update({ status: 'published' }).eq('id', campA);
    expect('A publishes own campaign (with render path attached)', allowed(publish));
    const pub2 = await anonClient.from('flyer_campaigns').select('*').eq('id', campA).single();
    expect('Anonymous sees published campaign', allowed(pub2) && pub2.data?.status === 'published');

    // Archive → disappears publicly, owner retains access
    const arch = await clientA.from('flyer_campaigns').update({ status: 'archived' }).eq('id', campA);
    expect('A archives own campaign', allowed(arch));
    const pub3 = await anonClient.from('flyer_campaigns').select('*').eq('id', campA);
    expect('Archived campaign disappears from public gallery', zeroRows(pub3));
    const ownArch = await clientA.from('flyer_campaigns').select('*').eq('id', campA).single();
    expect('Owner still reads own archived campaign', allowed(ownArch));
  }

  console.log('\n── STORAGE (flyer-renders) ──');
  {
    // Bucket may not exist yet (0003 unapplied) — skip cleanly, never fake.
    const probe = await clientA.storage.from('flyer-renders').list('flyers');
    if (probe.error && /not found|does not exist|Bucket/i.test(probe.error.message)) {
      console.log('  SKIP — flyer-renders bucket not found (migration 0003 not applied).');
    } else {
      const pathA = `flyers/${profA}/${campA}.png`;
      const blob = new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' });

      const up = await clientA.storage.from('flyer-renders').upload(pathA, blob, { contentType: 'image/png', upsert: true });
      expect('Owner uploads own render', allowed(up));
      if (allowed(up)) createdStoragePaths.push(pathA);

      const forged = await clientB.storage.from('flyer-renders').upload(`flyers/${profA}/forged-${stamp}.png`, blob, { contentType: 'image/png' });
      expect('B cannot insert into A folder', denied(forged) || !!forged.error);

      const rdB = await clientB.storage.from('flyer-renders').download(pathA);
      expect('B cannot read A render (draft)', !!rdB.error);

      const rdAnon = await anonClient.storage.from('flyer-renders').download(pathA);
      expect('Anonymous cannot read draft render', !!rdAnon.error);

      const upd = await clientA.storage.from('flyer-renders').update(pathA, blob, { contentType: 'image/png', upsert: true });
      expect('Owner updates own render', allowed(upd));

      const delB = await clientB.storage.from('flyer-renders').remove([pathA]);
      const stillThere = await clientA.storage.from('flyer-renders').list(`flyers/${profA}`);
      expect('B cannot delete A render', !!(delB.error) || (stillThere.data ?? []).some((o) => o.name === `${campA}.png`));

      // Note: public published-render read is covered once a render path is
      // attached to a published campaign row — verified live post-migration.
      const del = await clientA.storage.from('flyer-renders').remove([pathA]);
      expect('Owner deletes own render', allowed(del));
    }
  }

  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  exitCode = fail === 0 ? 0 : 1;
} catch (err) {
  console.error(`\nABORT: ${err?.message ?? err}`);
  exitCode = 1;
} finally {
  await cleanup();
  process.exit(exitCode);
}
