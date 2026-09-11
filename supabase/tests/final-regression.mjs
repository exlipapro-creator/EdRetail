// Final release hardening — consolidated real-browser regression.
// Covers: favourites (nav swap), cart persistence, full anonymous guest
// checkout → wa.me URL + anonymous sales row (service-key verification),
// legal view, ?ref= attribution, admin guard, console cleanliness.
//   BASE_URL (default http://localhost:3000)
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

const env = readFileSync('.env', 'utf8');
const SB_URL = env.match(/^VITE_SUPABASE_URL=(.+)$/m)?.[1];
const SERVICE = env.match(/^SUPABASE_SERVICE_ROLE_KEY=(.+)$/m)?.[1];
const salesCount = async () => {
  const r = await fetch(`${SB_URL}/rest/v1/sales?select=count`, {
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'count=exact' },
  });
  return Number(r.headers.get('content-range')?.split('/')[1] ?? 0);
};
const cartCount = (page) =>
  page.evaluate(() => {
    const m = document.querySelector('#header-cart-btn')?.getAttribute('aria-label') || '';
    return Number(m.match(/\d+/)?.[0] ?? 0);
  });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => m.type() === 'error' && m.location()?.url?.startsWith(BASE) && consoleErrors.push(m.text()));

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 45000 });

// 1. Favourites: product modal heart → nav to Favourites → item visible.
await page.locator('#bottom-nav-products:visible, #nav-link-products:visible').first().click();
await page.waitForTimeout(700);
await page.locator('img[alt="MRT Complex"]').first().click();
await page.waitForTimeout(600);
await page.locator('#product-detail-modal button[aria-label="Add favourite"]').first().click({ timeout: 6000 });
await page.locator('#product-detail-modal button[aria-label="Close"]').first().click().catch(() => {});
await page.waitForTimeout(300);
await page.locator('#bottom-nav-favourites:visible').click();
await page.waitForTimeout(600);
const favText = await page.evaluate(() => document.body.innerText.replace(/\n/g, ' '));
check('favourite saved via product heart', !/No favourites saved yet|Hakuna vipendwa/i.test(favText), favText.slice(0, 100));
check('bottom-nav Favourites opens favourites screen', /Saved Favourites|Vipendwa/i.test(favText));

// 2. Add to cart (same modal path was closed; reopen) then persistence across reload.
await page.locator('#bottom-nav-products:visible').click();
await page.waitForTimeout(500);
await page.locator('img[alt="MRT Complex"]').first().click();
await page.waitForTimeout(600);
await page.locator('#product-detail-modal').getByRole('button', { name: /Add to Cart|Weka/i }).click({ timeout: 6000 });
await page.locator('#product-detail-modal button[aria-label="Close"]').first().click().catch(() => {});
await page.waitForTimeout(400);
const count1 = await cartCount(page);
check('add to cart works from product detail', count1 >= 1, `count=${count1}`);
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 45000 });
const count2 = await cartCount(page);
check('cart persists across reload (localStorage)', count2 >= count1 && count2 >= 1, `after reload=${count2}`);

// 3. Anonymous guest checkout → wa.me order + anonymous sales row.
const salesBefore = await salesCount();
await page.locator('#header-cart-btn').click();
await page.locator('#checkout-sheet-drawer').waitFor({ state: 'visible', timeout: 8000 });
await page.waitForTimeout(500);
await page.locator('#checkout-customer-name').fill('Regression Tester');
await page.locator('#checkout-customer-phone').fill('0712 000 999');
await page.locator('#checkout-customer-location').fill('Regression Location, Dar');
// Message preview lives in the FORM view behind a toggle — the customer sees
// exactly what will be sent before submitting.
const previewBtn = page.locator('#toggle-message-preview-btn');
if (await previewBtn.count()) {
  await previewBtn.scrollIntoViewIfNeeded().catch(() => {});
  await previewBtn.click({ force: true }).catch(() => {});
  await page.waitForTimeout(400);
}
const previewText = await page.evaluate(() => document.querySelector('#checkout-sheet-drawer')?.innerText || '');
const previewOk = /Regression Tester/.test(previewText) && /255712000999/.test(previewText) && /Regression Location/.test(previewText) && /(Jumla|Total)/.test(previewText);
check('order preview shows name+phone+location+total', previewOk);
await page.locator('#submit-whatsapp-order-btn').click({ timeout: 6000 });
await page.waitForTimeout(900);
// The handoff button navigates programmatically (no anchor) — capture the
// real wa.me request URL as ground truth of what WhatsApp receives.
let orderNav = null;
const onRequest = (r) => { if (r.url().startsWith('https://wa.me/')) orderNav = r.url(); };
page.on('request', onRequest);
const handoffBtn = page.locator('#launch-whatsapp-success-btn').last();
await handoffBtn.scrollIntoViewIfNeeded({ timeout: 6000 }).catch(() => {});
await handoffBtn.click({ timeout: 6000, force: true }).catch(() => {});
await page.waitForURL(/wa\.me|api\.whatsapp/, { timeout: 10000 }).catch(() => {});
page.off('request', onRequest);
await page.waitForTimeout(1200);
const decoded = orderNav ? decodeURIComponent(orderNav) : '';
check('wa.me order URL generated on handoff', /^https:\/\/wa\.me\/\d+\?text=/.test(orderNav || ''), decoded.slice(0, 90));
check('wa.me message carries name+phone+location+total', /Regression Tester/.test(decoded) && /255712000999/.test(decoded) && /Regression Location/.test(decoded) && /(Total Amount|Jumla ya Malipo)/.test(decoded));
const salesAfter = await salesCount();
check('anonymous sales row persisted (no customer auth involved)', salesAfter > salesBefore, `before=${salesBefore} after=${salesAfter}`);

// 4. Legal view (fresh page — the checkout tab navigated to WhatsApp).
const page2 = await ctx.newPage();
page2.on('console', (m) => m.type() === 'error' && m.location()?.url?.startsWith(BASE) && consoleErrors.push(m.text()));
await page2.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page2.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 45000 });
await page2.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page2.waitForTimeout(400);
const legalLink = page2.locator('a:has-text("Privacy"), button:has-text("Faragha"), a:has-text("Faragha"), button:has-text("Privacy")').last();
await legalLink.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
await legalLink.click({ timeout: 5000, force: true });
await page2.waitForTimeout(500);
const legal = await page2.evaluate(() => document.body.innerText);
check('legal/privacy reachable; accountless wording present', /No account is needed|Huhitaji kuwa na akaunti/.test(legal));

// 5. Distributor attribution via ?ref= slug (hero carousel + storefront load).
await page2.goto(`${BASE}/?ref=mwanahamisi-lissu`, { waitUntil: 'domcontentloaded' });
await page2.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 45000 });
const slides = await page2.locator('#featured-wellness-banner button[aria-label^="Slide"]').count();
check('distributor storefront loads via ?ref= slug (hero carousel renders)', slides >= 1, `slides=${slides}`);

// 6. Admin route guarded.
await page2.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded' });
await page2.waitForTimeout(800);
const adminGuard = await page2.evaluate(() => !!document.querySelector('input[type="password"], input[type="email"]'));
check('admin route guarded (login surface, no storefront leak)', adminGuard);

check('zero console errors (app origin) across whole journey', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log('---');
console.log(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'} (${results.length - failed.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
