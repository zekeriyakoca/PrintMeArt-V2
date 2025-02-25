import { Component, input } from '@angular/core';
import { ProductDto } from '../../models/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<ProductDto>();

  constructor(private router: Router) {}

  goToProduct() {
    const productId = this.product()?.id;
    if (productId) {
      this.router.navigate(['/products', productId]);
    }
  }
}
