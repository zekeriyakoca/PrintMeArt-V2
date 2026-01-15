import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';

import { ImageGallery1Component } from '../../components/image-gallery-1/image-gallery-1.component';
import { ProductPurchaseSidebarComponent } from '../../components/product-purchase-sidebar/product-purchase-sidebar.component';
import { AccordionInfoComponent } from '../../components/accordion-info/accordion-info.component';
import { AccordionItem } from '../../models/accordion-item';
import { PolicyComponent } from '../../components/policy/policy.component';
import { RelatedProductsComponent } from '../../components/related-products/related-products.component';
import { MUSEUMS, Museum } from '../../data/museums';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    ImageGallery1Component,
    ProductPurchaseSidebarComponent,
    AccordionInfoComponent,
    PolicyComponent,
    RelatedProductsComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent
  extends BasePageComponent
  implements OnInit
{
  productId: string = '';
  product = signal<ProductDto>({} as ProductDto);
  calculatedPrice = signal<number>(0);
  quantity = signal<number>(1);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {
    super();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.productId = params.get('productId') || '';
        this.fetchProduct();
      });
  }
  museum = computed<Museum | null>(() => {
    const attributes = this.product().attributes;
    if (!attributes || attributes.length === 0) {
      return null;
    }

    for (const museum of MUSEUMS) {
      const foundAttribute = attributes.find((attr) =>
        attr.toLowerCase().includes(museum.name),
      );
      if (foundAttribute) {
        return museum;
      }
    }

    return null;
  });

  productAccordionData = computed(() => {
    const sourceUrl = this.product().sourceUrl;
    const creditLine = this.product().creditLine || '—';

    const rightsContent = `
      <div class="space-y-4">
        <div>
          <span class="font-medium text-slate-700">License</span>
          <p class="text-slate-600">Public Domain / CC0 (when available)</p>
        </div>
        <div>
          <span class="font-medium text-slate-700">Source</span>
          <p class="text-slate-600">We always link the original museum/collection page for full transparency.</p>
          ${sourceUrl ? `<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-cyan-600 hover:text-cyan-700 underline text-sm">View original source →</a>` : '<span class="text-slate-400 text-sm">Source link not available</span>'}
        </div>
        <div>
          <span class="font-medium text-slate-700">Credit</span>
          <p class="text-slate-600">${creditLine}</p>
        </div>
        <div class="pt-2 border-t border-slate-100">
          <p class="text-slate-500 text-sm italic">Just to be clear: museums and collections don't sponsor us — we simply love great art and carefully curate public-domain pieces for printing.</p>
        </div>
        <div>
          <span class="font-medium text-slate-700">Spotted something wrong?</span>
          <p class="text-slate-600 text-sm">Tell us at <a href="mailto:support@printmeart.nl" class="text-cyan-600 hover:text-cyan-700">support@printmeart.nl</a> and we'll check it fast.</p>
        </div>
      </div>
    `;

    return [
      {
        name: 'Description',
        content: this.product().description || 'No description available.',
      },
      {
        name: 'Rights & Source',
        content: rightsContent,
      },
    ] as AccordionItem[];
  });

  fetchProduct() {
    this.apiService.getProductById(this.productId).subscribe((product) => {
      if (product) {
        this.product.set(product);
      }
    });
  }
}
