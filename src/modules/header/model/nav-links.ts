export type NavLink = {
  href: string;
  label: string;
};

// Sections of the main page; the leading "/" makes them work from a nomination page too.
export const NAV_LINKS: NavLink[] = [
  { href: '/#about', label: 'О премии' },
  { href: '/#nominations', label: 'Номинации' },
  { href: '/#stages', label: 'Этапы' },
  { href: '/#tickets', label: 'Билеты' },
  { href: '/#faq', label: 'FAQ' },
];
