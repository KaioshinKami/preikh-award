import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { handleError } from './api-error.ts';
import type { Config } from './config.ts';
import type { Sql } from './db/sql.ts';
// Brings in the sql/config/currentUser decorations; Vercel type-checks only what server.ts imports.
import type {} from './fastify-types.ts';
import { adminRoutes } from './modules/admin/admin-routes.ts';
import { applicationsRoutes } from './modules/applications/applications-routes.ts';
import { authRoutes } from './modules/auth/auth-routes.ts';
import { AUTH_COOKIE } from './modules/auth/session.ts';
import { imagesRoutes } from './modules/images/images-routes.ts';
import { nominationsRoutes } from './modules/nominations/nominations-routes.ts';
import { votesRoutes } from './modules/votes/votes-routes.ts';

type BuildAppOptions = {
  sql: Sql;
  config: Config;
  logger?: boolean;
};

export async function buildApp({ sql, config, logger = true }: BuildAppOptions) {
  const app = Fastify({ logger, trustProxy: config.trustProxy });

  app.decorate('sql', sql);
  app.decorate('config', config);
  app.decorateRequest('currentUser', null);
  app.setErrorHandler(handleError);

  await app.register(cookie);
  await app.register(jwt, {
    secret: config.jwtSecret,
    cookie: { cookieName: AUTH_COOKIE, signed: false },
  });
  // Limits are opt-in per route (register, login, votes, applications).
  await app.register(rateLimit, { global: false });

  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(nominationsRoutes, { prefix: '/api' });
  await app.register(imagesRoutes, { prefix: '/api' });
  await app.register(votesRoutes, { prefix: '/api/votes' });
  await app.register(applicationsRoutes, { prefix: '/api/applications' });
  await app.register(adminRoutes, { prefix: '/api/admin' });

  return app;
}
