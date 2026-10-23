import { DOCUMENT, PlatformLocation } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AVAILABLE_LANGUAGES, languageOfPath } from './languages';

export { AVAILABLE_LANGUAGES, type Language } from './languages';

/** The language comes from the URL; the app runs with /en or /nl as its base. */
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly currentLanguage = AVAILABLE_LANGUAGES.find((l) => l.code === languageOfPath(inject(PlatformLocation).pathname))!;
  readonly availableLanguages = AVAILABLE_LANGUAGES;

  currentLanguageCode(): string {
    return this.currentLanguage.code;
  }

  /** Opens the same page in the other language. */
  setLanguage(languageCode: string): void {
    if (languageCode !== this.currentLanguage.code) {
      this.document.location.assign(`/${languageCode}${this.router.url}`);
    }
  }

  isCurrentLanguage(languageCode: string): boolean {
    return this.currentLanguage.code === languageCode;
  }
}
