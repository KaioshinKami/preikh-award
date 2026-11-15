import { AdminPage } from '@/modules/admin';
import { AuthProvider } from '@/modules/auth';
import { LandingPage } from './landing-page';

// shortcut: two screens need no router; add one if more pages appear.
const isAdminRoute = window.location.pathname.replace(/\/+$/, '') === '/admin';

export function App() {
  return <AuthProvider>{isAdminRoute ? <AdminPage /> : <LandingPage />}</AuthProvider>;
}
