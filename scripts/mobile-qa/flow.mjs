// Mobile regression walk: custom design page → editor → cart → checkout → Stripe (see README.md).
// node flow.mjs <outDir> [baseUrl] [deviceFilter]
import { chromium, webkit, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2] || 'out';
const BASE = process.argv[3] || 'http://localhost:4000';
const ONLY = process.argv[4];
const IMG = new URL('./portrait.jpg', import.meta.url).pathname;
const LAND = new URL('./landscape.jpg', import.meta.url).pathname;

const DEVICES = [
  { id: 'iphone-se', engine: webkit, desc: devices['iPhone SE'] },
  { id: 'iphone-14', engine: webkit, desc: devices['iPhone 14'] },
  { id: 'pixel-7', engine: chromium, desc: devices['Pixel 7'], chrome: true },
  { id: 'galaxy-s9', engine: chromium, desc: devices['Galaxy S9+'], chrome: true },
  { id: 'small-360', engine: chromium, desc: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } }, chrome: true },
  { id: 'tablet-768', engine: webkit, desc: devices['iPad Mini'] },
  { id: 'desktop', engine: chromium, desc: { viewport: { width: 1366, height: 860 } }, chrome: true },
];

/** Layout checks run on the page as it is */
async function audit(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const issues = [];
    const doc = document.scrollingElement;
    if (doc.scrollWidth > vw + 1) issues.push({ kind: 'page-h-overflow', detail: `scrollWidth ${doc.scrollWidth} > ${vw}` });

    const visible = (el) => {
      const s = getComputedStyle(el);
      if (s.visibility === 'hidden' || s.display === 'none') return false;
      for (let p = el; p; p = p.parentElement) if (+getComputedStyle(p).opacity === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const clippedByAncestor = (el) => {
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        const s = getComputedStyle(p);
        if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) {
          const pr = p.getBoundingClientRect();
          if (pr.right <= vw + 1 && pr.left >= -1) return true;
        }
      }
      return false;
    };
    const label = (el) => {
      const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '';
      const txt = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}${txt ? ` "${txt}"` : ''}`;
    };

    const all = [...document.body.querySelectorAll('*')].filter((el) => !el.closest('svg') || el.tagName === 'svg');
    for (const el of all) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      // Off the right / left edge, not clipped by a scroller or overflow-hidden parent
      if (((r.right > vw + 2 && r.left < vw - 2) || (r.left < -2 && r.right > 2)) && !el.closest('[aria-hidden=true],[inert]') && !clippedByAncestor(el) && getComputedStyle(el).position !== 'fixed') {
        issues.push({ kind: 'off-screen-x', detail: `${label(el)} [${Math.round(r.left)}..${Math.round(r.right)}] vw ${vw}` });
      }
      // Text overflowing its own box (cut words, ellipsis is fine)
      const s = getComputedStyle(el);
      if (!el.matches('.sr-only') && el.children.length === 0 && el.innerText?.trim() && el.scrollWidth > el.clientWidth + 2 && s.textOverflow !== 'ellipsis' && /(hidden|clip)/.test(s.overflowX)) {
        issues.push({ kind: 'text-clipped', detail: `${label(el)} ${el.scrollWidth}>${el.clientWidth}` });
      }
      // Tiny text on phones
      if (vw < 768 && el.children.length === 0 && el.innerText?.trim() && parseFloat(s.fontSize) < 10.5) {
        issues.push({ kind: 'tiny-text', detail: `${label(el)} ${s.fontSize}` });
      }
    }
    // Small tap targets
    if (vw < 768) {
      for (const el of document.querySelectorAll('button, [role=button], select')) {
        if (!visible(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > doc.scrollHeight || r.right <= 0 || r.left >= vw) continue;
        if ((r.height < 28 || r.width < 28) && !el.matches('.sr-only') && el.tagName !== 'INPUT') issues.push({ kind: 'small-tap', detail: `${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}` });
      }
    }
    // iOS Safari zooms the page in when a field under 16px gets focus
    if (vw < 768) {
      for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), select, textarea')) {
        if (!visible(el)) continue;
        const fs = parseFloat(getComputedStyle(el).fontSize);
        if (fs < 16) issues.push({ kind: 'ios-zoom-input', detail: `${label(el)} ${fs}px` });
        const r = el.getBoundingClientRect();
        if (r.height < 40) issues.push({ kind: 'short-field', detail: `${label(el)} ${Math.round(r.height)}px tall` });
      }
    }
    // Fixed / sticky layers covering each other in the viewport
    const layers = all.filter((el) => visible(el) && ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.bottom > 0 && r.top < vh && r.width > 40 && r.height > 20 && r.height < vh * 0.9);
    for (let i = 0; i < layers.length; i++)
      for (let j = i + 1; j < layers.length; j++) {
        const a = layers[i], b = layers[j];
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
        const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
        if (ox > 20 && oy > 8) issues.push({ kind: 'fixed-overlap', detail: `${label(a.el)} ✕ ${label(b.el)} (${Math.round(ox)}x${Math.round(oy)})` });
      }
    // Dedupe
    const seen = new Set();
    return issues.filter((i) => (seen.has(i.kind + i.detail) ? false : seen.add(i.kind + i.detail)));
  });
}

async function run(device) {
  const dir = path.join(OUT, device.id);
  fs.mkdirSync(dir, { recursive: true });
  const browser = await device.engine.launch(device.chrome ? { channel: 'chrome' } : {});
  const ctx = await browser.newContext({ ...device.desc, locale: 'nl-NL' });
  // Blob storage allows only the live site and :4200 (another session's); test-only, the site is not changed
  if (/localhost|127\.0\.0\.1/.test(BASE)) await ctx.route(/ecombone\.blob\.core\.windows\.net/, async (route) => {
    if (route.request().method() !== 'GET') return route.continue();
    const res = await route.fetch();
    await route.fulfill({ response: res, headers: { ...res.headers(), 'access-control-allow-origin': new URL(BASE).origin } });
  });
  const page = await ctx.newPage();
  const log = { device: device.id, viewport: device.desc.viewport, steps: [], console: [], failedRequests: [] };
  page.on('console', (m) => m.type() === 'error' && log.console.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => log.console.push('pageerror: ' + e.message.slice(0, 300)));
  page.on('requestfailed', (r) => log.failedRequests.push(`${r.failure()?.errorText} ${r.url().slice(0, 150)}`));
  let n = 0;
  const shot = async (name, { full = true } = {}) => {
    await page.waitForTimeout(700);
    const file = `${String(++n).padStart(2, '0')}-${name}`;
    const issues = await audit(page).catch((e) => [{ kind: 'audit-error', detail: e.message }]);
    await page.screenshot({ path: path.join(dir, file + '-view.png') });
    if (full) await page.screenshot({ path: path.join(dir, file + '-full.png'), fullPage: true }).catch(() => {});
    log.steps.push({ step: file, url: page.url().replace(BASE, ''), issues });
  };
  const step = async (name, fn) => {
    try {
      await fn();
    } catch (e) {
      log.steps.push({ step: `!! ${name}`, error: e.message.split('\n')[0] });
      await page.screenshot({ path: path.join(dir, `ERR-${name}.png`) }).catch(() => {});
    }
  };

  await step('custom-page', async () => {
    await page.goto(BASE + '/nl/your-design', { waitUntil: 'networkidle' });
    await shot('custom-page');
    const reject = page.getByRole('button', { name: /weiger|reject|alleen nood/i });
    if (await reject.count()) await reject.first().click();
  });
  await step('upload', async () => {
    await page.setInputFiles('#file-upload', IMG);
    await page.waitForResponse((r) => /upload/i.test(r.url()) && r.request().method() === 'POST', { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await shot('after-upload-editor', { full: false });
  });
  await step('editor-close', async () => {
    const close = page.locator('app-product-preview').getByRole('button', { name: /sluit|close/i });
    if (await close.count()) await close.first().click();
    else await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    await shot('editor-closed');
  });
  await step('options', async () => {
    const sidebar = page.locator('app-product-purchase-sidebar:visible').first();
    await sidebar.scrollIntoViewIfNeeded();
    await shot('options');
  });
  const sb = () => page.locator('app-product-purchase-sidebar:visible').first();
  await step('more-sizes', async () => {
    const t = sb().locator('.more-toggle');
    await t.scrollIntoViewIfNeeded();
    await t.click();
    await page.waitForTimeout(500);
    await shot('more-sizes', { full: false });
    await t.click();
  });
  await step('paper-dropdown', async () => {
    const t = sb().locator('app-paper-options button').first();
    await t.scrollIntoViewIfNeeded();
    await t.click();
    await page.waitForTimeout(500);
    await shot('paper-dropdown', { full: false });
    await t.click();
  });
  await step('frame-dropdown', async () => {
    const t = sb().locator('app-frame-options button').first();
    await t.scrollIntoViewIfNeeded();
    await t.click();
    await page.waitForTimeout(500);
    await shot('frame-dropdown', { full: false });
    // A frame in stock, not the rolled-up one
    const items = sb().locator('app-frame-options button:not([disabled])');
    const count = await items.count();
    for (let i = 1; i < count; i++) {
      const txt = (await items.nth(i).innerText()).toLowerCase();
      if (!txt.includes('opgerold')) { await items.nth(i).click(); break; }
    }
    await page.waitForTimeout(800);
    await t.scrollIntoViewIfNeeded();
    await shot('frame-chosen-mat', { full: false });
  });
  await step('add-to-cart', async () => {
    const btn = page.locator('app-product-purchase-sidebar:visible .add-to-cart-btn, app-product-purchase-sidebar:visible button:has-text("winkelwagen")').first();
    await btn.scrollIntoViewIfNeeded();
    const put = page.waitForRequest((r) => r.url().includes('/basket/v1/basket') && r.method() === 'PUT', { timeout: 60000 });
    put.catch(() => {});
    await btn.click({ timeout: 10000 });
    const req = await put;
    const items = JSON.parse(req.postData() || '[]');
    log.cartOptions = items.at(-1)?.selectedOptions?.map((o) => `${o.optionName}:${(o.spec1 || '').slice(-40)}${o.spec2 ? '|' + o.spec2 : ''}${o.spec3 ? '|' + o.spec3 : ''}`);
    log.cartPicture = items.at(-1)?.pictureUrl;
    await page.waitForTimeout(1500);
    await shot('added-modal', { full: false });
  });
  await step('cart-sidebar', async () => {
    await page.evaluate(() => window.scrollTo(0, 0));
    const headerCart = page.locator('header button[aria-label="Winkelmand"]:visible').first();
    if (await headerCart.count()) await headerCart.click();
    else {
      // Phones: the cart is in the menu
      await page.locator('header button').filter({ hasText: /menu/i }).first().click();
      await page.waitForTimeout(600);
      await page.locator('nav button:visible, aside button:visible, [role=dialog] button:visible').filter({ hasText: /winkelmand/i }).first().click();
    }
    await page.waitForTimeout(900);
    await shot('cart-sidebar', { full: false });
    await page.keyboard.press('Escape');
  });
  await step('mobile-menu', async () => {
    if ((page.viewportSize()?.width ?? 1000) >= 1024) return;
    await page.goto(BASE + '/nl/your-design', { waitUntil: 'networkidle' });
    const burger = page.locator('header button').filter({ hasText: /menu/i }).first();
    await burger.click();
    await page.waitForTimeout(700);
    await shot('mobile-menu', { full: false });
  });
  await step('cart-page', async () => {
    await page.goto(BASE + '/nl/cart', { waitUntil: 'networkidle' });
    await shot('cart');
  });
  await step('checkout', async () => {
    await page.goto(BASE + '/nl/checkout', { waitUntil: 'networkidle' });
    await shot('checkout-empty');
  });
  await step('checkout-filled', async () => {
    const fill = async (sel, v) => {
      const el = page.locator(sel).first();
      if (await el.count()) await el.fill(v);
    };
    await fill('input[type=email], input[name=email], #email', `qa-${crypto.randomUUID().slice(0, 12)}@example.com`);
    await fill('#first_name', 'Test');
    await fill('#last_name', 'Klant');
    await fill('input[name=fullName], #fullName', 'Test Klant');
    await fill('input[type=tel], input[name=phone], #phone', '0612345678');
    await fill('#postal-code', '1011 AB');
    await fill('input[name=houseNumber], #houseNumber', '1');
    await fill('input[name=street], #street', 'Teststraat 1');
    await fill('input[name=city], #city', 'Amsterdam');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.waitForTimeout(1500);
    await shot('checkout-filled');
  });
  if ((process.env.PAY || '').split(',').includes(device.id)) {
    await step('stripe', async () => {
      await page.locator('.confirm-btn:visible').first().click();
      await page.waitForURL(/stripe\.com/, { timeout: 45000 });
      await page.waitForLoadState('networkidle');
      await shot('stripe');
      await page.goto(BASE + '/nl/checkout/cancel', { waitUntil: 'networkidle' });
      await shot('checkout-cancel');
    });
  }
  await step('static-pages', async () => {
    await page.goto(BASE + '/nl/checkout/success?session_id=cs_test_qa', { waitUntil: 'networkidle' });
    await shot('checkout-success-fake');
  });
  await step('landscape-upload', async () => {
    await page.goto(BASE + '/nl/your-design', { waitUntil: 'networkidle' });
    await page.setInputFiles('#file-upload', LAND);
    await page.waitForTimeout(5000);
    await shot('landscape-editor', { full: false });
  });

  fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify(log, null, 2));
  await browser.close();
  return log;
}

const results = [];
for (const d of DEVICES.filter((d) => !ONLY || ONLY.split(',').includes(d.id))) {
  console.log('== ' + d.id);
  const r = await run(d);
  results.push(r);
  for (const s of r.steps) console.log(`  ${s.step}${s.error ? ' ERROR ' + s.error : ''}${s.issues?.length ? ` (${s.issues.length} issues)` : ''}`);
  if (r.console.length) console.log('  console errors: ' + r.console.length);
}
fs.writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify(results, null, 2));
