import assert from 'node:assert/strict';
import { test } from 'node:test';
import { localize, NOMINATION_FIELDS } from './localize.ts';

const nomination = {
  title: 'Душнила года',
  category: 'Главные номинации',
  description: 'Описание',
  translations: { en: { title: 'Killjoy of the year', category: '' } },
};

test('a translated field is shown in the chosen language', () => {
  assert.equal(localize(nomination, NOMINATION_FIELDS, 'en').title, 'Killjoy of the year');
});

test('a missing or empty translation falls back to Russian', () => {
  const english = localize(nomination, NOMINATION_FIELDS, 'en');
  assert.equal(english.category, 'Главные номинации');
  assert.equal(english.description, 'Описание');
  assert.equal(localize(nomination, NOMINATION_FIELDS, 'kk').title, 'Душнила года');
});

test('Russian always shows the main texts', () => {
  assert.deepEqual(localize(nomination, NOMINATION_FIELDS, 'ru'), {
    title: 'Душнила года',
    category: 'Главные номинации',
    description: 'Описание',
  });
});

test('items saved before translations existed still work', () => {
  const { translations: _translations, ...old } = nomination;
  assert.equal(localize(old, NOMINATION_FIELDS, 'kk').title, 'Душнила года');
});
