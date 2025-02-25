import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { CategoryDto } from '../../models/category';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductListResponseDto } from '../../models/product';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly CATALOG_API_URL = environment.serviceUrls['catalog-api'];

  constructor(
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: string
  ) {}

  get isSSR(): boolean {
    return this.platformId == 'server' ? true : false;
  }

  getCategories(): Observable<CategoryDto[] | undefined> {
    if (this.isSSR) {
      return of([]);
    }
    return this._httpClient.get<CategoryDto[]>(
      `${this.CATALOG_API_URL}/catalog/v1/categories`
    );
  }

  getProductsByCategory(
    categoryId: string
  ): Observable<ProductListResponseDto> {
    if (this.isSSR) {
      return of({} as ProductListResponseDto);
    }
    return this._httpClient.post<ProductListResponseDto>(
      `${this.CATALOG_API_URL}/catalog/v1/products/search`,
      { categoryId }
    );
  }
}
