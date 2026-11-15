import type { FastifyInstance } from 'fastify';
import { getSettings } from '../settings/settings-repository.ts';
import { hideVoteCounts, listNominations } from './nominations-repository.ts';

export async function nominationsRoutes(app: FastifyInstance) {
  // Vote counts stay secret until the admin publishes the results.
  app.get('/nominations', async () => {
    const settings = await getSettings(app.sql);
    const nominations = await listNominations(app.sql);

    return {
      ...settings,
      nominations: settings.resultsPublished ? nominations : hideVoteCounts(nominations),
    };
  });
}
