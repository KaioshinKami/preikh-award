import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatVotes } from './format-votes.ts';

// Intl puts a narrow no-break space between thousands; compare with a plain one.
const plain = (text: string) => text.replace(/\s/g, ' ');

test('Russian picks the word form by the number', () => {
  assert.equal(formatVotes(1), '1 голос');
  assert.equal(formatVotes(3), '3 голоса');
  assert.equal(formatVotes(5), '5 голосов');
  assert.equal(plain(formatVotes(18420, 'ru')), '18 420 голосов');
});

test('English and Kazakh use their own forms', () => {
  assert.equal(formatVotes(1, 'en'), '1 vote');
  assert.equal(formatVotes(2, 'en'), '2 votes');
  assert.equal(formatVotes(1, 'kk'), '1 дауыс');
  assert.equal(formatVotes(21, 'kk'), '21 дауыс');
});
