import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Nomination = {
  id: number;
  title: string;
  category: string;
  imageUrl: string | null;
  nominees: { id: number; name: string; avatarUrl: string | null }[];
};

// A real 1×1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const IMAGE_URL = /^\/api\/images\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

let testApp: TestApp;
let adminCookie: string;
let voterCookie: string;

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

function upload(data: Buffer, contentType: string, cookie = adminCookie) {
  return testApp.app.inject({
    method: 'POST',
    url: '/api/admin/images',
    headers: { cookie, 'content-type': contentType },
    payload: data,
  });
}

async function uploadPng(): Promise<string> {
  const response = await upload(PNG, 'image/png');
  assert.equal(response.statusCode, 201);
  return (response.json() as { url: string }).url;
}

async function listNominations(): Promise<Nomination[]> {
  return (await testApp.app.inject({ method: 'GET', url: '/api/nominations' })).json().nominations;
}

before(async () => {
  testApp = await createTestApp();
  const admin = await register('Admin', 'admin@example.com');
  adminCookie = admin.cookie;
  voterCookie = (await register('Voter', 'voter@example.com')).cookie;
  await testApp.sql`update users set role = 'admin' where id = ${admin.id}`;
});

after(() => testApp.close());

test('only an admin can upload an image', async () => {
  assert.equal((await upload(PNG, 'image/png', '')).statusCode, 401);
  assert.equal((await upload(PNG, 'image/png', voterCookie)).statusCode, 403);
});

test('an uploaded image is served with its type and a long cache', async () => {
  const url = await uploadPng();
  assert.match(url, IMAGE_URL);

  const response = await testApp.app.inject({ method: 'GET', url });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'image/png');
  assert.equal(response.headers['x-content-type-options'], 'nosniff');
  assert.match(String(response.headers['cache-control']), /immutable/);
  assert.deepEqual(response.rawPayload, PNG);
});

test('data that is not a JPEG, PNG or WebP picture is rejected', async () => {
  const fakePng = await upload(Buffer.from('<svg onload="alert(1)"></svg>'), 'image/png');
  assert.equal(fakePng.statusCode, 400);

  const gif = await upload(Buffer.from('GIF89a'), 'image/gif');
  assert.equal(gif.statusCode, 415);
});

test('an unknown image id answers 404', async () => {
  const response = await testApp.app.inject({
    method: 'GET',
    url: '/api/images/00000000-0000-0000-0000-000000000000',
  });
  assert.equal(response.statusCode, 404);
});

test('a nomination logo and a nominee photo are saved and listed', async () => {
  const [nomination] = await listNominations();
  const logoUrl = await uploadPng();
  const photoUrl = await uploadPng();

  const updateNomination = await testApp.app.inject({
    method: 'PUT',
    url: `/api/admin/nominations/${nomination.id}`,
    headers: { cookie: adminCookie },
    payload: { title: nomination.title, category: nomination.category, imageUrl: logoUrl },
  });
  assert.equal(updateNomination.statusCode, 200);

  const nominee = nomination.nominees[0];
  const updateNominee = await testApp.app.inject({
    method: 'PUT',
    url: `/api/admin/nominees/${nominee.id}`,
    headers: { cookie: adminCookie },
    payload: { name: nominee.name, avatarUrl: photoUrl },
  });
  assert.equal(updateNominee.statusCode, 200);

  const [listed] = await listNominations();
  assert.equal(listed.imageUrl, logoUrl);
  assert.equal(listed.nominees[0].avatarUrl, photoUrl);
});

test('an image URL must be an upload or an https link', async () => {
  const [nomination] = await listNominations();
  for (const imageUrl of ['javascript:alert(1)', '/api/admin/users', 'http://example.com/a.png']) {
    const response = await testApp.app.inject({
      method: 'PUT',
      url: `/api/admin/nominations/${nomination.id}`,
      headers: { cookie: adminCookie },
      payload: { title: nomination.title, category: nomination.category, imageUrl },
    });
    assert.equal(response.statusCode, 400, imageUrl);
  }
});

test('old uploads nobody uses are removed, used ones are kept', async () => {
  const [nomination] = await listNominations();
  const usedId = nomination.imageUrl?.split('/').pop();
  assert.ok(usedId);
  const [abandoned] = await testApp.sql<{ id: string }[]>`
    insert into images (content_type, data, created_at)
    values ('image/png', ${PNG}, now() - interval '2 hours')
    returning id
  `;
  await testApp.sql`update images set created_at = now() - interval '2 hours' where id = ${usedId}`;

  await uploadPng();

  const remaining = await testApp.sql<{ id: string }[]>`
    select id from images where id in (${abandoned.id}, ${usedId})
  `;
  assert.deepEqual(
    remaining.map((image) => image.id),
    [usedId],
  );
});
