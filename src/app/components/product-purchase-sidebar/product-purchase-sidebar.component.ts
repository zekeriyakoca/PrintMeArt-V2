import { SizeOption } from './../../models/size-option';
import { Component, computed, model, signal } from '@angular/core';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { CartService } from '../../services/cart/cart.service';
import { BasePageComponent } from '../../pages/basePageComponent';
import { SelectedOptionDto } from '../../models/cart-item';
import { OptionsComponent } from '../shared/options/options.component';
import { CommonModule } from '@angular/common';
import { FrameOptionsComponent } from '../frame-options/frame-options.component';
import { IconComponent } from '../shared/icon/icon.component';
import { MatOptionsComponent } from '../mat-options/mat-options.component';
import { SizeOptionsComponent } from '../size-options/size-options.component';
import { SizeOptions } from '../../shared/constants';

@Component({
  selector: 'app-product-purchase-sidebar',
  imports: [
    OptionsComponent,
    CommonModule,
    FrameOptionsComponent,
    IconComponent,
    MatOptionsComponent,
    SizeOptionsComponent,
  ],
  templateUrl: './product-purchase-sidebar.component.html',
  styleUrl: './product-purchase-sidebar.component.scss',
})
export class ProductPurchaseSidebarComponent extends BasePageComponent {
  private variantId: number = 1;
  SizeOptions = SizeOptions;

  product = model<ProductDto>({} as ProductDto);
  selectedSize = model(SizeOptions[0]);
  isMatIncluded = model<boolean>(false);

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
  ) {
    super();
  }

  calculatedPrice = signal<number>(0);
  quantity = signal<number>(1);

  hasAllOptionsSelected = computed(() => {
    if (
      this.selectedSize() == null ||
      this.product().optionGroups == null ||
      this.product().optionGroups.length === 0
    ) {
      return false;
    }

    let isFrameSelected =
      this.product().optionGroups.filter((group) =>
        group.name.toLowerCase().includes('frame'),
      )[0].selectedOptionId !== undefined;

    let isAllSelected = isFrameSelected && this.selectedSize();

    if (isAllSelected) {
      this.calculatePrice();
    }

    return isAllSelected;
  });

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
  }

  setQuantity(change: number) {
    this.quantity.update((currentQuantity) => {
      const newQuantity = currentQuantity + change;
      return Math.max(newQuantity, 1);
    });
  }

  calculatePrice() {
    const selectedOptions = this.getSelectedOptions();

    this.apiService
      .calculatePrice(this.product().id.toString(), selectedOptions)
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

    this.cartService.addItemToCart(
      this.product().id,
      this.variantId,
      this.product().name,
      this.product().cheapestPrice,
      this.calculatedPrice(),
      this.quantity(),
      this.product().images[0].thumb,
      this.getSelectedOptions(),
    );
  }

  getSelectedOptionName(optionId?: number): string {
    if (!optionId) return '';
    const option = this.product()
      .optionGroups.flatMap((group) => group.options)
      .find((opt) => opt.id === optionId);
    return option ? option.value : '';
  }

  private getSelectedOptions() {
    const selectedOptions = this.product()
      .optionGroups.filter((x) => x.selectedOptionId ?? 0 > 0)
      .map(
        (group) =>
          ({
            optionId: group.selectedOptionId!,
            optionName: group.options.find(
              (option) => option.id === group.selectedOptionId,
            )?.value,
            spec1: this.selectedSize().val1.toString(),
            spec2: this.selectedSize().val2.toString(),
          }) as SelectedOptionDto,
      );
    selectedOptions.push({
      optionId:
        this.product().optionGroups.find(
          (group) => group.name.toLowerCase() === 'including mat',
        )?.options[0].id || 0,
      optionName: this.isMatIncluded() ? 'Include Mat' : 'No Mat',
      spec1: this.isMatIncluded() ? 'true' : 'false',
    } as SelectedOptionDto);

    selectedOptions.push({
      optionId:
        this.product().optionGroups.find(
          (group) => group.name.toLowerCase() === 'size',
        )?.options[0].id || 0,
      optionName: this.selectedSize().name,
      spec1: this.selectedSize().val1.toString(),
      spec2: this.selectedSize().val2.toString(),
    } as SelectedOptionDto);
    return selectedOptions;
  }
}
