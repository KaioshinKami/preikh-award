import { EVENT_INFO, useEventTexts } from '@/modules/event';
import { useNavLinks } from '@/modules/header';
import { Logo } from '@/shared/components';
import { defineMessages, useMessages } from '@/shared/i18n';
import { handleLinkClick } from '@/shared/lib/navigation';
import styles from './footer.module.scss';

const MESSAGES = defineMessages({
  ru: {
    tagline: `Премия компании Preikh. ${EVENT_INFO.edition}, ${EVENT_INFO.year}.`,
    navLabel: 'Разделы сайта',
    toTop: 'Наверх ↑',
  },
  kk: {
    tagline: `Preikh тобының сыйлығы. ${EVENT_INFO.edition}, ${EVENT_INFO.year}.`,
    navLabel: 'Сайт бөлімдері',
    toTop: 'Жоғары ↑',
  },
  en: {
    tagline: `The Preikh crew award. ${EVENT_INFO.edition}, ${EVENT_INFO.year}.`,
    navLabel: 'Site sections',
    toTop: 'Back to top ↑',
  },
});

export function Footer() {
  const t = useMessages(MESSAGES);
  const event = useEventTexts();
  const navLinks = useNavLinks();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>{t.tagline}</p>
        </div>

        <nav aria-label={t.navLabel}>
          <ul className={styles.links}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href} onClick={handleLinkClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.event}>
          <p className={styles.eventDate}>{event.dateLabel}</p>
          <p>{event.venue}</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {EVENT_INFO.year} {EVENT_INFO.name}
        </p>
        <a className={styles.link} href='/#top' onClick={handleLinkClick}>
          {t.toTop}
        </a>
      </div>

      <p className={styles.watermark} aria-hidden='true'>
        PREIKH
      </p>
    </footer>
  );
}
