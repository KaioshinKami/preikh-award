import { buildApp } from '../src/app.ts';
import { requireEnv } from '../src/config.ts';
import { ensureDatabase, runMigrations } from '../src/db/migrate.ts';
import { seedNominations } from '../src/db/seed.ts';
import { createSql } from '../src/db/sql.ts';

const TEST_DATABASE_SUFFIX = '_test';

// Tests run against "<database>_test" next to the dev database, rebuilt from scratch every run.
function getTestDatabaseUrl(): string {
  const url = new URL(requireEnv('DATABASE_URL'));
  url.pathname = `${url.pathname}${TEST_DATABASE_SUFFIX}`;
  return url.toString();
}

export async function createTestApp() {
  const databaseUrl = getTestDatabaseUrl();
  await ensureDatabase(databaseUrl);
  const sql = createSql(databaseUrl);

  await sql`drop schema public cascade`;
  await sql`create schema public`;
  await runMigrations(sql);
  await seedNominations(sql, [
    {
      title: 'First',
      category: 'A',
      description: '',
      nominees: [
        { name: 'One', tagline: '' },
        { name: 'Two', tagline: '' },
      ],
    },
    { title: 'Second', category: 'B', description: '', nominees: [{ name: 'Three', tagline: '' }] },
  ]);

  const config = {
    databaseUrl,
    jwtSecret: 'test-secret-that-is-long-enough-for-hs256-signing',
    port: 0,
    isProduction: false,
  };
  const app = await buildApp({ sql, config, logger: false });

  const close = async () => {
    await app.close();
    await sql.end();
  };

  return { app, sql, close };
}
