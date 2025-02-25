import { Component, input } from '@angular/core';
import { ProductDto } from '../../models/product';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  product = input.required<ProductDto>();
}
