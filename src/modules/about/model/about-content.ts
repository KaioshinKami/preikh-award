import { defineMessages } from '@/shared/i18n';

export type AboutStat = {
  value: string;
  label: string;
};

type AboutTexts = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  stats: AboutStat[];
};

export const ABOUT_MESSAGES = defineMessages<AboutTexts>({
  ru: {
    eyebrow: 'О премии',
    title: 'Самая тёплая ночь холодного сезона',
    paragraphs: [
      'PREIKH AWARD — премия нашей компании за всё время. Здесь награждают своих: королей и душнил, опоздунов и движ-мейкеров, всех, без кого эти годы были бы скучнее.',
      'Номинантов собрала комиссия, а победителей выбираете вы: в каждой номинации побеждает тот, за кого отдали больше всего голосов. Итоги держим в секрете до церемонии.',
    ],
    stats: [
      { value: '2023–2026', label: 'все истории за всё время' },
      { value: '4', label: 'человека в комиссии' },
      { value: '1 голос', label: 'в каждой номинации' },
      { value: '1 ночь', label: 'чтобы вручить все награды' },
    ],
  },
  kk: {
    eyebrow: 'Сыйлық туралы',
    title: 'Суық маусымның ең жылы түні',
    paragraphs: [
      'PREIKH AWARD — біздің топтың барлық уақыттағы сыйлығы. Мұнда өзімізді марапаттаймыз: королдер мен зеріктіргіштерді, кешігушілер мен думан ұйымдастырушыларды — онсыз бұл жылдар әлдеқайда іш пыстырарлық болар еді.',
      'Номинанттарды комиссия жинады, ал жеңімпаздарды сіз таңдайсыз: әр номинацияда ең көп дауыс жинаған адам жеңеді. Қорытындыны салтанатқа дейін құпия сақтаймыз.',
    ],
    stats: [
      { value: '2023–2026', label: 'барлық уақыттағы оқиғалар' },
      { value: '4', label: 'адам комиссияда' },
      { value: '1 дауыс', label: 'әр номинацияда' },
      { value: '1 түн', label: 'барлық марапатты табыстауға' },
    ],
  },
  en: {
    eyebrow: 'About the award',
    title: 'The warmest night of the cold season',
    paragraphs: [
      "PREIKH AWARD is our crew's all-time award. Here we celebrate our own: kings and killjoys, latecomers and party starters — everyone who made these years less boring.",
      'The commission picked the nominees, and you pick the winners: in each nomination, whoever gets the most votes wins. The results stay secret until the ceremony.',
    ],
    stats: [
      { value: '2023–2026', label: 'every story, all time' },
      { value: '4', label: 'people on the commission' },
      { value: '1 vote', label: 'in each nomination' },
      { value: '1 night', label: 'to hand out every award' },
    ],
  },
});
