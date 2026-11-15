import { EVENT_INFO } from '../model/event-info';

// Google Calendar expects UTC timestamps like 20261220T160000Z.
function toCalendarTimestamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '');
}

export function getCeremonyCalendarUrl(): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${EVENT_INFO.name} ${EVENT_INFO.year} — церемония`,
    dates: `${toCalendarTimestamp(EVENT_INFO.ceremonyStartIso)}/${toCalendarTimestamp(EVENT_INFO.ceremonyEndIso)}`,
    location: EVENT_INFO.venue,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
