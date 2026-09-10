// Phase 5 release verification — hidden-access gesture (Goals → Distributor
// Login) and its escalation gesture inside DistributorAuthModal.
// Uses real timed wheel events (cadence ≥220ms, reset window 2.5s).
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const browser = await chromium.launch();
const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); };

// ── Touch-equivalent (wheel) test on Goals: pull from the footer band where
// the zone element itself is off-screen — the exact user-reported scenario.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().click();
  await page.locator('[data-hidden-access-zone="goals"]').waitFor({ state: 'attached', timeout: 10000 });

  const zoneBox = await page.locator('[data-hidden-access-zone="goals"]').boundingBox();
  check('goals zone present', !!zoneBox);

  // Scroll to the true page bottom: zone sits ABOVE the viewport, footer fills the screen.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  const afterScroll = await page.evaluate(() => {
    const r = document.querySelector('[data-hidden-access-zone="goals"]').getBoundingClientRect();
    return { zoneTop: r.top, zoneBottom: r.bottom, innerH: window.innerHeight, scrollY: window.scrollY, pageH: document.documentElement.scrollHeight };
  });
  // Position is informational: depending on viewport height the zone sits
  // partly on-screen or above the fold at full scroll — the band pull below
  // must work in BOTH cases (that is the user-reported scenario).
  check('page bottom reached', afterScroll.scrollY > 0, `scrollY=${afterScroll.scrollY}, zoneBottom=${afterScroll.zoneBottom}`);

  // Three deliberate wheel-up pulls inside the bottom viewport band (96px), spaced 450ms.
  const y = 844 - 60;
  await page.mouse.move(200, y); // position INSIDE the band BEFORE pulling
  await page.waitForTimeout(200);
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(450);
  }
  await page.waitForTimeout(500);

  const login = await page.evaluate(() => ({
    hasEmail: !!document.querySelector('input[type="email"]'),
    text: document.body.innerText.slice(0, 150),
  }));
  check('distributor login opened from footer band pulls', login.hasEmail, login.text.replace(/\n/g, ' ').slice(0, 90));
  await page.close();
}

// ── Negative control: three pulls in the MIDDLE of the page must not trigger.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  await page.locator('#featured-wellness-banner').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#bottom-nav-goals:visible, #nav-link-goals:visible').first().click();
  await page.locator('[data-hidden-access-zone="goals"]').waitFor({ state: 'attached', timeout: 10000 });
  await page.waitForTimeout(400);
  await page.mouse.move(200, 400); // middle of the viewport — outside band & zone
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(450); }
  await page.waitForTimeout(400);
  const still = await page.evaluate(() => ({
    hasEmail: !!document.querySelector('input[type="email"]'),
    zoneStill: !!document.querySelector('[data-hidden-access-zone="goals"]'),
  }));
  check('mid-page pulls do NOT trigger', still.zoneStill && !still.hasEmail);
  await page.close();
}

await browser.close();
const failed = results.filter(r => !r.ok);
console.log('---');
console.log(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'} (${results.length - failed.length}/${results.length})`);
process.exit(failed.length ? 1 : 0);
