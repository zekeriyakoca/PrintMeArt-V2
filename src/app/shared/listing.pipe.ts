import { inject, Pipe, PipeTransform } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { LanguageService } from '../services/i18n/language.service';
import { listingLink } from './category-path';

/**
 * A catalog link for routerLink: a category name ('Landscape') or the list's filters ({ attributeName: 'Rijksmuseum' }).
 * A bare category goes to its own page (/categorie/landschap), anything else to the filtered catalog.
 */
@Pipe({ name: 'listing' })
export class ListingPipe implements PipeTransform {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService).currentLanguageCode();

  transform(filters: string | Record<string, string | number | undefined>): UrlTree {
    return this.router.parseUrl(listingLink(this.language, typeof filters === 'string' ? { categoryName: filters } : filters));
  }
}
