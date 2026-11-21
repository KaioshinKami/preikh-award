import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import {
  EMBLEMS_PATH,
  readSeedNominations,
  seedEmblems,
  type SeedNomination,
} from '../src/db/seed.ts';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;

let testApp: TestApp;
let adminCookie: string;

const seedItem = (title: string, emblem: string): SeedNomination => ({
  title,
  category: 'A',
  description: '',
  emblem,
  nominees: [],
});

async function imageUrlOf(title: string): Promise<string | null> {
  const [row] = await testApp.sql<{ imageUrl: string | null }[]>`
    select image_url from nominations where title = ${title}
  `;
  return row.imageUrl;
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

test('an emblem is set as the logo of a nomination without one', async () => {
  const attached = await seedEmblems(testApp.sql, [seedItem('First', '01-first.webp')]);
  assert.equal(attached, 1);
  assert.equal(await imageUrlOf('First'), `${EMBLEMS_PATH}01-first.webp`);
});

test('a nomination that already has a logo keeps it, and re-running changes nothing', async () => {
  await testApp.sql`update nominations set image_url = 'https://example.com/own.png' where title = 'Second'`;
  const attached = await seedEmblems(testApp.sql, [
    seedItem('First', '99-other.webp'),
    seedItem('Second', '02-second.webp'),
  ]);
  assert.equal(attached, 0);
  assert.equal(await imageUrlOf('First'), `${EMBLEMS_PATH}01-first.webp`);
  assert.equal(await imageUrlOf('Second'), 'https://example.com/own.png');
});

test('the admin can save a nomination whose logo is an emblem', async () => {
  const [first] = await testApp.sql<
    { id: number }[]
  >`select id from nominations where title = 'First'`;
  const save = (imageUrl: string) =>
    testApp.app.inject({
      method: 'PUT',
      url: `/api/admin/nominations/${first.id}`,
      headers: { cookie: adminCookie },
      payload: { title: 'First', category: 'A', imageUrl },
    });
  assert.equal((await save(`${EMBLEMS_PATH}01-first.webp`)).statusCode, 200);
  assert.equal((await save(`${EMBLEMS_PATH}../admin.webp`)).statusCode, 400);
  assert.equal((await save('/emblems/x.svg')).statusCode, 400);
});

test('every emblem named in the seed file is in the site files', async () => {
  const seed = await readSeedNominations();
  const files = new Set(await readdir(new URL('../../public/emblems/', import.meta.url)));
  for (const nomination of seed) {
    assert.ok(nomination.emblem, `${nomination.title} has no emblem`);
    assert.ok(files.has(nomination.emblem), `${nomination.emblem} is missing`);
  }
});
