import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { ProductDto } from '../../models/product';
import { ApiService, PriceTableRow } from '../../services/api/api.service';
import { Bootstrap } from '../../services/bootstrap/bootstrap';
import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { TranslationService } from '../../services/i18n/translation.service';
import { LanguageService } from '../../services/i18n/language.service';
import { SeoService } from '../../services/seo/seo.service';
import { SizeOptions } from '../../shared/constants';

/** Your design: what a print of your own image costs, and the questions people ask before ordering one */
@Component({
  selector: 'app-custom-design-prices',
  imports: [TranslatePipe],
  templateUrl: './custom-design-prices.component.html',
})
export class CustomDesignPricesComponent {
  private readonly api = inject(ApiService);
  private readonly bootstrap = inject(Bootstrap);
  private readonly i18n = inject(TranslationService);
  private readonly seo = inject(SeoService);

  private readonly dutch = inject(LanguageService).currentLanguageCode() === 'nl';

  product = input.required<ProductDto>();
  rows = signal<PriceTableRow[]>([]);

  private readonly zone = computed(() => this.bootstrap.shippingInfo()?.zones.find((z) => z.countries.includes('NL')));
  freeFrom = computed(() => this.zone()?.freeShippingFrom ?? null);

  faq = computed(() => {
    const rows = this.rows();
    if (!rows.length) return [];
    const euro = (value: number) => this.euro(value);
    const last = rows[rows.length - 1];
    const days = this.bootstrap.shippingInfo()?.deliveryDays;
    const params = { from: euro(rows[0].poster), cottonFrom: euro(rows[0].cotton), largest: last.size.replace('x', ' × '), largestPrice: euro(last.cotton), days: days ?? '' };
    const keys = ['cost', 'resolution', 'files', 'process', 'paper', ...(days ? ['delivery'] : []), 'privacy'];
    return keys.map((key) => ({ q: this.i18n.t(`designPrices.faq.${key}Q`, params), a: this.i18n.t(`designPrices.faq.${key}A`, params) }));
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

  /** The page's own title and description stay; the questions and answers go in as FAQ data */
  private describeForSearch() {
    this.seo.setPage({
      title: this.i18n.t('seo.yourDesign.title'),
      description: this.i18n.t('seo.yourDesign.description'),
      structuredData: [
        {
          '@type': 'FAQPage',
          mainEntity: this.faq().map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
        },
      ],
    });
  }
}
