import { SizeOption } from './../../models/size-option';
import {
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';
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
import { PaperOptionsComponent } from '../paper-options/paper-options.component';
import { SizeOptionsComponent } from '../size-options/size-options.component';
import { SizeOptions } from '../../shared/constants';
import { DpiBarComponent } from '../dpi-bar/dpi-bar.component';
import { AppInsightsService } from '../../services/telemetry/app-insights.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'app-product-purchase-sidebar',
  imports: [
    OptionsComponent,
    CommonModule,
    FrameOptionsComponent,
    IconComponent,
    MatOptionsComponent,
    PaperOptionsComponent,
    SizeOptionsComponent,
    DpiBarComponent,
  ],
  templateUrl: './product-purchase-sidebar.component.html',
  styleUrl: './product-purchase-sidebar.component.scss',
})
export class ProductPurchaseSidebarComponent extends BasePageComponent {
  private variantId: number = 1;
  SizeOptions = SizeOptions;

  product = model<ProductDto>({} as ProductDto);
  isMatIncluded = model<boolean>(false);
  /** Custom image URL for custom design products (uploaded to backend) */
  customImageUrl = input<string | null>(null);

  onSelectedFrameChanged = output<string>();

  selectedSize = model<SizeOption | null>(SizeOptions[0]);
  /** Selected paper name for display and spec3 */
  selectedPaperName = signal<string>('Hahnemühle Photo Rag');

  constructor(
    private apiService: ApiService,
    private cartService: CartService,
    private telemetry: AppInsightsService,
    private toastService: ToastService,
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

    const frameGroup = this.product().optionGroups.find((group) =>
      group.name.toLowerCase().includes('frame'),
    );
    const isFrameSelected = frameGroup?.selectedOptionId !== undefined;

    // For custom products, require uploaded image URL
    const isCustomProduct = this.product().hasCustomOptions;
    const hasCustomProductDetails = this.product().optionGroups.some(
      (g) => g.name === 'CustomProductDetails',
    );
    const needsImageUrl = isCustomProduct && hasCustomProductDetails;
    const hasImageUrl = !needsImageUrl || !!this.customImageUrl();

    const isAllSelected = isFrameSelected && this.selectedSize() && hasImageUrl;

    if (isAllSelected) {
      this.calculatePrice();
    }

    return isAllSelected;
  });

  selectFrame(groupIndex: number, optionId: number) {
    this.selectOption(groupIndex, optionId);

    const selectedFrame =
      this.product().optionGroups[groupIndex].options.find(
        (option) => option.id === optionId,
      )?.value || '';

    this.onSelectedFrameChanged.emit(selectedFrame);
  }

  // // MOCK: Paper options for demo (remove when backend is ready)
  // productWithMockPaperOptions = computed(() => {
  //   const prod = this.product();
  //   if (!prod.optionGroups) return prod;

  //   // Check if paper options already exist
  //   const hasPaperOptions = prod.optionGroups.some(
  //     (g) =>
  //       g.name.toLowerCase() === 'paper' ||
  //       g.name.toLowerCase() === 'paper type' ||
  //       g.name.toLowerCase() === 'paper quality',
  //   );

  //   if (hasPaperOptions) {
  //     // Sort option groups: Frame -> Paper -> Mat -> Others
  //     const sortedGroups = [...prod.optionGroups].sort((a, b) => {
  //       const getOrder = (name: string) => {
  //         const lower = name.toLowerCase();
  //         if (lower.includes('frame')) return 1;
  //         if (lower === 'paper' || lower === 'paper type' || lower === 'paper quality') return 2;
  //         if (lower === 'including mat') return 3;
  //         return 4;
  //       };
  //       return getOrder(a.name) - getOrder(b.name);
  //     });

  //     return {
  //       ...prod,
  //       optionGroups: sortedGroups,
  //     };
  //   }

  //   // Add mock paper options (using frame thumbnails temporarily)
  //   const mockPaperGroup = {
  //     name: 'Paper',
  //     options: [
  //       {
  //         id: 901,
  //         value: 'Hahnemühle Photo Rag',
  //         imageUrl:
  //           'https://www.ikea.com/nl/en/images/products/edsbruk-frame-black-stained__0723741_pe734158_s5.jpg?f=xxs',
  //         optionGroup: 'Paper',
  //         isCustom: false,
  //         pricePolicyName: 'Standard',
  //       },
  //       {
  //         id: 902,
  //         value: 'Hahnemühle German Etching',
  //         imageUrl:
  //           'https://www.ikea.com/nl/en/images/products/plommontrad-frame-white-stained-pine-effect__1202413_pe905936_s5.jpg?f=xxs',
  //         optionGroup: 'Paper',
  //         isCustom: false,
  //         pricePolicyName: 'Standard',
  //       },
  //       {
  //         id: 903,
  //         value: 'Canson Infinity Rag Photographique II',
  //         imageUrl:
  //           'https://www.ikea.com/nl/en/images/products/edsbruk-frame-white__0706506_pe725889_s5.jpg?f=xxs',
  //         optionGroup: 'Paper',
  //         isCustom: false,
  //         pricePolicyName: 'Standard',
  //       },
  //     ],
  //     selectedOptionId: 901, // Default to Photo Rag
  //   };

  //   // Sort option groups: Frame -> Paper -> Mat -> Others
  //   const allGroups = [...prod.optionGroups, mockPaperGroup];
  //   const sortedGroups = allGroups.sort((a, b) => {
  //     const getOrder = (name: string) => {
  //       const lower = name.toLowerCase();
  //       if (lower.includes('frame')) return 1;
  //       if (lower === 'paper' || lower === 'paper type' || lower === 'paper quality') return 2;
  //       if (lower === 'including mat') return 3;
  //       return 4;
  //     };
  //     return getOrder(a.name) - getOrder(b.name);
  //   });

  //   return {
  //     ...prod,
  //     optionGroups: sortedGroups,
  //   };
  // });

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

  calculatePrice() {
    const selectedOptions = this.getSelectedOptions();

    this.apiService
      .calculatePrice(this.product().id.toString(), selectedOptions)
      .subscribe({
        next: (response) => {
          this.calculatedPrice.set(response.price);
          this.variantId = response.variantId;

          this.telemetry.trackEvent('price_calculated', {
            productId: this.product().id,
            variantId: response.variantId,
            price: response.price,
            selectedOptionsCount: selectedOptions?.length ?? 0,
          });
        },
        error: (error) => {
          this.telemetry.trackException(error, {
            operation: 'calculatePrice',
            productId: this.product().id,
          });
          console.error('Error fetching calculated price:', error);
        },
      });
  }

  addToCart() {
    if (!this.hasAllOptionsSelected()) {
      // Check if it's specifically missing the custom image
      const hasCustomProductDetails = this.product().optionGroups.some(
        (g) => g.name === 'CustomProductDetails',
      );
      if (hasCustomProductDetails && !this.customImageUrl()) {
        this.toastService.error(
          'Please wait for your image to finish uploading before adding to cart.',
        );
      }
      this.telemetry.trackEvent('add_to_cart_blocked', {
        productId: this.product().id,
        reason: 'missing_options',
      });
      return;
    }

    // Determine picture URL: use custom image URL for custom products, otherwise use product image
    const customUrl = this.customImageUrl();
    const productImages = this.product().images;
    const pictureUrl =
      customUrl ||
      (productImages && productImages.length > 0 ? productImages[0].thumb : '');

    this.cartService.addItemToCart(
      this.product().id,
      this.variantId,
      this.product().name,
      this.calculatedPrice(),
      this.quantity(),
      pictureUrl,
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
    const size = this.selectedSize() ?? SizeOptions[0];
    const paperName = this.selectedPaperName();

    const selectedOptions = this.product()
      .optionGroups.filter((x) => x.selectedOptionId ?? 0 > 0)
      .map((group) => {
        const isPaper = group.name.toLowerCase().startsWith('paper');
        return {
          optionId: group.selectedOptionId!,
          optionName: isPaper
            ? paperName
            : group.options.find(
                (option) => option.id === group.selectedOptionId,
              )?.value,
          spec1: size.val1.toString(),
          spec2: size.val2.toString(),
          spec3: isPaper ? paperName : undefined,
        } as SelectedOptionDto;
      });

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
      optionName: size.name,
      spec1: size.val1.toString(),
      spec2: size.val2.toString(),
    } as SelectedOptionDto);

    // Add CustomProductDetails option with uploaded image URL for custom products
    const customImageUrl = this.customImageUrl();
    if (customImageUrl) {
      const customProductDetailsGroup = this.product().optionGroups.find(
        (group) => group.name === 'CustomProductDetails',
      );
      if (customProductDetailsGroup) {
        const customProductUrlOption = customProductDetailsGroup.options.find(
          (opt) => opt.value === 'CustomProductUrl',
        );
        if (customProductUrlOption) {
          selectedOptions.push({
            optionId: customProductUrlOption.id,
            optionName: 'CustomProductUrl',
            spec1: customImageUrl,
          } as SelectedOptionDto);
        }
      }
    }

    return selectedOptions;
  }
}
