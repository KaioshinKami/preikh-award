import { readFile } from 'node:fs/promises';
import { requireEnv } from '../config.ts';
import { detectImageType, saveImage } from '../modules/images/images-repository.ts';
import type {
  NominationTranslations,
  NomineeTranslations,
} from '../modules/nominations/translations.ts';
import { createSql, type Sql } from './sql.ts';

export type SeedNominee = {
  name: string;
  tagline: string;
  translations?: NomineeTranslations;
};

export type SeedNomination = {
  title: string;
  category: string;
  description: string;
  // A picture in seed-data/emblems/ used as the nomination's logo.
  emblem?: string;
  translations?: NominationTranslations;
  nominees: SeedNominee[];
};

const SEED_FILE = new URL('./seed-data/nominations.json', import.meta.url);
const EMBLEMS_DIR = new URL('./seed-data/emblems/', import.meta.url);

// Fills an empty database; does nothing once any nomination exists, so it is safe to re-run.
export async function seedNominations(sql: Sql, nominations: SeedNomination[]): Promise<boolean> {
  const [{ count }] = await sql<
    { count: number }[]
  >`select count(*)::int as count from nominations`;
  if (count > 0) return false;

  await sql.begin(async (transaction) => {
    for (const nomination of nominations) {
      const [created] = await transaction<{ id: number }[]>`
        insert into nominations (title, category, description, translations)
        values (
          ${nomination.title},
          ${nomination.category},
          ${nomination.description},
          ${transaction.json(nomination.translations ?? {})}
        )
        returning id
      `;
      for (const nominee of nomination.nominees) {
        await transaction`
          insert into nominees (nomination_id, name, tagline, translations)
          values (
            ${created.id},
            ${nominee.name},
            ${nominee.tagline},
            ${transaction.json(nominee.translations ?? {})}
          )
        `;
      }
    }
  });

  return true;
}

// Adds the seed file's translations to a database that was seeded before translations existed.
// Rows are matched by their Russian title / name and only filled while they have none, so
// anything already translated or renamed in the admin page is left alone. Safe to re-run.
export async function seedTranslations(sql: Sql, nominations: SeedNomination[]) {
  let nominationCount = 0;
  let nomineeCount = 0;

  await sql.begin(async (transaction) => {
    for (const nomination of nominations) {
      if (nomination.translations) {
        const updated = await transaction`
          update nominations set translations = ${transaction.json(nomination.translations)}
          where title = ${nomination.title} and translations = '{}'
          returning id
        `;
        nominationCount += updated.length;
      }
      for (const nominee of nomination.nominees) {
        if (!nominee.translations) continue;
        const updated = await transaction`
          update nominees e set translations = ${transaction.json(nominee.translations)}
          from nominations n
          where e.nomination_id = n.id
            and n.title = ${nomination.title}
            and e.name = ${nominee.name}
            and e.translations = '{}'
          returning e.id
        `;
        nomineeCount += updated.length;
      }
    }
  });

  return { nominations: nominationCount, nominees: nomineeCount };
}

// Gives every nomination that has no logo yet its emblem from the seed file, stored like an
// upload from the admin page. A logo set in the admin page is never replaced. Safe to re-run.
export async function seedEmblems(
  sql: Sql,
  nominations: SeedNomination[],
  emblemsDir: URL = EMBLEMS_DIR,
): Promise<number> {
  let attached = 0;
  for (const nomination of nominations) {
    if (!nomination.emblem) continue;
    const [target] = await sql<{ id: number }[]>`
      select id from nominations where title = ${nomination.title} and image_url is null
    `;
    if (!target) continue;

    const data = await readFile(new URL(nomination.emblem, emblemsDir));
    const contentType = detectImageType(data);
    if (!contentType) throw new Error(`${nomination.emblem} is not a JPEG, PNG or WebP picture`);

    const url = await saveImage(sql, contentType, data);
    const updated = await sql`
      update nominations set image_url = ${url} where id = ${target.id} and image_url is null
      returning id
    `;
    attached += updated.length;
  }
  return attached;
}

export async function readSeedNominations(): Promise<SeedNomination[]> {
  return JSON.parse(await readFile(SEED_FILE, 'utf8')) as SeedNomination[];
}

if (import.meta.main) {
  const sql = createSql(requireEnv('DATABASE_URL'));
  const seed = await readSeedNominations();
  const isSeeded = await seedNominations(sql, seed);
  const translated = isSeeded ? null : await seedTranslations(sql, seed);
  const emblems = await seedEmblems(sql, seed);
  await sql.end();
  console.log(
    isSeeded ? 'Seeded nominations and nominees' : 'Nominations already exist, seed skipped',
  );
  if (translated) {
    console.log(
      `Translations added: ${translated.nominations} nominations, ${translated.nominees} nominees`,
    );
  }
  console.log(`Emblems added: ${emblems}`);
}
