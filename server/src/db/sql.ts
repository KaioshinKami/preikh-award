import postgres from 'postgres';

// Column names come back camelCased (nomination_id → nominationId).
export function createSql(databaseUrl: string) {
  return postgres(databaseUrl, { transform: postgres.camel, onnotice: () => {} });
}

export type Sql = ReturnType<typeof createSql>;

// Postgres error codes the API turns into user-facing errors.
export const UNIQUE_VIOLATION = '23505';
export const FOREIGN_KEY_VIOLATION = '23503';
// Raised instead of 23503 when a row is protected by an ON DELETE RESTRICT foreign key.
export const RESTRICT_VIOLATION = '23001';

export function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof postgres.PostgresError && error.code === code;
}

// "%text%" for ILIKE, with the user's own % and _ matched literally. Empty input means no filter.
export function toContainsPattern(search: string | undefined): string | null {
  const trimmed = search?.trim();
  if (!trimmed) return null;
  return `%${trimmed.replace(/[\\%_]/g, '\\$&')}%`;
}
