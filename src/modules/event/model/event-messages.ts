import { defineMessages, useMessages } from '@/shared/i18n';
import { EVENT_INFO } from './event-info';

export type EventTexts = {
  dateLabel: string;
  timeLabel: string;
  venue: string;
  calendarTitle: string;
};

const EVENT_MESSAGES = defineMessages<EventTexts>({
  ru: {
    dateLabel: '12 декабря 2026',
    timeLabel: '19:00',
    venue: 'Дом Абди',
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — церемония`,
  },
  kk: {
    dateLabel: '2026 жылғы 12 желтоқсан',
    timeLabel: '19:00',
    venue: 'Абдидің үйі',
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — салтанат`,
  },
  en: {
    dateLabel: 'December 12, 2026',
    timeLabel: '19:00',
    venue: "Abdi's place",
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — ceremony`,
  },
});

export function useEventTexts(): EventTexts {
  return useMessages(EVENT_MESSAGES);
}
