import type { FastifyInstance } from 'fastify';
import { applicationsAdminRoutes } from '../applications/applications-admin-routes.ts';
import { requireAdmin } from '../auth/session.ts';
import { nominationsAdminRoutes } from '../nominations/nominations-admin-routes.ts';
import { getSettings, updateSettings, type Settings } from '../settings/settings-repository.ts';
import { getStats } from '../stats/stats-repository.ts';

const settingsSchema = {
  body: {
    type: 'object',
    minProperties: 1,
    additionalProperties: false,
    properties: {
      votingOpen: { type: 'boolean' },
      resultsPublished: { type: 'boolean' },
    },
  },
};

// Every route registered here, including the nested plugins, requires the admin role.
export async function adminRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAdmin);

  app.get('/stats', async () => getStats(app.sql));
  app.get('/settings', async () => getSettings(app.sql));
  app.put<{ Body: Partial<Settings> }>('/settings', { schema: settingsSchema }, async (request) =>
    updateSettings(app.sql, request.body),
  );

  await app.register(nominationsAdminRoutes);
  await app.register(applicationsAdminRoutes);
}
