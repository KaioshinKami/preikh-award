const numberFormat = new Intl.NumberFormat('ru-RU');
const pluralRules = new Intl.PluralRules('ru-RU');

const VOTE_WORDS: Record<string, string> = {
  one: 'голос',
  few: 'голоса',
  many: 'голосов',
  other: 'голоса',
};

// 1 → "1 голос", 3 → "3 голоса", 18 420 → "18 420 голосов"
export function formatVotes(count: number): string {
  return `${numberFormat.format(count)} ${VOTE_WORDS[pluralRules.select(count)]}`;
}
