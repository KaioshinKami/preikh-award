import { defineMessages, useMessages } from '@/shared/i18n';
import { EVENT_INFO } from './event-info';

export type EventTexts = {
  dateLabel: string;
  timeLabel: string;
  venue: string;
  calendarTitle: string;
};

// The ceremony's date, time and place are kept secret for now.
const SECRET = '?';

const EVENT_MESSAGES = defineMessages<EventTexts>({
  ru: {
    dateLabel: SECRET,
    timeLabel: SECRET,
    venue: SECRET,
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — церемония`,
  },
  kk: {
    dateLabel: SECRET,
    timeLabel: SECRET,
    venue: SECRET,
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — салтанат`,
  },
  en: {
    dateLabel: SECRET,
    timeLabel: SECRET,
    venue: SECRET,
    calendarTitle: `${EVENT_INFO.name} ${EVENT_INFO.year} — ceremony`,
  },
});

export function useEventTexts(): EventTexts {
  return useMessages(EVENT_MESSAGES);
}
