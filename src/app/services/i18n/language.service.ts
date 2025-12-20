import {
  Injectable,
  PLATFORM_ID,
  Inject,
  signal,
  computed,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Language {
  code: string;
  name: string;
  description: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', description: 'United States' },
  { code: 'nl', name: 'Nederlands', description: 'Netherlands' },
];

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly STORAGE_KEY = 'lang';
  private readonly DEFAULT_LANG = 'nl';

  private _currentLanguage = signal<Language>(AVAILABLE_LANGUAGES[1]); // Default to Dutch

  readonly currentLanguage = this._currentLanguage.asReadonly();
  readonly currentLanguageCode = computed(() => this._currentLanguage().code);
  readonly availableLanguages = AVAILABLE_LANGUAGES;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.initLanguage();
  }

  private initLanguage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedLang =
        localStorage.getItem(this.STORAGE_KEY) ?? this.DEFAULT_LANG;
      const language = AVAILABLE_LANGUAGES.find((l) => l.code === storedLang);
      if (language) {
        this._currentLanguage.set(language);
      }
    }
  }

  setLanguage(languageCode: string): void {
    const language = AVAILABLE_LANGUAGES.find((l) => l.code === languageCode);
    if (language) {
      this._currentLanguage.set(language);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.STORAGE_KEY, languageCode);
      }
    }
  }

  isCurrentLanguage(languageCode: string): boolean {
    return this._currentLanguage().code === languageCode;
  }
}
