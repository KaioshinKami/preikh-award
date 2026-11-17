import { EVENT_INFO } from '@/modules/event';
import { NAV_LINKS } from '@/modules/header';
import { Logo } from '@/shared/components';
import { handleLinkClick } from '@/shared/lib/navigation';
import styles from './footer.module.scss';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>
            Премия компании Preikh. {EVENT_INFO.edition}, {EVENT_INFO.year}.
          </p>
        </div>

        <nav aria-label='Разделы сайта'>
          <ul className={styles.links}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href} onClick={handleLinkClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.event}>
          <p className={styles.eventDate}>{EVENT_INFO.dateLabel}</p>
          <p>{EVENT_INFO.venue}</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {EVENT_INFO.year} {EVENT_INFO.name}
        </p>
        <a className={styles.link} href='/#top' onClick={handleLinkClick}>
          Наверх ↑
        </a>
      </div>

      <p className={styles.watermark} aria-hidden='true'>
        PREIKH
      </p>
    </footer>
  );
}
