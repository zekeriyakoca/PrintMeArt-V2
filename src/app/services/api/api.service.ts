import { ProductTags } from './../../models/product';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CategoryDto } from '../../models/category';
import { Observable, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductDto,
  PaginatedListDto,
  ProductSimpleDto,
  ProductFilterRequestDto,
  FilterGroupDto,
} from '../../models/product';
import { SelectedOptionDto } from '../../models/cart-item';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly CATALOG_API_URL = environment.serviceUrls['catalog-api'];
  private readonly PRICING_API_URL = environment.serviceUrls['pricing-api'];
  private readonly ORDERING_API_URL = environment.serviceUrls['ordering-api'];
  private readonly BFF_URL = environment.serviceUrls['bff'];
  private categoriesCache$?: Observable<CategoryDto[] | undefined>;

  constructor(
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  get isSSR(): boolean {
    return this.platformId == 'server' ? true : false;
  }

  getCategories(): Observable<CategoryDto[] | undefined> {
    if (this.isSSR) {
      return of([]);
    }
    if (!this.categoriesCache$) {
      this.categoriesCache$ = this._httpClient
        .get<CategoryDto[]>(`${this.CATALOG_API_URL}/catalog/v1/categories`)
        .pipe(shareReplay(1));
    }
    return this.categoriesCache$;
  }

  getProductsByCategory(
    categoryName: string,
  ): Observable<PaginatedListDto<ProductSimpleDto>> {
    return this.getFilteredProducts({
      categoryName,
    } as ProductFilterRequestDto);
  }

  getProductById(productId: string): Observable<ProductDto> {
    if (this.isSSR) {
      return of({} as ProductDto);
    }
    return this._httpClient.get<ProductDto>(
      `${this.CATALOG_API_URL}/catalog/v1/storefront/products/${productId}`,
    );
  }

  calculatePrice(
    productId: string,
    selectedOptions: SelectedOptionDto[],
  ): Observable<any> {
    if (this.isSSR) {
      return of({});
    }
    const requestBody = {
      productId: productId,
      selectedOptions: selectedOptions,
    };

    return this._httpClient.post<any>(
      `${this.PRICING_API_URL}/pricing/v1/product/calculate-price`,
      requestBody,
    );
  }

  createDraftOrder(): Observable<any> {
    if (this.isSSR) {
      return of({});
    }
    return this._httpClient.post<any>(
      `${this.BFF_URL}/bff/v1/ordering/draft-order`,
      {},
    );
  }

  submitOrder(userInfo: any): Observable<any> {
    if (this.isSSR) {
      return of({});
    }
    return this._httpClient.post<any>(
      `${this.BFF_URL}/bff/v1/ordering/order`,
      userInfo,
    );
  }

  getFilterOptions(): Observable<FilterGroupDto[]> {
    if (this.isSSR) {
      return of([] as FilterGroupDto[]);
    }
    return this._httpClient.get<any>(
      `${this.CATALOG_API_URL}/catalog/v1/storefront/filter-options`,
    );
  }

  getFeaturedProducts(
    pageSize: number,
    pageIndex: number,
  ): Observable<PaginatedListDto<ProductSimpleDto>> {
    return this.getFilteredProducts({
      pageSize: pageSize,
      pageIndex: pageIndex,
      tags: ProductTags.Featured,
    } as ProductFilterRequestDto);
  }

  getFilteredProducts(filterBody: ProductFilterRequestDto) {
    if (this.isSSR) {
      return of({} as PaginatedListDto<ProductSimpleDto>);
    }
    return this._httpClient.post<PaginatedListDto<ProductSimpleDto>>(
      `${this.CATALOG_API_URL}/catalog/v1/storefront/products/search`,
      filterBody,
    );
  }
}
