import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntil, first } from 'rxjs';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart/cart.service';
import { SelectedOptionDto } from '../../models/cart-item';
import { OptionsComponent } from '../../components/shared/options/options.component';
import { ImageGallery1Component } from '../../components/image-gallery-1/image-gallery-1.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, OptionsComponent, ImageGallery1Component],
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
    private cartService: CartService,
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

  hasAllOptionsSelected = computed(
    () =>
      this.product().optionGroups?.length > 0 &&
      this.product().optionGroups.every(
        (group) => group.selectedOptionId !== undefined,
      ),
  );

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
    this.calculatePrice();
  }

  setQuantity(change: number) {
    this.quantity.update((currentQuantity) => {
      const newQuantity = currentQuantity + change;
      return Math.max(newQuantity, 1);
    });
  }

  calculatePrice() {
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
          this.calculatedPrice.set(response.price);
          this.variantId = response.variantId;
        },
        error: (error) => {
          console.error('Error fetching calculated price:', error);
        },
      });
  }

  addToCart() {
    if (!this.hasAllOptionsSelected()) {
      return;
    }

    const selectedOptions: SelectedOptionDto[] =
      this.product().optionGroups.map((group) => ({
        optionId: group.selectedOptionId!,
        optionName:
          group.options.find((option) => option.id === group.selectedOptionId)
            ?.value || '',
      }));

    this.cartService.addItemToCart(
      +this.productId,
      this.variantId,
      this.product().name,
      this.product().cheapestPrice,
      this.calculatedPrice(),
      this.quantity(),
      this.product().images[0].original,
      selectedOptions,
    );
  }
}
