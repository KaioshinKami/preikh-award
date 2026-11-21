import type { FastifyInstance } from 'fastify';
import { getSettings } from '../settings/settings-repository.ts';
import { hideVoteCounts, listNominations } from './nominations-repository.ts';

// The list is the same for every visitor, so the CDN may answer it for a few seconds and then
// refresh it in the background; browsers always ask again. An admin change shows within ~15 s.
const SHORT_SHARED_CACHE = 'public, max-age=0, s-maxage=15, stale-while-revalidate=60';

export async function nominationsRoutes(app: FastifyInstance) {
  // Vote counts stay secret until the admin publishes the results.
  app.get('/nominations', async (_request, reply) => {
    const settings = await getSettings(app.sql);
    const nominations = await listNominations(app.sql);

    reply.header('Cache-Control', SHORT_SHARED_CACHE);
    return {
      ...settings,
      nominations: settings.resultsPublished ? nominations : hideVoteCounts(nominations),
    };
  });
}
