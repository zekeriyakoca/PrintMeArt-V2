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
import { IconComponent } from '../shared/icon/icon.component';
import { MatOptionsComponent } from '../mat-options/mat-options.component';
import { SizeOptionsComponent } from '../size-options/size-options.component';

@Component({
  selector: 'app-product-purchase-sidebar',
  imports: [
    OptionsComponent,
    CommonModule,
    FrameOptionsComponent,
    InputNumberComponent,
    IconComponent,
    MatOptionsComponent,
    SizeOptionsComponent,
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
  isMatIncluded = false;
  sizeOptions = [
    { id: 1, name: '13x18', val1: 13, val2: 18 },
    { id: 2, name: '21x30', val1: 21, val2: 30 },
    { id: 3, name: '30x40', val1: 30, val2: 40 },
    { id: 4, name: '40x60', val1: 40, val2: 60 },
    { id: 5, name: '50x70', val1: 50, val2: 70 },
    { id: 6, name: '60x90', val1: 60, val2: 90 },
  ];
  selectedSize = this.sizeOptions[0];

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
  ) {
    super();
  }

  hasAllOptionsSelected = computed(() => {
    const allSelected =
      this.selectedSize != null &&
      this.product().optionGroups?.length > 0 &&
      this.product()
        .optionGroups.filter((group) => !group.options[0].isCustom)
        .every((group) => group.selectedOptionId !== undefined);

    if (allSelected) {
      this.calculatePrice();
    }
    return allSelected;
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
    // this.calculatePrice();
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
        id: group.selectedOptionId!,
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
            id: group.selectedOptionId!,
            optionId: 0,
          }) as SelectedOptionDto,
      );
    selectedOptions.push({
      optionId: 0, // TODO : Remove
      id:
        this.product().optionGroups.find(
          (group) => group.name.toLowerCase() === 'including mat',
        )?.options[0].id || 0,
      spec1: this.isMatIncluded ? 'true' : 'false',
    } as SelectedOptionDto);

    selectedOptions.push({
      optionId: 0, // TODO : Remove
      id:
        this.product().optionGroups.find(
          (group) => group.name.toLowerCase() === 'size',
        )?.options[0].id || 0,
      spec1: this.selectedSize.val1.toString(),
      spec2: this.selectedSize.val2.toString(),
    } as SelectedOptionDto);
    return selectedOptions;
  }
}
function modal<T>(arg0: ProductDto) {
  throw new Error('Function not implemented.');
}
