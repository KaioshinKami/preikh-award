export const LOCALES = ['ru', 'kk', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

// BCP 47 tags for Intl: numbers, plurals and prices follow the chosen language.
export const LOCALE_TAGS: Record<Locale, string> = {
  ru: 'ru-RU',
  kk: 'kk-KZ',
  en: 'en-US',
};

// Short labels for the switcher and the full names for its tooltips.
export const LOCALE_NAMES: Record<Locale, { short: string; full: string }> = {
  ru: { short: 'РУС', full: 'Русский' },
  kk: { short: 'ҚАЗ', full: 'Қазақша' },
  en: { short: 'ENG', full: 'English' },
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

// The visitor's own choice wins; on a first visit the first browser language the site has
// ("kk-KZ" → kk), else Russian.
export function detectLocale(stored: string | null, browserLanguages: readonly string[]): Locale {
  if (isLocale(stored)) return stored;
  for (const language of browserLanguages) {
    const primary = language.toLowerCase().split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}
