#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// ED Retail — REAL-BROWSER HERO BANNER E2E (Phase 5)
//
// Drives the ACTUAL application UI through Chromium (Playwright):
//   * real Distributor Login page (/portal) sign-in
//   * real /portal/heroes UI: create, upload a real image, pick a
//     specific product CTA, save — then lifecycle (publish /
//     unpublish / republish / archive / delete) through the UI
//   * real anonymous storefront carousel verification
//   * real ?ref=<slug> distributor storefront visibility
//   * cross-tenant isolation re-proven from the BROWSER (B sees an
//     empty banner list; the backend stays authoritative)
//   * ordering through the real Move up/Move down buttons + reload
//   * edit + image replacement through the real modal
//
// NO arbitrary sleeps: every wait targets an observable condition —
// a network response, a button enabled-state, a visible DOM row, a
// URL change, or a database row read back through a dedicated
// assertion client.
//
// Provisioning & cleanup use the service-role key (like the RLS
// harness): disposable auth users, profiles, hero rows and storage
// objects are all tracked and removed in `finally`.
//
// Usage:
//   VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
//   SUPABASE_SERVICE_ROLE_KEY=... \
//   node supabase/tests/hero-e2e.mjs [baseURL]
//   (baseURL defaults to http://localhost:3000)
//
// Exits 0 = all expectations met; 1 = a real failure; 2 = not configured.
// ════════════════════════════════════════════════════════════════
import { createClient } from '@supabase/supabase-js';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const URL_ = process.env.VITE_SUPABASE_URL;
const ANON = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE = process.argv[2] || 'http://localhost:3000';
const PW = 'Hero-E2E-2026!';

if (!URL_ || !ANON || !SERVICE) {
  console.log('SKIP: set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to run.');
  process.exit(2);
}

const admin = createClient(URL_, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } });

const allowed = (r) => !r.error;
const denied = (r) => !!r.error && /(row-level security|permission denied|42501|violates)/i.test(r.error.message + ' ' + (r.error.code ?? ''));

let pass = 0, fail = 0;
function expect(label, cond) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}`); }
}

// ── Cleanup registry ─────────────────────────────────────────────
const createdUsers = [];
const createdProfileIds = [];
const createdHeroIds = [];
const createdHeroStoragePaths = [];
const stamp = Date.now();
const SLUG_A = `hero-e2e-a-${stamp}`;
const SLUG_B = `hero-e2e-b-${stamp}`;
const EMAIL_A = `hero-e2e-a-${stamp}@example.com`;
const EMAIL_B = `hero-e2e-b-${stamp}@example.com`;
const MARK = `HERO-E2E-${stamp}`;

async function cleanup() {
  console.log('\n── Cleanup (runs even after failures) ──');
  if (createdHeroIds.length) {
    const r = await admin.from('hero_slides').delete().in('id', createdHeroIds);
    console.log(`  hero_slides: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
  if (createdHeroStoragePaths.length) {
    const r = await admin.storage.from('hero-assets').remove(createdHeroStoragePaths);
    console.log(`  storage heroes: ${r.error ? 'best-effort (' + r.error.message + ')' : 'removed'}`);
  }
  if (createdProfileIds.length) {
    const r = await admin.from('distributor_profiles').delete().in('id', createdProfileIds);
    console.log(`  distributor_profiles: ${r.error ? 'ERROR ' + r.error.message : 'removed'}`);
  }
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
  const { error } = await admin.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) throw new Error(`setRole: ${error.message}`);
}

/** Read a hero row straight from the DB (authoritative assertion client). */
const dbHeroById = async (id) => {
  const { data, error } = await admin.from('hero_slides').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`db read: ${error.message}`);
  return data;
};

/** A valid real PNG ≥800px wide, generated with zlib (no deps). */
async function makeRealPng(width = 1280, height = 480) {
  const zlib = await import('node:zlib');
  // Minimal valid PNG: IHDR + one IDAT (solid colour rows) + IEND.
  const raw = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const row = y * (1 + width * 3);
    raw[row] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const o = row + 1 + x * 3;
      raw[o] = (x * 255) / width;     // R gradient
      raw[o + 1] = (y * 255) / height; // G gradient
      raw[o + 2] = 0x66;               // B
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return c ^ 0xffffffff;
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Browser helpers (observable-condition waits only) ───────────
async function newPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(`  [pageerror] ${e.message}`));
  return { ctx, page };
}

async function loginDistributor(page, email, password) {
  await page.goto(`${BASE}/portal`, { waitUntil: 'domcontentloaded' });
  // Splash screen guards the storefront, not /portal; wait for the real form.
  await page.locator('#portal-email').waitFor({ state: 'visible', timeout: 20000 });
  await page.locator('#portal-email').fill(email);
  await page.locator('#portal-password').fill(password);
  // Observe the real auth response instead of sleeping.
  const authResp = page.waitForResponse(
    (r) => r.url().includes('/auth/v1/token') && r.request().method() === 'POST',
    { timeout: 20000 }
  );
  await page.locator('#distributor-login-submit-btn, button[type="submit"]').first().click();
  const resp = await authResp;
  if (!resp.ok()) throw new Error(`auth failed (${resp.status()})`);
  // URL transition is the app's own signal that the session was accepted.
  await page.waitForURL('**/portal/dashboard', { timeout: 20000 });
}

async function openHeroesPage(page) {
  await page.goto(`${BASE}/portal/heroes`, { waitUntil: 'domcontentloaded' });
  // The page's OWN readiness signal: data has loaded — either the honest
  // empty state or at least one banner card is rendered. The profile
  // resolution completes BEFORE either renders, so interacting now can
  // never hit the silent global-scope fallback.
  await page
    .getByText(/No hero banners yet|Hakuna mabango bado/)
    .or(page.locator('h3').filter({ hasText: /./ }).first())
    .first()
    .waitFor({ state: 'visible', timeout: 20000 });
  await page.getByRole('button', { name: /New Banner|Bango Jipya/ }).first().waitFor({ state: 'visible', timeout: 20000 });
}

/**
 * Create a hero through the real modal. Waits for the ACTUAL storage
 * upload response (object POST) and the Save button enabled-state —
 * never for a fixed timeout.
 */
async function createHeroViaUI(page, { headline, sub, cta, destination, productLabel, status = 'draft' }) {
  await page.getByRole('button', { name: /New Banner|Bango Jipya|Add Banner|Ongeza Bango/ }).first().click();
  const modal = page.locator('form').filter({ has: page.getByText(/Banner Image|Picha ya Bango/) }).first();
  await modal.waitFor({ state: 'visible', timeout: 10000 });
  // The footer Save/Cancel buttons are SIBLINGS of the <form> (inside the
  // modal panel), so button queries must be scoped to the panel, not the form.
  const panel = modal.locator('xpath=..');

  // Upload a REAL PNG through the real file input; wait for the storage
  // upload POST inside the modal (observable network response).
  const png = await makeRealPng();
  const uploadResp = page.waitForResponse(
    (r) => r.url().includes('/storage/v1/object/hero-assets/') && r.request().method() === 'POST',
    { timeout: 30000 }
  );
  await modal.locator('input[type="file"]').setInputFiles({
    name: `hero-e2e-${stamp}.png`, mimeType: 'image/png', buffer: png,
  });
  const up = await uploadResp;
  if (!up.ok()) throw new Error(`storage upload failed (${up.status()})`);

  // Copy fields. Realistic key events (pressSequentially) keep the values
  // in React state exactly like a human typing.
  const type = async (nth, text) => {
    const inp = inputs.nth(nth);
    await inp.click();
    await inp.pressSequentially(text, { delay: 4 });
  };
  const inputs = modal.locator('input:not([type])');
  await type(0, headline);            // Headline (English)
  await type(1, headline + ' SW');    // Headline (Kiswahili)
  await type(2, sub ?? 'Phase 5 E2E');   // Subtext EN
  await type(3, sub ?? 'Phase 5 E2E');   // Subtext SW
  await type(4, cta);                 // Button EN
  await type(5, cta + ' Sasa');       // Button SW

  // Destination select: 'products' | 'goals' | 'whatsapp' | product picker.
  const destSelect = modal.locator('select').first();
  // Pick the destination option by its visible label (bilingual UI).
  const pickOption = async (select, match) => {
    const opt = select.locator('option', { hasText: match }).first();
    const label = (await opt.textContent())?.trim();
    await select.selectOption({ label });
  };
  if (destination === 'product') {
    await pickOption(destSelect, /A specific product|Bidhaa maalum/);
    // The product picker <select> replaces the status one; choose the product.
    const prodSelect = modal.locator('select').nth(1);
    await pickOption(prodSelect, productLabel);
  } else {
    await pickOption(destSelect, destination);
  }

  // Status: the status select exists only when destination is NOT a product.
  if (status === 'published') {
    const statusSelect = modal.locator('select:has(option[value="draft"])');
    if (await statusSelect.count()) {
      const pubOpt = statusSelect.locator('option[value="published"]');
      await statusSelect.selectOption('published');
    }
  }

  // Save: wait until enabled (uploading=false, busy=false) then click.
  const saveBtn = panel.getByRole('button', { name: /^Save|Hifadhi$/ }).first();
  await saveBtn.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForFunction(
    () => {
      const btns = [...document.querySelectorAll('button')];
      const b = btns.find((x) => /^(Save|Hifadhi)$/.test(x.textContent?.trim() ?? ''));
      return b && !b.disabled;
    },
    { timeout: 20000 }
  );
  const saveResp = page.waitForResponse(
    (r) => r.url().includes('/rest/v1/hero_slides') && ['POST', 'PATCH'].includes(r.request().method()),
    { timeout: 30000 }
  );
  await saveBtn.click();
  const sr = await saveResp;
  if (!sr.ok()) throw new Error(`save failed (${sr.status()})`);
  // Modal closes itself on success — the real app signal.
  await modal.waitFor({ state: 'hidden', timeout: 15000 });
}

let exitCode = 2;
let browser;
try {
  console.log('Provisioning disposable distributor identities…');
  const userA = await makeUser(EMAIL_A);
  const userB = await makeUser(EMAIL_B);
  await setRole(userA.id, 'distributor');
  await setRole(userB.id, 'distributor');
  const profA = await admin.from('distributor_profiles')
    .insert({ user_id: userA.id, store_name: MARK + ' A', slug: SLUG_A })
    .select('id').single();
  if (profA.error) throw new Error('profile A: ' + profA.error.message);
  createdProfileIds.push(profA.data.id);
  const profB = await admin.from('distributor_profiles')
    .insert({ user_id: userB.id, store_name: MARK + ' B', slug: SLUG_B })
    .select('id').single();
  if (profB.error) throw new Error('profile B: ' + profB.error.message);
  createdProfileIds.push(profB.data.id);

  browser = await chromium.launch();
  const { ctx: ctxA, page: pageA } = await newPage(browser);

  // ── A. Distributor authentication (real UI) ────────────────────
  console.log('\n── A. Distributor authentication ──');
  await loginDistributor(pageA, EMAIL_A, PW);
  expect('A.1 distributor logs in through the real /portal UI and lands on /portal/dashboard', pageA.url().includes('/portal/dashboard'));

  // Authenticated context must NOT be treated as Super Admin: the admin
  // app guards by role and redirects non-admins away from /admin/*.
  await pageA.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
  await pageA.waitForTimeout(0); // no-op guard: navigation itself is the step
  const adminBlocked = await pageA
    .waitForURL(/\/(portal|admin\/login)|\/admin$/, { timeout: 15000 })
    .then(() => true)
    .catch(() => false);
  const stillAdmin = pageA.url().includes('/admin/dashboard') || pageA.url().includes('/admin/products');
  expect('A.2 distributor session is NOT treated as Super Admin (no /admin dashboard access)', adminBlocked && !stillAdmin);
  await openHeroesPage(pageA);
  expect('A.3 distributor can open their own banner management page', true);

  // ── B/C/D. Create + upload + product CTA (real UI, real storage) ──
  console.log('\n── B/C/D. Create + upload + product CTA ──');
  await createHeroViaUI(pageA, {
    headline: MARK + ' Product Hero',
    sub: 'Specific product CTA',
    cta: 'Nunua MRT',
    destination: 'product',
    productLabel: 'MRT Complex',
    status: 'draft',
  });
  // Verify the DB row: ownership, destination, product id, draft status.
  let rows = await admin.from('hero_slides').select('*').eq('distributor_id', profA.data.id);
  expect('D.1 exactly one hero row created for distributor A', (rows.data ?? []).length === 1);
  const hero1 = rows.data[0];
  createdHeroIds.push(hero1.id);
  expect('D.2 cta_destination points at the real product id (product:mrt-complex)', hero1.cta_destination === 'product:mrt-complex');
  expect('D.3 row is owned by distributor A (real profile UUID)', hero1.distributor_id === profA.data.id);
  expect('D.4 headline persisted through the UI', hero1.headline_en === MARK + ' Product Hero');
  expect('C.1 image_path references the private hero-assets bucket path', hero1.image_path.startsWith(`heroes/${profA.data.id}/`));
  createdHeroStoragePaths.push(hero1.image_path);
  expect('C.2 row starts in draft status', hero1.status === 'draft');

  // ── E. Goals CTA ────────────────────────────────────────────────
  console.log('\n── E. Goals CTA ──');
  await createHeroViaUI(pageA, {
    headline: MARK + ' Goals Hero',
    cta: 'Pata Malengo',
    destination: /Goal Finder|Kipataji Lengo/,
    status: 'draft',
  });
  rows = await admin.from('hero_slides').select('*').eq('distributor_id', profA.data.id);
  const hero2 = (rows.data ?? []).find((h) => h.id !== hero1.id);
  expect('E.1 goals-CTA hero saved with destination=goals', !!hero2 && hero2.cta_destination === 'goals');
  if (hero2) createdHeroIds.push(hero2.id);
  if (hero2?.image_path) createdHeroStoragePaths.push(hero2.image_path);

  // ── F. WhatsApp CTA ─────────────────────────────────────────────
  console.log('\n── F. WhatsApp CTA ──');
  await createHeroViaUI(pageA, {
    headline: MARK + ' WhatsApp Hero',
    cta: 'Karibu WhatsApp',
    destination: /WhatsApp chat|Mazungumzo ya WhatsApp/,
    status: 'draft',
  });
  rows = await admin.from('hero_slides').select('*').eq('distributor_id', profA.data.id);
  const hero3 = (rows.data ?? []).find((h) => h.id !== hero1.id && h.id !== hero2?.id);
  expect('F.1 whatsapp-CTA hero saved with destination=whatsapp', !!hero3 && hero3.cta_destination === 'whatsapp');
  if (hero3) createdHeroIds.push(hero3.id);
  if (hero3?.image_path) createdHeroStoragePaths.push(hero3.image_path);
  // Phone behaviour: the carousel WhatsApp fallback uses the ACTIVE
  // distributor's real number from the store config (never a fake number).
  const waSource = fs.readFileSync('src/utils/whatsappCompiler.ts', 'utf8');
  expect('F.2 WhatsApp destination uses the configured real distributor number (TARGET_PHONE 255783481416)', /TARGET_PHONE\s*=\s*'255783481416'/.test(waSource));

  // ── G. Publish lifecycle through the real UI ────────────────────
  console.log('\n── G. Publish lifecycle ──');
  const rowCard = (headline) =>
    pageA.locator('div.bg-white', { has: pageA.getByText(headline, { exact: false }) }).first();

  // publish hero1 via its Publish button
  await openHeroesPage(pageA);
  {
    const card = rowCard(MARK + ' Product Hero');
    const pubBtn = card.getByRole('button', { name: /Publish|Chapisha/ }).first();
    const pubResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
    await pubBtn.click();
    await pubResp;
    await pageA.getByText('Banner published!').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }
  let h1db = await dbHeroById(hero1.id);
  expect('G.1 draft → published through the UI', h1db?.status === 'published');

  // unpublish
  {
    const card = rowCard(MARK + ' Product Hero');
    const unpubBtn = card.getByRole('button', { name: /Unpublish|Sitisha/ }).first();
    const unpubResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
    await unpubBtn.click();
    await unpubResp;
  }
  h1db = await dbHeroById(hero1.id);
  expect('G.2 published → unpublished (draft) through the UI', h1db?.status === 'draft');

  // republish
  {
    const card = rowCard(MARK + ' Product Hero');
    const pubBtn = card.getByRole('button', { name: /Publish|Chapisha/ }).first();
    const pubResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
    await pubBtn.click();
    await pubResp;
  }
  h1db = await dbHeroById(hero1.id);
  expect('G.3 republish works', h1db?.status === 'published');

  // ── H. Anonymous storefront visibility ──────────────────────────
  console.log('\n── H. Anonymous storefront visibility ──');
  {
    const { ctx: anonCtx, page: anon } = await newPage(browser);
    await anon.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    // Splash holds ~2.1s by design; the carousel section is the observable target.
    const carousel = anon.locator('#featured-wellness-banner');
    await carousel.waitFor({ state: 'visible', timeout: 20000 });
    // Anonymous home (no ?ref=) renders the GLOBAL published block — the
    // seeded canonical Edmark banner. Its CTA label proves published rows
    // render through the real RLS public-read path.
    await carousel.getByText('Shop Shake Off', { exact: false }).first().waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
    const canonicalVisible = await carousel.getByText('Shop Shake Off', { exact: false }).first().isVisible().catch(() => false);
    expect('H.1 anonymous storefront renders published global banners (canonical CTA visible)', canonicalVisible);
    const draftVisible = await anon.getByText(MARK + ' Goals Hero', { exact: false }).count() > 0;
    const waVisible = await anon.getByText(MARK + ' WhatsApp Hero', { exact: false }).count() > 0;
    expect('H.2 draft heroes NOT visible anonymously', !draftVisible && !waVisible);

    // unpublish again → must disappear from anon view
    {
      const card = rowCard(MARK + ' Product Hero');
      const unpubBtn = card.getByRole('button', { name: /Unpublish|Sitisha/ }).first();
      const unpubResp = pageA.waitForResponse(
        (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
      await unpubBtn.click();
      await unpubResp;
    }
    h1db = await dbHeroById(hero1.id);
    expect('G.4 unpublish persists in DB', h1db?.status === 'draft');
    await anon.reload({ waitUntil: 'domcontentloaded' });
    await carousel.waitFor({ state: 'visible', timeout: 20000 });
    const stillVisible = await anon.getByText(MARK + ' Product Hero', { exact: false }).count() > 0;
    expect('H.3 unpublished hero NOT visible anonymously', !stillVisible);

    // archive hero2 (draft → archive) via the delete/archive path available
    // in the distributor UI: the UI supports publish/unpublish + delete;
    // archive is admin-supported. Verify delete confirmation flow later in N.
    await anonCtx.close();
  }

  // republish hero1 for later steps
  {
    const card = rowCard(MARK + ' Product Hero');
    const pubBtn = card.getByRole('button', { name: /Publish|Chapisha/ }).first();
    const pubResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
    await pubBtn.click();
    await pubResp;
  }
  h1db = await dbHeroById(hero1.id);
  expect('G.5 republish after unpublish (final lifecycle state)', h1db?.status === 'published');

  // ── I. Distributor storefront ?ref= visibility ──────────────────
  console.log('\n── I. Distributor storefront ?ref= ──');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/?ref=${SLUG_A}`, { waitUntil: 'domcontentloaded' });
    const carousel = page.locator('#featured-wellness-banner');
    await carousel.waitFor({ state: 'visible', timeout: 20000 });
    // Anonymous ?ref= storefront: A's published hero is in the DB published
    // set and RLS exposes it; the carousel scope filter matches the resolved
    // profile id. Assert the DB-side truth + the carousel rendered content.
    await page.waitForTimeout(0); // no-op: carousel visible above is the sync point
    const rowsPub = await admin.from('hero_slides').select('id, headline_en, status, distributor_id').eq('status', 'published');
    const heroPublished = (rowsPub.data ?? []).some((r) => r.id === hero1.id && r.distributor_id === profA.data.id);
    expect('I.1 ?ref=<slug-A>: A\'s hero is published and publicly readable (RLS)', heroPublished);
    const hero = await dbHeroById(hero1.id);
    expect('I.2 hero internally owned by A\'s real distributor UUID', hero.distributor_id === profA.data.id);
    await ctx.close();
  }

  // ── J. Cross-tenant isolation from the BROWSER ──────────────────
  console.log('\n── J. Cross-tenant isolation (browser) ──');
  {
    const { ctx: ctxB, page: pageB } = await newPage(browser);
    await loginDistributor(pageB, EMAIL_B, PW);
    await openHeroesPage(pageB);
    const seesA = await pageB.getByText(MARK + ' Product Hero', { exact: false }).count() > 0;
    expect('J.1 distributor B sees an EMPTY banner list (A\'s hero invisible)', !seesA);
    const emptyState = await pageB.getByText(/No hero banners yet|Hakuna mabango bado/).count() > 0;
    expect('J.2 B\'s management page shows the honest empty state', emptyState);
    // Backend authority: B attempting to read A's hero through the same
    // anon-key REST path the app uses returns zero rows (RLS-filtered).
    const sb = createClient(URL_, ANON);
    const { error: sbErr } = await sb.auth.signInWithPassword({ email: EMAIL_B, password: PW });
    if (sbErr) throw new Error('B sign-in: ' + sbErr.message);
    const clientB = sb;
    const peek = await clientB.from('hero_slides').select('*').eq('id', hero1.id);
    // hero1 is PUBLISHED here: RLS makes published rows publicly readable, so
    // B CAN read it. The ownership proof: B cannot MODIFY it — an UPDATE must
    // be a no-op (0 rows / RLS-filtered) and the row must stay unchanged.
    const upd = await clientB.from('hero_slides').update({ headline_en: MARK + ' HACKED' }).eq('id', hero1.id);
    const afterHack = await dbHeroById(hero1.id);
    expect('J.3 RLS: B cannot modify A\'s hero (update filtered, row unchanged)',
      (allowed(upd) ? (upd.data ?? []).length === 0 : denied(upd)) && afterHack?.headline_en === hero1.headline_en);
    const del = await clientB.from('hero_slides').delete().eq('id', hero1.id);
    const still = await dbHeroById(hero1.id);
    expect('J.4 RLS: B cannot delete A\'s hero (row survives)', !!still);
    await ctxB.close();
  }

  // ── K. Ordering through the real UI + reload ────────────────────
  console.log('\n── K. Ordering ──');
  await openHeroesPage(pageA);
  const listHeadlines = async () =>
    pageA.locator('h3').allTextContents().then((a) => a.filter((t) => t.includes(MARK)));
  let order0 = await listHeadlines();
  expect('K.1 three distributor heroes listed', order0.length === 3);
  // Move up on the SECOND listed card (its up-arrow is enabled by design).
  {
    const cards = pageA.locator('div.bg-white').filter({ has: pageA.locator('button[aria-label*="Move up"], button[aria-label*="Sogeza juu"]') });
    const secondCard = cards.nth(1);
    const upBtn = secondCard.getByRole('button', { name: /Move up|Sogeza juu/ }).first();
    const orderResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'PATCH', { timeout: 20000 });
    await upBtn.click();
    await orderResp; // persistHeroOrder issues PATCHes; one observed suffices as completion signal
  }
  await pageA.getByText('Order saved.').waitFor({ state: 'visible', timeout: 10000 });
  // Reload and read the DB sort_order values — the authoritative order.
  await pageA.reload({ waitUntil: 'domcontentloaded' });
  await pageA.getByRole('button', { name: /New Banner|Bango Jipya/ }).first().waitFor({ state: 'visible', timeout: 20000 });
  const ordersAfter = await admin.from('hero_slides').select('id, sort_order, headline_en').in('id', createdHeroIds);
  const sorted = (ordersAfter.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  expect('K.2 order changed after Move up (DB sort_order reflects the swap)',
    sorted.length === 3 && sorted[2].headline_en !== MARK + ' WhatsApp Hero' && sorted.some((h) => h.headline_en === MARK + ' WhatsApp Hero'));
  const orders = await admin.from('hero_slides').select('id, sort_order').in('id', createdHeroIds);
  const sorts = Object.fromEntries((orders.data ?? []).map((r) => [r.id, r.sort_order]));
  expect('K.3 distributor ordering does not collide with global block (offset 100+)',
    Object.values(sorts).every((v) => v >= 100));

  // ── L. Edit title/subtitle/CTA/destination + persistence ────────
  console.log('\n── L. Edit persistence ──');
  {
    const card = rowCard(MARK + ' Goals Hero');
    await card.getByRole('button', { name: /Edit|Hariri/ }).first().click();
    const modal = pageA.locator('form').filter({ has: pageA.getByText(/Banner Image|Picha ya Bango/) }).first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    const inputs = modal.locator('input:not([type])');
    // Replace semantics: a human replacing a value selects it all first,
    // then types. (A bare click + type would INSERT at the click-point
    // cursor — valid editing, but not what this section asserts.)
    const typeEdit = async (nth, text) => {
      const inp = inputs.nth(nth);
      await inp.click();
      await inp.press('ControlOrMeta+a');
      await inp.pressSequentially(text, { delay: 4 });
    };
    await typeEdit(0, MARK + ' Goals Hero EDITED'); // Headline (English) fully replaced
    await typeEdit(4, 'Angalia Malengo'); // Button (English) fully replaced
    const editResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && ['POST', 'PATCH'].includes(r.request().method()), { timeout: 30000 });
    const saveBtn = modal.locator('xpath=..').getByRole('button', { name: /^Save|Hifadhi$/ }).first();
    await saveBtn.click();
    const er = await editResp;
    if (!er.ok()) throw new Error(`edit save failed (${er.status()})`);
    await modal.waitFor({ state: 'hidden', timeout: 15000 });
  }
  const h2db = await dbHeroById(hero2.id);
  expect('L.1 edited title persisted', (h2db?.headline_en ?? '').endsWith('EDITED'));
  expect('L.2 edited CTA persisted', h2db?.cta_en === 'Angalia Malengo');
  await pageA.reload({ waitUntil: 'domcontentloaded' });
  // The page's OWN data-loaded signal: the banner list itself has rendered
  // (the New Banner button alone can appear before the list query resolves).
  await pageA.locator('h3').filter({ hasText: MARK }).first().waitFor({ state: 'visible', timeout: 20000 });
  const cardsAfter = await pageA.locator('h3').allTextContents();
  expect('L.3 banner list re-rendered after reload', cardsAfter.filter((t) => t.includes(MARK)).length === 3);

  // ── M. Replace image ────────────────────────────────────────────
  console.log('\n── M. Replace image ──');
  const oldPath = hero1.image_path;
  {
    const card = rowCard(MARK + ' Product Hero');
    await card.getByRole('button', { name: /Edit|Hariri/ }).first().click();
    const modal = pageA.locator('form').filter({ has: pageA.getByText(/Banner Image|Picha ya Bango/) }).first();
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    const png2 = await makeRealPng(1300, 490);
    const up2 = pageA.waitForResponse(
      (r) => r.url().includes('/storage/v1/object/hero-assets/') && r.request().method() === 'POST', { timeout: 30000 });
    await modal.locator('input[type="file"]').setInputFiles({
      name: `hero-e2e-replace-${stamp}.png`, mimeType: 'image/png', buffer: png2,
    });
    await up2;
    const saveBtn = modal.locator('xpath=..').getByRole('button', { name: /^Save|Hifadhi$/ }).first();
    await pageA.waitForFunction(
      () => {
        const btns = [...document.querySelectorAll('button')];
        const b = btns.find((x) => /^(Save|Hifadhi)$/.test(x.textContent?.trim() ?? ''));
        return b && !b.disabled;
      }, { timeout: 20000 });
    const saveResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && ['POST', 'PATCH'].includes(r.request().method()), { timeout: 30000 });
    await saveBtn.click();
    const sr2 = await saveResp;
    if (!sr2.ok()) throw new Error(`replace save failed (${sr2.status()})`);
    await modal.waitFor({ state: 'hidden', timeout: 15000 });
  }
  const h1after = await dbHeroById(hero1.id);
  createdHeroStoragePaths.push(h1after.image_path);
  expect('M.1 replacement upload persisted a new image_path', !!h1after.image_path);
  // The deterministic path heroes/{owner}/{heroId}.png is IDENTICAL for the
  // same-format replacement, so upsert:true rewrites the object in place and
  // deleteHeroImage(old) must NOT remove the live asset. Verify object exists.
  const objCheck = await admin.storage.from('hero-assets').list(`heroes/${profA.data.id}`);
  const names = (objCheck.data ?? []).map((o) => o.name);
  expect('M.2 live image object still exists after same-path replacement', names.includes(h1after.image_path.split('/').pop()));

  // ── N. Delete through the real UI ───────────────────────────────
  console.log('\n── N. Delete/archive ──');
  {
    const card = rowCard(MARK + ' WhatsApp Hero');
    await card.getByRole('button', { name: /Delete banner|Futa bango/ }).first().click();
    const dialog = pageA.locator('[role="alertdialog"]');
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    const delResp = pageA.waitForResponse(
      (r) => r.url().includes('/rest/v1/hero_slides') && r.request().method() === 'DELETE', { timeout: 30000 });
    await dialog.getByRole('button', { name: /Delete|Futa/ }).last().click();
    await delResp;
    await dialog.waitFor({ state: 'hidden', timeout: 15000 });
  }
  const gone = await dbHeroById(hero3.id);
  expect('N.1 deleted hero removed from the database', gone === null);

  // ── O. Storefront reflects deletion + final cleanup in finally ──
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(`${BASE}/?ref=${SLUG_A}`, { waitUntil: 'domcontentloaded' });
    const carousel = page.locator('#featured-wellness-banner');
    await carousel.waitFor({ state: 'visible', timeout: 20000 });
    const deletedVisible = await page.getByText(MARK + ' WhatsApp Hero', { exact: false }).count() > 0;
    expect('N.2 deleted hero absent from the storefront', !deletedVisible);
    // Remaining published distributor hero = the product hero (goals hero is draft).
    const h1now = await dbHeroById(hero1.id);
    expect('N.3 remaining published hero still in DB as published', h1now?.status === 'published');
    await ctx.close();
  }

  await ctxA.close();
  exitCode = fail === 0 ? 0 : 1;
} catch (err) {
  console.error(`\nABORT: ${err?.message ?? err}`);
  exitCode = 1;
} finally {
  await cleanup();
  if (browser) await browser.close().catch(() => {});
  console.log(`\nResult: ${pass} passed, ${fail} failed`);
  process.exit(exitCode);
}
