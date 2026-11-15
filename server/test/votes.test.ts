import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { updateSettings } from '../src/modules/settings/settings-repository.ts';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type NominationsResponse = {
  nominations: { id: number; nominees: { id: number; votes?: number }[] }[];
};

let testApp: TestApp;
let sessionCookie: string;
let first: NominationsResponse['nominations'][number];
let second: NominationsResponse['nominations'][number];

async function vote(nominationId: number, nomineeId: number, cookie = sessionCookie) {
  return testApp.app.inject({
    method: 'POST',
    url: '/api/votes',
    headers: cookie ? { cookie } : {},
    payload: { nominationId, nomineeId },
  });
}

async function getNominations(): Promise<NominationsResponse> {
  return (await testApp.app.inject({ method: 'GET', url: '/api/nominations' })).json();
}

before(async () => {
  testApp = await createTestApp();
  const registration = await testApp.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name: 'Voter', email: 'Voter@Example.com', password: 'long-enough-password' },
  });
  assert.equal(registration.statusCode, 201);
  const setCookie = registration.cookies.find((cookie) => cookie.name === 'preikh_session');
  assert.ok(setCookie?.httpOnly, 'session cookie must be httpOnly');
  sessionCookie = `preikh_session=${setCookie.value}`;
  [first, second] = (await getNominations()).nominations;
});

after(() => testApp.close());

test('a guest cannot vote', async () => {
  assert.equal((await vote(first.id, first.nominees[0].id, '')).statusCode, 401);
});

test('a nominee from another nomination is rejected', async () => {
  assert.equal((await vote(first.id, second.nominees[0].id)).statusCode, 400);
});

test('only one vote per nomination, and it cannot be changed', async () => {
  assert.equal((await vote(first.id, first.nominees[0].id)).statusCode, 201);
  assert.equal((await vote(first.id, first.nominees[0].id)).statusCode, 409);
  assert.equal((await vote(first.id, first.nominees[1].id)).statusCode, 409);
});

test('voting is rejected while it is closed', async () => {
  await updateSettings(testApp.sql, { votingOpen: false });
  assert.equal((await vote(second.id, second.nominees[0].id)).statusCode, 403);
  await updateSettings(testApp.sql, { votingOpen: true });
  assert.equal((await vote(second.id, second.nominees[0].id)).statusCode, 201);
});

test('vote counts stay hidden until results are published', async () => {
  const hidden = await getNominations();
  assert.equal(hidden.nominations[0].nominees[0].votes, undefined);

  await updateSettings(testApp.sql, { resultsPublished: true });
  const published = await getNominations();
  assert.equal(published.nominations[0].nominees[0].votes, 1);
});

test('an admin cannot delete a nominee that already has votes', async () => {
  await testApp.sql`update users set role = 'admin' where email = 'voter@example.com'`;
  const response = await testApp.app.inject({
    method: 'DELETE',
    url: `/api/admin/nominees/${first.nominees[0].id}`,
    headers: { cookie: sessionCookie },
  });
  await testApp.sql`update users set role = 'user' where email = 'voter@example.com'`;

  assert.equal(response.statusCode, 409);
});

test('a regular user cannot open the admin API', async () => {
  const response = await testApp.app.inject({
    method: 'GET',
    url: '/api/admin/stats',
    headers: { cookie: sessionCookie },
  });
  assert.equal(response.statusCode, 403);
});
