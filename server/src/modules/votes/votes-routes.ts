import type { FastifyInstance } from 'fastify';
import { getCurrentUser, requireUser } from '../auth/session.ts';
import { castVote, getUserVotes } from './vote-service.ts';

type VoteBody = { nominationId: number; nomineeId: number };

const voteSchema = {
  body: {
    type: 'object',
    required: ['nominationId', 'nomineeId'],
    additionalProperties: false,
    properties: {
      nominationId: { type: 'integer', minimum: 1 },
      nomineeId: { type: 'integer', minimum: 1 },
    },
  },
};

const VOTE_RATE_LIMIT = { rateLimit: { max: 60, timeWindow: '1 minute' } };

export async function votesRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.get('/me', async (request) => ({
    votes: await getUserVotes(app.sql, getCurrentUser(request).id),
  }));

  app.post<{ Body: VoteBody }>(
    '/',
    { schema: voteSchema, config: VOTE_RATE_LIMIT },
    async (request, reply) => {
      await castVote(app.sql, { userId: getCurrentUser(request).id, ...request.body });
      return reply
        .code(201)
        .send({ nominationId: request.body.nominationId, nomineeId: request.body.nomineeId });
    },
  );
}
