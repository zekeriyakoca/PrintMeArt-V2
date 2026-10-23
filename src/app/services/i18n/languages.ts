export interface Language {
  code: string;
  name: string;
  description: string;
}

export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', description: 'United States' },
  { code: 'nl', name: 'Nederlands', description: 'Netherlands' },
];

export const DEFAULT_LANGUAGE = 'nl';

/** Cookie that remembers the language a visitor chose */
export const LANGUAGE_COOKIE = 'lang';

export function isLanguage(code: string | undefined): code is string {
  return AVAILABLE_LANGUAGES.some((language) => language.code === code);
}

/** Every page lives under its language: /en/... or /nl/... */
export function languageOfPath(path: string): string {
  const code = path.split('/')[1];
  return isLanguage(code) ? code : DEFAULT_LANGUAGE;
}
