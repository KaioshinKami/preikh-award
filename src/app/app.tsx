import { AdminPage } from '@/modules/admin';
import { AuthProvider } from '@/modules/auth';
import { LandingPage } from './landing-page';

// shortcut: two screens need no router; the admin page picks its own section from /admin/<section>.
const isAdminRoute = /^\/admin(\/|$)/.test(window.location.pathname);

export function App() {
  return <AuthProvider>{isAdminRoute ? <AdminPage /> : <LandingPage />}</AuthProvider>;
}
