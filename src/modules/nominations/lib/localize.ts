import type { Locale } from '@/shared/i18n';

type Translations<Field extends string> = Partial<
  Record<'kk' | 'en', Partial<Record<Field, string>>>
>;

type Translatable<Field extends string> = Record<Field, string> & {
  translations?: Translations<Field>;
};

// The texts in the visitor's language; a field without a translation keeps its Russian text.
export function localize<Field extends string>(
  item: Translatable<Field>,
  fields: readonly Field[],
  locale: Locale,
): Record<Field, string> {
  const translated = locale === 'ru' ? undefined : item.translations?.[locale];
  return Object.fromEntries(
    fields.map((field) => [field, translated?.[field] || item[field]]),
  ) as Record<Field, string>;
}

export const NOMINATION_FIELDS = ['title', 'category', 'description'] as const;
export const NOMINEE_FIELDS = ['name', 'tagline'] as const;
