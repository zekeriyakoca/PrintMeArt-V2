import { inject, Injectable } from '@angular/core';
import { LanguageService } from './language.service';

type Dictionary = { [key: string]: string | Dictionary };

const DICTIONARIES: Record<string, () => Promise<{ default: Dictionary }>> = {
  en: () => import('../../i18n/en.json'),
  nl: () => import('../../i18n/nl.json'),
};

/** The interface texts for the page's language, from src/app/i18n/<language>.json. */
@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  readonly language = inject(LanguageService).currentLanguageCode();
  private dictionary: Dictionary = {};

  /** Loads only the current language, once, before the app renders. */
  async load(): Promise<void> {
    this.dictionary = (await DICTIONARIES[this.language]()).default;
  }

  /** 'product.madeIn' + { city: 'Den Bosch' } → "Gemaakt in Den Bosch door …" */
  t(key: string, params?: Record<string, string | number>): string {
    const text = this.lookup(key);
    return params ? text.replace(/{{(\w+)}}/g, (_, name: string) => String(params[name] ?? '')) : text;
  }

  /** The text for a key, or undefined when the dictionary has none (no fallback) */
  find(key: string): string | undefined {
    const found = key.split('.').reduce<string | Dictionary | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), this.dictionary);
    return typeof found === 'string' ? found : undefined;
  }

  /**
   * Catalog names and fixed terms are keyed by their English text, which may contain dots
   * ('name.Classic black frame with a clean, timeless look.'); without a translation they show as themselves,
   * as does a plain name ('Rijksmuseum').
   */
  private lookup(key: string): string {
    const found = key.split('.').reduce<string | Dictionary | undefined>((node, part) => (typeof node === 'object' ? node[part] : undefined), this.dictionary);
    if (typeof found === 'string') return found;
    const dot = key.indexOf('.');
    const group = dot > 0 ? this.dictionary[key.slice(0, dot)] : undefined;
    if (typeof group !== 'object') return key;
    const named = group[key.slice(dot + 1)];
    return typeof named === 'string' ? named : key.slice(dot + 1);
  }
}
