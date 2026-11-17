import { EVENT_INFO } from '../model/event-info';
import type { EventTexts } from '../model/event-messages';

// Google Calendar expects UTC timestamps like 20261220T160000Z.
function toCalendarTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
}

export function getCeremonyCalendarUrl(texts: EventTexts): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: texts.calendarTitle,
    dates: `${toCalendarTimestamp(EVENT_INFO.ceremonyStartIso)}/${toCalendarTimestamp(EVENT_INFO.ceremonyEndIso)}`,
    location: texts.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
