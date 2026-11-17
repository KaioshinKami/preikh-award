import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { seedTranslations } from '../src/db/seed.ts';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;
type Nomination = {
  id: number;
  title: string;
  category: string;
  translations: Record<string, Record<string, string>>;
  nominees: { id: number; name: string; translations: Record<string, Record<string, string>> }[];
};

let testApp: TestApp;
let adminCookie: string;

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

function adminPut(url: string, payload: object) {
  return testApp.app.inject({ method: 'PUT', url, headers: { cookie: adminCookie }, payload });
}

async function listNominations(): Promise<Nomination[]> {
  return (await testApp.app.inject({ method: 'GET', url: '/api/nominations' })).json().nominations;
}

before(async () => {
  testApp = await createTestApp();
  const admin = await register('Admin', 'admin@example.com');
  adminCookie = admin.cookie;
  await testApp.sql`update users set role = 'admin' where id = ${admin.id}`;
});

after(() => testApp.close());

test('nominations and nominees start without translations', async () => {
  const [nomination] = await listNominations();
  assert.deepEqual(nomination.translations, {});
  assert.deepEqual(nomination.nominees[0].translations, {});
});

test('an admin saves translations; blank texts are dropped', async () => {
  const [nomination] = await listNominations();
  const saved = await adminPut(`/api/admin/nominations/${nomination.id}`, {
    title: nomination.title,
    category: nomination.category,
    translations: {
      kk: { title: '  Бірінші  ', category: '', description: ' ' },
      en: { title: 'First', category: 'Main' },
    },
  });
  assert.equal(saved.statusCode, 200);

  const nominee = nomination.nominees[0];
  const savedNominee = await adminPut(`/api/admin/nominees/${nominee.id}`, {
    name: nominee.name,
    translations: { en: { name: 'One (en)', tagline: '' }, kk: { name: '' } },
  });
  assert.equal(savedNominee.statusCode, 200);

  const [listed] = await listNominations();
  assert.deepEqual(listed.translations, {
    kk: { title: 'Бірінші' },
    en: { title: 'First', category: 'Main' },
  });
  assert.deepEqual(listed.nominees[0].translations, { en: { name: 'One (en)' } });
});

test('only Kazakh and English and the known fields are stored; too long is rejected', async () => {
  const [, nomination] = await listNominations();
  const save = (translations: object) =>
    adminPut(`/api/admin/nominations/${nomination.id}`, {
      title: nomination.title,
      category: nomination.category,
      translations,
    });

  // Fastify drops properties the schema does not list instead of failing the request.
  const unknown = await save({ de: { title: 'Zweite' }, en: { slogan: 'Nope' } });
  assert.equal(unknown.statusCode, 200);
  assert.deepEqual(unknown.json().nomination.translations, {});

  const tooLong = await save({ en: { title: 'x'.repeat(81) } });
  assert.equal(tooLong.statusCode, 400);
  assert.equal(tooLong.json().code, 'validation_failed');
});

test('seeding translations fills only untranslated rows that match by Russian text', async () => {
  const filled = await seedTranslations(testApp.sql, [
    {
      title: 'First',
      category: 'A',
      description: '',
      translations: { en: { title: 'Overwritten?' } },
      nominees: [
        { name: 'One', tagline: '', translations: { en: { name: 'Overwritten?' } } },
        { name: 'Two', tagline: '', translations: { en: { name: 'Two (en)' } } },
      ],
    },
    {
      title: 'Second',
      category: 'B',
      description: '',
      translations: { kk: { title: 'Екінші' } },
      nominees: [],
    },
    { title: 'Missing', category: 'C', description: '', translations: { en: {} }, nominees: [] },
  ]);
  assert.deepEqual(filled, { nominations: 1, nominees: 1 });

  const [first, second] = await listNominations();
  assert.equal(first.translations.en?.title, 'First');
  assert.equal(first.nominees[0].translations.en?.name, 'One (en)');
  assert.equal(first.nominees[1].translations.en?.name, 'Two (en)');
  assert.equal(second.translations.kk?.title, 'Екінші');
});

test('errors a visitor can see carry a code for the site to translate', async () => {
  const login = await testApp.app.inject({
    method: 'POST',
    url: '/api/auth/login',
    payload: { email: 'nobody@example.com', password: 'whatever-password' },
  });
  assert.equal(login.statusCode, 401);
  assert.equal(login.json().code, 'invalid_credentials');
  assert.ok(login.json().error);

  const vote = await testApp.app.inject({
    method: 'POST',
    url: '/api/votes',
    payload: { nominationId: 1, nomineeId: 1 },
  });
  assert.equal(vote.statusCode, 401);
  assert.equal(vote.json().code, 'unauthorized');
});
