import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ApiService } from '../../services/api/api.service';
import {
  FilterGroupDto,
  PaginatedListDto,
  ProductSimpleDto,
} from '../../models/product';
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
  products = signal<PaginatedListDto<ProductSimpleDto>>(
    {} as PaginatedListDto<ProductSimpleDto>
  );
  filterOptions = signal<FilterGroupDto[]>([]);

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
    this.fetchFilterOptions();
  }

  fetchFilterOptions() {
    this.apiService
      .getFilterOptions()
      .pipe(first())
      .subscribe((filterOptions) => {
        this.filterOptions.set(filterOptions);
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

  selectOption(_t12: number, $event: number) {
    throw new Error('Method not implemented.');
  }
}
