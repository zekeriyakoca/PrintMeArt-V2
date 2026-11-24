/** The artist pages have a translated address: /nl/kunstenaars/winslow-homer, /en/artists/winslow-homer */
export const ARTISTS_SEGMENT: Record<string, string> = { nl: 'kunstenaars', en: 'artists' };

/** Path without the language, e.g. '/kunstenaars/winslow-homer'; the index when no slug is given */
export function artistPath(language: string, slug?: string): string {
  const segment = ARTISTS_SEGMENT[language] ?? ARTISTS_SEGMENT['en'];
  return slug ? `/${segment}/${slug}` : `/${segment}`;
}

/** Artists with fewer prints get a page, but stay out of search results until the catalogue grows */
export const MIN_INDEXED_WORKS = 3;

/** The slug the backend gives an artist: the stored one, else the name in lower-case ASCII */
export function artistSlug(artist: { name: string; metadata?: Record<string, string> | null }): string {
  return (
    artist.metadata?.['Slug'] ||
    artist.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  );
}
