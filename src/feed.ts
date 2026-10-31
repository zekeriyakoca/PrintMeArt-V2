import { environment } from './environments/environment';
import { productPath } from './app/shared/product-path';
import type { ProductDto, ProductSimpleDto } from './app/models/product';
import type { ShippingInfo } from './app/services/bootstrap/bootstrap';
import en from './app/i18n/en.json';
import nl from './app/i18n/nl.json';
import { backend, catalog, escapeXml } from './sitemap';

/** The product list, prices and shipping are read again after an hour */
const CACHE_MS = 60 * 60 * 1000;
/** A failed read is tried again after five minutes */
const RETRY_MS = 5 * 60 * 1000;
/** The painter, story, category and images of a product change rarely */
const DETAILS_CACHE_MS = 24 * 60 * 60 * 1000;
/**
 * One product's details every 600 ms (100 a minute): the gateway allows the server 300 calls a minute,
 * shared with the pages it renders
 */
const DETAILS_INTERVAL_MS = 600;
/** Google's limits */
const MAX_TITLE = 150;
const MAX_DESCRIPTION = 5000;
const MAX_ADDITIONAL_IMAGES = 10;
/** Posters, Prints & Visual Artwork */
const GOOGLE_CATEGORY = 500044;
/** Zones listed per item; the rest of the EU is set up in Merchant Center itself */
const FEED_SHIPPING_COUNTRIES = ['NL', 'BE', 'DE'];

const DICTIONARIES = { nl, en } as const;
export type FeedLanguage = keyof typeof DICTIONARIES;

interface FeedProduct {
  /** From the search, as the product page shows it */
  price: number;
  details: ProductDto;
}

interface FeedData {
  products: FeedProduct[];
  shipping: ShippingInfo;
  /** 'Animal art' → 'Art Prints', the group it is listed under */
  parents: Map<string, string>;
}

let feed: FeedData | undefined;
/** When the feed is due to be read again */
let dueAt = 0;
let refreshing: Promise<void> | undefined;
const details = new Map<number, { product: ProductDto; at: number }>();

/** Reads the catalog in the background when the feed is due; the feed in hand is served meanwhile */
export function refreshProductFeed(): void {
  if (refreshing || Date.now() < dueAt) return;
  refreshing = fetchFeedData()
    .then((data) => {
      feed = data;
      dueAt = Date.now() + CACHE_MS;
    })
    .catch((error) => {
      console.error('Product feed: could not read the catalog', error);
      dueAt = Date.now() + RETRY_MS;
    })
    .finally(() => (refreshing = undefined));
}

/**
 * Every visible product for Google Merchant Center, Pinterest and Meta catalogs (RSS 2.0 with Google's `g:` fields),
 * with the same title, text and price as the product page in that language. Undefined until the catalog
 * has been read once after the server started, which takes a few minutes.
 */
export function productFeedXml(language: FeedLanguage): string | undefined {
  refreshProductFeed();
  if (!feed) return undefined;
  const { products, shipping, parents } = feed;
  const t = (group: 'name' | 'seo', key: string) => lookup(DICTIONARIES[language], group, key);
  const site = `${environment.siteUrl}/${language}`;

  const items = products.map(({ price, details: product }) => {
    const facts = (product.metadata ?? {}) as unknown as Record<string, string | undefined>;
    const painter = facts['Painter'];
    // The page's own wording: the story (Dutch on /nl when written), otherwise the short description
    const story = (language === 'nl' && facts['Story_nl']) || facts['Story'] || product.description || '';
    const description = plainText(story) || t('seo', 'product.description').replace('{{name}}', product.name);
    const images = (product.images ?? []).map((image) => image.large).filter(Boolean);
    const category = product.categoryName;
    const productType = [parents.get(category), category].filter((name): name is string => !!name).map((name) => t('name', name));

    const fields: [string, string | number][] = [
      ['g:id', product.id],
      ['g:title', cut([product.name, painter].filter(Boolean).join(' – '), MAX_TITLE)],
      ['g:description', cut(description, MAX_DESCRIPTION)],
      ['g:link', `${site}/products/${productPath(product)}`],
      ['g:image_link', images[0]],
      ...images.slice(1, 1 + MAX_ADDITIONAL_IMAGES).map((image): [string, string] => ['g:additional_image_link', image]),
      ['g:availability', 'in_stock'],
      ['g:price', `${price.toFixed(2)} EUR`],
      ['g:brand', 'PrintMeArt'],
      ['g:condition', 'new'],
      ['g:identifier_exists', 'no'],
      ['g:google_product_category', GOOGLE_CATEGORY],
      ...(productType.length ? [['g:product_type', productType.join(' > ')] as [string, string]] : []),
    ];
    const field = ([name, value]: [string, string | number]) => `      <${name}>${escapeXml(String(value))}</${name}>`;
    return `    <item>
${fields.map(field).join('\n')}
${shippingXml(shipping, price)}
    </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>PrintMeArt</title>
    <link>${escapeXml(site)}</link>
    <description>${escapeXml(t('seo', 'home.description'))}</description>
${items.join('\n')}
  </channel>
</rss>
`;
}

/** Shipping per country, worked out as the product page's Offer does it */
function shippingXml(info: ShippingInfo, price: number): string {
  return info.zones
    .flatMap((zone) => zone.countries.filter((country) => FEED_SHIPPING_COUNTRIES.includes(country)).map((country) => ({ zone, country })))
    .map(({ zone, country }) => {
      const rate = zone.freeShippingFrom != null && price >= zone.freeShippingFrom ? 0 : zone.rate;
      // The backend gives one delivery figure, covering both printing and transit
      return `      <g:shipping>
        <g:country>${country}</g:country>
        <g:price>${rate.toFixed(2)} ${escapeXml(info.currency)}</g:price>
        <g:min_handling_time>0</g:min_handling_time>
        <g:max_handling_time>0</g:max_handling_time>
        <g:min_transit_time>1</g:min_transit_time>
        <g:max_transit_time>${Math.max(1, info.deliveryDays)}</g:max_transit_time>
      </g:shipping>`;
    })
    .join('\n');
}

async function fetchFeedData(): Promise<FeedData> {
  const [search, shipping, groups] = await Promise.all([
    catalog('/storefront/products/search', { pageSize: 5000, pageIndex: 0 }) as Promise<{ data: ProductSimpleDto[] }>,
    backend('bff', '/bff/v1/ordering/shipping-info') as Promise<ShippingInfo>,
    catalog('/storefront/filter-options') as Promise<{ groupType: string; name: string; options: { name: string }[] }[]>,
  ]);
  // The search lists what the shop shows (its isAvailable flag is not reliable) but leaves out the painter,
  // story and category, which come from each product's own details
  const products: FeedProduct[] = [];
  for (const item of search.data) {
    const product = await productDetails(item.id);
    if (product?.isAvailable && item.cheapestPrice > 0) products.push({ price: item.cheapestPrice, details: product });
  }
  const parents = new Map(groups.filter((g) => g.groupType === 'Categories').flatMap((group) => group.options.map((option): [string, string] => [option.name, group.name])));
  return { products, shipping, parents };
}

/** A product whose details do not load is left out of this hour's feed, or kept as last read */
async function productDetails(id: number): Promise<ProductDto | undefined> {
  const known = details.get(id);
  if (known && Date.now() - known.at < DETAILS_CACHE_MS) return known.product;
  for (let attempt = 0; attempt < 2; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, DETAILS_INTERVAL_MS));
    try {
      const product = (await catalog(`/storefront/products/${id}`)) as ProductDto;
      details.set(id, { product, at: Date.now() });
      return product;
    } catch (error) {
      console.error(`Product feed: no details for product ${id}`, error);
      // Rate limited: try once more in the next minute
      if (!String(error).includes(' 429 ')) break;
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
    }
  }
  return known?.product;
}

/** Catalog names are keyed by their English text, which may contain dots; without a translation they show as themselves */
function lookup(dictionary: object, group: 'name' | 'seo', key: string): string {
  const node = (dictionary as Record<string, Record<string, unknown>>)[group];
  if (group === 'name') return typeof node[key] === 'string' ? (node[key] as string) : key;
  const found = key.split('.').reduce<unknown>((at, part) => (at as Record<string, unknown> | undefined)?.[part], node);
  return typeof found === 'string' ? found : key;
}

/** Text without markup or characters XML does not allow, paragraphs kept */
function plainText(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .trim();
}

function cut(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, text.lastIndexOf(' ', max - 1))}…` : text;
}
