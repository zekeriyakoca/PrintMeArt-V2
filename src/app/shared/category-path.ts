/** The category pages have a translated address: /nl/categorie/landschap, /en/category/landscape */
export const CATEGORY_SEGMENT: Record<string, string> = { nl: 'categorie', en: 'category' };

/**
 * The slug of each catalog category (keyed by its English name, as the backend stores it) in each language.
 * Written out rather than derived from the translation, so a reworded name never moves a page search engines know.
 * A category missing here stays reachable as a catalog filter (/products?categoryName=…) until it is added.
 */
export const CATEGORY_SLUGS: Record<string, Record<string, string>> = {
  'Art Prints': { nl: 'kunstprints', en: 'art-prints' },
  Landscape: { nl: 'landschap', en: 'landscape' },
  'Botanical Art': { nl: 'botanische-kunst', en: 'botanical-art' },
  'Animal Art': { nl: 'dierenkunst', en: 'animal-art' },
  'Still Life': { nl: 'stilleven', en: 'still-life' },
  'Cityscapes & Architecture': { nl: 'stadsgezichten-architectuur', en: 'cityscapes-architecture' },
  Seascapes: { nl: 'zeegezichten', en: 'seascapes' },
  Portraits: { nl: 'portretten', en: 'portraits' },
  'Abstract Art': { nl: 'abstracte-kunst', en: 'abstract-art' },
  'Famous Painters': { nl: 'beroemde-schilders', en: 'famous-painters' },
  'Renaissance Masters': { nl: 'renaissancemeesters', en: 'renaissance-masters' },
  'Dutch Masters': { nl: 'hollandse-meesters', en: 'dutch-masters' },
  'Modern Masters': { nl: 'moderne-meesters', en: 'modern-masters' },
  'Romantic & Realist Masters': { nl: 'romantiek-realisme-meesters', en: 'romantic-realist-masters' },
};

/** '/categorie/landschap' for a category with a page of its own, else undefined */
export function categoryPath(language: string, name: string): string | undefined {
  const slugs = CATEGORY_SLUGS[name];
  if (!slugs) return undefined;
  const lang = slugs[language] ? language : 'en';
  return `/${CATEGORY_SEGMENT[lang]}/${slugs[lang]}`;
}

/** Where a category is listed: its own page, or the catalog filtered to it */
export function categoryLink(language: string, name: string): string {
  return categoryPath(language, name) ?? `/products?categoryName=${encodeURIComponent(name)}`;
}

/** The category a slug in either language belongs to */
export function categoryBySlug(slug: string): string | undefined {
  return Object.keys(CATEGORY_SLUGS).find((name) => Object.values(CATEGORY_SLUGS[name]).includes(slug));
}

/** The catalog address for these filters: a bare category filter is that category's page */
export function listingLink(language: string, params: Record<string, string | number | undefined>): string {
  const set = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  const { categoryName, pageIndex } = params;
  const path = typeof categoryName === 'string' && categoryPath(language, categoryName);
  if (path && set.every(([key]) => key === 'categoryName' || key === 'pageIndex')) {
    return pageIndex ? `${path}?pageIndex=${pageIndex}` : path;
  }
  const query = set.map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`).join('&');
  return query ? `/products?${query}` : '/products';
}
