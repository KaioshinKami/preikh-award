import { defineMessages } from '@/shared/i18n';
import type { VoteStatus } from './types';

type NominationsTexts = {
  section: { eyebrow: string; title: string; lead: string; loading: string; empty: string };
  votingClosed: string;
  retry: string;
  card: { makeChoice: string; voted: string; vote: string; view: string };
  page: {
    back: string;
    loading: string;
    notFound: string;
    nominees: string;
    nomineesSoon: string;
    otherNominations: string;
    previous: string;
    next: string;
  };
  voteLabels: Record<VoteStatus, string>;
  confirmVote: (nomineeName: string) => string;
  application: {
    title: string;
    lead: string;
    guest: string;
    signIn: string;
    nomination: string;
    nominationOption: (title: string, category: string) => string;
    nominee: string;
    comment: string;
    submit: string;
    nameTooShort: (minLength: number) => string;
    sent: string;
  };
  // The "your own pick" field at the bottom of a nomination page.
  ownVariant: {
    title: string;
    lead: string;
    guest: string;
    signIn: string;
    label: string;
    placeholder: string;
    submit: string;
    tooShort: (minLength: number) => string;
    sent: string;
  };
};

export const NOMINATIONS_MESSAGES = defineMessages<NominationsTexts>({
  ru: {
    section: {
      eyebrow: 'Номинации 2026',
      title: 'Выбирай героев года',
      lead: 'Открой номинацию и проголосуй за своего героя. В каждой номинации — один голос, и изменить его нельзя.',
      loading: 'Загружаем номинации…',
      empty: 'Номинации появятся совсем скоро.',
    },
    votingClosed: 'Голосование сейчас закрыто.',
    retry: 'Попробовать снова',
    card: {
      makeChoice: 'Сделай выбор',
      voted: 'Голос отдан',
      vote: 'Проголосовать',
      view: 'Смотреть',
    },
    page: {
      back: '← Все номинации',
      loading: 'Загружаем номинацию…',
      notFound: 'Такой номинации нет.',
      nominees: 'Номинанты',
      nomineesSoon: 'Номинанты появятся совсем скоро.',
      otherNominations: 'Другие номинации',
      previous: '← Предыдущая',
      next: 'Следующая →',
    },
    voteLabels: {
      available: 'Голосовать',
      pending: 'Отправляем…',
      voted: 'Ваш голос',
      locked: 'Голос отдан',
      closed: 'Голосование закрыто',
    },
    confirmVote: (name) => `Отдать голос за «${name}»? Изменить его после отправки будет нельзя.`,
    application: {
      title: 'Предложить номинанта',
      lead: 'Не нашли своего кандидата? Предложите его — заявку проверит комиссия.',
      guest: 'Войдите, чтобы отправить заявку.',
      signIn: 'Войти',
      nomination: 'Номинация',
      nominationOption: (title, category) => `«${title}» — ${category}`,
      nominee: 'Кого предлагаете',
      comment: 'Почему (необязательно)',
      submit: 'Отправить заявку',
      nameTooShort: (min) => `Укажите имя номинанта — минимум ${min} символа`,
      sent: 'Заявка отправлена — модератор скоро её проверит.',
    },
    ownVariant: {
      title: 'Свой вариант',
      lead: 'Есть кандидат, которого нет в списке? Напишите его — комиссия увидит ваш вариант.',
      guest: 'Войдите, чтобы написать свой вариант.',
      signIn: 'Войти',
      label: 'Ваш вариант',
      placeholder: 'Кого бы вы выдвинули?',
      submit: 'Отправить',
      tooShort: (min) => `Напишите хотя бы ${min} символа`,
      sent: 'Спасибо! Ваш вариант отправлен комиссии.',
    },
  },
  kk: {
    section: {
      eyebrow: '2026 номинациялары',
      title: 'Жыл кейіпкерлерін таңда',
      lead: 'Номинацияны ашып, өз кейіпкеріңе дауыс бер. Әр номинацияда бір дауыс, оны өзгертуге болмайды.',
      loading: 'Номинациялар жүктелуде…',
      empty: 'Номинациялар жақында пайда болады.',
    },
    votingClosed: 'Дауыс беру қазір жабық.',
    retry: 'Қайталап көру',
    card: { makeChoice: 'Таңдау жаса', voted: 'Дауыс берілді', vote: 'Дауыс беру', view: 'Қарау' },
    page: {
      back: '← Барлық номинациялар',
      loading: 'Номинация жүктелуде…',
      notFound: 'Мұндай номинация жоқ.',
      nominees: 'Номинанттар',
      nomineesSoon: 'Номинанттар жақында пайда болады.',
      otherNominations: 'Басқа номинациялар',
      previous: '← Алдыңғы',
      next: 'Келесі →',
    },
    voteLabels: {
      available: 'Дауыс беру',
      pending: 'Жіберілуде…',
      voted: 'Сіздің дауысыңыз',
      locked: 'Дауыс берілді',
      closed: 'Дауыс беру жабық',
    },
    confirmVote: (name) =>
      `«${name}» үшін дауыс бересіз бе? Жіберілгеннен кейін оны өзгерту мүмкін болмайды.`,
    application: {
      title: 'Номинант ұсыну',
      lead: 'Өз үміткеріңізді таппадыңыз ба? Ұсыныңыз — өтінімді комиссия тексереді.',
      guest: 'Өтінім жіберу үшін кіріңіз.',
      signIn: 'Кіру',
      nomination: 'Номинация',
      nominationOption: (title, category) => `«${title}» — ${category}`,
      nominee: 'Кімді ұсынасыз',
      comment: 'Неліктен (міндетті емес)',
      submit: 'Өтінім жіберу',
      nameTooShort: (min) => `Номинанттың атын жазыңыз — кемінде ${min} таңба`,
      sent: 'Өтінім жіберілді — модератор жақында тексереді.',
    },
    ownVariant: {
      title: 'Өз нұсқаңыз',
      lead: 'Тізімде жоқ үміткер бар ма? Жазыңыз — комиссия сіздің нұсқаңызды көреді.',
      guest: 'Өз нұсқаңызды жазу үшін кіріңіз.',
      signIn: 'Кіру',
      label: 'Сіздің нұсқаңыз',
      placeholder: 'Кімді ұсынар едіңіз?',
      submit: 'Жіберу',
      tooShort: (min) => `Кемінде ${min} таңба жазыңыз`,
      sent: 'Рахмет! Нұсқаңыз комиссияға жіберілді.',
    },
  },
  en: {
    section: {
      eyebrow: 'Nominations 2026',
      title: 'Pick the heroes of the year',
      lead: "Open a nomination and vote for your hero. One vote per nomination, and it can't be changed.",
      loading: 'Loading nominations…',
      empty: 'Nominations are coming soon.',
    },
    votingClosed: 'Voting is closed right now.',
    retry: 'Try again',
    card: { makeChoice: 'Make your pick', voted: 'Voted', vote: 'Vote', view: 'View' },
    page: {
      back: '← All nominations',
      loading: 'Loading the nomination…',
      notFound: "This nomination doesn't exist.",
      nominees: 'Nominees',
      nomineesSoon: 'Nominees are coming soon.',
      otherNominations: 'Other nominations',
      previous: '← Previous',
      next: 'Next →',
    },
    voteLabels: {
      available: 'Vote',
      pending: 'Sending…',
      voted: 'Your vote',
      locked: 'Already voted',
      closed: 'Voting closed',
    },
    confirmVote: (name) => `Vote for “${name}”? You won't be able to change it after sending.`,
    application: {
      title: 'Suggest a nominee',
      lead: "Didn't find your candidate? Suggest them — the commission will review it.",
      guest: 'Sign in to send a suggestion.',
      signIn: 'Sign in',
      nomination: 'Nomination',
      nominationOption: (title, category) => `“${title}” — ${category}`,
      nominee: 'Who do you suggest',
      comment: 'Why (optional)',
      submit: 'Send suggestion',
      nameTooShort: (min) => `Enter the nominee's name — at least ${min} characters`,
      sent: 'Suggestion sent — a moderator will review it soon.',
    },
    ownVariant: {
      title: 'Your own pick',
      lead: 'Someone missing from the list? Write them in — the commission will see your pick.',
      guest: 'Sign in to write your own pick.',
      signIn: 'Sign in',
      label: 'Your pick',
      placeholder: 'Who would you nominate?',
      submit: 'Send',
      tooShort: (min) => `Write at least ${min} characters`,
      sent: 'Thanks! Your pick has been sent to the commission.',
    },
  },
});
