import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from '../../services/api/api.service';
import { ProductFilterRequestDto, ProductTags } from '../../models/product';

type CollectionFilter = { type: 'tag'; tags: ProductTags } | { type: 'category'; categoryName: string } | { type: 'attribute'; attributeName: string };

interface Collection {
  name: string;
  tagline: string;
  imageUrl: string | undefined;
  queryParams: Record<string, string>;
  badge?: string;
  filter?: CollectionFilter;
}

@Component({
  selector: 'app-collections',
  imports: [RouterLink],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly thumbnails = signal(new Map<string, string>());
  readonly mediumSizeImages = signal(new Map<string, string>());

  readonly featured: Collection[] = [
    {
      name: 'Dutch Masters',
      tagline: 'Rembrandt, Vermeer and their contemporaries — the golden age of Dutch painting, 1600–1700.',
      imageUrl: undefined,
      queryParams: { categoryName: 'Dutch Masters' },
      badge: 'Collection',
      filter: { type: 'category', categoryName: 'Dutch masters' },
    },
    {
      name: 'Winter Scenes',
      tagline: 'Frost, snow and still moments',
      imageUrl: undefined,
      queryParams: { attributeName: 'Winter' },
      filter: { type: 'attribute', attributeName: 'Winter' },
    },
    {
      name: 'Claude Monet',
      tagline: 'Father of Impressionism',
      imageUrl: undefined,
      queryParams: { attributeName: 'Claude Monet' },
      badge: '1840 – 1926',
      filter: { type: 'attribute', attributeName: 'Claude Monet' },
    },
  ];

  readonly starters: Collection[] = [
    {
      name: "Editor's Picks",
      tagline: 'Our favourite finds, chosen by the team',
      imageUrl: undefined,
      queryParams: { tags: String(ProductTags.OurPick) },
      badge: 'Staff Pick',
      filter: { type: 'tag', tags: ProductTags.OurPick },
    },
    {
      name: 'In the Spotlight',
      tagline: 'The prints everyone is looking at',
      imageUrl: undefined,
      queryParams: { tags: String(ProductTags.Featured) },
      badge: 'Trending',
      filter: { type: 'tag', tags: ProductTags.Featured },
    },
    {
      name: 'Timeless Classics',
      tagline: 'Art that never goes out of style',
      imageUrl: undefined,
      badge: 'Classics',
      queryParams: { attributeName: 'Classics' },
      filter: { type: 'attribute', attributeName: 'Classics' },
    },
    {
      name: 'Dutch Masters',
      tagline: 'The golden era of Dutch painting',
      imageUrl: undefined,
      queryParams: { categoryName: 'Dutch Masters' },
      badge: 'Collection',
      filter: { type: 'category', categoryName: 'Dutch masters' },
    },
    {
      name: 'Van Gogh Collection',
      tagline: 'Bold strokes, vivid colour',
      imageUrl: undefined,
      queryParams: { attributeName: 'Vincent van Gogh' },
      badge: 'Fan Favourite',
      filter: { type: 'attribute', attributeName: 'Vincent van Gogh' },
    },
  ];

  readonly museums: Collection[] = [
    {
      name: 'Rijksmuseum Highlights',
      tagline: 'Dutch golden age masterpieces',
      imageUrl: undefined,
      queryParams: { attributeName: 'Rijksmuseum' },
      badge: 'Amsterdam',
      filter: { type: 'attribute', attributeName: 'Rijksmuseum' },
    },
    {
      name: 'The Met Collection',
      tagline: '5,000 years of art history',
      imageUrl: undefined,
      queryParams: { attributeName: 'Metropolitan Museum of Art' },
      badge: 'New York',
      filter: { type: 'attribute', attributeName: 'Metropolitan Museum of Art' },
    },
    {
      name: 'National Gallery Picks',
      tagline: 'European masters since 1824',
      imageUrl: undefined,
      queryParams: { attributeName: 'National Gallery, London' },
      badge: 'London',
      filter: { type: 'attribute', attributeName: 'National Gallery, London' },
    },
    {
      name: 'Cleveland Museum of Art Picks',
      tagline: 'World-class collection since 1913',
      imageUrl: undefined,
      queryParams: { attributeName: 'Cleveland Museum of Art' },
      badge: 'Cleveland',
      filter: { type: 'attribute', attributeName: 'Cleveland Museum of Art' },
    },
    {
      name: 'Clark Art Institute',
      tagline: 'Two million years of history',
      imageUrl: undefined,
      queryParams: { attributeName: 'Clark Art Institute' },
      badge: 'Williamstown',
      filter: { type: 'attribute', attributeName: 'Clark Art Institute' },
    },
    {
      name: "Musée d'Orsay Corner",
      tagline: 'The home of Impressionism',
      imageUrl: undefined,
      queryParams: { attributeName: "Musée d'Orsay" },
      badge: 'Paris',
      filter: { type: 'attribute', attributeName: "Musée d'Orsay" },
    },
    {
      name: 'Yale Art Collection',
      tagline: 'Three centuries of American art',
      imageUrl: undefined,
      queryParams: { attributeName: 'Yale University Art Gallery' },
      badge: 'New Haven',
      filter: { type: 'attribute', attributeName: 'Yale University Art Gallery' },
    },
  ];

  readonly scenes: Collection[] = [
    {
      name: 'Alpine Peaks & Valleys',
      tagline: 'Where the air is crisp and clear',
      imageUrl: undefined,
      queryParams: { attributeName: 'Alps' },
      filter: { type: 'attribute', attributeName: 'Alps' },
    },
    {
      name: 'Landscapes',
      tagline: 'Wide horizons and open skies',
      imageUrl: undefined,
      queryParams: { categoryName: 'Landscape' },
      filter: { type: 'category', categoryName: 'Landscape' },
    },
    {
      name: 'Forest & Countryside',
      tagline: 'Quiet paths and dappled light',
      imageUrl: undefined,
      queryParams: { attributeName: 'Forest&Countryside' },
      filter: { type: 'attribute', attributeName: 'Forest&Countryside' },
    },
    {
      name: 'Winter Scenes',
      tagline: 'Frost, snow and still moments',
      imageUrl: undefined,
      queryParams: { attributeName: 'Winter' },
      filter: { type: 'attribute', attributeName: 'Winter' },
    },
    {
      name: 'Cities in Art',
      tagline: 'Urban life captured in paint',
      imageUrl: undefined,
      queryParams: { categoryName: 'Cityscapes & Architecture' },
      filter: { type: 'category', categoryName: 'Cityscapes & Architecture' },
    },
    {
      name: 'Botanical Art',
      tagline: 'Colour, life and quiet beauty',
      imageUrl: undefined,
      queryParams: { categoryName: 'Botanical art' },
      filter: { type: 'category', categoryName: 'Botanical art' },
    },
  ];

  readonly styles: Collection[] = [
    {
      name: 'Renaissance',
      tagline: 'The rebirth of art and humanism',
      imageUrl: undefined,
      queryParams: { attributeName: 'Renaissance' },
      badge: 'c. 1400s',
      filter: { type: 'attribute', attributeName: 'Renaissance' },
    },
    {
      name: 'Romanticism',
      tagline: 'Emotion, nature and sublime drama',
      imageUrl: undefined,
      queryParams: { attributeName: 'Romanticism' },
      badge: 'c. 1800',
      filter: { type: 'attribute', attributeName: 'Romanticism' },
    },
    {
      name: 'Impressionism',
      tagline: 'Light, colour and the fleeting moment',
      imageUrl: undefined,
      queryParams: { attributeName: 'Impressionism' },
      badge: 'c. 1870s',
      filter: { type: 'attribute', attributeName: 'Impressionism' },
    },
    {
      name: 'Post-Impressionism',
      tagline: 'Beyond the visible — into the felt',
      imageUrl: undefined,
      queryParams: { attributeName: 'Post-Impressionism' },
      badge: 'c. 1880s',
      filter: { type: 'attribute', attributeName: 'Post-Impressionism' },
    },
    {
      name: 'Realism',
      tagline: 'Life as it truly is — without pretence',
      imageUrl: undefined,
      queryParams: { attributeName: 'Realism' },
      badge: 'c. 1850s',
      filter: { type: 'attribute', attributeName: 'Realism' },
    },
    {
      name: 'Art Nouveau',
      tagline: "Nature's curves in art and design",
      imageUrl: undefined,
      queryParams: { attributeName: 'Art Nouveau' },
      badge: 'c. 1890s',
      filter: { type: 'attribute', attributeName: 'Art Nouveau' },
    },
  ];

  readonly painters: Collection[] = [
    {
      name: 'Claude Monet',
      tagline: 'Father of Impressionism',
      imageUrl: undefined,
      queryParams: { attributeName: 'Claude Monet' },
      badge: '1840 – 1926',
      filter: { type: 'attribute', attributeName: 'Claude Monet' },
    },
    {
      name: 'Vincent van Gogh',
      tagline: 'Post-Impressionist visionary',
      imageUrl: undefined,
      queryParams: { attributeName: 'Vincent van Gogh' },
      badge: '1853 – 1890',
      filter: { type: 'attribute', attributeName: 'Vincent van Gogh' },
    },
    {
      name: 'Camille Pissarro',
      tagline: 'Gentle giant of Impressionism',
      imageUrl: undefined,
      queryParams: { attributeName: 'Camille Pissarro' },
      badge: '1830 – 1903',
      filter: { type: 'attribute', attributeName: 'Camille Pissarro' },
    },
    {
      name: 'Alfred Sisley',
      tagline: 'The quiet Impressionist',
      imageUrl: undefined,
      queryParams: { attributeName: 'Alfred Sisley' },
      badge: '1839 – 1899',
      filter: { type: 'attribute', attributeName: 'Alfred Sisley' },
    },
    {
      name: 'Pierre-Auguste Renoir',
      tagline: 'Joy and beauty in every stroke',
      imageUrl: undefined,
      queryParams: { attributeName: 'Pierre-Auguste Renoir' },
      badge: '1841 – 1919',
      filter: { type: 'attribute', attributeName: 'Pierre-Auguste Renoir' },
    },
    {
      name: 'J.M.W. Turner',
      tagline: 'The painter of light',
      imageUrl: undefined,
      queryParams: { attributeName: 'J.M.W. Turner' },
      badge: '1775 – 1851',
      filter: { type: 'attribute', attributeName: 'J. M. W. Turner' },
    },
    {
      name: 'John Singer Sargent',
      tagline: 'The greatest portrait painter',
      imageUrl: undefined,
      queryParams: { attributeName: 'John Singer Sargent' },
      badge: '1856 – 1925',
      filter: { type: 'attribute', attributeName: 'John Singer Sargent' },
    },
  ];

  scrollTo(id: string, event: Event) {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  ngOnInit() {
    const all = [...this.starters, ...this.museums, ...this.scenes, ...this.painters, ...this.styles, ...this.featured];
    const requests = all
      .filter((c): c is Collection & { filter: CollectionFilter } => !!c.filter)
      .map((c) =>
        this.apiService.getFilteredProducts(this.toFilterBody(c.filter)).pipe(
          map((res) => ({ name: c.name, url: res?.data?.[0]?.image?.medium, urlMedium: res?.data?.[0]?.image?.large })),
          catchError(() => of({ name: c.name, url: undefined as string | undefined, urlMedium: undefined as string | undefined })),
        ),
      );

    if (requests.length === 0) return;

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((results) => {
        const map = new Map<string, string>();
        const mapForMediumImages = new Map<string, string>();
        for (const r of results) {
          if (r.url) map.set(r.name, r.url);
          if (r.urlMedium) mapForMediumImages.set(r.name, r.urlMedium);
        }
        this.thumbnails.set(map);
        this.mediumSizeImages.set(mapForMediumImages);
      });
  }

  private toFilterBody(filter: CollectionFilter): ProductFilterRequestDto {
    const base: ProductFilterRequestDto = { pageSize: 1, pageIndex: 0 };
    switch (filter.type) {
      case 'tag':
        return { ...base, tags: filter.tags };
      case 'category':
        return { ...base, categoryName: filter.categoryName };
      case 'attribute':
        return { ...base, attributeName: filter.attributeName };
    }
  }
}
