import assert from 'node:assert/strict';
import { test } from 'node:test';
import { hashPassword, verifyPassword } from '../src/modules/auth/password.ts';

test('a hash verifies only with the original password', async () => {
  const hash = await hashPassword('correct horse battery');

  assert.equal(await verifyPassword('correct horse battery', hash), true);
  assert.equal(await verifyPassword('wrong password', hash), false);
});

test('the same password gets a different salt and hash each time', async () => {
  const firstHash = await hashPassword('same-password');
  const secondHash = await hashPassword('same-password');

  assert.notEqual(firstHash, secondHash);
  assert.ok(!firstHash.includes('same-password'));
});

test('a malformed stored hash never verifies', async () => {
  assert.equal(await verifyPassword('anything', 'not-a-hash'), false);
  assert.equal(await verifyPassword('anything', 'bcrypt$abc$def'), false);
});
