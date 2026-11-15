import { readFile } from 'node:fs/promises';
import { requireEnv } from '../config.ts';
import { createSql, type Sql } from './sql.ts';

export type SeedNomination = {
  title: string;
  category: string;
  description: string;
  nominees: { name: string; tagline: string }[];
};

const SEED_FILE = new URL('./seed-data/nominations.json', import.meta.url);

// Fills an empty database; does nothing once any nomination exists, so it is safe to re-run.
export async function seedNominations(sql: Sql, nominations: SeedNomination[]): Promise<boolean> {
  const [{ count }] = await sql<
    { count: number }[]
  >`select count(*)::int as count from nominations`;
  if (count > 0) return false;

  await sql.begin(async (transaction) => {
    for (const nomination of nominations) {
      const [created] = await transaction<{ id: number }[]>`
        insert into nominations (title, category, description)
        values (${nomination.title}, ${nomination.category}, ${nomination.description})
        returning id
      `;
      for (const nominee of nomination.nominees) {
        await transaction`
          insert into nominees (nomination_id, name, tagline)
          values (${created.id}, ${nominee.name}, ${nominee.tagline})
        `;
      }
    }
  });

  return true;
}

export async function readSeedNominations(): Promise<SeedNomination[]> {
  return JSON.parse(await readFile(SEED_FILE, 'utf8')) as SeedNomination[];
}

if (import.meta.main) {
  const sql = createSql(requireEnv('DATABASE_URL'));
  const isSeeded = await seedNominations(sql, await readSeedNominations());
  await sql.end();
  console.log(
    isSeeded ? 'Seeded nominations and nominees' : 'Nominations already exist, seed skipped',
  );
}
