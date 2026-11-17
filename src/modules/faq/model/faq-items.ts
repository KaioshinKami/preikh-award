import type { EventTexts } from '@/modules/event';
import { defineMessages } from '@/shared/i18n';

export type FaqItem = {
  question: string;
  answer: string;
};

type FaqTexts = {
  title: string;
  lead: string;
  // The last answer names the ceremony's date, time and place.
  items: (event: EventTexts) => FaqItem[];
};

export const FAQ_MESSAGES = defineMessages<FaqTexts>({
  ru: {
    title: 'Частые вопросы',
    lead: 'Коротко о голосовании, номинантах и церемонии.',
    items: (event) => [
      {
        question: 'Кто может голосовать?',
        answer:
          'Любой, у кого есть аккаунт на сайте. В каждой номинации — один голос, изменить его после отправки нельзя.',
      },
      {
        question: 'Как определяют победителей?',
        answer:
          'Только по голосам на сайте: побеждает номинант, за которого проголосовало больше всего людей. До церемонии результаты не видит никто, кроме комиссии.',
      },
      {
        question: 'Кто выбрал номинантов?',
        answer:
          'Комиссия: Елдар, Абди, Алишер и Алиби. Каждого номинанта кто-то из компании предложил сам.',
      },
      {
        question: 'Как предложить номинанта?',
        answer:
          'Войдите в аккаунт и заполните форму «Предложить номинанта» под списком номинаций. Заявку проверит комиссия.',
      },
      {
        question: 'Где и когда церемония?',
        answer: `${event.dateLabel}, ${event.timeLabel} — ${event.venue}. Там объявим победителей и вручим награды.`,
      },
    ],
  },
  kk: {
    title: 'Жиі қойылатын сұрақтар',
    lead: 'Дауыс беру, номинанттар және салтанат туралы қысқаша.',
    items: (event) => [
      {
        question: 'Кім дауыс бере алады?',
        answer:
          'Сайтта аккаунты бар кез келген адам. Әр номинацияда бір дауыс, жіберілгеннен кейін оны өзгертуге болмайды.',
      },
      {
        question: 'Жеңімпаздар қалай анықталады?',
        answer:
          'Тек сайттағы дауыстар бойынша: ең көп адам дауыс берген номинант жеңеді. Салтанатқа дейін нәтижелерді комиссиядан басқа ешкім көрмейді.',
      },
      {
        question: 'Номинанттарды кім таңдады?',
        answer: 'Комиссия: Елдар, Абди, Алишер және Алиби. Әр номинантты топтағы біреу өзі ұсынды.',
      },
      {
        question: 'Номинантты қалай ұсынуға болады?',
        answer:
          'Аккаунтқа кіріп, номинациялар тізімінің астындағы «Номинант ұсыну» формасын толтырыңыз. Өтінімді комиссия тексереді.',
      },
      {
        question: 'Салтанат қашан және қайда өтеді?',
        answer: `${event.dateLabel}, ${event.timeLabel} — ${event.venue}. Сол жерде жеңімпаздарды жариялап, марапаттарды табыстаймыз.`,
      },
    ],
  },
  en: {
    title: 'Frequently asked questions',
    lead: 'The short version on voting, nominees and the ceremony.',
    items: (event) => [
      {
        question: 'Who can vote?',
        answer:
          "Anyone with an account on the site. One vote per nomination, and it can't be changed once sent.",
      },
      {
        question: 'How are the winners decided?',
        answer:
          'Only by votes on the site: the nominee with the most votes wins. Until the ceremony, nobody but the commission sees the results.',
      },
      {
        question: 'Who picked the nominees?',
        answer:
          'The commission: Yeldar, Abdi, Alisher and Alibi. Every nominee was suggested by someone from the crew.',
      },
      {
        question: 'How do I suggest a nominee?',
        answer:
          'Sign in and fill in the “Suggest a nominee” form below the list of nominations. The commission will review it.',
      },
      {
        question: 'When and where is the ceremony?',
        answer: `${event.dateLabel}, ${event.timeLabel} — ${event.venue}. That's where we announce the winners and hand out the awards.`,
      },
    ],
  },
});
