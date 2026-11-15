import type { Sql } from '../../db/sql.ts';

export type Settings = {
  votingOpen: boolean;
  resultsPublished: boolean;
};

const SETTING_KEYS: Record<keyof Settings, string> = {
  votingOpen: 'voting_open',
  resultsPublished: 'results_published',
};

export async function getSettings(sql: Sql): Promise<Settings> {
  const rows = await sql<{ key: string; value: boolean }[]>`select key, value from settings`;
  const valueByKey = new Map(rows.map((row) => [row.key, row.value]));

  return {
    votingOpen: valueByKey.get(SETTING_KEYS.votingOpen) ?? false,
    resultsPublished: valueByKey.get(SETTING_KEYS.resultsPublished) ?? false,
  };
}

export async function updateSettings(sql: Sql, changes: Partial<Settings>): Promise<Settings> {
  for (const field of Object.keys(SETTING_KEYS) as (keyof Settings)[]) {
    const value = changes[field];
    if (value === undefined) continue;
    await sql`
      insert into settings (key, value) values (${SETTING_KEYS[field]}, ${value})
      on conflict (key) do update set value = excluded.value
    `;
  }

  return getSettings(sql);
}
