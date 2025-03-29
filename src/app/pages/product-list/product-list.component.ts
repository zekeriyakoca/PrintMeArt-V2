import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ApiService } from '../../services/api/api.service';
import {
  FilterGroupDto,
  PaginatedListDto,
  ProductFilterRequestDto,
  ProductSimpleDto,
} from '../../models/product';
import { first, takeUntil } from 'rxjs';
import { BasePageComponent } from '../basePageComponent';
import { mapColorToHex } from '../../shared/utils';

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
  selectedFilterOptions = signal<ProductFilterRequestDto>({
    pageSize: 10,
    pageIndex: 0,
  });

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
        this.filterOptions.set(filterOptions ?? []);
      });
  }

  fetchProducts() {
    if (this.categoryId != '') {
      this.apiService
        .getProductsByCategory(this.categoryId)
        .pipe(first())
        .subscribe((products) => {
          if (products?.data) {
            this.products.set(products);
          }
        });
    } else {
      this.apiService
        .getFilteredProducts({ pageSize: 10, pageIndex: 0 })
        .pipe(first())
        .subscribe((products) => {
          if (products?.data) {
            this.products.set(products);
          }
        });
    }
  }

  selectOption(groupType: string, optionId: number) {
    const currentSelectedOptions = this.selectedFilterOptions();
    const newSelectedOptions: ProductFilterRequestDto = {
      ...currentSelectedOptions,
      categoryId: undefined,
      attributeId: undefined,
      optionId: undefined,
    };

    if (groupType.toLowerCase().includes('categories')) {
      newSelectedOptions.categoryId = optionId;
    } else if (groupType.toLowerCase().includes('attributes')) {
      newSelectedOptions.attributeId = optionId;
    } else if (groupType.toLowerCase().includes('options')) {
      newSelectedOptions.optionId = optionId;
    }

    this.selectedFilterOptions.set(newSelectedOptions);
    this.fetchProductsWithFilters();
  }

  fetchProductsWithFilters() {
    this.apiService
      .getFilteredProducts(this.selectedFilterOptions())
      .pipe(first())
      .subscribe((products) => {
        if (products?.data) {
          this.products.set(products);
        }
      });
  }

  mapColorToHex(color: string): string {
    return mapColorToHex(color);
  }
}
