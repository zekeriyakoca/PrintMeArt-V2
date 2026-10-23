import { environment } from './environments/environment';
import { productPath } from './app/shared/product-path';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from './app/services/i18n/languages';

const STATIC_PAGES = ['/', '/collections', '/products', '/about', '/frames', '/your-design', '/how-we-work', '/legal', '/licensing'];
const CACHE_MS = 60 * 60 * 1000;

let cached: { xml: string; at: number } | undefined;

/** Every page in every language, each listing its translations; rebuilt at most once an hour. */
export async function sitemapXml(): Promise<string> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.xml;

  const products = await fetchProducts();
  const paths = [...STATIC_PAGES, ...products.map((product) => `/products/${productPath(product)}`)];
  const url = (language: string, path: string) => `${environment.siteUrl}/${language}${path === '/' ? '' : path}`;
  const entries = paths.flatMap((path) =>
    AVAILABLE_LANGUAGES.map(
      ({ code }) => `  <url>
    <loc>${url(code, path)}</loc>
${AVAILABLE_LANGUAGES.map((other) => `    <xhtml:link rel="alternate" hreflang="${other.code}" href="${url(other.code, path)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(DEFAULT_LANGUAGE, path)}"/>
  </url>`,
    ),
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  cached = { xml, at: Date.now() };
  return xml;
}

async function fetchProducts(): Promise<{ id: number; name: string }[]> {
  // Inside the cluster the catalog is reached through the gateway, as server-rendered pages do
  const catalog = environment.serviceUrls['catalog-api'];
  const base = process.env['INTERNAL_API_URL'] ? catalog.replace(new URL(catalog).origin, process.env['INTERNAL_API_URL']) : catalog;
  const response = await fetch(`${base}/catalog/v1/storefront/products/search`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', Origin: environment.siteUrl },
    body: JSON.stringify({ pageSize: 5000, pageIndex: 0 }),
  });
  if (!response.ok) throw new Error(`Catalog answered ${response.status}`);
  return (await response.json()).data;
}
