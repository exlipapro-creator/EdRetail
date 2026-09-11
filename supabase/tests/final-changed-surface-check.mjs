// Phase 5 FINAL SECURITY SWEEP — targeted responsive confirmation for the
// final changed surfaces (SmartAssistantModal, LegalView) plus storefront home,
// at the 8 release viewports. Run: node supabase/tests/final-changed-surface-check.mjs
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORTS = [
  [320, 640], [360, 800], [390, 844], [414, 896],
  [768, 1024], [1280, 720], [1440, 900], [1920, 1080],
];

const overflowOf = (page) =>
  page.evaluate(() => document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth);

const browser = await chromium.launch();
const consoleErrors = [];
let failures = 0;

for (const [w, h] of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${w}x${h}: ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${w}x${h}: PAGEERROR ${e.message.slice(0, 160)}`));

  const row = { vp: `${w}x${h}` };
  try {
    await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
    await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
    row.home = await overflowOf(page);

    // Changed surface: ED-Assistant (SmartAssistantModal) opens compactly, no overflow
    await page.locator('#floating-chatbot-launcher-btn').click();
    const panel = page.locator('div.fixed.inset-0 > div').last();
    await panel.waitFor({ state: 'visible', timeout: 10000 });
    row.edAssistant = await overflowOf(page);
    const box = await panel.boundingBox();
    // Breakpoint-aware compact contract (mirrors responsive-audit.mjs):
    // mobile bottom sheet ≤72dvh (tolerance 2px); desktop floating card
    // 530–640px with no viewport clipping (32px margin).
    row.assistantCompact =
      !!box &&
      box.width <= w &&
      box.height <= 640 &&
      (w < 640 ? box.height <= h * 0.72 + 2 : box.height >= 530 && box.height <= h - 32);
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    // Changed surface: Legal view (LegalView) via footer
    await page.getByRole('button', { name: /Privacy & Terms|Faragha & Masharti/ }).first().click();
    await page.getByRole('heading', { name: /Privacy Notice|Sera ya Faragha/ }).first().waitFor({ timeout: 10000 });
    row.legal = await overflowOf(page);
  } catch (e) {
    row.error = String(e.message || e).slice(0, 140);
  }
  await ctx.close();

  const bad = row.error != null || [row.home, row.edAssistant, row.legal].some((v) => v > 0) || row.assistantCompact === false;
  if (bad) failures++;
  console.log(`${row.vp}  home=${row.home}  edAssistant=${row.edAssistant}  legal=${row.legal}  compact=${row.assistantCompact}  ${bad ? (row.error ? 'ERROR ' + row.error : 'FAIL') : 'PASS'}`);
}

await browser.close();
console.log('---');
console.log(`RESULT: ${failures === 0 && consoleErrors.length === 0 ? 'PASS (0px overflow everywhere, no console errors)' : `FAIL (${failures} viewport rows, ${consoleErrors.length} console errors)`}`);
if (consoleErrors.length) console.log(consoleErrors.join('\n'));
process.exit(failures === 0 ? 0 : 1);
