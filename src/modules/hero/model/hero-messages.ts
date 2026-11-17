import { EVENT_INFO } from '@/modules/event';
import { defineMessages } from '@/shared/i18n';

type HeroTexts = {
  badge: string;
  lead: string;
  vote: string;
  ticket: string;
  // The ceremony date goes into one of the running-line phrases.
  tickerPhrases: (ceremonyDate: string) => string[];
  countdown: {
    caption: string;
    over: string;
    units: { days: string; hours: string; minutes: string; seconds: string };
    timerLabel: (days: number) => string;
  };
};

export const HERO_MESSAGES = defineMessages<HeroTexts>({
  ru: {
    badge: `${EVENT_INFO.edition} · Зима ${EVENT_INFO.year}`,
    lead: 'Премия нашей компании за всё время. Вы выбираете героев, а мы вручаем им награды на церемонии.',
    vote: 'Голосовать',
    ticket: 'Билет на церемонию',
    tickerPhrases: (date) => [
      'Голоса решают всё',
      'Кто станет Preikh King?',
      `Церемония ${date}`,
      '+1000 ауры без усилий',
      'Номинантов собрала комиссия',
    ],
    countdown: {
      caption: 'До церемонии',
      over: 'Церемония состоялась — спасибо, что были с нами!',
      units: { days: 'дней', hours: 'часов', minutes: 'минут', seconds: 'секунд' },
      timerLabel: (days) => `До церемонии осталось дней: ${days}`,
    },
  },
  kk: {
    badge: `${EVENT_INFO.edition} · ${EVENT_INFO.year} қысы`,
    lead: 'Біздің топтың барлық уақыттағы сыйлығы. Кейіпкерлерді сіз таңдайсыз, ал біз оларды салтанатта марапаттаймыз.',
    vote: 'Дауыс беру',
    ticket: 'Салтанатқа билет',
    tickerPhrases: (date) => [
      'Бәрін дауыс шешеді',
      'Preikh King кім болады?',
      `Салтанат: ${date}`,
      'Еш күшсіз +1000 аура',
      'Номинанттарды комиссия жинады',
    ],
    countdown: {
      caption: 'Салтанатқа дейін',
      over: 'Салтанат өтті — бізбен бірге болғаныңызға рахмет!',
      units: { days: 'күн', hours: 'сағат', minutes: 'минут', seconds: 'секунд' },
      timerLabel: (days) => `Салтанатқа ${days} күн қалды`,
    },
  },
  en: {
    badge: `${EVENT_INFO.edition} · Winter ${EVENT_INFO.year}`,
    lead: "Our crew's all-time award. You pick the heroes, and we hand them their awards at the ceremony.",
    vote: 'Vote',
    ticket: 'Ceremony ticket',
    tickerPhrases: (date) => [
      'Votes decide everything',
      'Who will be Preikh King?',
      `Ceremony: ${date}`,
      '+1000 aura, zero effort',
      'Nominees picked by the commission',
    ],
    countdown: {
      caption: 'Until the ceremony',
      over: 'The ceremony is over — thanks for being with us!',
      units: { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' },
      timerLabel: (days) => `${days} days until the ceremony`,
    },
  },
});
