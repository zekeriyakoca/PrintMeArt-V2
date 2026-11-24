import { ProductImageDto, ProductSimpleDto } from './product';

/**
 * Stored facts about an artist (from Wikidata and the museums), keyed as the backend keeps them:
 * Slug, SortName, BirthYear, DeathYear, BirthPlace(_nl), DeathPlace(_nl), Country(_nl), Movement(_nl),
 * WikidataId, Wikipedia(_nl), HeroProductId, FeaturedProductIds (comma separated).
 */
export type ArtistFacts = Record<string, string | undefined>;

export interface ArtistSummaryDto {
  name: string;
  slug: string;
  sortName: string;
  productCount: number;
  image?: ProductImageDto;
  facts: ArtistFacts;
}

export interface ArtistWorkDto extends ProductSimpleDto {
  metadata?: Record<string, string | undefined>;
}

export interface ArtistDetailDto extends ArtistSummaryDto {
  description: string;
  descriptionNl?: string;
  works: ArtistWorkDto[];
  related: ArtistSummaryDto[];
}
