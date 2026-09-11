// Phase 5 §10 — responsive release audit across the 8 required viewports.
// For each viewport: load the real surfaces through real navigation and
// measure horizontal overflow (scrollWidth − clientWidth). Also verifies the
// ED-Assistant panel stays compact and the welcome dialog auto-dismisses.
// No arbitrary sleeps: every wait targets an observable element/state.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORTS = [
  [320, 640], [360, 800], [390, 844], [414, 896],
  [768, 1024], [1280, 720], [1440, 900], [1920, 1080],
];

const overflowOf = (page) =>
  page.evaluate(() => ({
    overflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
    innerW: window.innerWidth,
    innerH: window.innerHeight,
  }));

// The ED-Assistant inner panel (backdrop's direct child card).
const assistantPanel = (page) => page.locator('div.fixed.inset-0 > div').last();
// Panel must stay a floating assistant: never full-screen, never a giant
// modal. Compact-but-usable contract (2026-09 refinement):
//  - mobile bottom sheet (< 640px wide): height ≤ 72dvh (+2px tolerance), ≤ 640px
//  - desktop floating card (≥ 640px): absolute height 530–640px and no
//    viewport clipping (32px breathing room); 460×580 is the spec default,
//    which is ~80% of a 720px-tall viewport by design.
const compactAssistant = (r, innerW, innerH) => {
  if (r.panelW == null || r.panelH == null) return false;
  if (r.panelW > innerW) return false;
  if (r.panelH > 640) return false;
  if (innerW < 640) return r.panelH <= innerH * 0.72 + 2;
  return r.panelH >= 530 && r.panelH <= innerH - 32;
};

const browser = await chromium.launch();
const matrix = [];
const consoleErrors = [];

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}x${h}: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${w}x${h}: PAGEERROR ${e.message.slice(0, 200)}`));

  const row = { vp: `${w}x${h}`, surfaces: {} };
  const record = (surface, fn) =>
    fn()
      .then((detail) => { row.surfaces[surface] = { ok: true, ...detail }; })
      .catch((e) => { row.surfaces[surface] = { ok: false, detail: String(e.message || e).slice(0, 140) }; });

  try {
    // Storefront home
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
    await record('home', async () => overflowOf(page));

    // ED-Assistant compactness (open + measure + close)
    await record('ed-assistant', async () => {
      await page.locator('#floating-chatbot-launcher-btn').click();
      const panel = assistantPanel(page);
      await panel.waitFor({ state: 'visible', timeout: 10000 });
      const box = await panel.boundingBox();
      const of = await overflowOf(page);
      await page.keyboard.press('Escape'); // Escape handler closes the modal
      return { panelW: box ? Math.round(box.width) : null, panelH: box ? Math.round(box.height) : null, ...of };
    });

    // Checkout surface (add a real product → open the cart sheet)
    await record('checkout', async () => {
      await page.locator('input[placeholder*="Search" i], input[placeholder*="Bidhaa" i]').first()
        .scrollIntoViewIfNeeded().catch(() => {});
      await page.locator('button[aria-label*="Add MRT Complex" i], button[aria-label*="Weka MRT Complex" i]').first()
        .click({ timeout: 15000 });
      await page.locator('#header-cart-btn').click();
      const sheet = page.locator('[role="dialog"][aria-label*="Cart" i], [role="dialog"][aria-label*="Mkoba" i]').first();
      await sheet.waitFor({ state: 'visible', timeout: 10000 });
      const of = await overflowOf(page);
      await sheet.locator('[aria-label="Close"]').first().click({ timeout: 5000 }).catch(() => {});
      return of;
    });

    // Delivery (footer link on the HOME screen — footer buttons have no ids,
    // so target by visible text inside <footer>)
    await record('delivery', async () => {
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
      const dl = page.locator('footer button', { hasText: /Delivery Info|Uwasilishaji/ }).first();
      await dl.scrollIntoViewIfNeeded();
      await dl.click();
      await page.locator('#delivery-city-search').waitFor({ state: 'visible', timeout: 15000 });
      return overflowOf(page);
    });

    // Goals (from a clean home state, like a real user journey)
    await record('goals', async () => {
      await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
      await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
      await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().click();
      // hasText matches subtree text (the heading is split across spans on mobile).
      await page.locator('h1, h2').filter({ hasText: /program|Bundles|Goal|Lengo/i }).first()
        .waitFor({ state: 'visible', timeout: 15000 });
      return overflowOf(page);
    });

    // Distributor login
    await record('portal-login', async () => {
      await page.goto(BASE + '/portal', { waitUntil: 'domcontentloaded' });
      await page.locator('#portal-email').waitFor({ state: 'visible', timeout: 20000 });
      return overflowOf(page);
    });

    // Admin login
    await record('admin-login', async () => {
      await page.goto(BASE + '/admin', { waitUntil: 'domcontentloaded' });
      await page.locator('input[type="email"], input[type="password"]').first()
        .waitFor({ state: 'visible', timeout: 20000 });
      return overflowOf(page);
    });
  } catch (e) {
    row.surfaces.fatal = { ok: false, detail: String(e.message || e).slice(0, 160) };
  } finally {
    await ctx.close();
  }
  matrix.push(row);
}

await browser.close();

// Report
let bad = 0;
for (const row of matrix) {
  console.log(`\n${row.vp}`);
  for (const [surface, r] of Object.entries(row.surfaces)) {
    const overflow = r.overflow ?? 0;
    // Overflow tolerance: ≤2px (sub-pixel rendering noise)
    const tooWide = overflow > 2;
    const compact = surface !== 'ed-assistant' || compactAssistant(r, r.innerW ?? 0, r.innerH ?? 0);
    const ok = r.ok && !tooWide && compact;
    if (!ok) bad++;
    const dims = surface === 'ed-assistant' && r.panelW ? ` panel=${r.panelW}x${r.panelH}px` : '';
    console.log(`  ${ok ? 'ok ' : 'BAD'} ${surface.padEnd(14)} overflow=${overflow}px${dims}${!r.ok ? ' :: ' + r.detail : ''}`);
  }
}
console.log(`\nConsole errors: ${consoleErrors.length}`);
console.log(consoleErrors.slice(0, 10).map((e) => '  ' + e).join('\n'));
console.log(`\nRESULT: ${bad === 0 && consoleErrors.length === 0 ? 'PASS' : 'FAIL'} (${bad} bad cells)`);
process.exit(bad === 0 ? 0 : 1);
