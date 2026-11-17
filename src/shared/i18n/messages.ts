import { getLocale, useLocale } from './locale-store';
import type { Locale } from './locales';

export type Messages<Texts> = Record<Locale, Texts>;

// A module's texts in every language. The Russian object sets the shape, so a Kazakh or
// English text that is missing or misnamed fails the type check instead of showing blank.
export function defineMessages<Texts>(messages: {
  ru: Texts;
  kk: NoInfer<Texts>;
  en: NoInfer<Texts>;
}): Messages<Texts> {
  return messages;
}

// The texts in the language the visitor chose; re-renders when they switch.
export function useMessages<Texts>(messages: Messages<Texts>): Texts {
  return messages[useLocale()];
}

// The same outside React, read at the moment of the call.
export function getMessages<Texts>(messages: Messages<Texts>): Texts {
  return messages[getLocale()];
}
