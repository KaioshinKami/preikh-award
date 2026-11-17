import type { EventTexts } from '@/modules/event';
import { EVENT_INFO } from '@/modules/event';
import { defineMessages } from '@/shared/i18n';

export type StageId = 'nominees' | 'voting' | 'counting' | 'ceremony';

// When each stage runs; the texts are in VOTING_STAGES_MESSAGES.
export type VotingStage = {
  id: StageId;
  startIso: string;
  endIso: string;
};

export type StageStatus = 'done' | 'active' | 'upcoming';

export const VOTING_STAGES: VotingStage[] = [
  { id: 'nominees', startIso: '2026-11-01T00:00:00+05:00', endIso: '2026-11-13T23:59:59+05:00' },
  { id: 'voting', startIso: '2026-11-14T00:00:00+05:00', endIso: '2026-12-10T23:59:59+05:00' },
  { id: 'counting', startIso: '2026-12-11T00:00:00+05:00', endIso: '2026-12-11T23:59:59+05:00' },
  { id: 'ceremony', startIso: EVENT_INFO.ceremonyStartIso, endIso: EVENT_INFO.ceremonyEndIso },
];

type StageTexts = { title: string; description: string; dateLabel: string };

type VotingStagesTexts = {
  eyebrow: string;
  title: string;
  lead: string;
  statuses: Record<StageStatus, string>;
  // The ceremony stage repeats its date, time and place.
  stages: (event: EventTexts) => Record<StageId, StageTexts>;
};

export const VOTING_STAGES_MESSAGES = defineMessages<VotingStagesTexts>({
  ru: {
    eyebrow: 'Как это работает',
    title: 'Четыре шага до награды',
    lead: 'Компания предлагает, комиссия собирает, вы голосуете, а победителей объявляем вживую.',
    statuses: { done: 'Завершён', active: 'Идёт сейчас', upcoming: 'Скоро' },
    stages: (event) => ({
      nominees: {
        title: 'Номинанты',
        description: 'Компания предложила кандидатов, комиссия собрала из них номинации.',
        dateLabel: 'до 13 ноября',
      },
      voting: {
        title: 'Голосование',
        description:
          'Один голос в каждой номинации. Своего кандидата можно предложить через заявку.',
        dateLabel: '14 ноября – 10 декабря',
      },
      counting: {
        title: 'Подсчёт голосов',
        description: 'Голосование закрыто. Итоги знает только комиссия, и она молчит.',
        dateLabel: '11 декабря',
      },
      ceremony: {
        title: 'Церемония',
        description: `Объявляем победителей и вручаем награды. ${event.venue}, ${event.timeLabel}.`,
        dateLabel: event.dateLabel,
      },
    }),
  },
  kk: {
    eyebrow: 'Бұл қалай өтеді',
    title: 'Марапатқа дейін төрт қадам',
    lead: 'Топ ұсынады, комиссия жинайды, сіз дауыс бересіз, ал жеңімпаздарды тікелей жариялаймыз.',
    statuses: { done: 'Аяқталды', active: 'Қазір жүріп жатыр', upcoming: 'Жақында' },
    stages: (event) => ({
      nominees: {
        title: 'Номинанттар',
        description: 'Топ үміткерлерді ұсынды, комиссия солардан номинациялар құрады.',
        dateLabel: '13 қарашаға дейін',
      },
      voting: {
        title: 'Дауыс беру',
        description: 'Әр номинацияда бір дауыс. Өз үміткеріңізді өтінім арқылы ұсына аласыз.',
        dateLabel: '14 қараша – 10 желтоқсан',
      },
      counting: {
        title: 'Дауыс санау',
        description: 'Дауыс беру жабылды. Қорытындыны тек комиссия біледі, ал ол үндемейді.',
        dateLabel: '11 желтоқсан',
      },
      ceremony: {
        title: 'Салтанат',
        description: `Жеңімпаздарды жариялап, марапаттарды табыстаймыз. ${event.venue}, ${event.timeLabel}.`,
        dateLabel: event.dateLabel,
      },
    }),
  },
  en: {
    eyebrow: 'How it works',
    title: 'Four steps to the award',
    lead: 'The crew suggests, the commission collects, you vote, and we announce the winners live.',
    statuses: { done: 'Done', active: 'In progress', upcoming: 'Coming up' },
    stages: (event) => ({
      nominees: {
        title: 'Nominees',
        description:
          'The crew suggested candidates, and the commission turned them into nominations.',
        dateLabel: 'until November 13',
      },
      voting: {
        title: 'Voting',
        description: 'One vote per nomination. You can suggest your own candidate with the form.',
        dateLabel: 'November 14 – December 10',
      },
      counting: {
        title: 'Vote count',
        description: 'Voting is closed. Only the commission knows the results, and it keeps quiet.',
        dateLabel: 'December 11',
      },
      ceremony: {
        title: 'Ceremony',
        description: `We announce the winners and hand out the awards. ${event.venue}, ${event.timeLabel}.`,
        dateLabel: event.dateLabel,
      },
    }),
  },
});
