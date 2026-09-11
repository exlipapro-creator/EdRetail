// Post-release verification — Goals hidden 3-pull gesture via REAL browser input.
// Uses CDP Input.synthesizeScrollGesture (Chrome's realistic touch synthesizer)
// and Playwright's mouse wheel API. No JS event dispatch, no React state access.
// A "pull" = finger moves UP (yDistance NEGATIVE in CDP: finger travels upward)
// or wheel scrolls UP (deltaY < 0). Verified against raw event coordinates.
//   BASE_URL (default https://ed-retail.onrender.com)
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'https://ed-retail.onrender.com';
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`);
};

async function freshGoals(width, height, { desktop = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: !desktop,
    isMobile: !desktop,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const cdp = await ctx.newCDPSession(page);
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 45000 });
  if (desktop) {
    await page.locator('#nav-link-goals:visible, #bottom-nav-goals:visible').first().click();
  } else {
    await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().tap();
  }
  await page.locator('[data-hidden-access-zone="goals"]').waitFor({ state: 'attached', timeout: 15000 });
  await page.waitForTimeout(600);
  return { ctx, page, cdp, errors };
}

// Scroll to the true page bottom with real wheel input (headless CDP touch
// scrolling is inert; wheel events drive the page exactly like a real device).
async function scrollToTrueBottom(page) {
  for (let i = 0; i < 30; i++) {
    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.move(page.viewportSize().width / 2, Math.round(page.viewportSize().height / 2));
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => window.scrollY);
    if (after === before && i > 1) break;
  }
  return page.evaluate(() => ({
    scrollY: window.scrollY,
    pageH: document.documentElement.scrollHeight,
    zoneTop: document.querySelector('[data-hidden-access-zone="goals"]').getBoundingClientRect().top,
  }));
}

// One real pull: finger travels UP `distance` px starting at (x, y).
async function pull(cdp, page, x, y, { desktop = false, distance = 180 } = {}) {
  if (desktop) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(120);
    await page.mouse.wheel(0, -260); // wheel up = pull
  } else {
    await cdp.send('Input.synthesizeScrollGesture', {
      x, y, xDistance: 0, yDistance: -distance, speed: 1000, gestureSourceType: 'touch', preventFling: true,
    });
  }
  await page.waitForTimeout(450); // deliberate cadence (220ms min, 250ms swipe gap)
}

const loginOpen = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('input[type="email"]');
    return !!el && el.getBoundingClientRect().height > 0;
  });

// Sanity: confirm the synthesized touch gesture really moves the finger UP.
{
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await page.evaluate(() => {
    window.__ys = [];
    window.addEventListener('touchstart', (e) => window.__ys.push(['start', Math.round(e.touches[0].clientY)]), { passive: true });
    window.addEventListener('touchend', (e) => window.__ys.push(['end', Math.round(e.changedTouches[0].clientY)]), { passive: true });
  });
  await pull(cdp, page, 195, 804);
  const ys = await page.evaluate(() => window.__ys.flat());
  const ok = ys.includes('start') && ys.includes('end') && ys[ys.indexOf('start') + 1] - ys[ys.indexOf('end') + 1] > 120;
  check('input pipeline sanity: synthesized touch pull moves finger UP >120px', ok, JSON.stringify(ys));
  await ctx.close();
}

// ── POSITIVE: 3 real touch pulls at true page bottom over the bottom-nav area.
for (const [w, h] of [[320, 640], [390, 844], [414, 896]]) {
  const { ctx, page, cdp, errors } = await freshGoals(w, h);
  const bottom = await scrollToTrueBottom(page);
  await pull(cdp, page, Math.round(w / 2), h - 40); // over the fixed bottom nav
  await pull(cdp, page, Math.round(w / 2), h - 40);
  await pull(cdp, page, Math.round(w / 2), h - 40);
  await page.waitForTimeout(500);
  check(`${w}x${h}: 3 pulls at true bottom (over nav) → login`, await loginOpen(page),
    `scrollY=${bottom.scrollY}/${bottom.pageH}, zoneTop@bottom=${Math.round(bottom.zoneTop)}, consoleErrors=${errors.length}`);
  await ctx.close();
}

// ── POSITIVE variant: pulls starting over footer links (inside 96px band).
{
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await scrollToTrueBottom(page);
  await pull(cdp, page, 195, 800); // 44px above bottom — band
  await pull(cdp, page, 195, 770); // 74px above bottom — band
  await pull(cdp, page, 195, 800);
  await page.waitForTimeout(500);
  check('390x844: 3 pulls over footer/nav band (mixed positions) → login', await loginOpen(page));
  await ctx.close();
}

// ── POSITIVE (desktop): 3 wheel-up pulls with cursor over the footer.
for (const [w, h] of [[1280, 720], [1440, 900]]) {
  const { ctx, page, cdp, errors } = await freshGoals(w, h, { desktop: true });
  await scrollToTrueBottom(page);
  await pull(cdp, page, Math.round(w / 2), h - 40, { desktop: true });
  await pull(cdp, page, Math.round(w / 2), h - 40, { desktop: true });
  await pull(cdp, page, Math.round(w / 2), h - 40, { desktop: true });
  await page.waitForTimeout(500);
  check(`${w}x${h}: 3 wheel pulls over footer → login`, await loginOpen(page), `consoleErrors=${errors.length}`);
  await ctx.close();
}

// ── NEGATIVES.
{
  // Pulls starting 200px above the bottom (mid-footer / content area, above
  // the 160px band) must not trigger.
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await scrollToTrueBottom(page);
  for (let i = 0; i < 3; i++) await pull(cdp, page, 195, 844 - 200);
  await page.waitForTimeout(400);
  const open = await loginOpen(page);
  check('390x844: pulls starting 200px above bottom do NOT open login', !open,
    open ? 'UNEXPECTED' : 'band limit holds (only bottom 160px counts)');
  await ctx.close();
}
{
  // 1 and 2 pulls do nothing; the third completes.
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await scrollToTrueBottom(page);
  await pull(cdp, page, 195, 804);
  await page.waitForTimeout(400);
  const after1 = await loginOpen(page);
  await pull(cdp, page, 195, 804);
  await page.waitForTimeout(400);
  const after2 = await loginOpen(page);
  await pull(cdp, page, 195, 804);
  await page.waitForTimeout(500);
  check('1 pull → nothing', !after1);
  check('2 pulls → nothing', !after2);
  check('3rd pull completes → login', await loginOpen(page));
  await ctx.close();
}
{
  // Mid-page pulls never trigger.
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await page.mouse.move(195, 422);
  await page.mouse.wheel(0, 1400);
  await page.waitForTimeout(400);
  for (let i = 0; i < 3; i++) await pull(cdp, page, 195, 422);
  await page.waitForTimeout(400);
  check('3 mid-page pulls → nothing', !(await loginOpen(page)));
  await ctx.close();
}
{
  // Random short drags in the band (<120px up) never trigger.
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await scrollToTrueBottom(page);
  for (let i = 0; i < 4; i++) {
    await cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 804, xDistance: 20, yDistance: -60, speed: 900, gestureSourceType: 'touch', preventFling: true });
    await page.waitForTimeout(500);
  }
  check('random short drags in band → nothing', !(await loginOpen(page)));
  await ctx.close();
}
{
  // Ordinary footer browsing: flicks with reading pauses never stack 3 pulls
  // inside the 2.5s window; downward finger movement (yDistance>0) never counts.
  const { ctx, page, cdp } = await freshGoals(390, 844);
  await scrollToTrueBottom(page);
  const flick = (dist) => cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 790, xDistance: 0, yDistance: dist, speed: 1600, gestureSourceType: 'touch', preventFling: true });
  await flick(-180); await page.waitForTimeout(900);  // pull up, then pause to read
  await flick(-180); await page.waitForTimeout(3000); // 2nd pull, then reset window elapses
  await flick(180); await page.waitForTimeout(900);   // downward swipe — not a pull
  await flick(-180); await page.waitForTimeout(400);  // 4th-ish pull, counter had reset
  check('ordinary footer scrolling → nothing', !(await loginOpen(page)));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log('---');
console.log(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'} (${results.length - failed.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
