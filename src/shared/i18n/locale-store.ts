import { useSyncExternalStore } from 'react';
import { detectLocale, type Locale } from './locales';

const STORAGE_KEY = 'preikh-locale';
const LOCALE_CHANGE_EVENT = 'app:localechange';

// Storage can be unavailable (private mode, blocked site data); the site then just doesn't remember.
function readStoredLocale(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let currentLocale: Locale = detectLocale(readStoredLocale(), window.navigator.languages ?? []);
document.documentElement.lang = currentLocale;

// For code outside React (the API client); components use useLocale().
export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  if (locale === currentLocale) return;
  currentLocale = locale;
  document.documentElement.lang = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not remembered for the next visit; the switch itself still works.
  }
  window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(LOCALE_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(LOCALE_CHANGE_EVENT, onChange);
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribe, getLocale);
}
