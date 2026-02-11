import { ProductTags } from './../../models/product';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { CategoryDto } from '../../models/category';
import { Observable, of, shareReplay, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductDto,
  PaginatedListDto,
  ProductSimpleDto,
  ProductFilterRequestDto,
  FilterGroupDto,
} from '../../models/product';
import { SelectedOptionDto } from '../../models/cart-item';
import { SizeOptions } from '../../shared/constants';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly CATALOG_API_URL = environment.serviceUrls['catalog-api'];
  private readonly PRICING_API_URL = environment.serviceUrls['pricing-api'];
  private readonly BFF_URL = environment.serviceUrls['bff'];
  private categoriesCache$?: Observable<CategoryDto[] | undefined>;

  public readonly FromPrice = signal(0);

  constructor(
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  get isSSR(): boolean {
    return this.platformId == 'server' ? true : false;
  }

  fetchFromPrice(): void {
    if (this.isSSR) {
      return;
    }

    const size = SizeOptions[0];

    this.getFilteredProducts({
      pageSize: 1,
      pageIndex: 0,
    } as ProductFilterRequestDto)
      .pipe(
        switchMap((result) => {
          if (!result.data?.length) {
            return of(null);
          }
          return this.getProductById(result.data[0].id.toString());
        }),
        switchMap((product) => {
          if (!product?.optionGroups) {
            return of(null);
          }

          const selectedOptions: SelectedOptionDto[] = product.optionGroups
            .filter(
              (group) =>
                group.name.toLowerCase() !== 'including mat' &&
                group.name.toLowerCase() !== 'size' &&
                group.options.length > 0,
            )
            .map((group) => ({
              optionId: group.options[0].id,
              optionName: group.options[0].value,
              spec1: size.val1.toString(),
              spec2: size.val2.toString(),
              optionValue: undefined,
            }));

          const matGroup = product.optionGroups.find(
            (group) => group.name.toLowerCase() === 'including mat',
          );
          if (matGroup?.options.length) {
            selectedOptions.push({
              optionId: matGroup.options[0].id,
              optionName: 'No Mat',
              spec1: 'false',
              optionValue: undefined,
            });
          }

          const sizeGroup = product.optionGroups.find(
            (group) => group.name.toLowerCase() === 'size',
          );
          if (sizeGroup?.options.length) {
            selectedOptions.push({
              optionId: sizeGroup.options[0].id,
              optionName: size.name,
              spec1: size.val1.toString(),
              spec2: size.val2.toString(),
              optionValue: undefined,
            });
          }

          return this.calculatePrice(product.id.toString(), selectedOptions);
        }),
        tap((priceResult) => {
          if (priceResult?.price) {
            const fromPrice = Math.floor(priceResult.price) + 0.99;
            this.FromPrice.set(fromPrice);
          }
        }),
      )
      .subscribe();
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

  // ============ Stripe Checkout ============

  /**
   * Initiate Stripe checkout and get redirect URL
   */
  initiateCheckout(data: {
    orderId: number;
    customerEmail: string;
    currency: string;
  }): Observable<{ checkoutUrl: string; sessionId: string }> {
    if (this.isSSR) {
      return of({ checkoutUrl: '', sessionId: '' });
    }
    return this._httpClient.post<{ checkoutUrl: string; sessionId: string }>(
      `${this.BFF_URL}/bff/v1/ordering/checkout`,
      data,
    );
  }

  /**
   * Get checkout session status (used after Stripe redirect)
   */
  getCheckoutSession(sessionId: string): Observable<{
    sessionId: string;
    status: 'open' | 'complete' | 'expired';
    paymentStatus: 'unpaid' | 'paid' | 'no_payment_required';
    customerEmail?: string;
    orderId?: number;
    orderNumber?: string;
    amountTotal?: number;
    currency?: string;
  }> {
    if (this.isSSR) {
      return of({
        sessionId: '',
        status: 'expired' as const,
        paymentStatus: 'unpaid' as const,
      });
    }
    return this._httpClient.get<any>(
      `${this.BFF_URL}/bff/v1/ordering/checkout/${sessionId}`,
    );
  }
}
