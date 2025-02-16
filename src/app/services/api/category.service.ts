import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { CategoryDto } from '../../models/category';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private _httpClient: HttpClient) {}

  updateCategoryTree(categories: CategoryDto[]): Observable<void> {
    const flattenCategories = [
      categories,
      ...categories.map((x) => [
        x.childCategories,
        ...(x.childCategories?.map((x) => x.childCategories) ?? []),
      ]),
    ].flat(Infinity);
    return this._httpClient.put<void>(
      `${environment.serviceUrls['catalog-api']}/catalog/v1/category/tree`,
      { categories: flattenCategories }
    );
  }
}
