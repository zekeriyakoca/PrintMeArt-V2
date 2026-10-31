import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_LANGUAGE, isLanguage, LANGUAGE_COOKIE } from './app/services/i18n/languages';
import { productFeedXml, refreshProductFeed } from './feed';
import { sitemapXml } from './sitemap';

const browserDistFolder = join(dirname(fileURLToPath(import.meta.url)), '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');

// One address for the shop: www.printmeart.nl moves to printmeart.nl
app.use((req, res, next) => {
  if (!req.hostname.startsWith('www.')) return next();
  res.redirect(301, `https://${req.hostname.slice(4)}${req.originalUrl}`);
});
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

// Built files; the hashed bundles and the fonts never change, everything else is re-checked daily
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (/-[A-Z0-9]{8}\.(js|css)$|\/fonts\//.test(path)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);

app.get('/sitemap.xml', (_req, res, next) => {
  sitemapXml()
    .then((xml) => res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml))
    .catch(next);
});

// Product feeds for Google Merchant Center, Pinterest and Meta; Dutch is the main one
app.get(['/feeds/products.xml', '/feeds/products-en.xml'], (req, res) => {
  const xml = productFeedXml(req.path.endsWith('-en.xml') ? 'en' : 'nl');
  // Right after a start the catalog is still being read
  if (!xml) return res.status(503).set({ 'Retry-After': '600', 'Cache-Control': 'no-store' }).send('The product feed is being prepared');
  return res.type('application/xml').set('Cache-Control', 'public, max-age=3600').send(xml);
});

// Every page lives under /en or /nl, and the language of the last page opened is remembered.
// An address without one goes to that language, or Dutch the first time.
app.use((req, res, next) => {
  const language = req.path.split('/')[1];
  if (isLanguage(language)) {
    res.cookie(LANGUAGE_COOKIE, language, { maxAge: 31536000000, sameSite: 'lax' });
    return next();
  }
  const remembered = req.get('cookie')?.match(new RegExp(`(?:^|; )${LANGUAGE_COOKIE}=(\\w+)`))?.[1];
  const target = isLanguage(remembered) ? remembered : DEFAULT_LANGUAGE;
  res.set('Cache-Control', 'no-store').redirect(302, `/${target}${req.originalUrl === '/' ? '' : req.originalUrl}`);
});

// Pages that depend on the visitor render in the browser only
app.get(/^\/(en|nl)\/(cart|checkout|profile|orders|login|order-confirmation)(\/|$)/, (_req, res) => {
  res.set('Cache-Control', 'no-cache').sendFile(join(browserDistFolder, 'index.csr.html'));
});

// Rendered pages are kept for 30 minutes: every visitor gets the same page (prices are worked out in the browser),
// so a burst of visits or a crawler does not render the same page again and again
const PAGE_CACHE_MS = 30 * 60 * 1000;
const PAGE_CACHE_MAX = 2000;
const pageCache = new Map<string, { expires: number; headers: [string, string][]; body: Buffer }>();

// Angular renders the page without its language prefix and is told the language alongside
app.use((req, res, next) => {
  const key = req.originalUrl;
  const cached = req.method === 'GET' ? pageCache.get(key) : undefined;
  if (cached && cached.expires > Date.now()) {
    cached.headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(200).send(cached.body);
    return;
  }

  const language = req.originalUrl.slice(1, 3);
  const page = req.originalUrl.slice(3);
  req.url = req.originalUrl = page.startsWith('/') ? page : `/${page}`;
  angularApp
    .handle(req, { language })
    .then(async (response) => {
      if (!response) return next();
      const location = response.headers.get('location');
      if (location?.startsWith('/')) return res.redirect(response.status, `/${language}${location}`);
      if (req.method !== 'GET' || response.status !== 200) return writeResponseToNodeResponse(response, res);

      const headers = [...response.headers.entries()];
      const body = Buffer.from(await response.arrayBuffer());
      pageCache.delete(key);
      if (pageCache.size >= PAGE_CACHE_MAX) pageCache.delete(pageCache.keys().next().value!);
      pageCache.set(key, { expires: Date.now() + PAGE_CACHE_MS, headers, body });
      headers.forEach(([name, value]) => res.setHeader(name, value));
      return res.status(200).send(body);
    })
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => console.log(`Storefront listening on http://localhost:${port}`));
  refreshProductFeed();
}

export const reqHandler = createNodeRequestHandler(app);
