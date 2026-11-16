import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { toContainsPattern } from '../../db/sql.ts';

type VotesQuery = {
  nominationId?: number;
  userId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

const DEFAULT_PAGE_SIZE = 50;

const listSchema = {
  querystring: {
    type: 'object',
    additionalProperties: false,
    properties: {
      nominationId: { type: 'integer', minimum: 1 },
      userId: { type: 'integer', minimum: 1 },
      search: { type: 'string', maxLength: 100 },
      limit: { type: 'integer', minimum: 1, maximum: 200 },
      offset: { type: 'integer', minimum: 0 },
    },
  },
};

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
};

export async function votesAdminRoutes(app: FastifyInstance) {
  // Newest first. `search` matches the voter's name or email and the nominee's name.
  app.get<{ Querystring: VotesQuery }>('/votes', { schema: listSchema }, async (request) => {
    const { limit = DEFAULT_PAGE_SIZE, offset = 0 } = request.query;
    const nominationId = request.query.nominationId ?? null;
    const userId = request.query.userId ?? null;
    const pattern = toContainsPattern(request.query.search);

    const filter = app.sql`
      from votes v
      join users u on u.id = v.user_id
      join nominations n on n.id = v.nomination_id
      join nominees e on e.id = v.nominee_id
      where (${nominationId}::int is null or v.nomination_id = ${nominationId})
        and (${userId}::int is null or v.user_id = ${userId})
        and (${pattern}::text is null
          or u.name ilike ${pattern} or u.email ilike ${pattern} or e.name ilike ${pattern})
    `;

    const votes = await app.sql`
      select
        v.id, v.created_at,
        v.user_id, u.name as user_name, u.email as user_email,
        v.nomination_id, n.title as nomination_title,
        v.nominee_id, e.name as nominee_name
      ${filter}
      order by v.created_at desc, v.id desc
      limit ${limit} offset ${offset}
    `;
    const [{ total }] = await app.sql<{ total: number }[]>`select count(*)::int as total ${filter}`;
    const [user = null] = userId
      ? await app.sql`select id, name, email from users where id = ${userId}`
      : [];

    return { votes, total, user };
  });

  // Annuls a vote, e.g. one cast from a fake account; the user can then vote in that nomination again.
  app.delete<{ Params: { id: number } }>(
    '/votes/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const rows = await app.sql`delete from votes where id = ${request.params.id} returning id`;
      if (rows.length === 0) throw new ApiError(404, 'Голос не найден');
      return reply.code(204).send();
    },
  );
}
