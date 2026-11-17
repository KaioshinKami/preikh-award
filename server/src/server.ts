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

// Not awaited: on Vercel the runtime intercepts listen() and finishes it only after this module
// has loaded, so a top-level await here would never resolve and every request would time out.
app.listen({ port: config.port, host: '127.0.0.1' }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
