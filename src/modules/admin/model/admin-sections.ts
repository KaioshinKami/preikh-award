export type AdminSection = 'overview' | 'votes' | 'users' | 'nominations' | 'applications';

export const ADMIN_SECTIONS: { id: AdminSection; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'votes', label: 'Голоса' },
  { id: 'users', label: 'Пользователи' },
  { id: 'nominations', label: 'Номинации' },
  { id: 'applications', label: 'Заявки' },
];
