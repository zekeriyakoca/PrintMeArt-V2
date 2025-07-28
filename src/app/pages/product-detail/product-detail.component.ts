import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, first } from 'rxjs';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';
import { CommonModule } from '@angular/common';
import { ImageGallery1Component } from '../../components/image-gallery-1/image-gallery-1.component';
import { ProductPurchaseSidebarComponent } from '../../components/product-purchase-sidebar/product-purchase-sidebar.component';
import { AccordionInfoComponent } from '../../components/accordion-info/accordion-info.component';
import { AccordionItem } from '../../models/accordion-item';
import { PolicyComponent } from '../../components/policy/policy.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ImageGallery1Component,
    ProductPurchaseSidebarComponent,
    AccordionInfoComponent,
    PolicyComponent,
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
  private variantId: number = 1;

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

  productAccordionData = computed(() => {
    return [
      {
        name: 'Title',
        content: this.product().title || 'No title available.',
      },
      {
        name: 'Description',
        content: this.product().description || 'No description available.',
      },
    ] as AccordionItem[];
  });

  fetchProduct() {
    this.apiService
      .getProductById(this.productId)
      .pipe(first())
      .subscribe((product) => {
        if (product) {
          this.product.set(product);
        }
      });
  }
}
