import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fillMissingDays } from './fill-missing-days.ts';

test('days without votes are filled with zeros, across a month boundary', () => {
  const filled = fillMissingDays([
    { day: '2026-11-29', votes: 4 },
    { day: '2026-12-02', votes: 1 },
  ]);

  assert.deepEqual(filled, [
    { day: '2026-11-29', votes: 4 },
    { day: '2026-11-30', votes: 0 },
    { day: '2026-12-01', votes: 0 },
    { day: '2026-12-02', votes: 1 },
  ]);
});

test('no votes means no days', () => {
  assert.deepEqual(fillMissingDays([]), []);
});
