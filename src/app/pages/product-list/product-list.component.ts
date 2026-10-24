import { TranslatePipe } from '../../services/i18n/translate.pipe';
import { afterNextRender, afterRenderEffect, AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductGalleryCardComponent } from '../../components/product-gallery-card/product-gallery-card.component';
import { ApiService } from '../../services/api/api.service';
import { FilterGroupDto, PaginatedListDto, ProductFilterRequestDto, ProductSimpleDto, ProductTags } from '../../models/product';
import { takeUntil } from 'rxjs';
import { BasePageComponent } from '../basePageComponent';
import { mapColorToHex } from '../../shared/utils';
import { isDesktopViewport } from '../../shared/device';
import { INTRO_IMAGES } from '../../shared/intro-images';

import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../components/shared/icon/icon.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { AnalyticsService } from '../../services/telemetry/analytics.service';
import { SeoService, summary } from '../../services/seo/seo.service';
import { TranslationService } from '../../services/i18n/translation.service';

@Component({
  selector: 'app-product-list',
  imports: [TranslatePipe, ProductCardComponent, ProductGalleryCardComponent, FormsModule, IconComponent, PaginationComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent extends BasePageComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  products = signal<PaginatedListDto<ProductSimpleDto>>({} as PaginatedListDto<ProductSimpleDto>);
  selectedFilterOptions = signal<ProductFilterRequestDto>({
    pageSize: 20,
    pageIndex: 0,
  });
  filterOptions = signal<FilterGroupDto[]>([]);
  filterSearchTerms = signal<Record<string, string>>({});
  expandedGroups = signal<Set<string>>(new Set());
  hideFilters = signal<boolean>(true);
  viewMode = signal<'grid' | 'gallery-1' | 'gallery-2' | 'gallery-3'>('grid');
  // The saved view lives in the browser; it is applied once the server-rendered page is taken over
  private readonly restoreViewMode = afterNextRender(() => {
    const saved = localStorage.getItem('viewMode') as 'grid' | 'gallery-1' | 'gallery-2' | 'gallery-3' | null;
    if (saved) this.viewMode.set(saved);
  });

  setViewMode(mode: 'grid' | 'gallery-1' | 'gallery-2' | 'gallery-3') {
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

  /** The category, artist, museum or collection the list is narrowed to; it gets a heading of its own */
  named = computed(() => this.selectedFilterOptions().categoryName ?? this.selectedFilterOptions().attributeName);
  namedGroup = computed(() => {
    const group = this.filterOptions().find((g) => g.options.some((o) => o.name === this.named()));
    return group ? this.getFilterGroupName(group.name) : undefined;
  });
  /** The introduction of the category, artist, museum or collection, where there is one */
  namedText = signal<string | undefined>(undefined);
  namedImage = computed(() => INTRO_IMAGES[this.named() ?? '']);
  @ViewChild('intro') intro?: ElementRef<HTMLElement>;
  introExpanded = signal(false);
  /** Whether the clamped introduction hides text, so it needs a read more button */
  introOverflows = signal(false);
  private readonly measureIntro = afterRenderEffect(() => {
    this.namedText();
    if (this.introExpanded()) return;
    const el = this.intro?.nativeElement;
    this.introOverflows.set(!!el && el.scrollHeight > el.clientHeight + 1);
  });

  isOptionSelected(optionName: string): boolean {
    const f = this.selectedFilterOptions();
    return f.categoryName === optionName || f.attributeName === optionName || f.optionName === optionName;
  }

  private readonly seo = inject(SeoService);
  private readonly i18n = inject(TranslationService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private analytics: AnalyticsService,
  ) {
    super();
  }

  ngOnInit() {
    this.route.queryParamMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params) => {
      const categoryName = params.get('categoryName') || undefined;
      const attributeName = params.get('attributeName') || undefined;
      const optionName = params.get('optionName') || undefined;
      const tagsParam = params.get('tags');
      const tags = tagsParam != null ? (+tagsParam as ProductTags) : undefined;

      this.selectedFilterOptions.set({
        pageSize: +20,
        pageIndex: +(params.get('pageIndex') ?? 0),
        categoryName,
        attributeName,
        optionName,
        searchTerm: params.get('searchTerm') || undefined,
        tags,
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
      const onlyCategoryOptions = filterOptions.filter((o) => o.groupType.toLowerCase().includes('categories'));

      const onlyAttributeOptions = filterOptions.filter((o) => o.groupType.toLowerCase().includes('attributes')).filter((o) => o.name.trim().toLowerCase() !== 'image quality');

      this.filterOptions.set([...(onlyCategoryOptions ?? []), ...(onlyAttributeOptions ?? [])]);

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
    if (filters.pageSize !== 20) queryParams['pageSize'] = filters.pageSize;
    if (filters.categoryName) queryParams['categoryName'] = filters.categoryName;
    if (filters.attributeName) queryParams['attributeName'] = filters.attributeName;
    if (filters.optionName) queryParams['optionName'] = filters.optionName;
    if (filters.searchTerm) queryParams['searchTerm'] = filters.searchTerm;
    if (filters.tags !== undefined) queryParams['tags'] = filters.tags;
    this.router.navigate([], { queryParams });
  }

  fetchProductsWithFilters() {
    this.apiService.getFilteredProducts(this.selectedFilterOptions()).subscribe((products) => {
      if (products?.data) {
        products.data.sort((a, b) => b.imageRatio - a.imageRatio);
        this.products.set(products);
        this.describeNamed(products.data[0]?.id);
        const filters = this.selectedFilterOptions();
        this.analytics.trackProductListViewed(
          {
            category_name: filters.categoryName,
            attribute_name: filters.attributeName,
            option_name: filters.optionName,
            search_term: filters.searchTerm,
            tags: filters.tags,
            result_count: products.count,
          },
          products.data,
        );
      }
    });
  }

  search(): void {
    const current = this.selectedFilterOptions();
    this.analytics.trackSearch(current.searchTerm || '');
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

  getFilterGroupName(name: string) {
    if (name.toLowerCase() == 'origin') {
      return 'Museum';
    }
    return name;
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

  /** A category, museum or artist page gets its own title; the plain catalog the general one. */
  /**
   * A category's introduction is in the dictionary (intro.<name>); an attribute's description comes
   * with the products that carry it, so it is read from the first one
   */
  private describeNamed(firstProductId: number | undefined) {
    const { categoryName, attributeName: attribute } = this.selectedFilterOptions();
    this.introExpanded.set(false);
    this.namedText.set(categoryName ? this.i18n.find('intro.' + categoryName) : undefined);
    if (categoryName || !attribute || !firstProductId) return this.describeForSearch();
    this.apiService.getProductById(String(firstProductId)).subscribe((product) => {
      const details = product.attributeDetails?.find((a) => a.name === attribute);
      this.namedText.set((this.i18n.language === 'nl' && details?.metadata?.['Description_nl']) || details?.description || undefined);
      this.describeForSearch();
    });
  }

  private describeForSearch() {
    const name = this.named() ?? this.selectedFilterOptions().searchTerm;
    const shown = name ? this.i18n.t('name.' + name) : undefined;
    const description = this.namedText() ?? (shown ? this.i18n.t('seo.catalog.namedDescription', { name: shown }) : this.i18n.t('seo.catalog.description'));
    this.seo.setPage({
      title: shown ? this.i18n.t('seo.catalog.namedTitle', { name: shown }) : this.i18n.t('seo.catalog.title'),
      description: summary(description),
      structuredData: this.named() ? [{ '@type': 'CollectionPage', name: shown, description, numberOfItems: this.products().count }] : [],
    });
  }

}
