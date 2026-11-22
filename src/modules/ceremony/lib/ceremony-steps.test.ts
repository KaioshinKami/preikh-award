import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { CeremonyNomination, CeremonyNominee } from '../model/types.ts';
import { buildCeremonySteps, ceremonyNominations, rankNominees } from './ceremony-steps.ts';

let nextId = 1;
const nominee = (name: string, votes: number): CeremonyNominee => ({
  id: nextId++,
  name,
  avatarUrl: null,
  votes,
});

const nomination = (title: string, nominees: CeremonyNominee[]): CeremonyNomination => ({
  id: nextId++,
  title,
  category: '',
  description: '',
  imageUrl: null,
  nominees,
});

const summary = (places: ReturnType<typeof rankNominees>) =>
  places.map((place) => [place.place, place.votes, place.nominees.map((item) => item.name)]);

test('the most votes win and the rest follow in order', () => {
  const places = rankNominees([nominee('Елдос', 3), nominee('Алиби', 10), nominee('Жанат', 7)]);
  assert.deepEqual(summary(places), [
    [1, 10, ['Алиби']],
    [2, 7, ['Жанат']],
    [3, 3, ['Елдос']],
  ]);
  assert.equal(places[0].share, 0.5);
});

test('equal votes share a place, and the next place follows on', () => {
  const places = rankNominees([
    nominee('Ербо', 5),
    nominee('Гани', 5),
    nominee('Тимур', 2),
    nominee('Диас', 0),
  ]);
  assert.deepEqual(summary(places), [
    [1, 5, ['Гани', 'Ербо']],
    [2, 2, ['Тимур']],
    [3, 0, ['Диас']],
  ]);
});

test('each nomination gets its slides, and the ceremony opens and closes', () => {
  const shown = ceremonyNominations([
    nomination('Мем года', [nominee('Ербо', 4), nominee('Гани', 1)]),
    nomination('Без номинантов', []),
    nomination('Один номинант', [nominee('Абди', 3)]),
    nomination('Без голосов', [nominee('Елдар', 0), nominee('Алишер', 0)]),
  ]);
  assert.deepEqual(
    shown.map((item) => item.title),
    ['Мем года', 'Один номинант', 'Без голосов'],
  );

  assert.deepEqual(
    buildCeremonySteps(shown).map((step) =>
      'nomination' in step ? `${step.kind}:${step.nomination}` : step.kind,
    ),
    [
      'opening',
      'nomination:0',
      'suspense:0',
      'winner:0',
      'places:0',
      'nomination:1',
      'suspense:1',
      'winner:1',
      'nomination:2',
      'closing',
    ],
  );
});
