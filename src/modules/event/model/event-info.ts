// Facts that read the same in every language; the date, place and other texts are in event-messages.
export const EVENT_INFO = {
  name: 'PREIKH AWARD',
  edition: 'All Time',
  year: 2026,
  // While true, the countdown shows "?" instead of numbers and there is no "add to calendar"
  // button. The date, time and place themselves are "?" in event-messages.
  isCeremonySecret: true,
  // Kazakhstan time (UTC+5). Only decides when each stage counts as running.
  ceremonyStartIso: '2026-12-12T19:00:00+05:00',
  ceremonyEndIso: '2026-12-12T23:59:00+05:00',
} as const;
