import { useEffect, useLayoutEffect, useSyncExternalStore, type MouseEvent } from 'react';

// shortcut: the site has three screens, so links switch them through history.pushState
// instead of a router library. The admin page keeps its own section routing under /admin.
const LOCATION_CHANGE_EVENT = 'app:locationchange';

type HistoryState = { scrollY?: number } | null;

// The scroll is set by useScrollRestoration() right after the next screen renders; the
// browser's own restoration runs before React swaps the screen and lands at the wrong spot.
window.history.scrollRestoration = 'manual';

// Bumped on every navigation; 0 means the page is still on the address it was opened with.
let navigationCount = 0;
let currentPathname = window.location.pathname;
let previousPathname = currentPathname;

function recordNavigation(): void {
  navigationCount += 1;
  previousPathname = currentPathname;
  currentPathname = window.location.pathname;
}

// Registered before React subscribes, so the count is updated when React reads it.
window.addEventListener('popstate', recordNavigation);

export function isAdminPath(pathname: string): boolean {
  return /^\/admin(\/|$)/.test(pathname);
}

function getHashTarget(): HTMLElement | null {
  const { hash } = window.location;
  return hash.length > 1 ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
}

export function navigate(url: string): void {
  const state = (window.history.state as HistoryState) ?? {};
  window.history.replaceState({ ...state, scrollY: window.scrollY }, '');
  window.history.pushState({}, '', url);
  recordNavigation();
  window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
}

// For <a onClick>: same-site links switch screens without a reload; ctrl/cmd-click still opens a tab.
export function handleLinkClick(event: MouseEvent<HTMLAnchorElement>): void {
  const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
  if (event.defaultPrevented || event.button !== 0 || isModifiedClick) return;

  const url = new URL(event.currentTarget.href);
  if (url.origin !== window.location.origin) return;

  event.preventDefault();
  navigate(`${url.pathname}${url.search}${url.hash}`);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(LOCATION_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(LOCATION_CHANGE_EVENT, onChange);
  };
}

export function usePathname(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

// After each navigation: scroll to the #hash target, else to where this history entry was
// left, else to the top. Runs before paint, so the old position never flashes.
export function useScrollRestoration(): void {
  const navigationKey = useSyncExternalStore(subscribe, () => navigationCount);

  useLayoutEffect(() => {
    if (navigationKey === 0 || isAdminPath(window.location.pathname)) return;

    const isSamePage = window.location.pathname === previousPathname;
    const target = getHashTarget();
    if (target) {
      target.scrollIntoView({ behavior: isSamePage ? 'smooth' : 'instant' });
      return;
    }
    const savedScrollY = (window.history.state as HistoryState)?.scrollY;
    window.scrollTo({ top: savedScrollY ?? 0, behavior: 'instant' });
  }, [navigationKey]);
}

// The page was opened at /#section: the browser jumped to the anchor before the app rendered,
// so a screen calls this once the content the anchor points into is on the page.
export function useScrollToHashOnOpen(isContentReady: boolean): void {
  useEffect(() => {
    if (!isContentReady || navigationCount > 0) return;
    getHashTarget()?.scrollIntoView({ behavior: 'instant' });
  }, [isContentReady]);
}
