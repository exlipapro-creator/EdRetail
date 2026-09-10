// Phase 5 — ED-Assistant size/layout refinement.
// Compact-but-usable contract: the panel is a floating conversation surface —
// never full-screen, never a giant modal — and the conversation area gets the
// majority of the height. Dimensions verified live at the 8 release viewports.
import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const VIEWPORTS = [
  [320, 640], [360, 800], [390, 844], [414, 896],
  [768, 1024], [1280, 720], [1440, 900], [1920, 1080],
];

// Per-viewport expected panel height ranges (the UX spec).
const EXPECT = {
  '320x640': [420, 475],
  '360x800': [510, 585],
  '390x844': [540, 600],
  '414x896': [570, 630],
  '768x1024': [530, 600],
  '1280x720': [530, 625],
  '1440x900': [540, 625],
  '1920x1080': [540, 625],
};

const browser = await chromium.launch();
const consoleErrors = [];
let bad = 0;

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}x${h}: ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${w}x${h}: PAGEERROR ${e.message.slice(0, 160)}`));

  try {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });

    // Seed enough conversation content to prove scrolling + several visible messages.
    await page.locator('#floating-chatbot-launcher-btn').click();
    const panel = page.locator('div.fixed.inset-0 > div').last();
    await panel.waitFor({ state: 'visible', timeout: 10000 });

    // Conversation area must be the flexible region and scroll independently.
    const conv = page.locator('div.flex-1.min-h-0.overflow-y-auto');
    await conv.first().waitFor({ state: 'visible', timeout: 5000 });

    // Send a couple of messages so history exists.
    const input = panel.locator('input[type="text"]');
    await input.fill('hey');
    await input.press('Enter');
    await page.waitForTimeout(600);

    const m = await page.evaluate(() => {
      const panelEl = [...document.querySelectorAll('div.fixed.inset-0 > div')].pop();
      const pr = panelEl.getBoundingClientRect();
      const conv = panelEl.querySelector('div.flex-1.min-h-0.overflow-y-auto');
      const cr = conv.getBoundingClientRect();
      const cs = getComputedStyle(panelEl);
      const header = panelEl.firstElementChild.getBoundingClientRect();
      const inputEl = panelEl.querySelector('input[type="text"]');
      const ir = inputEl.getBoundingClientRect();
      return {
        panelW: Math.round(pr.width), panelH: Math.round(pr.height),
        convH: Math.round(cr.height), headerH: Math.round(header.height),
        inputVisible: ir.bottom <= window.innerHeight && ir.height > 0,
        bodyOverflowLocked: getComputedStyle(document.body).overflow === 'hidden',
        position: cs.position,
        hOverflow: document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth,
      };
    });

    const checks = {
      'open': m.panelH > 200,
      'height-in-range': m.panelH >= EXPECT[`${w}x${h}`][0] && m.panelH <= EXPECT[`${w}x${h}`][1],
      'no-h-overflow': m.hOverflow <= 2,
      'no-v-clipping': m.panelH <= h - 8,
      'conversation-meaningful': m.convH >= 180,
      'input-visible': m.inputVisible,
      'body-locked': m.bodyOverflowLocked,
      'close-reachable': await panel.locator('button:has(svg.lucide-x)').first().isVisible().catch(() => false),
      'whatsapp-reachable': await panel.locator('a[title*="WhatsApp" i]').first().isVisible().catch(() => false),
    };

    const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
    if (failed.length) bad++;
    console.log(
      `${w}x${h}  panel=${m.panelW}x${m.panelH}  conv=${m.convH}px  header=${m.headerH}px  ` +
      `${failed.length ? 'FAIL: ' + failed.join(',') : 'PASS'}`
    );

    // Close works (Escape) and page returns to normal.
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden', timeout: 5000 });
  } catch (e) {
    bad++;
    console.log(`${w}x${h}  ERROR ${String(e.message || e).slice(0, 140)}`);
  }
  await ctx.close();
}

await browser.close();
console.log('---');
console.log(`RESULT: ${bad === 0 && consoleErrors.length === 0 ? 'PASS (all viewports, no console errors)' : `FAIL (${bad} rows, ${consoleErrors.length} console errors)`}`);
if (consoleErrors.length) console.log(consoleErrors.slice(0, 10).join('\n'));
process.exit(bad === 0 ? 0 : 1);
