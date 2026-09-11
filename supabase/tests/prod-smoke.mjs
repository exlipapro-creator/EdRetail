// Phase 5 release — comprehensive PRODUCTION smoke test.
// Covers the approved release checklist: storefront, hero, product/commerce,
// ED-Assistant, distributor surfaces, public-navigation hygiene, auth hygiene.
// Usage: BASE_URL=https://ed-retail.onrender.com node supabase/tests/prod-smoke.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => { results.push({ ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };
const consoleErrors = [];

{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message.slice(0, 160)));

  // ── Storefront load ──
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
  check('storefront loads (hero carousel visible)', true);

  const heroSlides = await page.locator('#featured-wellness-banner button[aria-label^="Slide"]').count();
  check('4 published hero banners', heroSlides === 4, `slides=${heroSlides}`);

  const logoOk = await page.locator('header img').first().evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false);
  check('logo loads', !!logoOk);

  const navButtons = await page.locator('nav[aria-label="Mobile Navigation"] button').count();
  check('bottom navigation renders (5 items)', navButtons === 5, `buttons=${navButtons}`);

  const portalExposed = await page.evaluate(() => {
    const t = document.body.innerText.toLowerCase();
    return t.includes('distributor portal') || t.includes('become a distributor');
  });
  check('no public Distributor Portal / Become-a-Distributor exposure', !portalExposed);

  // ── Search ──
  const search = page.locator('header input[type="search"], header input[placeholder*="Search" i], header input[placeholder*="Tafuta" i]').first();
  await search.fill('Shake');
  await page.waitForTimeout(900);
  const searchResults = await page.evaluate(() => document.body.innerText.toLowerCase().includes('shake off'));
  check('search works', searchResults);
  await search.fill('');

  // ── Categories → Products ──
  await page.locator('#bottom-nav-products:visible, #nav-link-products:visible').first().click();
  await page.waitForTimeout(700);
  const productsOk = await page.evaluate(() => document.body.innerText.toLowerCase().includes('all edmark wellness products'));
  check('products view renders', productsOk);

  // ── Product detail + add to cart ──
  await page.locator('img[alt="MRT Complex"]').first().click();
  await page.waitForTimeout(600);
  const detailOk = await page.evaluate(() => document.body.innerText.includes('PRODUCT DESCRIPTION'));
  check('product detail opens', detailOk);
  const addBtn = page.locator('#product-detail-modal').getByRole('button', { name: /Add to Cart|Weka/i });
  if (await addBtn.count()) { await addBtn.click(); await page.waitForTimeout(500); }
  await page.locator('#product-detail-modal button[aria-label="Close"]').first().click().catch(() => {});
  await page.waitForTimeout(300);
  // Verify through the real cart sheet: item present with quantity.
  await page.locator('#header-cart-btn').click();
  await page.waitForTimeout(700);
  const cartVerify = await page.evaluate(() => {
    const t = document.body.innerText;
    return { hasMRT: t.includes('MRT Complex'), hasQty: /×\s*1|1 item|Kipengele 1/i.test(t) };
  });
  check('add to cart works (item in cart, qty 1)', cartVerify.hasMRT && cartVerify.hasQty);

  // ── Cart / checkout ──
  // (cart is already open from the add-to-cart verification above)
  const cartOk = await page.evaluate(() => /Your Order Cart|Mkoba/i.test(document.body.innerText));
  check('cart opens', cartOk);
  const waOrder = await page.evaluate(() => document.body.innerText.toLowerCase().includes('whatsapp'));
  check('WhatsApp order flow present', waOrder);
  const guestOk = await page.evaluate(() => /no account needed|huhitaji akaunti|order without an account|bila akaunti/i.test(document.body.innerText));
  check('guest checkout path present', guestOk);
  await page.keyboard.press('Escape').catch(() => {});
  await page.locator('[aria-label="Close"]').first().click({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(300);

  // ── Goals ──
  await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().click();
  await page.waitForTimeout(700);
  const goalsOk = await page.evaluate(() => document.body.innerText.includes('WELLNESS GUIDANCE'));
  check('goals view renders', goalsOk);

  // ── Flyers (footer link) ──
  const flyers = page.locator('footer button', { hasText: /View Flyers|Angalia Kampeni/i }).first();
  await flyers.scrollIntoViewIfNeeded();
  await flyers.click();
  await page.waitForTimeout(800);
  const flyersOk = await page.evaluate(() => document.body.innerText.length > 100);
  check('flyers view opens', flyersOk);

  // ── Language switch ──
  const sw = page.locator('header button', { hasText: /^SW$/ }).first();
  await sw.click();
  await page.waitForTimeout(500);
  const swOk = await page.evaluate(() => document.body.innerText.includes('Mkoba') || document.body.innerText.includes('Bidhaa'));
  check('language switch to Kiswahili works', swOk);
  await page.locator('header button', { hasText: /^EN$/ }).first().click();
  await page.waitForTimeout(300);

  // ── ED-Assistant ──
  await page.locator('#floating-chatbot-launcher-btn').click();
  const panel = page.locator('div.fixed.inset-0 > div').last();
  await panel.waitFor({ state: 'visible', timeout: 10000 });
  const dims = await page.evaluate(() => {
    const p = [...document.querySelectorAll('div.fixed.inset-0 > div')].pop();
    const r = p.getBoundingClientRect();
    const conv = p.querySelector('div.flex-1.min-h-0.overflow-y-auto');
    return { w: Math.round(r.width), h: Math.round(r.height), convH: conv ? Math.round(conv.getBoundingClientRect().height) : 0, innerH: window.innerHeight };
  });
  check('ED-Assistant opens; mobile ~70dvh', dims.h >= 500 && dims.h <= 640, `panel=${dims.w}x${dims.h}`);
  check('conversation area meaningful', dims.convH >= 180, `conv=${dims.convH}px`);
  const topicsOk = await panel.locator('button', { hasText: 'Weight Loss' }).first().isVisible().catch(() => false);
  check('topic pills render', topicsOk);
  await panel.locator('input[type="text"]').fill('hey');
  await panel.locator('input[type="text"]').press('Enter');
  await page.waitForTimeout(700);
  const msgsOk = await panel.evaluate((el) => el.innerText.includes('hey'));
  check('composer send works', msgsOk);
  const bodyLocked = await page.evaluate(() => getComputedStyle(document.body).overflow === 'hidden');
  check('body scroll lock while open', bodyLocked);
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  const closed = await page.evaluate(() => ![...document.querySelectorAll('div.fixed.inset-0 > div')].some((d) => d.querySelector('input[type="text"]')));
  check('assistant closes', closed);
  const unlocked = await page.evaluate(() => getComputedStyle(document.body).overflow !== 'hidden');
  check('body unlock after close', unlocked);

  // ── Hidden access: footer-band pulls open Distributor Login ──
  await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().click();
  await page.locator('[data-hidden-access-zone="goals"]').waitFor({ state: 'attached', timeout: 10000 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.mouse.move(200, 784);
  await page.waitForTimeout(250);
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(450); }
  await page.waitForTimeout(500);
  const login = await page.evaluate(() => ({ hasEmail: !!document.querySelector('input[type="email"]'), text: document.body.innerText.slice(0, 120) }));
  check('hidden access: 3-pull opens Distributor Login', login.hasEmail, login.text.replace(/\n/g, ' ').slice(0, 80));
  const adminExposed = await page.evaluate(() => document.body.innerText.includes('Super Admin'));
  check('super-admin not exposed before escalation', !adminExposed);

  await page.close();
}

await browser.close();
console.log('---');
console.log(`Console errors: ${consoleErrors.length}`);
if (consoleErrors.length) console.log(consoleErrors.slice(0, 8).join('\n'));
console.log(`RESULT: ${consoleErrors.length === 0 && results.every((r) => r.ok) ? 'PASS' : 'FAIL'} (${results.filter((r) => r.ok).length}/${results.length})`);
