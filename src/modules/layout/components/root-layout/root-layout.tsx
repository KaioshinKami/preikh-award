import type { ReactNode } from 'react';
import { Footer } from '@/modules/footer';
import { Header } from '@/modules/header';
import { Snowfall } from '../snowfall/snowfall';
import styles from './root-layout.module.scss';

type RootLayoutProps = {
  children: ReactNode;
};

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <div className={styles.sky} aria-hidden='true' />
      <Snowfall />
      <div className={styles.page}>
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
}
