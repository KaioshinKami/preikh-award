import { defineMessages, useMessages } from '@/shared/i18n';

export type NavLink = {
  href: string;
  label: string;
};

// Sections of the main page; the leading "/" makes them work from a nomination page too.
const NAV_TARGETS = ['about', 'nominations', 'stages', 'tickets', 'faq'] as const;
type NavTarget = (typeof NAV_TARGETS)[number];

const NAV_MESSAGES = defineMessages<Record<NavTarget, string>>({
  ru: {
    about: 'О премии',
    nominations: 'Номинации',
    stages: 'Этапы',
    tickets: 'Билеты',
    faq: 'FAQ',
  },
  kk: {
    about: 'Сыйлық туралы',
    nominations: 'Номинациялар',
    stages: 'Кезеңдер',
    tickets: 'Билеттер',
    faq: 'FAQ',
  },
  en: {
    about: 'About',
    nominations: 'Nominations',
    stages: 'Stages',
    tickets: 'Tickets',
    faq: 'FAQ',
  },
});

export function useNavLinks(): NavLink[] {
  const labels = useMessages(NAV_MESSAGES);
  return NAV_TARGETS.map((target) => ({ href: `/#${target}`, label: labels[target] }));
}
