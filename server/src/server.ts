import { buildApp } from './app.ts';
import { loadConfig } from './config.ts';
import { createSql } from './db/sql.ts';

const config = loadConfig();
const sql = createSql(config.databaseUrl);
const app = await buildApp({ sql, config });

const shutdown = async () => {
  await app.close();
  await sql.end();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: config.port, host: '127.0.0.1' });
