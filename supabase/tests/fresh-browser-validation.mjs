// Phase 5 §12 — fresh-browser validation: fresh context, clean storage,
// console + network capture, unexpected 4xx/5xx detection.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const consoleErrors = [];
const failedRequests = [];
const badResponses = []; // 4xx/5xx, filtered later for expected ones

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300));
});
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message.slice(0, 300)));
page.on('requestfailed', (r) => failedRequests.push(`${r.method()} ${r.url().slice(0, 120)} :: ${r.failure()?.errorText}`));
page.on('response', (r) => {
  if (r.status() >= 400) badResponses.push(`${r.status()} ${r.request().method()} ${r.url().slice(0, 140)}`);
});

const results = [];
const check = (label, ok, detail = '') => {
  results.push({ label, ok, detail });
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ' — ' + detail : ''}`);
};

try {
  // ── 1. Customer storefront (anonymous, fresh) ──────────────────
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  // The page's OWN readiness signal (same as the hero E2E): the published
  // banner carousel section renders after the ~2.1s splash hold by design.
  await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 25000 });
  const searchInput = page.locator('input[placeholder*="Search" i], input[placeholder*="Bidhaa" i]').first();
  await searchInput.waitFor({ state: 'visible', timeout: 15000 });
  check('Storefront renders (fresh anonymous context, search visible)', true);

  // Goals view: navigate via the real header nav (bottom nav is mobile-only).
  await page.locator('#nav-link-goals').click();
  await page.getByText(/Find what fits your goal|Lengo lako/).first().waitFor({ state: 'visible', timeout: 20000 });
  check('Goals view renders (via bottom nav)', true);

  // No visible Distributor Portal / Become a Distributor links on storefront
  const portalLinkCount = await page.locator('a:visible', { hasText: /Distributor Portal|Portal ya Msambazaji/ }).count();
  const becomeCount = await page.locator('a:visible, button:visible', { hasText: /Become a Distributor|Kuwa Msambazaji/ }).count();
  check('No visible Distributor Portal link on Goals', portalLinkCount === 0, `found=${portalLinkCount}`);
  check('No visible Become-a-Distributor link on Goals', becomeCount === 0, `found=${becomeCount}`);

  // ── 2. Distributor login page ──────────────────────────────────
  await page.goto(BASE + '/portal', { waitUntil: 'domcontentloaded' });
  await page.locator('#portal-email').waitFor({ state: 'visible', timeout: 20000 });
  check('Distributor Login page renders', true);

  // No visible Super Admin entry before the 3-pull gesture
  const superAdminVisible = await page.locator('a:visible, button:visible', { hasText: /Super Admin/i }).count();
  check('No visible Super Admin entry on login page', superAdminVisible === 0, `found=${superAdminVisible}`);

  // ── 3. ?ref= storefront with a real canonical slug (public check) ──
  // (Use the live canonical distributor slug; hero visibility itself is
  // proven by the E2E. Here we only verify the page resolves.)
  await page.goto(BASE + '/?ref=edretail', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  check('?ref= storefront resolves', true, page.url());

  // ── 4. Admin login page ────────────────────────────────────────
  await page.goto(BASE + '/admin', { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  const adminForm = await page.locator('input[type="email"], input[type="password"]').first().isVisible({ timeout: 15000 }).catch(() => false);
  check('Admin login renders', adminForm);
} finally {
  await browser.close();
}

// Expected/intentional responses (documented, non-defects):
//   * 400/401/403 on /auth/v1/* or /rest/v1/* when querying with no session
//     (RLS/probe denials are the *intended* security behavior).
//   * 404 storage reads for draft assets from anonymous contexts (non-leaking).
const EXPECTED = /(\/auth\/v1\/|\/rest\/v1\/user_roles|\/rest\/v1\/hero_slides.*status=eq\.published|storage\/v1\/object\/hero-assets).*(40[013]|40[13])|40[13]\s+(GET|POST)\s+.*\/(auth|rest|storage)\//i;
const unexpected = badResponses.filter((r) => !EXPECTED.test(r));

console.log('\n── Console errors ──');
console.log(consoleErrors.length ? consoleErrors.map((e) => '  ' + e).join('\n') : '  (none)');
console.log('── Failed network requests ──');
console.log(failedRequests.length ? failedRequests.map((e) => '  ' + e).join('\n') : '  (none)');
console.log('── Unexpected 4xx/5xx ──');
console.log(unexpected.length ? unexpected.map((e) => '  ' + e).join('\n') : '  (none)');
console.log('── All 4xx/5xx (for review) ──');
console.log(badResponses.length ? badResponses.map((e) => '  ' + e).join('\n') : '  (none)');

const hardFail = results.some((r) => !r.ok) || unexpected.length > 0 || consoleErrors.some((e) => /Uncaught| hydration/i.test(e));
console.log(`\nRESULT: ${hardFail ? 'FAIL' : 'PASS'} (${results.filter((r) => r.ok).length}/${results.length} checks, ${unexpected.length} unexpected HTTP errors, ${consoleErrors.length} console errors)`);
process.exit(hardFail ? 1 : 0);
