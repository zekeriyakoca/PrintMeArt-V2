// SEO regression check against the server-rendered shop. Run after `npm run build`:
//   node scripts/seo-check.mjs                                # starts dist/store-front/server/server.mjs on a free port
//   SEO_BASE_URL=https://printmeart.nl node scripts/seo-check.mjs   # or checks a running shop
// It samples every page type in Dutch and English and fails (exit 1) when a page loses what search engines need:
// one H1, a translated title and H1, a clean self-referencing canonical, hreflang alternates, a place in the
// sitemap, and the 301s that keep old addresses working, and when a page shows €0.00 or a product page shows a
// price other than the one its product data offers. The pages render with live catalog data.
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const SITE = 'https://printmeart.nl';

/** Pages checked in Dutch; the English page is the one the Dutch page names as its 'en' alternate */
const FIXED_PAGES = {
  home: '/nl',
  catalog: '/nl/products',
  category: '/nl/categorie/landschap',
  'category (famous painters)': '/nl/categorie/hollandse-meesters',
  artists: '/nl/kunstenaars',
  collections: '/nl/collections',
  'your-design': '/nl/your-design',
  guides: '/nl/gids',
  about: '/nl/about',
};
/** One page of each kind whose addresses depend on the catalog, taken from the sitemap */
const SITEMAP_SAMPLES = {
  product: /^\/nl\/products\/\d+/,
  artist: /^\/nl\/kunstenaars\/[^/]+$/,
  guide: /^\/nl\/gids\/[^/]+$/,
};
/** Old or broken addresses and where they must move permanently */
const REDIRECTS = [
  ['/nl/nl/about', '/nl/about'],
  ['/en/en/products', '/en/products'],
  ['/nl/products?categoryName=Landscape', '/nl/categorie/landschap'],
  ['/en/products?categoryName=Landscape', '/en/category/landscape'],
  ['/nl/products?categoryName=Dutch%20Masters', '/nl/categorie/hollandse-meesters'],
  ['/en/products?categoryName=Cityscapes%20%26%20Architecture', '/en/category/cityscapes-architecture'],
  ['/nl/products?categoryName=Landscape&utm_source=newsletter', '/nl/categorie/landschap?utm_source=newsletter'],
  ['/nl/category/landscape', '/nl/categorie/landschap'],
  ['/en/categorie/landschap', '/en/category/landscape'],
];

/** The shop started by this script, when no SEO_BASE_URL is given */
let server;
const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

const base = process.env.SEO_BASE_URL?.replace(/\/$/, '') ?? (await startServer());
try {
  await run();
} finally {
  server?.kill();
}
if (failures.length) {
  console.error(`\nSEO check failed (${failures.length}):\n${failures.map((f) => `  ✗ ${f}`).join('\n')}`);
  process.exit(1);
}
console.log('\nSEO check passed');

async function run() {
  const sitemap = await text('/sitemap.xml');
  const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeXml(m[1])));
  console.log(`sitemap: ${locs.size} addresses`);
  if (locs.size < 100) fail('sitemap', `only ${locs.size} addresses`);
  for (const loc of locs) {
    if (/[?&]categoryName=/.test(loc)) fail('sitemap', `${loc} is a category filter; give the category a slug in src/app/shared/category-path.ts`);
  }

  const pages = { ...FIXED_PAGES };
  for (const [kind, pattern] of Object.entries(SITEMAP_SAMPLES)) {
    const path = [...locs].map((loc) => loc.slice(SITE.length)).find((p) => pattern.test(p));
    if (path) pages[kind] = path;
    else fail('sitemap', `no ${kind} page in the sitemap`);
  }

  for (const [kind, nlPath] of Object.entries(pages)) {
    const nl = await checkPage(`${kind} nl`, nlPath);
    if (!nl) continue;
    const enPath = nl.alternates.en?.slice(SITE.length);
    if (!enPath) continue;
    const en = await checkPage(`${kind} en`, enPath);
    if (!en) continue;
    if (en.alternates.nl !== nl.canonical) fail(`${kind} en`, `hreflang nl is ${en.alternates.nl}, expected ${nl.canonical}`);
    if (nl.title === en.title) fail(`${kind} nl`, `title is the same as on the English page: "${nl.title}"`);
    // A product's H1 is the artwork's own title, the same in every language
    if (nl.h1 && nl.h1 === en.h1 && kind !== 'product') fail(`${kind} nl`, `H1 is the same as on the English page: "${nl.h1}"`);
    for (const page of [nl, en]) {
      if (!locs.has(page.canonical)) fail(`${kind}`, `${page.canonical} is missing from the sitemap`);
    }
  }

  for (const [from, to] of REDIRECTS) {
    const response = await fetch(base + from, { redirect: 'manual' });
    const location = response.headers.get('location')?.replace(/^https?:\/\/[^/]+/, '');
    const ok = response.status === 301 && location === to;
    console.log(`${ok ? '✓' : '✗'} ${from} → ${response.status} ${location ?? ''}`);
    if (!ok) fail('redirect', `${from} answered ${response.status} ${location ?? ''}, expected 301 to ${to}`);
  }
}

/** The page's SEO essentials, or undefined when it could not be read */
async function checkPage(where, path) {
  const response = await fetch(base + path, { redirect: 'manual' });
  if (response.status !== 200) {
    fail(where, `${path} answered ${response.status} ${response.headers.get('location') ?? ''}`);
    return undefined;
  }
  const html = await response.text();
  const head = html.slice(0, html.indexOf('</head>'));
  const body = html.slice(html.indexOf('</head>'));
  const title = decodeXml(head.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? '');
  const h1s = [...body.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)].map((m) =>
    decodeXml(
      m[0]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim(),
    ),
  );
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((m) => m[0]);
  const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
  const canonical = links.filter((l) => attr(l, 'rel') === 'canonical').map((l) => decodeXml(attr(l, 'href') ?? ''));
  const alternates = Object.fromEntries(links.filter((l) => attr(l, 'rel') === 'alternate' && attr(l, 'hreflang')).map((l) => [attr(l, 'hreflang'), decodeXml(attr(l, 'href') ?? '')]));
  const robots = head.match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '';
  const expected = SITE + path;

  const before = failures.length;
  if (!title) fail(where, `${path} has no <title>`);
  if (h1s.length !== 1) fail(where, `${path} has ${h1s.length} H1s${h1s.length ? `: ${h1s.map((h) => `"${h}"`).join(', ')}` : ''}`);
  if (canonical.length !== 1) fail(where, `${path} has ${canonical.length} canonical links`);
  else if (canonical[0].includes('?')) fail(where, `${path} canonical has a query string: ${canonical[0]}`);
  else if (canonical[0] !== expected) fail(where, `${path} canonical is ${canonical[0]}, expected ${expected}`);
  for (const language of ['nl', 'en', 'x-default']) {
    if (!alternates[language]) fail(where, `${path} has no hreflang="${language}" alternate`);
  }
  const own = path.split('/')[1];
  if (alternates[own] && alternates[own] !== canonical[0]) fail(where, `${path} hreflang ${own} is ${alternates[own]}, not the page itself`);
  if (/noindex/.test(robots)) fail(where, `${path} is noindex`);
  checkPrices(where, path, html);
  console.log(`${failures.length === before ? '✓' : '✗'} ${where.padEnd(32)} ${path}  "${title}"  H1 "${h1s[0] ?? ''}"`);
  return { title, h1: h1s[0], canonical: canonical[0], alternates };
}

/**
 * Google Merchant Center and Googlebot read the server HTML: a price of €0.00 there, or one that differs from the
 * product data's offer, gets products disapproved. The purchase panel's prices (class="price") must all be the offer.
 */
function checkPrices(where, path, html) {
  const zero = html.match(/€(\s|&nbsp;)?0[.,]00(?!\d)/);
  if (zero) fail(where, `${path} shows ${zero[0]}`);
  const products = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
    .flatMap((m) => {
      try {
        return [JSON.parse(m[1])].flat();
      } catch {
        return [];
      }
    })
    .filter((data) => data['@type'] === 'Product');
  if (!products.length) return;
  // A single offer, or the cheapest of several (Your design)
  const offers = products[0].offers;
  const offer = Number(offers?.['@type'] === 'AggregateOffer' ? offers.lowPrice : offers?.price);
  if (!(offer > 0)) return fail(where, `${path} product data offers no price`);
  const shown = [...html.matchAll(/<span[^>]*class="price"[^>]*>([^<]*)<\/span>/g)].map((m) => decodeXml(m[1]).trim());
  if (!shown.length) return fail(where, `${path} shows no price; the product data offers €${offer.toFixed(2)}`);
  for (const price of shown) {
    const value = Number(price.replace(/[^\d.,]/g, '').replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'));
    if (value !== offer) fail(where, `${path} shows ${price}, the product data offers €${offer.toFixed(2)}`);
  }
}

async function text(path) {
  const response = await fetch(base + path);
  if (!response.ok) throw new Error(`${path} answered ${response.status}`);
  return response.text();
}

function decodeXml(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Starts the built shop on a free port and waits until it answers */
async function startServer() {
  const port = await new Promise((resolve) => {
    const probe = createServer().listen(0, () => {
      const { port } = probe.address();
      probe.close(() => resolve(port));
    });
  });
  server = spawn(process.execPath, ['dist/store-front/server/server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'inherit', 'inherit'] });
  const url = `http://localhost:${port}`;
  for (let i = 0; i < 60; i++) {
    try {
      await fetch(url + '/robots.txt');
      return url;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  server.kill();
  throw new Error('The built shop did not start; run `npm run build` first');
}
