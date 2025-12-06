import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ApiService } from '../../services/api/api.service';
import {
  FilterGroupDto,
  PaginatedListDto,
  ProductFilterRequestDto,
  ProductSimpleDto,
} from '../../models/product';
import { takeUntil } from 'rxjs';
import { BasePageComponent } from '../basePageComponent';
import { mapColorToHex } from '../../shared/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-product-list',
  imports: [
    ProductCardComponent,
    CommonModule,
    FormsModule,
    IconComponent,
    PaginationComponent,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent
  extends BasePageComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  products = signal<PaginatedListDto<ProductSimpleDto>>(
    {} as PaginatedListDto<ProductSimpleDto>,
  );
  selectedFilterOptions = signal<ProductFilterRequestDto>({
    pageSize: 12,
    pageIndex: 0,
  });
  filterOptions = signal<FilterGroupDto[]>([]);
  hideFilters = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
  ) {
    super();
  }

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.selectedFilterOptions().categoryName =
          params.get('categoryName') || '';
        this.resetPagination();
        this.fetchProductsWithFilters();
      });

    this.fetchFilterOptions();
  }

  ngAfterViewInit() {
    if (this.route.snapshot.fragment === 'search') {
      this.searchInput.nativeElement.focus();
    }
  }

  fetchFilterOptions() {
    this.apiService.getFilterOptions().subscribe((filterOptions) => {
      const onlyCategoryAndAttributeOptions = filterOptions.filter(
        (o) =>
          o.groupType.toLowerCase().includes('categories') ||
          o.groupType.toLowerCase().includes('attributes'),
      );
      this.filterOptions.set(onlyCategoryAndAttributeOptions ?? []);
    });
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
    this.resetPagination();
    this.fetchProductsWithFilters();
  }

  resetPagination() {
    const currentSelectedOptions = this.selectedFilterOptions();
    this.selectedFilterOptions.set({
      ...currentSelectedOptions,
      pageIndex: 0,
    });
  }

  fetchProductsWithFilters() {
    this.apiService
      .getFilteredProducts(this.selectedFilterOptions())
      .subscribe((products) => {
        if (products?.data) {
          this.products.set(products);
        }
      });
  }

  search(): void {
    this.resetPagination();
    this.fetchProductsWithFilters();
  }

  mapColorToHex(color: string): string {
    return mapColorToHex(color);
  }
}
