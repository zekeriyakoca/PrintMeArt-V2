import {
  ProductDetailDto,
  ProductSearchRequestDto,
  ProductSimpleDto,
  UpsertAttributesRequestDto,
  UpsertVariantRequestDto,
} from './../../models/product';
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import {
  UpdateProductRequestDto,
  ProductAttributeDto,
  CreateProductRequestDto,
  ProductDto,
  VariantDto,
} from '../../models/product';
import { PRODUCTS } from './mockData';
import { environment } from '../../../environments/environment';
import { PaginatedItems } from '../../models/shared-models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private _httpClient: HttpClient) {}

  getProducts(
    pageIndex: number,
    pageSize: number,
    searchTerm: string,
  ): Observable<PaginatedItems<ProductSimpleDto>> {
    const request = new ProductSearchRequestDto(pageIndex, pageSize);
    request.searchTerm = searchTerm;

    return this._httpClient.post<PaginatedItems<ProductSimpleDto>>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/search`,
      request,
    );
  }

  getProduct(id: number): Observable<ProductDto | undefined> {
    return this._httpClient.get<ProductDto>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${id}`,
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this._httpClient.delete<void>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${id}`,
    );
  }

  updateProduct(product: UpdateProductRequestDto) {
    if (product.id === 0) {
      throw new Error('Product id is required');
    }

    const body = {
      ...product,
      images: product.imageDtos.map((image) => image.original),
    };
    return this._httpClient.put(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${product.id}`,
      body,
    );
  }

  createProduct(product: CreateProductRequestDto) {
    const body = {
      ...product,
      images: product.imageDtos.map((image) => image.original),
    };
    return this._httpClient.post(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product`,
      body,
    );
  }

  getVariant(
    productId: number,
    id: number,
  ): Observable<VariantDto | undefined> {
    return this._httpClient.get<VariantDto>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${productId}/variants/${id}`,
    );
  }

  getVariants(
    productId: number,
    page: number, // Todo: Implement pagination when supperted by the API
    pageSize: number,
    searchTerm: string,
  ): Observable<VariantDto[]> {
    return this._httpClient.get<VariantDto[]>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${productId}/variants`,
    );
  }

  updateVariant(productId: number, variant: VariantDto) {
    if (variant.id === 0 || productId === 0) {
      throw new Error('ProductId and VariantId are both required');
    }
    // TODO : Remove this function at all
    return this._httpClient.put(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${productId}/variants/${variant.id}`,
      {},
    );
  }

  getProductAttributes(
    productId: number,
    variantId: number,
  ): Observable<ProductAttributeDto[]> {
    return this._httpClient.get<ProductAttributeDto[]>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${productId}/variants/${variantId}/attributes`,
    );
  }

  updateProductAttributes(
    productId: number,
    variantId: number,
    attributes: ProductAttributeDto[],
  ) {
    if (productId === 0 || variantId === 0) {
      throw new Error('ProductId and VariantId are both required');
    }

    const body = new UpsertAttributesRequestDto(
      productId,
      variantId,
      attributes,
    );
    return this._httpClient.put(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/product/${productId}/variants/${variantId}/attributes`,
      body,
    );
  }
}
