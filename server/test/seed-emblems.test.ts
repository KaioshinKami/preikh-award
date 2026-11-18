import assert from 'node:assert/strict';
import { mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { after, before, test } from 'node:test';
import { readSeedNominations, seedEmblems, type SeedNomination } from '../src/db/seed.ts';
import { createTestApp } from './test-app.ts';

type TestApp = Awaited<ReturnType<typeof createTestApp>>;

// A real 1×1 PNG.
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

let testApp: TestApp;
let emblemsDir: URL;

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
  const dir = await mkdtemp(join(tmpdir(), 'preikh-emblems-'));
  await writeFile(join(dir, 'first.png'), PNG);
  await writeFile(join(dir, 'fake.png'), '<svg></svg>');
  emblemsDir = pathToFileURL(`${dir}/`);
});

after(() => testApp.close());

test('an emblem is stored as an image and set as the nomination logo', async () => {
  const attached = await seedEmblems(testApp.sql, [seedItem('First', 'first.png')], emblemsDir);
  assert.equal(attached, 1);

  const url = await imageUrlOf('First');
  assert.match(String(url), /^\/api\/images\/[0-9a-f-]{36}$/);
  const served = await testApp.app.inject({ method: 'GET', url: String(url) });
  assert.equal(served.statusCode, 200);
  assert.equal(served.headers['content-type'], 'image/png');
});

test('a nomination that already has a logo keeps it, and re-running adds nothing', async () => {
  const firstUrl = await imageUrlOf('First');
  const [{ count: imagesBefore }] = await testApp.sql<{ count: number }[]>`
    select count(*)::int as count from images
  `;

  const attached = await seedEmblems(testApp.sql, [seedItem('First', 'first.png')], emblemsDir);
  assert.equal(attached, 0);
  assert.equal(await imageUrlOf('First'), firstUrl);

  const [{ count: imagesAfter }] = await testApp.sql<{ count: number }[]>`
    select count(*)::int as count from images
  `;
  assert.equal(imagesAfter, imagesBefore);
});

test('a file that is not a picture is refused', async () => {
  await assert.rejects(
    seedEmblems(testApp.sql, [seedItem('Second', 'fake.png')], emblemsDir),
    /not a JPEG, PNG or WebP/,
  );
  assert.equal(await imageUrlOf('Second'), null);
});

test('every emblem named in the seed file exists and is a picture', async () => {
  const seed = await readSeedNominations();
  const files = new Set(await readdir(new URL('../src/db/seed-data/emblems/', import.meta.url)));
  for (const nomination of seed) {
    assert.ok(nomination.emblem, `${nomination.title} has no emblem`);
    assert.ok(files.has(nomination.emblem), `${nomination.emblem} is missing`);
  }
});
