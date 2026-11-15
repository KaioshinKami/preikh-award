import { EVENT_INFO } from '@/modules/event';

export type VotingStage = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  startIso: string;
  endIso: string;
};

export type StageStatus = 'done' | 'active' | 'upcoming';

export const VOTING_STAGES: VotingStage[] = [
  {
    id: 'nominees',
    title: 'Номинанты',
    description: 'Компания предложила кандидатов, комиссия собрала из них номинации.',
    dateLabel: 'до 13 ноября',
    startIso: '2026-11-01T00:00:00+05:00',
    endIso: '2026-11-13T23:59:59+05:00',
  },
  {
    id: 'voting',
    title: 'Голосование',
    description: 'Один голос в каждой номинации. Своего кандидата можно предложить через заявку.',
    dateLabel: '14 ноября – 10 декабря',
    startIso: '2026-11-14T00:00:00+05:00',
    endIso: '2026-12-10T23:59:59+05:00',
  },
  {
    id: 'counting',
    title: 'Подсчёт голосов',
    description: 'Голосование закрыто. Итоги знает только комиссия, и она молчит.',
    dateLabel: '11 декабря',
    startIso: '2026-12-11T00:00:00+05:00',
    endIso: '2026-12-11T23:59:59+05:00',
  },
  {
    id: 'ceremony',
    title: 'Церемония',
    description: `Объявляем победителей и вручаем награды. ${EVENT_INFO.venue}, ${EVENT_INFO.timeLabel}.`,
    dateLabel: EVENT_INFO.dateLabel,
    startIso: EVENT_INFO.ceremonyStartIso,
    endIso: EVENT_INFO.ceremonyEndIso,
  },
];
