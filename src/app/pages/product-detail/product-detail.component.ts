import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';

import { ImageGallery1Component } from '../../components/image-gallery-1/image-gallery-1.component';
import { ImageGallery2Component } from '../../components/image-gallery-2/image-gallery-2.component';
import { ProductPurchaseSidebarComponent } from '../../components/product-purchase-sidebar/product-purchase-sidebar.component';
import { AccordionInfoComponent } from '../../components/accordion-info/accordion-info.component';
import { AccordionItem } from '../../models/accordion-item';
import { PolicyComponent } from '../../components/policy/policy.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { MUSEUMS, Museum } from '../../data/museums';
import { AnalyticsService } from '../../services/telemetry/analytics.service';
import { LanguageService } from '../../services/i18n/language.service';
import { TranslationService } from '../../services/i18n/translation.service';

const ARTIST_GROUP = 'Artist';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [TranslatePipe, RouterLink, ImageGallery1Component, ImageGallery2Component, ProductPurchaseSidebarComponent, AccordionInfoComponent, PolicyComponent, RelatedProductsComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent extends BasePageComponent implements OnInit {
  private readonly dutch = inject(LanguageService).currentLanguageCode() === 'nl';
  private readonly i18n = inject(TranslationService);
  productId: string = '';
  product = signal<ProductDto>({} as ProductDto);
  calculatedPrice = signal<number>(0);
  quantity = signal<number>(1);

  isProductHorizontal = computed(() => {
    if (this.product()?.metadata?.OriginalImageWidth == null) {
      return false;
    }
    return +this.product().metadata.OriginalImageWidth > +this.product().metadata.OriginalImageHeight;
  });

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private analytics: AnalyticsService,
  ) {
    super();
  }

  ngOnInit() {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      this.productId = params.get('productId') || '';
      this.fetchProduct();
    });
  }
  // The museum-based story where we have one (in Dutch on /nl when written), otherwise the short product description
  storyParagraphs = computed(() => {
    const metadata = this.product().metadata;
    return ((this.dutch && metadata?.Story_nl) || metadata?.Story || this.product().description || '').split('\n\n');
  });

  artistBio = computed(() => {
    const artist = this.product().attributeDetails?.find((a) => a.group === ARTIST_GROUP);
    return (this.dutch && artist?.metadata?.['Description_nl']) || artist?.description;
  });

  // Story starts collapsed to two lines; the artist bio is only shown when expanded
  storyExpanded = signal(false);
  hasMoreStory = computed(() => this.storyParagraphs().length > 1 || !!this.artistBio() || this.storyParagraphs()[0].length > 160);

  museum = computed<Museum | null>(() => {
    const attributes = this.product().attributes;
    if (!attributes || attributes.length === 0) {
      return null;
    }

    for (const museum of MUSEUMS) {
      const foundAttribute = attributes.find((attr) => attr.toLowerCase().includes(museum.name.toLowerCase()));
      if (foundAttribute) {
        return museum;
      }
    }

    return null;
  });

  productAccordionData = computed(() => {
    const sourceUrl = this.product().sourceUrl;
    const { CreditLine, ObjectNumber } = this.product().metadata ?? {};
    const creditLine = [CreditLine ?? this.product().creditLine, ObjectNumber].filter(Boolean).join(' · ') || '—';

    const rightsContent = `
      <div class="space-y-4">
        <div>
          <span class="font-medium text-slate-700">${this.i18n.t('rights.license')}</span>
          <p class="text-slate-600">${this.i18n.t('rights.licenseText')}</p>
        </div>
        <div>
          <span class="font-medium text-slate-700">${this.i18n.t('rights.source')}</span>
          <p class="text-slate-600">${this.i18n.t('rights.sourceText')}</p>
          ${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-cyan-600 hover:text-cyan-700 underline text-sm">${this.i18n.t('rights.viewSource')}</a>` : `<span class="text-slate-400 text-sm">${this.i18n.t('rights.noSource')}</span>`}
        </div>
        <div>
          <span class="font-medium text-slate-700">${this.i18n.t('rights.credit')}</span>
          <p class="text-slate-600">${creditLine}</p>
        </div>
        <div class="pt-2 border-t border-slate-100">
          <p class="text-slate-500 text-sm italic">${this.i18n.t('rights.notSponsored')}</p>
        </div>
        <div>
          <span class="font-medium text-slate-700">${this.i18n.t('rights.spotted')}</span>
          <p class="text-slate-600 text-sm">${this.i18n.t('rights.tellUs', { email: '<a href="mailto:support@printmeart.nl" class="text-cyan-600 hover:text-cyan-700">support@printmeart.nl</a>' })}</p>
        </div>
      </div>
    `;

    return [
      {
        name: this.i18n.t('rights.description'),
        content: this.product().description || this.i18n.t('rights.noDescription'),
      },
      {
        name: this.i18n.t('rights.title'),
        content: rightsContent,
      },
    ] as AccordionItem[];
  });

  fetchProduct() {
    this.apiService.getProductById(this.productId).subscribe((product) => {
      if (product) {
        this.product.set(product);
        this.storyExpanded.set(false);
        this.analytics.trackProductViewed(product);
      }
    });
  }
}
