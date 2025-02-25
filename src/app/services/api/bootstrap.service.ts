import { Injectable, signal, Signal } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  catchError,
  first,
  map,
  Observable,
  of,
  take,
  tap,
  throwError,
} from 'rxjs';

import { ATTRIBUTE_GROUPS, PRICE_POLICY_OPTIONS } from './mockData';
import { AttributeGroupDto } from '../../models/attirubuteGroup';
import { environment } from '../../../environments/environment';
import { SelectDto } from '../../models/select';
import { CategoryDto } from '../../models/category';

@Injectable({
  providedIn: 'root',
})
export class BootstrapService {
  constructor(private _httpClient: HttpClient) {}

  private categories = signal<CategoryDto[]>([]);
  public get Categories(): Signal<CategoryDto[]> {
    return this.categories;
  }

  private attributeGroups = signal<AttributeGroupDto[]>([]);
  public get AttributeGroups(): Signal<AttributeGroupDto[]> {
    return this.attributeGroups.asReadonly();
  }

  fetchCategories() {
    if (this.categories().length <= 0) {
      this.getCategories().pipe(first()).subscribe();
    }
  }

  private getCategories(): Observable<CategoryDto[] | undefined> {
    return this._httpClient
      .get<CategoryDto[]>(
        `${environment.serviceUrls['catalog-api']}/catalog/v1/category`
      )
      .pipe(
        tap((categories) => {
          this.categories.set(categories ?? []);
        })
      );
  }

  getPricePolicyOptions(): Observable<SelectDto[]> {
    return of(PRICE_POLICY_OPTIONS).pipe(map((x) => x!));
  }

  fetchAttributeGroups(force: boolean = false) {
    if (force || this.attributeGroups().length <= 0) {
      this.getAttributeGroups().pipe(take(1)).subscribe();
    }
  }

  getAttributeGroups(): Observable<AttributeGroupDto[]> {
    return this._httpClient
      .get<AttributeGroupDto[]>(
        `${environment.serviceUrls['catalog-api']}/catalog/v1/attribute-group`
      )
      .pipe(
        take(1),
        tap((attributeGroups) => {
          this.attributeGroups.set(attributeGroups ?? []);
        })
      );
    return of(ATTRIBUTE_GROUPS);
  }
  getAttirbuteGroup(id: number): Observable<AttributeGroupDto | undefined> {
    return of(ATTRIBUTE_GROUPS.filter((group) => group.id === id)[0]);
  }
}
