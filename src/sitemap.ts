import { DefaultUrlSerializer } from '@angular/router';
import { environment } from './environments/environment';
import { productPath } from './app/shared/product-path';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from './app/services/i18n/languages';

const STATIC_PAGES = ['/', '/collections', '/products', '/about', '/frames', '/your-design', '/how-we-work', '/legal', '/licensing'];
const CACHE_MS = 60 * 60 * 1000;
/** Categories, artists, museums and collections with fewer prints are too thin to list */
const MIN_PRODUCTS = 3;

let cached: { xml: string; at: number } | undefined;

/** Every page in every language, each listing its translations; rebuilt at most once an hour. */
export async function sitemapXml(): Promise<string> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.xml;

  const [products, listings] = await Promise.all([fetchProducts(), fetchListings()]);
  const paths = [...STATIC_PAGES, ...listings, ...products.map((product) => `/products/${productPath(product)}`)];
  const url = (language: string, path: string) => escapeXml(`${environment.siteUrl}/${language}${path === '/' ? '' : path}`);
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
  return (await catalog('/storefront/products/search', { pageSize: 5000, pageIndex: 0 })).data;
}

/** The product list narrowed to each category and attribute (artist, museum, collection) with enough prints */
async function fetchListings(): Promise<string[]> {
  const groups: { groupType: string; name: string; options: { name: string }[] }[] = await catalog('/storefront/filter-options');
  const names = (type: string) =>
    groups.filter((g) => g.groupType === type && g.name !== 'Image Quality').flatMap((g) => g.options.map((o) => o.name));
  const stats: Record<'categories' | 'attributes', { name: string; productCount: number }[]> = await catalog('/storefront/products/stats', {
    categoryNames: [...groups.filter((g) => g.groupType === 'Categories').map((g) => g.name), ...names('Categories')],
    attributeNames: names('Attributes'),
  });
  // Written exactly as the app writes its own address, so it matches the page's canonical link
  const serializer = new DefaultUrlSerializer();
  const listing = (param: string, name: string) => serializer.serialize(serializer.parse(`/products?${param}=${encodeURIComponent(name)}`));
  const enough = (items: { name: string; productCount: number }[]) => items.filter((i) => i.productCount >= MIN_PRODUCTS).map((i) => i.name);
  return [...enough(stats.categories).map((n) => listing('categoryName', n)), ...enough(stats.attributes).map((n) => listing('attributeName', n))];
}

async function catalog(path: string, body?: object) {
  // Inside the cluster the catalog is reached through the gateway, as server-rendered pages do
  const base = environment.serviceUrls['catalog-api'];
  const origin = process.env['INTERNAL_API_URL'] ? base.replace(new URL(base).origin, process.env['INTERNAL_API_URL']) : base;
  const response = await fetch(`${origin}/catalog/v1${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'content-type': 'application/json', Origin: environment.siteUrl },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`Catalog answered ${response.status} for ${path}`);
  return response.json();
}

function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
