import { defineMessages } from '@/shared/i18n';
import type { AuthMode } from './types';

type DialogCopy = { title: string; lead: string; switchText: string; switchAction: string };

type AuthTexts = {
  dialog: Record<AuthMode, DialogCopy>;
  close: string;
  fields: { name: string; email: string; password: string };
  passwordHint: (minLength: number) => string;
  submit: Record<AuthMode, string>;
  errors: {
    nameTooShort: (minLength: number) => string;
    invalidEmail: string;
    passwordTooShort: (minLength: number) => string;
    passwordRequired: string;
  };
  account: { signIn: string; admin: string; signOut: string };
};

export const AUTH_MESSAGES = defineMessages<AuthTexts>({
  ru: {
    dialog: {
      login: {
        title: 'Вход',
        lead: 'Войдите, чтобы голосовать и предлагать номинантов.',
        switchText: 'Нет аккаунта?',
        switchAction: 'Зарегистрироваться',
      },
      register: {
        title: 'Регистрация',
        lead: 'Аккаунт нужен, чтобы голосовать и предлагать номинантов.',
        switchText: 'Уже есть аккаунт?',
        switchAction: 'Войти',
      },
    },
    close: 'Закрыть',
    fields: { name: 'Имя', email: 'Email', password: 'Пароль' },
    passwordHint: (min) => `Не меньше ${min} символов`,
    submit: { login: 'Войти', register: 'Создать аккаунт' },
    errors: {
      nameTooShort: (min) => `Введите имя — минимум ${min} символа`,
      invalidEmail: 'Введите корректный email',
      passwordTooShort: (min) => `Пароль должен быть не короче ${min} символов`,
      passwordRequired: 'Введите пароль',
    },
    account: { signIn: 'Войти', admin: 'Админка', signOut: 'Выйти' },
  },
  kk: {
    dialog: {
      login: {
        title: 'Кіру',
        lead: 'Дауыс беру және номинант ұсыну үшін кіріңіз.',
        switchText: 'Аккаунтыңыз жоқ па?',
        switchAction: 'Тіркелу',
      },
      register: {
        title: 'Тіркелу',
        lead: 'Дауыс беру және номинант ұсыну үшін аккаунт керек.',
        switchText: 'Аккаунтыңыз бар ма?',
        switchAction: 'Кіру',
      },
    },
    close: 'Жабу',
    fields: { name: 'Аты', email: 'Email', password: 'Құпиясөз' },
    passwordHint: (min) => `Кемінде ${min} таңба`,
    submit: { login: 'Кіру', register: 'Аккаунт ашу' },
    errors: {
      nameTooShort: (min) => `Атыңызды жазыңыз — кемінде ${min} таңба`,
      invalidEmail: 'Дұрыс email енгізіңіз',
      passwordTooShort: (min) => `Құпиясөз кемінде ${min} таңбадан тұруы керек`,
      passwordRequired: 'Құпиясөзді енгізіңіз',
    },
    account: { signIn: 'Кіру', admin: 'Админка', signOut: 'Шығу' },
  },
  en: {
    dialog: {
      login: {
        title: 'Sign in',
        lead: 'Sign in to vote and suggest nominees.',
        switchText: "Don't have an account?",
        switchAction: 'Sign up',
      },
      register: {
        title: 'Sign up',
        lead: 'You need an account to vote and suggest nominees.',
        switchText: 'Already have an account?',
        switchAction: 'Sign in',
      },
    },
    close: 'Close',
    fields: { name: 'Name', email: 'Email', password: 'Password' },
    passwordHint: (min) => `At least ${min} characters`,
    submit: { login: 'Sign in', register: 'Create account' },
    errors: {
      nameTooShort: (min) => `Enter your name — at least ${min} characters`,
      invalidEmail: 'Enter a valid email',
      passwordTooShort: (min) => `The password must be at least ${min} characters`,
      passwordRequired: 'Enter your password',
    },
    account: { signIn: 'Sign in', admin: 'Admin', signOut: 'Sign out' },
  },
});
