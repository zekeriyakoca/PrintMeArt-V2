import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CUSTOM_PRINT_PRODUCT_ID, PAPER_PAGES, PaperPage, paperBySlug, paperName, paperPath, paperText } from '../../papers/papers';
import { ApiService, PriceTableRow } from '../../services/api/api.service';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { SeoService } from '../../services/seo/seo.service';
import { SizeOptions } from '../../shared/constants';
import { BasePageComponent } from '../basePageComponent';
import { NotFoundComponent } from '../not-found/not-found.component';

/** One paper: /nl/papier/hahnemuhle-photo-rag, /en/paper/hahnemuhle-photo-rag */
@Component({
  selector: 'app-paper',
  imports: [RouterLink, TranslatePipe, NotFoundComponent],
  templateUrl: './paper.component.html',
  styleUrl: '../guide/guide.component.scss',
})
export class PaperComponent extends BasePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);
  readonly language = inject(LanguageService).currentLanguageCode();

  paper = signal<PaperPage | null>(null);
  text = computed(() => {
    const paper = this.paper();
    return paper ? paperText(paper, this.language) : null;
  });
  fullName = computed(() => paperName(this.paper()));
  status = computed(() => statusKey(this.paper()));
  orderable = computed(() => orderable(this.paper()));
  /** Size and price of a print of your own image on this paper */
  prices = signal<{ size: string; price: string }[]>([]);
  others = computed(() =>
    PAPER_PAGES.filter((p) => p !== this.paper()).map((p) => ({ name: paperName(p), kind: paperText(p, this.language).kind, weight: p.weightGsm, link: this.link(p.slug) })),
  );
  readonly indexLink = this.link();

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const paper = paperBySlug(params.get('slug') ?? '') ?? null;
      this.paper.set(paper);
      this.prices.set([]);
      if (!paper) return;
      this.describeForSearch(paper);
      this.loadPrices(paper, paper.price);
    });
  }

  /** The router adds the language itself */
  link(slug?: string): string {
    return paperPath(this.language, slug);
  }

  /** Links inside the text stay in the app instead of reloading the page */
  follow(event: MouseEvent) {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (!href?.startsWith('/') || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    // The links in the text carry the language ('/nl/papier/…'); the router adds it itself
    this.router.navigateByUrl(href.replace(/^\/(nl|en)(?=\/|$)/, '') || '/');
  }

  private loadPrices(paper: PaperPage, column: 'poster' | 'cotton') {
    this.api.getProductById(CUSTOM_PRINT_PRODUCT_ID.toString()).subscribe((product) => {
      if (!product) return;
      this.api.getPriceTable(product, SizeOptions).subscribe((rows: PriceTableRow[]) => {
        // The answer of a paper the visitor has already left is dropped
        if (this.paper() !== paper) return;
        this.prices.set(rows.map((row) => ({ size: `${row.size.replace('x', ' × ')} cm`, price: this.euro(row[column]) })));
        this.describeForSearch(paper, rows.map((row) => ({ size: row.size.replace('x', ' × '), price: row[column] })));
      });
    });
  }

  /** Euros the way the reader writes them: €10,16 in Dutch, €10.16 in English */
  private euro(value: number): string {
    const text = this.amount(value);
    return `€${this.language === 'nl' ? text.replace('.', ',') : text}`;
  }

  /** Rounded like the currency pipe in the cart (40.305 → 40.31), not like toFixed */
  private amount(value: number): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(value);
  }

  private describeForSearch(paper: PaperPage, prices: { size: string; price: number }[] = []) {
    const text = paperText(paper, this.language);
    const path = paperPath(this.language, paper.slug);
    const url = this.seo.absoluteUrl(this.language, path);
    const order = this.seo.absoluteUrl(this.language, '/your-design');
    const amounts = prices.map((p) => Number(this.amount(p.price)));
    this.seo.setPage({
      title: text.title,
      description: text.description,
      path,
      paths: { nl: paperPath('nl', paper.slug), en: paperPath('en', paper.slug) },
      image: paper.image,
      structuredData: [
        {
          '@type': 'Product',
          name: this.i18n.t('paperPages.productName', { paper: paperName(paper) }),
          description: text.description,
          image: paper.image ?? `${environment.siteUrl}/share.jpg`,
          url,
          brand: { '@type': 'Brand', name: 'PrintMeArt' },
          material: `${paperName(paper)}, ${paper.weightGsm} g/m²`,
          additionalProperty: text.specs.map(([name, value]) => ({ '@type': 'PropertyValue', name, value })),
          // Only a paper in the order menu is offered for sale
          ...(prices.length && orderable(paper)
            ? {
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'EUR',
                  lowPrice: this.amount(Math.min(...amounts)),
                  highPrice: this.amount(Math.max(...amounts)),
                  offerCount: prices.length,
                  offers: prices.map((p) => ({
                    '@type': 'Offer',
                    name: `${p.size} cm`,
                    price: this.amount(p.price),
                    priceCurrency: 'EUR',
                    availability: 'https://schema.org/InStock',
                    url: order,
                  })),
                },
              }
            : {}),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'PrintMeArt', item: this.seo.absoluteUrl(this.language, '/') },
            { '@type': 'ListItem', position: 2, name: this.i18n.t('paperPages.title'), item: this.seo.absoluteUrl(this.language, paperPath(this.language)) },
            { '@type': 'ListItem', position: 3, name: paperName(paper), item: url },
          ],
        },
      ],
    });
  }
}

/** In the order menu today */
export function orderable(paper: PaperPage | null): boolean {
  return !!paper && !paper.soon && !paper.onRequest;
}

/** Whether the paper can be ordered in the shop, by email, or not yet */
export function statusKey(paper: PaperPage | null): string {
  return paper?.soon ? 'paperPages.soon' : paper?.onRequest ? 'paperPages.onRequest' : 'paperPages.available';
}
