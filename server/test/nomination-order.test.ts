import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;

let testApp: TestApp;

async function listedTitles(): Promise<string[]> {
  const response = await testApp.app.inject({ method: 'GET', url: '/api/nominations' });
  assert.equal(response.statusCode, 200);
  return response.json<{ nominations: { title: string }[] }>().nominations.map((n) => n.title);
}

before(async () => {
  testApp = await createTestApp();
});

after(async () => {
  await testApp.close();
});

test('nominations are listed in the order they were added', async () => {
  assert.deepEqual(await listedTitles(), ['First', 'Second']);
});

test('swapping positions swaps the order, each nomination keeping its nominees and id', async () => {
  const before = await testApp.app.inject({ method: 'GET', url: '/api/nominations' });
  const [first, second] = before.json<{ nominations: { id: number }[] }>().nominations;

  await testApp.sql`
    update nominations moved set position = other.position
    from nominations other
    where (moved.title, other.title) in (('First', 'Second'), ('Second', 'First'))
  `;

  const response = await testApp.app.inject({ method: 'GET', url: '/api/nominations' });
  const nominations = response.json<{
    nominations: { id: number; title: string; nominees: { name: string }[] }[];
  }>().nominations;
  assert.deepEqual(
    nominations.map((n) => [n.id, n.title, n.nominees.map((nominee) => nominee.name)]),
    [
      [second.id, 'Second', ['Three']],
      [first.id, 'First', ['One', 'Two']],
    ],
  );
});

test('a new nomination goes to the end of the list', async () => {
  await testApp.sql`insert into nominations (title, category) values ('Third', 'C')`;
  const titles = await listedTitles();
  assert.equal(titles.at(-1), 'Third');
});
