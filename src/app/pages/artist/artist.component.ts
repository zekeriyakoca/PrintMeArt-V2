import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ArtistDetailDto, ArtistSummaryDto, ArtistWorkDto } from '../../models/artist';
import { ApiService } from '../../services/api/api.service';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService, summary } from '../../services/seo/seo.service';
import { artistPath, MIN_INDEXED_WORKS } from '../../shared/artist-path';
import { productPath } from '../../shared/product-path';
import { environment } from '../../../environments/environment';
import { BasePageComponent } from '../basePageComponent';
import { INTRO_IMAGES } from '../../shared/intro-images';
import { NotFoundComponent } from '../not-found/not-found.component';

/** The technique groups the catalogue can be filtered on, recognised in the museum's medium text */
const TECHNIQUES: { key: string; pattern: RegExp }[] = [
  { key: 'watercolour', pattern: /watercolou?r|aquarel|gouache/i },
  { key: 'oil', pattern: /\boil\b|olieverf/i },
  { key: 'print', pattern: /etching|engraving|lithograph|woodblock|woodcut|aquatint|mezzotint|print/i },
  { key: 'drawing', pattern: /graphite|pencil|charcoal|chalk|pastel|ink|drawing/i },
];

/** How many works the catalogue shows before "show all" */
const FIRST_WORKS = 12;

export interface Work {
  product: ArtistWorkDto;
  path: string;
  year: string;
  technique: string;
  museum: string;
  city: string;
  dimensions: string;
  story: string[];
  image: string;
}

@Component({
  selector: 'app-artist',
  imports: [TranslatePipe, RouterLink, DecimalPipe, NotFoundComponent],
  templateUrl: './artist.component.html',
  styleUrl: './artist.component.scss',
})
export class ArtistComponent extends BasePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  private readonly bootstrap = inject(Bootstrap);
  readonly language = inject(LanguageService).currentLanguageCode();
  private readonly dutch = this.language === 'nl';

  artist = signal<ArtistDetailDto | null>(null);
  missing = signal(false);
  technique = signal<string>('all');
  showAll = signal(false);

  readonly indexPath = artistPath(this.language);
  readonly artistLink = (slug: string) => artistPath(this.language, slug);

  /** A fact in the page's language, falling back to the English value */
  fact = (key: string, artist: ArtistSummaryDto | null = this.artist()) =>
    (this.dutch && artist?.facts[`${key}_nl`]) || artist?.facts[key] || '';

  works = computed<Work[]>(() =>
    (this.artist()?.works ?? []).map((product) => {
      const m = product.metadata ?? {};
      const location = (m['Location'] ?? '').split(',');
      return {
        product,
        path: `/products/${productPath(product)}`,
        year: m['Date'] ?? '',
        technique: TECHNIQUES.find((t) => t.pattern.test(m['Medium'] ?? ''))?.key ?? '',
        museum: m['Museum'] ?? '',
        city: location.length > 1 ? location.slice(0, -1).join(',').trim() : '',
        dimensions: m['Dimensions'] ?? '',
        story: ((this.dutch && m['Story_nl']) || m['Story'] || '').split('\n\n').filter(Boolean),
        image: product.image?.medium || product.image?.small,
      };
    }),
  );

  count = computed(() => this.works().length);
  fromPrice = computed(() => Math.min(...this.works().map((w) => w.product.cheapestPrice).filter((p) => p > 0)));
  hasPrice = computed(() => Number.isFinite(this.fromPrice()));
  /** Small catalogues get a shorter page: one plate, no filters */
  size = computed(() => (this.count() >= 6 ? 'full' : this.count() >= 3 ? 'medium' : 'small'));

  /** The lead artwork: the editor's pick, otherwise the first in catalogue order */
  hero = computed(() => {
    const id = this.artist()?.facts['HeroProductId'];
    return this.works().find((w) => String(w.product.id) === id) ?? this.works()[0];
  });

  featured = computed(() => {
    const picks = (this.artist()?.facts['FeaturedProductIds'] ?? '').split(',').map((id) => id.trim());
    const chosen = picks.map((id) => this.works().find((w) => String(w.product.id) === id)).filter((w): w is Work => !!w);
    const withStory = this.works().filter((w) => w.story.length && !chosen.includes(w));
    const wanted = this.size() === 'full' ? 3 : this.size() === 'medium' ? 1 : this.count();
    return [...chosen, ...withStory].slice(0, wanted);
  });

  techniques = computed(() =>
    TECHNIQUES.map((t) => ({ key: t.key, count: this.works().filter((w) => w.technique === t.key).length })).filter((t) => t.count > 0),
  );
  showFilters = computed(() => this.size() === 'full' && this.techniques().length > 1);

  shown = computed(() => {
    const filtered = this.technique() === 'all' ? this.works() : this.works().filter((w) => w.technique === this.technique());
    return this.showAll() || this.technique() !== 'all' ? filtered : filtered.slice(0, FIRST_WORKS);
  });
  hiddenCount = computed(() => (this.technique() === 'all' && !this.showAll() ? Math.max(0, this.count() - FIRST_WORKS) : 0));

  museums = computed(() => {
    const byName = new Map<string, { name: string; city: string; count: number }>();
    for (const work of this.works()) {
      if (!work.museum) continue;
      const entry = byName.get(work.museum) ?? { name: work.museum, city: work.city, count: 0 };
      entry.count++;
      byName.set(work.museum, entry);
    }
    return [...byName.values()].sort((a, b) => b.count - a.count);
  });

  /** First and last year of the works, e.g. 1863–1909 */
  period = computed(() => {
    // One year per work (its first), and only years the artist was alive, so "19th century (1800s)" does not count
    const [born, died] = (this.lifeYears().match(/\d{4}/g) ?? []).map(Number);
    const years = this.works()
      .map((w) => Number(w.year.match(/\d{4}/)?.[0]))
      .filter((y) => y && (!born || !died || (y > born && y <= died)));
    if (!years.length) return '';
    const [first, last] = [Math.min(...years), Math.max(...years)];
    return first === last ? String(first) : `${first}–${last}`;
  });

  lifeYears = computed(() => {
    const born = this.artist()?.facts['BirthYear'];
    const died = this.artist()?.facts['DeathYear'];
    if (born && died) return `${born}–${died}`;
    return this.artist()?.description.match(/\((\d{4}[^)]*\d{4})\)/)?.[1] ?? '';
  });

  /** "Boston 1836 – Prouts Neck 1910" */
  lifeLine = computed(() => {
    const born = [this.fact('BirthPlace'), this.artist()?.facts['BirthYear']].filter(Boolean).join(' ');
    const died = [this.fact('DeathPlace'), this.artist()?.facts['DeathYear']].filter(Boolean).join(' ');
    return born && died ? `${born} – ${died}` : '';
  });

  /** The artist's portrait (160 px), where we have one */
  portrait = computed(() => INTRO_IMAGES[this.artist()?.name ?? '']);

  bio = computed(() => {
    const artist = this.artist();
    const text = ((this.dutch && artist?.descriptionNl) || artist?.description || '').trim();
    // Sentences are the lead and the rest; the first two read as the introduction
    const sentences = text.match(/[^.!?]+(?:[.!?](?=\s|$)|$)/g)?.map((s) => s.trim()) ?? [];
    return { lead: sentences.slice(0, 2).join(' '), rest: sentences.slice(2).join(' ') };
  });

  /** Names (first part of the H1) and surname (bold), as "Winslow *Homer*" */
  nameParts = computed(() => {
    const name = this.artist()?.name ?? '';
    const sort = this.artist()?.sortName ?? '';
    const at = sort ? name.lastIndexOf(sort) : -1;
    return at > 0 ? { first: name.slice(0, at).trim(), last: name.slice(at) } : { first: '', last: name };
  });

  shippingRate = computed(() => this.bootstrap.shippingInfo()?.zones.find((z) => z.countries.includes('NL'))?.rate ?? null);
  deliveryDays = computed(() => this.bootstrap.shippingInfo()?.deliveryDays ?? null);

  faq = computed(() => {
    const artist = this.artist();
    if (!artist) return [];
    const p = {
      name: artist.name,
      count: this.count(),
      price: this.money(this.fromPrice()),
      works: this.featured().concat(this.works()).filter((w, i, all) => all.indexOf(w) === i).slice(0, 4)
        .map((w) => (w.year ? `${w.product.name} (${w.year})` : w.product.name)).join(', '),
      museums: this.museums().map((m) => `${m.name} (${m.count})`).join(', '),
      died: artist.facts['DeathYear'] ?? '',
      days: this.deliveryDays() ?? '',
    };
    const items = [
      { q: this.i18n.t('artist.faq.whereQ', p), a: this.i18n.t('artist.faq.whereA', p) },
      { q: this.i18n.t('artist.faq.whichQ', p), a: this.i18n.t('artist.faq.whichA', p) },
      { q: this.i18n.t('artist.faq.sizesQ', p), a: this.i18n.t('artist.faq.sizesA', p) },
    ];
    if (p.died) items.push({ q: this.i18n.t('artist.faq.publicQ', p), a: this.i18n.t('artist.faq.publicA', p) });
    if (p.museums) items.push({ q: this.i18n.t('artist.faq.museumsQ', p), a: this.i18n.t('artist.faq.museumsA', p) });
    if (p.days) items.push({ q: this.i18n.t('artist.faq.deliveryQ', p), a: this.i18n.t('artist.faq.deliveryA', p) });
    return items;
  });

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.missing.set(false);
      this.technique.set('all');
      this.showAll.set(false);
      this.api.getArtist(slug).subscribe({
        next: (artist) => {
          this.artist.set(artist);
          this.describeForSearch(artist);
        },
        error: (error) => this.missing.set(error?.status === 404),
      });
    });
  }

  money(value: number): string {
    return Number.isFinite(value) ? `€ ${value.toFixed(2).replace('.', this.dutch ? ',' : '.')}` : '';
  }

  techniqueLabel(key: string): string {
    return key ? this.i18n.t(`artist.technique.${key}`) : '';
  }

  private describeForSearch(artist: ArtistDetailDto) {
    const path = artistPath(this.language, artist.slug);
    const url = this.seo.absoluteUrl(this.language, path);
    const params = { name: artist.name, count: this.count(), price: this.money(this.fromPrice()), years: this.lifeYears() };
    const description = summary(this.i18n.t('artist.seo.description', params));
    const image = this.hero()?.product.image?.large;
    const person = `${url}#artist`;

    this.seo.setPage({
      title: this.i18n.t('artist.seo.title', params),
      description,
      path,
      paths: { nl: artistPath('nl', artist.slug), en: artistPath('en', artist.slug) },
      image,
      noindex: this.count() < MIN_INDEXED_WORKS && artist.facts['Indexable'] !== 'true',
      structuredData: [
        {
          '@type': 'CollectionPage',
          '@id': `${url}#page`,
          url,
          name: this.i18n.t('artist.seo.title', params),
          description,
          inLanguage: this.language,
          about: { '@id': person },
          primaryImageOfPage: image,
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: this.count(),
            itemListElement: this.works().map((work, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: `${work.product.name} – ${artist.name}`,
                url: this.seo.absoluteUrl(this.language, work.path),
                image: work.product.image?.large,
                brand: { '@type': 'Brand', name: 'PrintMeArt' },
                offers: { '@type': 'Offer', price: work.product.cheapestPrice.toFixed(2), priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
              },
            })),
          },
        },
        {
          '@type': 'Person',
          '@id': person,
          name: artist.name,
          ...(artist.facts['BirthYear'] && { birthDate: artist.facts['BirthYear'] }),
          ...(artist.facts['DeathYear'] && { deathDate: artist.facts['DeathYear'] }),
          ...(artist.facts['BirthPlace'] && { birthPlace: { '@type': 'Place', name: artist.facts['BirthPlace'] } }),
          ...(artist.facts['DeathPlace'] && { deathPlace: { '@type': 'Place', name: artist.facts['DeathPlace'] } }),
          ...(artist.facts['Country'] && { nationality: { '@type': 'Country', name: artist.facts['Country'] } }),
          jobTitle: this.i18n.t('artist.painter'),
          description: summary(this.bio().lead, 300),
          image,
          sameAs: [
            artist.facts['WikidataId'] && `https://www.wikidata.org/wiki/${artist.facts['WikidataId']}`,
            artist.facts['Wikipedia'],
            artist.facts['Wikipedia_nl'],
          ].filter(Boolean),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'PrintMeArt', item: `${environment.siteUrl}/${this.language}` },
            { '@type': 'ListItem', position: 2, name: this.i18n.t('artist.index'), item: this.seo.absoluteUrl(this.language, this.indexPath) },
            { '@type': 'ListItem', position: 3, name: artist.name, item: url },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: this.faq().map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        },
      ],
    });
  }
}
