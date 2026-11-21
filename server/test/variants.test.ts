import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Variant = {
  id: number;
  name: string;
  supports: number;
  isMine: boolean;
  isSupported: boolean;
};

let testApp: TestApp;
let nominationId: number;
const cookies: Record<'admin' | 'alice' | 'bob' | 'carol', string> = {
  admin: '',
  alice: '',
  bob: '',
  carol: '',
};

async function register(name: string): Promise<string> {
  const response = await testApp.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name, email: `${name.toLowerCase()}@example.com`, password: 'long-enough-password' },
  });
  const session = response.cookies.find((cookie) => cookie.name === 'preikh_session');
  assert.ok(session);
  return `preikh_session=${session.value}`;
}

function suggest(cookie: string, nomineeName: string) {
  return testApp.app.inject({
    method: 'POST',
    url: '/api/applications',
    headers: { cookie },
    payload: { nominationId, nomineeName },
  });
}

async function listVariants(cookie?: string): Promise<Variant[]> {
  const response = await testApp.app.inject({
    method: 'GET',
    url: `/api/applications?nominationId=${nominationId}`,
    headers: cookie ? { cookie } : {},
  });
  assert.equal(response.statusCode, 200);
  return response.json<{ variants: Variant[] }>().variants;
}

function support(cookie: string, id: number, method: 'POST' | 'DELETE' = 'POST') {
  return testApp.app.inject({
    method,
    url: `/api/applications/${id}/support`,
    headers: { cookie },
  });
}

before(async () => {
  testApp = await createTestApp();
  for (const name of ['Admin', 'Alice', 'Bob', 'Carol'] as const) {
    cookies[name.toLowerCase() as keyof typeof cookies] = await register(name);
  }
  await testApp.sql`update users set role = 'admin' where email = 'admin@example.com'`;
  [{ id: nominationId }] = await testApp.sql<
    { id: number }[]
  >`select id from nominations where title = 'First'`;
});

after(() => testApp.close());

test('guests see the open picks but need an account to suggest one', async () => {
  assert.deepEqual(await listVariants(), []);
  const response = await testApp.app.inject({
    method: 'POST',
    url: '/api/applications',
    payload: { nominationId, nomineeName: 'Somebody' },
  });
  assert.equal(response.statusCode, 401);
});

test('a new pick starts with its author behind it', async () => {
  const response = await suggest(cookies.alice, 'Ербо');
  assert.equal(response.statusCode, 201);
  assert.equal(response.json<{ status: string }>().status, 'pending');

  const [variant] = await listVariants(cookies.alice);
  assert.deepEqual(
    {
      name: variant.name,
      supports: variant.supports,
      mine: variant.isMine,
      ok: variant.isSupported,
    },
    { name: 'Ербо', supports: 1, mine: true, ok: true },
  );
});

test('the same name again counts as support instead of a duplicate', async () => {
  const response = await suggest(cookies.bob, '  ербо ');
  assert.equal(response.statusCode, 200);
  assert.equal(response.json<{ status: string }>().status, 'supported');

  const variants = await listVariants(cookies.bob);
  assert.equal(variants.length, 1);
  assert.equal(variants[0].supports, 2);
  assert.equal(variants[0].isMine, false);
  assert.equal(variants[0].isSupported, true);
});

test('someone who is already a nominee cannot be suggested', async () => {
  const response = await suggest(cookies.bob, 'one');
  assert.equal(response.statusCode, 409);
  assert.equal(response.json<{ code: string }>().code, 'already_nominee');
});

test('support can be given once and taken back, but not by the author', async () => {
  const [{ id }] = await listVariants();

  assert.equal((await support(cookies.carol, id)).json<{ supports: number }>().supports, 3);
  assert.equal((await support(cookies.carol, id)).json<{ supports: number }>().supports, 3);
  assert.equal(
    (await support(cookies.carol, id, 'DELETE')).json<{ supports: number }>().supports,
    2,
  );

  const ownResponse = await support(cookies.alice, id, 'DELETE');
  assert.equal(ownResponse.statusCode, 409);
  assert.equal(ownResponse.json<{ code: string }>().code, 'own_variant');

  const [guestView] = await listVariants();
  assert.deepEqual([guestView.isMine, guestView.isSupported], [false, false]);
});

test('picks are listed most supported first, and the admin sees the counts', async () => {
  await suggest(cookies.carol, 'Тимур');
  const names = (await listVariants()).map((variant) => variant.name);
  assert.deepEqual(names, ['Ербо', 'Тимур']);

  const response = await testApp.app.inject({
    method: 'GET',
    url: '/api/admin/applications',
    headers: { cookie: cookies.admin },
  });
  const applications = response.json<{
    applications: { nomineeName: string; supports: number }[];
  }>().applications;
  assert.deepEqual(
    applications.map((application) => [application.nomineeName, application.supports]),
    [
      ['Ербо', 2],
      ['Тимур', 1],
    ],
  );
});

test('a pick the commission has reviewed disappears and cannot be supported', async () => {
  const [{ id }] = await listVariants();
  const reject = await testApp.app.inject({
    method: 'POST',
    url: `/api/admin/applications/${id}/reject`,
    headers: { cookie: cookies.admin },
  });
  assert.equal(reject.statusCode, 200);

  assert.deepEqual(
    (await listVariants()).map((variant) => variant.name),
    ['Тимур'],
  );
  const response = await support(cookies.bob, id);
  assert.equal(response.statusCode, 404);
  assert.equal(response.json<{ code: string }>().code, 'variant_not_found');
});
