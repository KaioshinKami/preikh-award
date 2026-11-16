import { useCallback, useEffect, useState } from 'react';
import { ADMIN_SECTIONS, type AdminSection } from './admin-sections';

export const ADMIN_PATH = '/admin';

type AdminRoute = {
  section: AdminSection;
  params: URLSearchParams;
};

function readRoute(): AdminRoute {
  const segment = window.location.pathname.slice(ADMIN_PATH.length).replace(/^\/+|\/+$/g, '');
  const section = ADMIN_SECTIONS.find((item) => item.id === segment)?.id ?? 'overview';
  return { section, params: new URLSearchParams(window.location.search) };
}

export function getAdminSectionUrl(section: AdminSection, params?: Record<string, string>): string {
  const path = section === 'overview' ? ADMIN_PATH : `${ADMIN_PATH}/${section}`;
  const query = params ? new URLSearchParams(params).toString() : '';
  return query ? `${path}?${query}` : path;
}

// The section lives in the URL (/admin/users, /admin/votes?user=5), so reload and Back keep it.
export function useAdminRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(readRoute());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((section: AdminSection, params?: Record<string, string>) => {
    window.history.pushState(null, '', getAdminSectionUrl(section, params));
    setRoute(readRoute());
    window.scrollTo({ top: 0 });
  }, []);

  return { ...route, navigate };
}
