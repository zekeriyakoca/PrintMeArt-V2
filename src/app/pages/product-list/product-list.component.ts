import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductGalleryCardComponent } from '../../components/product-gallery-card/product-gallery-card.component';
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
import { isDesktopViewport } from '../../shared/device';

import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';

@Component({
  selector: 'app-product-list',
  imports: [
    ProductCardComponent,
    ProductGalleryCardComponent,
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
  filterSearchTerms = signal<Record<string, string>>({});
  expandedGroups = signal<Set<string>>(new Set());
  hideFilters = signal<boolean>(true);
  viewMode = signal<'grid' | 'gallery-2' | 'gallery-3'>(
    (localStorage.getItem('viewMode') as 'grid' | 'gallery-2' | 'gallery-3') || 'grid',
  );

  setViewMode(mode: 'grid' | 'gallery-2' | 'gallery-3') {
    this.viewMode.set(mode);
    localStorage.setItem('viewMode', mode);
  }

  activeFilters = computed(() => {
    const filters = this.selectedFilterOptions();
    const chips: { type: string; name: string; colorClass: string }[] = [];
    if (filters.categoryName) {
      chips.push({
        type: 'categories',
        name: filters.categoryName,
        colorClass: 'bg-indigo-50 text-[#384f8cd9] hover:bg-indigo-100',
      });
    }
    if (filters.attributeName) {
      chips.push({
        type: 'attributes',
        name: filters.attributeName,
        colorClass: 'bg-sky-50 text-sky-600 hover:bg-sky-100',
      });
    }
    return chips;
  });

  isOptionSelected(optionName: string): boolean {
    const f = this.selectedFilterOptions();
    return (
      f.categoryName === optionName ||
      f.attributeName === optionName ||
      f.optionName === optionName
    );
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
  ) {
    super();
  }

  ngOnInit() {
    this.route.queryParamMap
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        const categoryName = params.get('categoryName') || undefined;
        const attributeName = params.get('attributeName') || undefined;
        const optionName = params.get('optionName') || undefined;

        this.selectedFilterOptions.set({
          pageSize: +(params.get('pageSize') ?? 12),
          pageIndex: +(params.get('pageIndex') ?? 0),
          categoryName,
          attributeName,
          optionName,
          searchTerm: params.get('searchTerm') || undefined,
        });
        if (!isDesktopViewport()) {
          this.hideFilters.set(true);
        } else if (categoryName || attributeName || optionName) {
          this.hideFilters.set(false);
        }

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
      const onlyCategoryOptions = filterOptions.filter((o) =>
        o.groupType.toLowerCase().includes('categories'),
      );

      const onlyAttributeOptions = filterOptions
        .filter((o) => o.groupType.toLowerCase().includes('attributes'))
        .filter((o) => o.name.trim().toLowerCase() !== 'image quality');

      this.filterOptions.set([
        ...(onlyCategoryOptions ?? []),
        ...(onlyAttributeOptions ?? []),
      ]);

      if (onlyCategoryOptions.length > 0) {
        this.toggleGroup(onlyCategoryOptions[0].name);
      }
    });
  }

  private getFilterKey(groupType: string): keyof ProductFilterRequestDto {
    if (groupType.toLowerCase().includes('categories')) return 'categoryName';
    if (groupType.toLowerCase().includes('attributes')) return 'attributeName';
    return 'optionName';
  }

  selectOption(groupType: string, optionName: string) {
    const key = this.getFilterKey(groupType);
    const current = this.selectedFilterOptions();
    const newFilters: ProductFilterRequestDto = {
      pageSize: current.pageSize,
      pageIndex: 0,
      [key]: current[key] === optionName ? undefined : optionName,
    };
    this.navigateWithFilters(newFilters);
  }

  resetFilters() {
    const current = this.selectedFilterOptions();
    this.navigateWithFilters({
      pageSize: current.pageSize,
      pageIndex: 0,
      searchTerm: current.searchTerm,
    });
  }

  private navigateWithFilters(filters: ProductFilterRequestDto) {
    const queryParams: Record<string, string | number | undefined> = {};
    if (filters.pageIndex) queryParams['pageIndex'] = filters.pageIndex;
    if (filters.pageSize !== 12) queryParams['pageSize'] = filters.pageSize;
    if (filters.categoryName)
      queryParams['categoryName'] = filters.categoryName;
    if (filters.attributeName)
      queryParams['attributeName'] = filters.attributeName;
    if (filters.optionName) queryParams['optionName'] = filters.optionName;
    if (filters.searchTerm) queryParams['searchTerm'] = filters.searchTerm;
    this.router.navigate([], { queryParams });
  }

  fetchProductsWithFilters() {
    this.apiService
      .getFilteredProducts(this.selectedFilterOptions())
      .subscribe((products) => {
        if (products?.data) {
          products.data.sort((a, b) => b.imageRatio - a.imageRatio);
          this.products.set(products);
        }
      });
  }

  search(): void {
    const current = this.selectedFilterOptions();
    this.navigateWithFilters({
      pageIndex: 0,
      pageSize: current.pageSize,
      searchTerm: current.searchTerm,
    });
  }

  onPaginationChanged(): void {
    this.navigateWithFilters(this.selectedFilterOptions());
  }

  toggleGroup(groupName: string): void {
    this.expandedGroups.update((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  }

  isGroupExpanded(groupName: string): boolean {
    return this.expandedGroups().has(groupName);
  }

  updateFilterSearch(groupName: string, term: string): void {
    this.filterSearchTerms.update((prev) => ({ ...prev, [groupName]: term }));
  }

  getFilteredOptions(group: FilterGroupDto): FilterGroupDto['options'] {
    const term = this.filterSearchTerms()[group.name]?.toLowerCase();
    if (!term) return group.options;
    return group.options.filter((o) => o.name.toLowerCase().includes(term));
  }

  mapColorToHex(color: string): string {
    return mapColorToHex(color);
  }
}
