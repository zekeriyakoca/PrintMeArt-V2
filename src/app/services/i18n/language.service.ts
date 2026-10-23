import { APP_BASE_HREF, DOCUMENT, isPlatformServer, PlatformLocation } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, Provider, REQUEST_CONTEXT } from '@angular/core';
import { Router } from '@angular/router';
import { AVAILABLE_LANGUAGES, languageOfPath } from './languages';

export { AVAILABLE_LANGUAGES, type Language } from './languages';

/**
 * The app runs with its language as its base (/en or /nl), so routes and links stay language-free.
 * In the browser the language is read from the URL; the server is handed the page without its
 * language and gets it alongside (server.ts). Reading the routes at build time has no language.
 */
export function provideLanguageBase(): Provider {
  return {
    provide: APP_BASE_HREF,
    useFactory: () => {
      if (!isPlatformServer(inject(PLATFORM_ID))) return `/${languageOfPath(inject(PlatformLocation).pathname)}`;
      const language = (inject(REQUEST_CONTEXT, { optional: true }) as { language?: string } | null)?.language;
      return language ? `/${language}` : '/';
    },
  };
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);

  readonly currentLanguage = AVAILABLE_LANGUAGES.find((l) => l.code === languageOfPath(inject(APP_BASE_HREF)))!;
  readonly availableLanguages = AVAILABLE_LANGUAGES;

  currentLanguageCode(): string {
    return this.currentLanguage.code;
  }

  constructor() {
    this.document.documentElement.lang = this.currentLanguage.code;
  }

  /** Opens the same page in that language; the server remembers it for next time. */
  setLanguage(languageCode: string): void {
    if (languageCode === this.currentLanguage.code) return;
    this.document.location.assign(`/${languageCode}${this.router.url}`);
  }

  isCurrentLanguage(languageCode: string): boolean {
    return this.currentLanguage.code === languageCode;
  }
}
