import { AngularNodeAppEngine, createNodeRequestHandler, isMainModule, writeResponseToNodeResponse } from '@angular/ssr/node';
import express from 'express';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { languageOfPath } from './app/services/i18n/languages';

const browserDistFolder = join(dirname(fileURLToPath(import.meta.url)), '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  next();
});

// Built files; the hashed bundles never change, everything else is re-checked daily
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    maxAge: '1d',
    setHeaders: (res, path) => {
      if (/-[A-Z0-9]{8}\.(js|css)$/.test(path)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);

// Every page lives under /en or /nl. Old links and plain hrefs without one keep the language of the page they came from.
app.use((req, res, next) => {
  if (/^\/(en|nl)(\/|$)/.test(req.path)) return next();
  const referrer = req.get('referer');
  const language = languageOfPath(referrer ? new URL(referrer).pathname : '/');
  res.redirect(req.path === '/' ? 302 : 301, `/${language}${req.originalUrl === '/' ? '' : req.originalUrl}`);
});

// Pages that depend on the visitor render in the browser only
app.get(/^\/(en|nl)\/(cart|checkout|profile|orders|login|order-confirmation)(\/|$)/, (_req, res) => {
  res.set('Cache-Control', 'no-cache').sendFile(join(browserDistFolder, 'index.csr.html'));
});

// Angular renders the page without its language prefix and is told the language alongside
app.use((req, res, next) => {
  const language = req.originalUrl.slice(1, 3);
  const page = req.originalUrl.slice(3);
  req.url = req.originalUrl = page.startsWith('/') ? page : `/${page}`;
  angularApp
    .handle(req, { language })
    .then((response) => {
      if (!response) return next();
      const location = response.headers.get('location');
      if (location?.startsWith('/')) return res.redirect(response.status, `/${language}${location}`);
      return writeResponseToNodeResponse(response, res);
    })
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => console.log(`Storefront listening on http://localhost:${port}`));
}

export const reqHandler = createNodeRequestHandler(app);
