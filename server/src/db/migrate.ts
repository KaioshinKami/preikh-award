import { readdir, readFile } from 'node:fs/promises';
import postgres from 'postgres';
import { requireEnv } from '../config.ts';
import { createSql, type Sql } from './sql.ts';

const MIGRATIONS_DIR = new URL('../../migrations/', import.meta.url);

// Creates the database from DATABASE_URL if it is missing, via the maintenance "postgres" database.
export async function ensureDatabase(databaseUrl: string): Promise<void> {
  const url = new URL(databaseUrl);
  const databaseName = decodeURIComponent(url.pathname.slice(1));
  url.pathname = '/postgres';
  const maintenanceSql = postgres(url.toString(), { max: 1, onnotice: () => {} });

  try {
    const [existing] =
      await maintenanceSql`select 1 from pg_database where datname = ${databaseName}`;
    if (!existing) await maintenanceSql`create database ${maintenanceSql(databaseName)}`;
  } finally {
    await maintenanceSql.end();
  }
}

export async function runMigrations(sql: Sql): Promise<string[]> {
  await sql`
    create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `;
  const appliedRows = await sql<{ name: string }[]>`select name from schema_migrations`;
  const appliedNames = new Set(appliedRows.map((row) => row.name));
  const migrationFiles = (await readdir(MIGRATIONS_DIR))
    .filter((file) => file.endsWith('.sql'))
    .sort();
  const appliedNow: string[] = [];

  for (const file of migrationFiles) {
    if (appliedNames.has(file)) continue;
    const migrationSql = await readFile(new URL(file, MIGRATIONS_DIR), 'utf8');
    await sql.begin(async (transaction) => {
      await transaction.unsafe(migrationSql);
      await transaction`insert into schema_migrations (name) values (${file})`;
    });
    appliedNow.push(file);
  }

  return appliedNow;
}

if (import.meta.main) {
  const databaseUrl = requireEnv('DATABASE_URL');
  await ensureDatabase(databaseUrl);
  const sql = createSql(databaseUrl);
  const appliedNow = await runMigrations(sql);
  await sql.end();
  console.log(appliedNow.length ? `Applied: ${appliedNow.join(', ')}` : 'Database is up to date');
}
