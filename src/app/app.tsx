import { useEffect } from 'react';
import { AdminPage } from '@/modules/admin';
import { AuthProvider } from '@/modules/auth';
import { RootLayout } from '@/modules/layout';
import { NominationPage, parseNominationPath } from '@/modules/nominations';
import { defineMessages, useMessages } from '@/shared/i18n';
import { isAdminPath, usePathname, useScrollRestoration } from '@/shared/lib/navigation';
import { LandingPage } from './landing-page';

const MESSAGES = defineMessages({
  ru: { title: 'PREIKH AWARD 2026 — премия компании Preikh' },
  kk: { title: 'PREIKH AWARD 2026 — Preikh тобының сыйлығы' },
  en: { title: 'PREIKH AWARD 2026 — the Preikh crew award' },
});

// Screens: the main page, a nomination page (/nominations/<id>) and the admin page (/admin/...).
export function App() {
  const t = useMessages(MESSAGES);
  const pathname = usePathname();
  const nominationId = parseNominationPath(pathname);
  const isAdmin = isAdminPath(pathname);
  useScrollRestoration();

  // A nomination page names the tab after the nomination itself.
  useEffect(() => {
    if (nominationId === null && !isAdmin) document.title = t.title;
  }, [t.title, nominationId, isAdmin]);

  if (isAdmin) {
    return (
      <AuthProvider>
        <AdminPage />
      </AuthProvider>
    );
  }

  // One layout for both public screens, so the header and the snowfall survive navigation.
  return (
    <AuthProvider>
      <RootLayout>
        {nominationId === null ? (
          <LandingPage />
        ) : (
          <NominationPage key={nominationId} nominationId={nominationId} />
        )}
      </RootLayout>
    </AuthProvider>
  );
}
