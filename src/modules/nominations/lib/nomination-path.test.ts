import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNominationPath, parseNominationPath } from './nomination-path.ts';

test('a nomination path round-trips to its id', () => {
  assert.equal(parseNominationPath(getNominationPath(12)), 12);
  assert.equal(parseNominationPath('/nominations/7/'), 7);
});

test('other paths are not nomination pages', () => {
  for (const pathname of ['/', '/nominations', '/nominations/abc', '/nominations/1/x', '/admin']) {
    assert.equal(parseNominationPath(pathname), null, pathname);
  }
});
