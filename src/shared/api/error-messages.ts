import { defineMessages } from '@/shared/i18n';

// Texts for the error codes the API sends (server/src/api-error.ts). An error without a known
// code keeps the server's own Russian text: that is the admin API, which is Russian only.
export const ERROR_MESSAGES = defineMessages({
  ru: {
    network: 'Сервер недоступен. Попробуйте позже',
    unknown: 'Что-то пошло не так',
    codes: {
      unauthorized: 'Войдите в аккаунт, чтобы продолжить',
      name_too_short: 'Имя слишком короткое',
      email_taken: 'Этот email уже зарегистрирован',
      invalid_credentials: 'Неверный email или пароль',
      voting_closed: 'Голосование сейчас закрыто',
      nominee_not_in_nomination: 'Этот номинант не участвует в выбранной номинации',
      already_voted: 'Вы уже проголосовали в этой номинации',
      nominee_name_required: 'Укажите имя номинанта',
      nomination_not_found: 'Такой номинации нет',
      validation_failed: 'Проверьте правильность заполнения полей',
      too_many_requests: 'Слишком много попыток. Попробуйте позже',
      internal_error: 'Внутренняя ошибка сервера',
    },
  },
  kk: {
    network: 'Сервер қолжетімсіз. Кейінірек қайталап көріңіз',
    unknown: 'Бірдеңе дұрыс болмады',
    codes: {
      unauthorized: 'Жалғастыру үшін аккаунтқа кіріңіз',
      name_too_short: 'Аты тым қысқа',
      email_taken: 'Бұл email бұрыннан тіркелген',
      invalid_credentials: 'Email немесе құпиясөз қате',
      voting_closed: 'Дауыс беру қазір жабық',
      nominee_not_in_nomination: 'Бұл номинант таңдалған номинацияға қатыспайды',
      already_voted: 'Сіз бұл номинацияда дауыс беріп қойдыңыз',
      nominee_name_required: 'Номинанттың атын жазыңыз',
      nomination_not_found: 'Мұндай номинация жоқ',
      validation_failed: 'Өрістердің дұрыс толтырылғанын тексеріңіз',
      too_many_requests: 'Әрекет тым көп. Кейінірек қайталап көріңіз',
      internal_error: 'Сервердің ішкі қатесі',
    },
  },
  en: {
    network: 'The server is unavailable. Please try again later',
    unknown: 'Something went wrong',
    codes: {
      unauthorized: 'Sign in to continue',
      name_too_short: 'The name is too short',
      email_taken: 'This email is already registered',
      invalid_credentials: 'Wrong email or password',
      voting_closed: 'Voting is closed right now',
      nominee_not_in_nomination: "This nominee isn't part of the chosen nomination",
      already_voted: "You've already voted in this nomination",
      nominee_name_required: "Enter the nominee's name",
      nomination_not_found: "This nomination doesn't exist",
      validation_failed: 'Please check the form fields',
      too_many_requests: 'Too many attempts. Please try again later',
      internal_error: 'Internal server error',
    },
  },
});
