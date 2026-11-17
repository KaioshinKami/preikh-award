import type { MouseEvent } from 'react';
import { AccountControls } from '@/modules/auth';
import { ButtonLink, Logo } from '@/shared/components';
import { handleLinkClick } from '@/shared/lib/navigation';
import { NAV_LINKS } from '../../model/nav-links';
import { useIsScrolled } from './use-is-scrolled';
import { useMobileMenu } from './use-mobile-menu';
import styles from './header.module.scss';

const SCROLL_OFFSET = 24;
const NAV_ID = 'site-nav';

export function Header() {
  const isScrolled = useIsScrolled(SCROLL_OFFSET);
  const { isMenuOpen, toggleMenu, closeMenu } = useMobileMenu();
  const menuLabel = isMenuOpen ? 'Закрыть меню' : 'Открыть меню';

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>) => {
    closeMenu();
    handleLinkClick(event);
  };

  return (
    <header className={styles.header} data-solid={isScrolled || isMenuOpen}>
      <div className={styles.inner}>
        <a
          href='/#top'
          className={styles.logoLink}
          aria-label='PREIKH AWARD — на главную'
          onClick={handleLinkClick}
        >
          <Logo />
        </a>

        <nav id={NAV_ID} className={styles.nav} data-open={isMenuOpen} aria-label='Основное меню'>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a className={styles.navLink} href={link.href} onClick={handleNavClick}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href='/#nominations' className={styles.cta} onClick={handleLinkClick}>
          Голосовать
        </ButtonLink>

        <AccountControls />

        <button
          type='button'
          className={styles.burger}
          aria-expanded={isMenuOpen}
          aria-controls={NAV_ID}
          aria-label={menuLabel}
          onClick={toggleMenu}
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
      </div>
    </header>
  );
}
