import { TextField } from '@/shared/components';
import type { TranslationLocale, Translations } from '../../model/types';
import styles from './translation-fields.module.scss';

export type TranslatedField<Field extends string> = {
  name: Field;
  label: string;
  maxLength: number;
  isMultiline?: boolean;
};

const LOCALE_TITLES: Record<TranslationLocale, string> = {
  kk: 'Қазақша',
  en: 'English',
};

const TRANSLATION_LOCALES: TranslationLocale[] = ['kk', 'en'];

type TranslationFieldsProps<Field extends string> = {
  fields: TranslatedField<Field>[];
  initialValues?: Translations<Field>;
};

// Kazakh and English versions of the Russian texts above. Empty fields show the Russian text
// on the site. The inputs are named "kk.title", "en.name", … for readTranslations().
export function TranslationFields<Field extends string>({
  fields,
  initialValues,
}: TranslationFieldsProps<Field>) {
  const hasTranslations = TRANSLATION_LOCALES.some(
    (locale) => Object.keys(initialValues?.[locale] ?? {}).length > 0,
  );

  return (
    <details className={styles.translations} open={hasTranslations}>
      <summary className={styles.summary}>Переводы: казахский и английский</summary>
      <p className={styles.hint}>Если поле пустое, на сайте показывается русский текст.</p>
      <div className={styles.locales}>
        {TRANSLATION_LOCALES.map((locale) => (
          <fieldset key={locale} className={styles.locale} lang={locale}>
            <legend className={styles.legend}>{LOCALE_TITLES[locale]}</legend>
            {fields.map((field) => (
              <TextField
                key={field.name}
                label={field.label}
                name={`${locale}.${field.name}`}
                maxLength={field.maxLength}
                defaultValue={initialValues?.[locale]?.[field.name] ?? ''}
                {...(field.isMultiline ? { isMultiline: true as const } : {})}
              />
            ))}
          </fieldset>
        ))}
      </div>
    </details>
  );
}

export function readTranslations<Field extends string>(
  formData: FormData,
  fields: readonly TranslatedField<Field>[],
): Translations<Field> {
  const translations: Translations<Field> = {};
  for (const locale of TRANSLATION_LOCALES) {
    translations[locale] = Object.fromEntries(
      fields.map((field) => [
        field.name,
        String(formData.get(`${locale}.${field.name}`) ?? '').trim(),
      ]),
    ) as Partial<Record<Field, string>>;
  }
  return translations;
}
