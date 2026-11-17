import {
  defineMessages,
  LOCALE_NAMES,
  LOCALES,
  setLocale,
  useLocale,
  useMessages,
} from '@/shared/i18n';
import styles from './language-switcher.module.scss';

const MESSAGES = defineMessages({
  ru: { label: 'Язык сайта' },
  kk: { label: 'Сайт тілі' },
  en: { label: 'Site language' },
});

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale();
  const t = useMessages(MESSAGES);
  const classNames = [styles.switcher, className].filter(Boolean).join(' ');

  return (
    <div className={classNames} role='group' aria-label={t.label}>
      {LOCALES.map((option) => (
        <button
          key={option}
          type='button'
          className={styles.option}
          lang={option}
          title={LOCALE_NAMES[option].full}
          aria-label={LOCALE_NAMES[option].full}
          aria-pressed={option === locale}
          onClick={() => setLocale(option)}
        >
          {LOCALE_NAMES[option].short}
        </button>
      ))}
    </div>
  );
}
