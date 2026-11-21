import { defineMessages } from '@/shared/i18n';

export type TicketTier = {
  id: string;
  name: string;
  priceKzt: number;
  perks: string[];
  isFeatured?: boolean;
};

type TicketsTexts = {
  eyebrow: string;
  title: string;
  // `details` is "date, time · place".
  lead: (details: string) => string;
  calendarNote: string;
  calendarButton: string;
  featuredBadge: string;
  tiers: TicketTier[];
};

export const TICKETS_MESSAGES = defineMessages<TicketsTexts>({
  ru: {
    eyebrow: 'Офлайн',
    title: 'Встретимся под снегопадом',
    lead: (details) => `${details}. Вручение наград победителям, которых выбрали вы.`,
    calendarNote: 'Добавьте церемонию в календарь, чтобы не пропустить.',
    calendarButton: 'Добавить в календарь',
    featuredBadge: 'Выбор зрителей',
    tiers: [
      {
        id: 'guest',
        name: 'Гость церемонии',
        priceKzt: 5000,
        perks: ['Вход на церемонию', 'Вручение всех наград вживую', 'Вся компания в одном месте'],
      },
    ],
  },
  kk: {
    eyebrow: 'Офлайн',
    title: 'Қар астында кездесейік',
    lead: (details) => `${details}. Сіз таңдаған жеңімпаздарды марапаттау.`,
    calendarNote: 'Өткізіп алмау үшін салтанатты күнтізбеге қосыңыз.',
    calendarButton: 'Күнтізбеге қосу',
    featuredBadge: 'Көрермендер таңдауы',
    tiers: [
      {
        id: 'guest',
        name: 'Салтанат қонағы',
        priceKzt: 5000,
        perks: ['Салтанатқа кіру', 'Барлық марапатты тікелей табыстау', 'Бүкіл топ бір жерде'],
      },
    ],
  },
  en: {
    eyebrow: 'Offline',
    title: "Let's meet under the snowfall",
    lead: (details) => `${details}. Awards for the winners you picked.`,
    calendarNote: "Add the ceremony to your calendar so you don't miss it.",
    calendarButton: 'Add to calendar',
    featuredBadge: 'Audience pick',
    tiers: [
      {
        id: 'guest',
        name: 'Ceremony guest',
        priceKzt: 5000,
        perks: [
          'Entry to the ceremony',
          'Every award handed out live',
          'The whole crew in one place',
        ],
      },
    ],
  },
});
