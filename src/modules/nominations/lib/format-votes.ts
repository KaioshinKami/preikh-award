import type { Locale } from '@/shared/i18n';

type VoteWords = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

// Kept here rather than in the dictionaries so this stays a plain function the admin page and
// the tests can call without React.
const LOCALE_TAGS: Record<Locale, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-US' };

const VOTE_WORDS: Record<Locale, VoteWords> = {
  ru: { one: 'голос', few: 'голоса', many: 'голосов', other: 'голоса' },
  kk: { other: 'дауыс' },
  en: { one: 'vote', other: 'votes' },
};

// 1 → "1 голос", 3 → "3 голоса", 18 420 → "18 420 голосов"; "1 vote" / "2 votes"; "5 дауыс".
export function formatVotes(count: number, locale: Locale = 'ru'): string {
  const tag = LOCALE_TAGS[locale];
  const words = VOTE_WORDS[locale];
  const rule = new Intl.PluralRules(tag).select(count);
  return `${new Intl.NumberFormat(tag).format(count)} ${words[rule] ?? words.other}`;
}
