import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Nomination = { id: number; nominees: { id: number }[] };
type AdminUser = { id: number; email: string; role: string; votes: number };
type AdminVote = { id: number; userId: number; userEmail: string; nomineeName: string };

let testApp: TestApp;
let adminCookie: string;
let voterCookie: string;
let adminId: number;
let voterId: number;
let nominations: Nomination[];

async function register(name: string, email: string) {
  const response = await testApp.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name, email, password: 'long-enough-password' },
  });
  assert.equal(response.statusCode, 201);
  const session = response.cookies.find((cookie) => cookie.name === 'preikh_session');
  assert.ok(session);
  return {
    id: (response.json() as { user: { id: number } }).user.id,
    cookie: `preikh_session=${session.value}`,
  };
}

function request(method: 'GET' | 'PUT' | 'DELETE', url: string, cookie: string, payload?: object) {
  return testApp.app.inject({ method, url, headers: { cookie }, payload });
}

before(async () => {
  testApp = await createTestApp();
  ({ id: adminId, cookie: adminCookie } = await register('Admin', 'admin@example.com'));
  ({ id: voterId, cookie: voterCookie } = await register('Voter', 'voter@example.com'));
  await testApp.sql`update users set role = 'admin' where id = ${adminId}`;

  nominations = (await testApp.app.inject({ method: 'GET', url: '/api/nominations' })).json()
    .nominations;
  for (const nomination of nominations) {
    const vote = await testApp.app.inject({
      method: 'POST',
      url: '/api/votes',
      headers: { cookie: voterCookie },
      payload: { nominationId: nomination.id, nomineeId: nomination.nominees[0].id },
    });
    assert.equal(vote.statusCode, 201);
  }
});

after(() => testApp.close());

test('a regular user cannot list users or votes', async () => {
  assert.equal((await request('GET', '/api/admin/users', voterCookie)).statusCode, 403);
  assert.equal((await request('GET', '/api/admin/votes', voterCookie)).statusCode, 403);
});

test('the admin sees every user with their vote count, and can search', async () => {
  const { users } = (await request('GET', '/api/admin/users', adminCookie)).json() as {
    users: AdminUser[];
  };
  assert.equal(users.length, 2);
  assert.equal(users.find((user) => user.id === voterId)?.votes, nominations.length);

  const found = (await request('GET', '/api/admin/users?search=VOTER@', adminCookie)).json() as {
    users: AdminUser[];
  };
  assert.deepEqual(
    found.users.map((user) => user.email),
    ['voter@example.com'],
  );

  // % is matched literally, not as a wildcard.
  const literal = (await request('GET', '/api/admin/users?search=%25', adminCookie)).json() as {
    users: AdminUser[];
  };
  assert.equal(literal.users.length, 0);
});

test('the admin sees who voted for whom, filtered and paged', async () => {
  const all = (await request('GET', '/api/admin/votes', adminCookie)).json() as {
    votes: AdminVote[];
    total: number;
  };
  assert.equal(all.total, nominations.length);
  assert.ok(all.votes.every((vote) => vote.userEmail === 'voter@example.com'));

  const page = (await request('GET', '/api/admin/votes?limit=1&offset=1', adminCookie)).json() as {
    votes: AdminVote[];
    total: number;
  };
  assert.equal(page.votes.length, 1);
  assert.equal(page.total, nominations.length);

  const byNomination = (
    await request('GET', `/api/admin/votes?nominationId=${nominations[0].id}`, adminCookie)
  ).json() as { total: number };
  assert.equal(byNomination.total, 1);

  const byUser = (
    await request('GET', `/api/admin/votes?userId=${adminId}`, adminCookie)
  ).json() as {
    total: number;
    user: { name: string } | null;
  };
  assert.equal(byUser.total, 0);
  assert.equal(byUser.user?.name, 'Admin');
});

test('the admin can annul a vote, and the user can vote again', async () => {
  const { votes } = (
    await request('GET', `/api/admin/votes?nominationId=${nominations[0].id}`, adminCookie)
  ).json() as { votes: AdminVote[] };
  assert.equal(
    (await request('DELETE', `/api/admin/votes/${votes[0].id}`, adminCookie)).statusCode,
    204,
  );
  assert.equal(
    (await request('DELETE', `/api/admin/votes/${votes[0].id}`, adminCookie)).statusCode,
    404,
  );

  const revote = await testApp.app.inject({
    method: 'POST',
    url: '/api/votes',
    headers: { cookie: voterCookie },
    payload: { nominationId: nominations[0].id, nomineeId: nominations[0].nominees[1].id },
  });
  assert.equal(revote.statusCode, 201);
});

test('the admin cannot change their own role or delete themselves', async () => {
  const demote = await request('PUT', `/api/admin/users/${adminId}/role`, adminCookie, {
    role: 'user',
  });
  assert.equal(demote.statusCode, 400);
  assert.equal(
    (await request('DELETE', `/api/admin/users/${adminId}`, adminCookie)).statusCode,
    400,
  );
});

test('the admin can grant and revoke the admin role', async () => {
  const grant = await request('PUT', `/api/admin/users/${voterId}/role`, adminCookie, {
    role: 'admin',
  });
  assert.equal(grant.statusCode, 200);
  assert.equal((await request('GET', '/api/admin/users', voterCookie)).statusCode, 200);

  await request('PUT', `/api/admin/users/${voterId}/role`, adminCookie, { role: 'user' });
  assert.equal((await request('GET', '/api/admin/users', voterCookie)).statusCode, 403);
});

test('deleting a user also removes their votes', async () => {
  assert.equal(
    (await request('DELETE', `/api/admin/users/${voterId}`, adminCookie)).statusCode,
    204,
  );
  const { total } = (await request('GET', '/api/admin/votes', adminCookie)).json() as {
    total: number;
  };
  assert.equal(total, 0);
  assert.equal(
    (await request('DELETE', `/api/admin/users/${voterId}`, adminCookie)).statusCode,
    404,
  );
});
