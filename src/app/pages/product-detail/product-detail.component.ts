import { Component, computed, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil, first } from 'rxjs';
import { ProductDto } from '../../models/product';
import { ApiService } from '../../services/api/api.service';
import { BasePageComponent } from '../basePageComponent';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart/cart.service';
import { CartItemDto, SelectedOptionDto } from '../../models/cart-item';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cartService: CartService,
    private router: Router
  ) {
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

  hasAllOptionsSelected = computed(
    () =>
      this.product().optionGroups?.length > 0 &&
      this.product().optionGroups.every(
        (group) => group.selectedOptionId !== undefined
      )
  );

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
      this.product().name,
      this.product().cheapestPrice,
      this.calculatedPrice(),
      this.product().images[0].original,
      selectedOptions
    );
  }

  navigateToCart() {
    this.router.navigate(['/cart']);
  }
}
