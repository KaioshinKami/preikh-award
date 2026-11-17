import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectLocale } from './locales.ts';

test('a saved choice wins over the browser languages', () => {
  assert.equal(detectLocale('kk', ['en-US', 'ru']), 'kk');
});

test('the first browser language the site has is used', () => {
  assert.equal(detectLocale(null, ['kk-KZ', 'ru-RU']), 'kk');
  assert.equal(detectLocale(null, ['de-DE', 'en-GB', 'ru']), 'en');
  assert.equal(detectLocale(null, ['RU']), 'ru');
});

test('Russian is the fallback for unknown or broken values', () => {
  assert.equal(detectLocale('fr', ['de', 'tr']), 'ru');
  assert.equal(detectLocale(null, []), 'ru');
});
