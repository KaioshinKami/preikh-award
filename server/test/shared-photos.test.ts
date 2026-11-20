import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Nominee = { id: number; name: string; avatarUrl: string | null };
type Nomination = { id: number; title: string; nominees: Nominee[] };

// A real 1×1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

let testApp: TestApp;
let adminCookie: string;

async function admin(method: 'POST' | 'PUT', url: string, payload: object) {
  const response = await testApp.app.inject({
    method,
    url,
    headers: { cookie: adminCookie },
    payload,
  });
  assert.ok(response.statusCode < 300, `${method} ${url}: ${response.body}`);
  return response.json();
}

async function uploadPhoto(): Promise<string> {
  const response = await testApp.app.inject({
    method: 'POST',
    url: '/api/admin/images',
    headers: { cookie: adminCookie, 'content-type': 'image/png' },
    payload: PNG,
  });
  assert.equal(response.statusCode, 201);
  return response.json().url;
}

async function photosOf(name: string): Promise<(string | null)[]> {
  const { nominations } = (
    await testApp.app.inject({ method: 'GET', url: '/api/nominations' })
  ).json() as {
    nominations: Nomination[];
  };
  return nominations
    .flatMap((nomination) => nomination.nominees)
    .filter((nominee) => nominee.name.trim().toLowerCase() === name.toLowerCase())
    .map((nominee) => nominee.avatarUrl);
}

async function nomineeId(nominationTitle: string, name: string): Promise<number> {
  const [row] = await testApp.sql<{ id: number }[]>`
    select e.id from nominees e join nominations n on n.id = e.nomination_id
    where n.title = ${nominationTitle} and lower(btrim(e.name)) = lower(${name})
  `;
  return row.id;
}

before(async () => {
  testApp = await createTestApp();
  const response = await testApp.app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { name: 'Admin', email: 'admin@example.com', password: 'long-enough-password' },
  });
  const session = response.cookies.find((cookie) => cookie.name === 'preikh_session');
  assert.ok(session);
  adminCookie = `preikh_session=${session.value}`;
  await testApp.sql`update users set role = 'admin' where email = 'admin@example.com'`;
});

after(() => testApp.close());

test('a photo set in one nomination shows for the same person in another', async () => {
  const photo = await uploadPhoto();
  await admin('PUT', `/api/admin/nominees/${await nomineeId('First', 'One')}`, {
    name: 'One',
    avatarUrl: photo,
  });
  // The same person added to another nomination, typed with other case and spaces, no photo.
  const second = await testApp.sql<
    { id: number }[]
  >`select id from nominations where title = 'Second'`;
  await admin('POST', `/api/admin/nominations/${second[0].id}/nominees`, { name: '  one ' });

  assert.deepEqual(await photosOf('one'), [photo, photo]);
  assert.deepEqual(await photosOf('two'), [null]);
});

test('replacing the photo in one nomination replaces it everywhere', async () => {
  const newPhoto = await uploadPhoto();
  await admin('PUT', `/api/admin/nominees/${await nomineeId('Second', 'one')}`, {
    name: 'one',
    avatarUrl: newPhoto,
  });
  assert.deepEqual(await photosOf('one'), [newPhoto, newPhoto]);
});

test('removing the photo removes it everywhere', async () => {
  await admin('PUT', `/api/admin/nominees/${await nomineeId('First', 'One')}`, {
    name: 'One',
    avatarUrl: null,
  });
  assert.deepEqual(await photosOf('one'), [null, null]);
});

test('a new nominee with a photo gives it to the same person in other nominations', async () => {
  const photo = await uploadPhoto();
  const second = await testApp.sql<
    { id: number }[]
  >`select id from nominations where title = 'Second'`;
  await admin('POST', `/api/admin/nominations/${second[0].id}/nominees`, {
    name: 'Two',
    avatarUrl: photo,
  });
  assert.deepEqual(await photosOf('two'), [photo, photo]);
  assert.deepEqual(await photosOf('three'), [null]);
});
