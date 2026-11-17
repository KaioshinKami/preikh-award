import { useLayoutEffect, useSyncExternalStore, type MouseEvent } from 'react';

// shortcut: the site has three screens, so links switch them through history.pushState
// instead of a router library. The admin page keeps its own section routing under /admin.
const LOCATION_CHANGE_EVENT = 'app:locationchange';

// Kept in each history entry: where to scroll when the entry is shown again.
type HistoryState = {
  // Where the visitor left the screen; wins when they come back with Back/Forward.
  scrollY?: number;
  // The section a link pointed to (/#faq), used when the entry is opened the first time.
  scrollTargetId?: string;
};

// The scroll is set by useScrollRestoration() right after the next screen renders; the
// browser's own restoration would run before React swaps the screen and land at the wrong spot.
window.history.scrollRestoration = 'manual';

// The site always opens at its top. An address that still carries a #section (an old link,
// a reload) must not jump down the page, so the # is dropped before anything renders.
if (window.location.hash) {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}`);
}

// Bumped on every navigation; 0 means the page is still on the address it was opened with.
let navigationCount = 0;

function recordNavigation(): void {
  navigationCount += 1;
}

// Registered before React subscribes, so the count is updated when React reads it.
window.addEventListener('popstate', recordNavigation);

function readHistoryState(): HistoryState {
  return (window.history.state as HistoryState | null) ?? {};
}

export function isAdminPath(pathname: string): boolean {
  return /^\/admin(\/|$)/.test(pathname);
}

// Section links (/#faq) scroll to the section but leave the address without the #.
export function navigate(url: string): void {
  const target = new URL(url, window.location.origin);
  const path = `${target.pathname}${target.search}`;
  const scrollTargetId = target.hash.length > 1 ? decodeURIComponent(target.hash.slice(1)) : '';

  // A section of the screen that is already open: just glide there.
  if (path === `${window.location.pathname}${window.location.search}`) {
    if (scrollTargetId) {
      document.getElementById(scrollTargetId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  window.history.replaceState({ ...readHistoryState(), scrollY: window.scrollY }, '');
  const nextState: HistoryState = scrollTargetId ? { scrollTargetId } : {};
  window.history.pushState(nextState, '', path);
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

// After each screen switch: back to where the visitor left this entry, else to the section the
// link pointed to, else to the top. Runs before paint, so the old position never flashes.
export function useScrollRestoration(): void {
  const navigationKey = useSyncExternalStore(subscribe, () => navigationCount);

  useLayoutEffect(() => {
    if (navigationKey === 0 || isAdminPath(window.location.pathname)) return;

    const { scrollY, scrollTargetId } = readHistoryState();
    if (scrollY !== undefined) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      return;
    }
    const target = scrollTargetId ? document.getElementById(scrollTargetId) : null;
    if (target) {
      target.scrollIntoView({ behavior: 'instant' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigationKey]);
}
