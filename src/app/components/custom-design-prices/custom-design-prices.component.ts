import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ProductDto } from '../../models/product';
import { ApiService, PriceTableRow } from '../../services/api/api.service';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { LanguageService } from '../../services/i18n/language.service';
import { SeoService } from '../../services/seo/seo.service';
import { SizeOptions } from '../../shared/constants';
import { RouterLink } from '@angular/router';
import { paperPath } from '../../papers/papers';
import { environment } from '../../../environments/environment';

/** The size whose price the first answer spells out, besides the smallest and the largest */
const MID_SIZE = '50x70';
const PERKS = ['proof', 'shipping', 'pickup', 'made'] as const;

/** Your design: what a print of your own image costs, and the questions people ask before ordering one */
@Component({
  selector: 'app-custom-design-prices',
  imports: [TranslatePipe, RouterLink],
  templateUrl: './custom-design-prices.component.html',
})
export class CustomDesignPricesComponent {
  private readonly api = inject(ApiService);
  private readonly bootstrap = inject(Bootstrap);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);

  private readonly language = inject(LanguageService).currentLanguageCode();
  private readonly dutch = this.language === 'nl';

  /** The router adds the language itself */
  readonly papersLink = paperPath(this.language);

  product = input.required<ProductDto>();
  rows = signal<PriceTableRow[]>([]);

  private readonly zone = computed(() => this.bootstrap.shippingInfo()?.zones.find((z) => z.countries.includes('NL')));
  freeFrom = computed(() => this.zone()?.freeShippingFrom ?? null);

  /** What sets the studio apart, above the prices; free shipping only when the shop offers it */
  perks = computed(() => {
    const free = this.freeFrom();
    const amount = free ? this.euro(free, 0) : '';
    return PERKS.filter((key) => key !== 'shipping' || free).map((key) => this.i18n.t(`designPrices.perks.${key}`, { amount }));
  });

  faq = computed(() => {
    const rows = this.rows();
    if (!rows.length) return [];
    const euro = (value: number) => this.euro(value);
    const last = rows[rows.length - 1];
    const days = this.bootstrap.shippingInfo()?.deliveryDays;
    const params = { from: euro(rows[0].poster), cottonFrom: euro(rows[0].cotton), largest: last.size.replace('x', ' × '), largestPrice: euro(last.cotton), days: days ?? '' };
    const keys = ['cost', 'resolution', 'files', 'process', 'paper', ...(days ? ['delivery'] : []), 'pickup', 'privacy'];
    const mid = rows.find((row) => row.size === MID_SIZE);
    const costMid = mid
      ? ` ${this.i18n.t('designPrices.faq.costMid', { mid: mid.size.replace('x', ' × '), midPoster: euro(mid.poster), midCotton: euro(mid.cotton) })}`
      : '';
    // What shipping within the Netherlands costs, after the delivery time
    const zone = this.zone();
    const deliveryCost = zone
      ? ` ${this.i18n.t(zone.freeShippingFrom != null ? 'designPrices.faq.deliveryCostFree' : 'designPrices.faq.deliveryCost', { rate: euro(zone.rate), free: zone.freeShippingFrom != null ? this.euro(zone.freeShippingFrom, 0) : '' })}`
      : '';
    const extra: Record<string, string> = { cost: costMid, delivery: deliveryCost };
    return keys.map((key) => ({
      q: this.i18n.t(`designPrices.faq.${key}Q`, params),
      a: this.i18n.t(`designPrices.faq.${key}A`, params) + (extra[key] ?? ''),
    }));
  });

  /** Euros the way the reader writes them: €10,16 in Dutch, €10.16 in English */
  euro(value: number, digits = 2): string {
    // Rounded like the currency pipe in the cart (40.305 → 40.31), not like toFixed
    const text = new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false }).format(value);
    return `€${this.dutch ? text.replace('.', ',') : text}`;
  }

  private readonly load = effect(() => {
    const product = this.product();
    if (!product?.id) return;
    untracked(() =>
      this.api.getPriceTable(product, SizeOptions).subscribe((rows) => {
        this.rows.set(rows);
        this.describeForSearch();
      }),
    );
  });

  /** The page's own title and description stay; every size and paper goes in as an offer, the questions and answers as FAQ data */
  private describeForSearch() {
    const url = this.seo.absoluteUrl(this.language, '/your-design');
    // Rounded like the prices on the page
    const amount = (value: number) => this.euro(value).replace('€', '').replace(',', '.');
    const offers = this.rows().flatMap((row) =>
      [
        { paper: 'Premium Poster', price: row.poster },
        { paper: 'Hahnemühle Photo Rag', price: row.cotton },
      ].map(({ paper, price }) => ({
        '@type': 'Offer',
        name: `${row.size.replace('x', ' × ')} cm – ${paper}`,
        price: amount(price),
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        url,
      })),
    );
    const prices = offers.map((offer) => Number(offer.price));
    this.seo.setPage({
      title: this.i18n.t('seo.yourDesign.title'),
      description: this.i18n.t('seo.yourDesign.description'),
      structuredData: [
        {
          '@type': 'Product',
          name: this.i18n.t('designPrices.productName'),
          description: this.i18n.t('seo.yourDesign.description'),
          image: `${environment.siteUrl}/share.jpg`,
          url,
          brand: { '@type': 'Brand', name: 'PrintMeArt' },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'EUR',
            lowPrice: amount(Math.min(...prices)),
            highPrice: amount(Math.max(...prices)),
            offerCount: offers.length,
            offers,
          },
        },
        {
          '@type': 'FAQPage',
          mainEntity: this.faq().map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
    });
  }
}
