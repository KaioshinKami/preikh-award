import type { Config } from './config.ts';
import type { Sql } from './db/sql.ts';
import type { SessionUser } from './modules/auth/session.ts';

declare module 'fastify' {
  interface FastifyInstance {
    sql: Sql;
    config: Config;
  }

  interface FastifyRequest {
    currentUser: SessionUser | null;
  }
}
