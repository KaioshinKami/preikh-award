import { defineMessages } from '@/shared/i18n';

type CommissionTexts = {
  eyebrow: string;
  title: string;
  role: string;
  members: string[];
};

export const COMMISSION_MESSAGES = defineMessages<CommissionTexts>({
  ru: {
    eyebrow: 'Комиссия',
    title: 'Те, кто собрал номинантов',
    role: 'Член комиссии',
    members: ['Елдар', 'Абди', 'Алишер', 'Алиби'],
  },
  kk: {
    eyebrow: 'Комиссия',
    title: 'Номинанттарды жинағандар',
    role: 'Комиссия мүшесі',
    members: ['Елдар', 'Абди', 'Алишер', 'Алиби'],
  },
  en: {
    eyebrow: 'Commission',
    title: 'The people who picked the nominees',
    role: 'Commission member',
    members: ['Yeldar', 'Abdi', 'Alisher', 'Alibi'],
  },
});
