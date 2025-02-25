import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ApiService } from '../../services/api/api.service';
import { ProductListResponseDto } from '../../models/product';
import { first, takeUntil } from 'rxjs';
import { BasePageComponent } from '../basePageComponent';

@Component({
  selector: 'app-product-list',
  imports: [ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent extends BasePageComponent implements OnInit {
  categoryId: string = '';
  products = signal<ProductListResponseDto>({} as ProductListResponseDto);

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
    super();
  }

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.categoryId = params.get('categoryId') || '';
        this.fetchProducts();
      });
  }

  fetchProducts() {
    this.apiService
      .getProductsByCategory(this.categoryId)
      .pipe(first())
      .subscribe((products) => {
        if (products?.data) {
          this.products.set(products);
        }
      });
  }
}
