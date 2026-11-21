import type { ReactNode } from 'react';
import { Footer } from '@/modules/footer';
import { Header } from '@/modules/header';
import { MusicToggle } from '../music-toggle/music-toggle';
import { Snowfall } from '../snowfall/snowfall';
import styles from './root-layout.module.scss';

type RootLayoutProps = {
  children: ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className={styles.sky} aria-hidden='true' />
      <div className={styles.page}>
        {/* Inside the page so the snow falls over the cards and photos but under the header. */}
        <Snowfall />
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
      {/* Outside the page wrapper so the music keeps playing from one page to the next. */}
      <MusicToggle />
    </>
  );
}
