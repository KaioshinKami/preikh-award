import { useEffect } from 'react';
import { AdminPage } from '@/modules/admin';
import { AuthProvider } from '@/modules/auth';
import { RootLayout } from '@/modules/layout';
import { NominationPage, parseNominationPath } from '@/modules/nominations';
import { isAdminPath, usePathname, useScrollRestoration } from '@/shared/lib/navigation';
import { SITE_TITLE } from '@/shared/lib/site-title';
import { LandingPage } from './landing-page';

// Screens: the main page, a nomination page (/nominations/<id>) and the admin page (/admin/...).
export function App() {
  const pathname = usePathname();
  const nominationId = parseNominationPath(pathname);
  const isAdmin = isAdminPath(pathname);
  useScrollRestoration();

  // A nomination page names the tab after the nomination itself.
  useEffect(() => {
    if (nominationId === null && !isAdmin) document.title = SITE_TITLE;
  }, [nominationId, isAdmin]);

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
