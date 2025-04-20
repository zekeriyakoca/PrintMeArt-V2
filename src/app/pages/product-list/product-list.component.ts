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
  categoryName: string = '';
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
        this.categoryName = params.get('categoryName') || '';
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
    if (this.categoryName != '') {
      this.apiService
        .getProductsByCategory(this.categoryName)
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

  selectOption(groupType: string, optionName: string) {
    const currentSelectedOptions = this.selectedFilterOptions();
    const newSelectedOptions: ProductFilterRequestDto = {
      ...currentSelectedOptions,
      categoryName: undefined,
      attributeName: undefined,
      optionName: undefined,
    };

    if (groupType.toLowerCase().includes('categories')) {
      newSelectedOptions.categoryName = optionName;
    } else if (groupType.toLowerCase().includes('attributes')) {
      newSelectedOptions.attributeName = optionName;
    } else if (groupType.toLowerCase().includes('options')) {
      newSelectedOptions.optionName = optionName;
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
