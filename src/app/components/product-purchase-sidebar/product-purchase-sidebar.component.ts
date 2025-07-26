import { Component, computed, input, model, signal } from '@angular/core';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { CartService } from '../../services/cart/cart.service';
import { BasePageComponent } from '../../pages/basePageComponent';
import { SelectedOptionDto } from '../../models/cart-item';
import { first } from 'rxjs';
import { OptionsComponent } from '../shared/options/options.component';
import { CommonModule } from '@angular/common';
import { FrameOptionsComponent } from '../frame-options/frame-options.component';
import { InputNumberComponent } from '../shared/input-number/input-number.component';

@Component({
  selector: 'app-product-purchase-sidebar',
  imports: [
    OptionsComponent,
    CommonModule,
    FrameOptionsComponent,
    InputNumberComponent,
  ],
  templateUrl: './product-purchase-sidebar.component.html',
  styleUrl: './product-purchase-sidebar.component.scss',
})
export class ProductPurchaseSidebarComponent extends BasePageComponent {
  productId = input<number>(0);
  product = model<ProductDto>({} as ProductDto);
  calculatedPrice = signal<number>(0);
  quantity = signal<number>(1);
  private variantId: number = 1;

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
  ) {
    super();
  }

  hasAllOptionsSelected = computed(
    () =>
      this.product().optionGroups?.length > 0 &&
      this.product().optionGroups.every(
        (group) => group.selectedOptionId !== undefined,
      ),
  );

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
      .calculatePrice(this.product().id.toString(), selectedOptions)
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
function modal<T>(arg0: ProductDto) {
  throw new Error('Function not implemented.');
}
