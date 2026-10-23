import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslationService } from './translation.service';

/** {{ 'product.addToCart' | t }} — the text in the page's language. */
@Pipe({ name: 't' })
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(TranslationService);

  transform(key: string | null | undefined, params?: Record<string, string | number>): string {
    return key ? this.i18n.t(key, params) : '';
  }
}
