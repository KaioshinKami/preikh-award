// Languages a nomination or nominee can be translated into; Russian is the main text.
export const TRANSLATION_LOCALES = ['kk', 'en'] as const;
export type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export type Translations<Field extends string> = Partial<
  Record<TranslationLocale, Partial<Record<Field, string>>>
>;

export type NominationTranslations = Translations<'title' | 'category' | 'description'>;
export type NomineeTranslations = Translations<'name' | 'tagline'>;

// JSON schema for the translations object, with the same length limits as the Russian fields.
export function translationsSchema(fieldLimits: Record<string, number>) {
  const textsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: Object.fromEntries(
      Object.entries(fieldLimits).map(([field, maxLength]) => [
        field,
        { type: 'string', maxLength },
      ]),
    ),
  };
  return {
    type: 'object',
    additionalProperties: false,
    properties: Object.fromEntries(TRANSLATION_LOCALES.map((locale) => [locale, textsSchema])),
  };
}

// Trims every text and drops the empty ones, so a missing translation falls back to Russian.
export function cleanTranslations<Field extends string>(
  translations: Translations<Field> | undefined,
): Translations<Field> {
  const cleaned: Translations<Field> = {};
  for (const locale of TRANSLATION_LOCALES) {
    const texts = Object.entries(translations?.[locale] ?? {})
      .map(([field, value]) => [field, String(value).trim()] as const)
      .filter(([, value]) => value.length > 0);
    if (texts.length > 0) {
      cleaned[locale] = Object.fromEntries(texts) as Partial<Record<Field, string>>;
    }
  }
  return cleaned;
}
