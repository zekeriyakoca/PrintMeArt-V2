import { ProductTags } from './../../models/product';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CategoryDto } from '../../models/category';
import { EMPTY, Observable, forkJoin, map, of, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ProductDto,
  PaginatedListDto,
  ProductSimpleDto,
  ProductFilterRequestDto,
  FilterGroupDto,
} from '../../models/product';
import { SelectedOptionDto } from '../../models/cart-item';
import { ArtistDetailDto, ArtistSummaryDto } from '../../models/artist';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly CATALOG_API_URL = environment.serviceUrls['catalog-api'];
  private readonly PRICING_API_URL = environment.serviceUrls['pricing-api'];
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
    return this._httpClient.get<ProductDto>(
      `${this.CATALOG_API_URL}/catalog/v1/storefront/products/${productId}`,
    );
  }

  /**
   * Prices of a product in the standard sizes on Premium Poster and on cotton paper, rolled up.
   * Worked out on the server too (unlike calculatePrice), so the price table is in the page search engines read;
   * the browser reuses the server's answers.
   */
  getPriceTable(product: ProductDto, sizes: { name: string; val1: number; val2: number }[]): Observable<PriceTableRow[]> {
    const group = (name: string) => product.optionGroups.find((g) => g.name.toLowerCase().startsWith(name));
    const paper = group('paper');
    const frame = group('frame')?.options.find((o) => o.value === 'Rolled-up');
    const mat = group('including mat')?.options[0];
    const size = group('size')?.options[0];
    if (!paper || !frame || !mat || !size) return of([]);
    const price = (s: { name: string; val1: number; val2: number }, grade: string, paperName: string) => {
      const option = paper.options.find((o) => o.value === grade) ?? paper.options[0];
      const specs = { spec1: s.val1.toString(), spec2: s.val2.toString() };
      return this._httpClient
        .post<{ price: number }>(`${this.PRICING_API_URL}/pricing/v1/product/calculate-price`, {
          productId: product.id.toString(),
          selectedOptions: [
            { optionId: option.id, optionName: paperName, ...specs, spec3: paperName },
            { optionId: frame.id, optionName: frame.value, ...specs },
            { optionId: mat.id, optionName: 'No Mat', spec1: 'false' },
            { optionId: size.id, optionName: s.name, ...specs },
          ],
        })
        .pipe(map((r) => r.price));
    };
    return forkJoin(
      sizes.map((s) =>
        forkJoin({ poster: price(s, 'Home', 'Premium Poster'), cotton: price(s, 'Museum', 'Hahnemühle Photo Rag') }).pipe(
          map(({ poster, cotton }) => ({ size: s.name, poster, cotton })),
        ),
      ),
    );
  }

  calculatePrice(
    productId: string,
    selectedOptions: SelectedOptionDto[],
  ): Observable<any> {
    // Prices are worked out in the browser only
    if (this.isSSR) {
      return EMPTY;
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

  saveCheckoutContact(contact: { email: string; firstName: string; lastName: string }): Observable<unknown> {
    if (this.isSSR) {
      return of({});
    }
    return this._httpClient.post(`${this.BFF_URL}/bff/v1/ordering/checkout-contact`, contact);
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

  getArtists(): Observable<ArtistSummaryDto[]> {
    return this._httpClient.get<ArtistSummaryDto[]>(`${this.CATALOG_API_URL}/catalog/v1/storefront/artists`);
  }

  getArtist(slug: string): Observable<ArtistDetailDto> {
    return this._httpClient.get<ArtistDetailDto>(`${this.CATALOG_API_URL}/catalog/v1/storefront/artists/${encodeURIComponent(slug)}`);
  }

  getFilterOptions(): Observable<FilterGroupDto[]> {
    return this._httpClient.get<FilterGroupDto[]>(
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

export interface PriceTableRow {
  size: string;
  poster: number;
  cotton: number;
}
