import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, first } from 'rxjs';
import { ProductDto, ProductImageDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [DecimalPipe],
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

  hasAllOptionsSelected = computed(
    () =>
      this.product().optionGroups?.length > 0 &&
      this.product().optionGroups.every(
        (group) => group.selectedOptionId !== undefined
      )
  );

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
    super();
  }

  ngOnInit() {
    this.route.paramMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.productId = params.get('productId') || '';
        this.fetchProducts();
      });
  }

  fetchProducts() {
    this.apiService
      .getProductById(this.productId)
      .pipe(first())
      .subscribe((product) => {
        if (product) {
          this.product.set(product);
        }
      });
  }

  selectOption(groupIndex: number, optionId: number) {
    this.product.update((currentProduct) => {
      const updatedGroups = currentProduct.optionGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }
        return {
          ...group,
          selectedOptionId:
            group.selectedOptionId === optionId ? undefined : optionId,
        };
      });
      return { ...currentProduct, optionGroups: updatedGroups };
    });
    this.updatePrice();
  }

  updatePrice() {
    if (!this.hasAllOptionsSelected()) {
      return;
    }

    const selectedOptions = this.product().optionGroups.map((group) => ({
      id: group.selectedOptionId!,
    }));

    this.apiService
      .calculatePrice(this.productId, selectedOptions)
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.calculatedPrice.set(response);
        },
        error: (error) => {
          console.error('Error fetching calculated price:', error);
        },
      });
  }
}
