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

/** Every page lives under its language: /en/... or /nl/... */
export function languageOfPath(path: string): string {
  const code = path.split('/')[1];
  return AVAILABLE_LANGUAGES.some((language) => language.code === code) ? code : DEFAULT_LANGUAGE;
}
