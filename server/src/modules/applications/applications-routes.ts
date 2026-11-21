import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { FOREIGN_KEY_VIOLATION, hasErrorCode, type Sql } from '../../db/sql.ts';
import { findSessionUser, getCurrentUser, requireUser } from '../auth/session.ts';

type ApplicationBody = { nominationId: number; nomineeName: string; comment?: string };
type ListQuery = { nominationId: number };
type IdParams = { id: number };

const applicationSchema = {
  body: {
    type: 'object',
    required: ['nominationId', 'nomineeName'],
    additionalProperties: false,
    properties: {
      nominationId: { type: 'integer', minimum: 1 },
      nomineeName: { type: 'string', minLength: 2, maxLength: 80 },
      comment: { type: 'string', maxLength: 500 },
    },
  },
};

const listSchema = {
  querystring: {
    type: 'object',
    required: ['nominationId'],
    properties: { nominationId: { type: 'integer', minimum: 1 } },
  },
};

const idParamsSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'integer', minimum: 1 } },
  },
};

const APPLICATION_RATE_LIMIT = { rateLimit: { max: 10, timeWindow: '1 hour' } };
const SUPPORT_RATE_LIMIT = { rateLimit: { max: 120, timeWindow: '1 hour' } };

// Only suggestions still waiting for the commission can be seen and supported: an approved one
// is a nominee by now, a rejected one is gone.
async function findOpenSuggestion(sql: Sql, id: number) {
  const [suggestion] = await sql<{ id: number; userId: number }[]>`
    select id, user_id from applications where id = ${id} and status = 'pending'
  `;
  if (!suggestion) {
    throw new ApiError(404, 'Этот вариант уже рассмотрела комиссия', 'variant_not_found');
  }
  return suggestion;
}

async function countSupports(sql: Sql, id: number): Promise<number> {
  const [{ supports }] = await sql<{ supports: number }[]>`
    select count(*)::int as supports from application_supports where application_id = ${id}
  `;
  return supports;
}

export async function applicationsRoutes(app: FastifyInstance) {
  // A nomination's open suggestions, most supported first. Guests see them too; a signed-in
  // visitor also learns which ones they wrote and which they support.
  app.get<{ Querystring: ListQuery }>('/', { schema: listSchema }, async (request, reply) => {
    const userId = (await findSessionUser(request))?.id ?? null;
    const variants = await app.sql`
      select
        a.id,
        a.nominee_name as name,
        count(s.user_id)::int as supports,
        coalesce(a.user_id = ${userId}, false) as is_mine,
        coalesce(bool_or(s.user_id = ${userId}), false) as is_supported
      from applications a
      left join application_supports s on s.application_id = a.id
      where a.nomination_id = ${request.query.nominationId} and a.status = 'pending'
      group by a.id
      order by supports desc, a.created_at, a.id
    `;
    reply.header('Cache-Control', 'private, no-store');
    return { variants };
  });

  // A name that is already suggested in this nomination (ignoring case and extra spaces) is not
  // added twice: the visitor's support goes to the existing suggestion instead.
  app.post<{ Body: ApplicationBody }>(
    '/',
    { preHandler: requireUser, schema: applicationSchema, config: APPLICATION_RATE_LIMIT },
    async (request, reply) => {
      const userId = getCurrentUser(request).id;
      const { nominationId } = request.body;
      const nomineeName = request.body.nomineeName.trim();
      if (!nomineeName) throw new ApiError(400, 'Укажите имя номинанта', 'nominee_name_required');

      try {
        const result = await app.sql.begin(async (transaction) => {
          const [nominee] = await transaction`
            select id from nominees
            where nomination_id = ${nominationId}
              and regexp_replace(lower(btrim(name)), '[[:space:]]+', ' ', 'g')
                = regexp_replace(lower(btrim(${nomineeName})), '[[:space:]]+', ' ', 'g')
          `;
          if (nominee) {
            throw new ApiError(
              409,
              'Этот человек уже есть среди номинантов — просто проголосуйте за него',
              'already_nominee',
            );
          }

          const [existing] = await transaction<{ id: number }[]>`
            select id from applications
            where nomination_id = ${nominationId}
              and status = 'pending'
              and regexp_replace(lower(btrim(nominee_name)), '[[:space:]]+', ' ', 'g')
                = regexp_replace(lower(btrim(${nomineeName})), '[[:space:]]+', ' ', 'g')
            order by id
            limit 1
          `;
          const suggestionId =
            existing?.id ??
            (
              await transaction<{ id: number }[]>`
                insert into applications (user_id, nomination_id, nominee_name, comment)
                values (${userId}, ${nominationId}, ${nomineeName}, ${request.body.comment?.trim() ?? ''})
                returning id
              `
            )[0].id;

          await transaction`
            insert into application_supports (application_id, user_id)
            values (${suggestionId}, ${userId})
            on conflict do nothing
          `;
          return { id: suggestionId, isNew: !existing };
        });

        return reply
          .code(result.isNew ? 201 : 200)
          .send({ id: result.id, status: result.isNew ? 'pending' : 'supported' });
      } catch (error) {
        if (hasErrorCode(error, FOREIGN_KEY_VIOLATION)) {
          throw new ApiError(400, 'Такой номинации нет', 'nomination_not_found');
        }
        throw error;
      }
    },
  );

  app.post<{ Params: IdParams }>(
    '/:id/support',
    { preHandler: requireUser, schema: idParamsSchema, config: SUPPORT_RATE_LIMIT },
    async (request) => {
      const suggestion = await findOpenSuggestion(app.sql, request.params.id);
      await app.sql`
        insert into application_supports (application_id, user_id)
        values (${suggestion.id}, ${getCurrentUser(request).id})
        on conflict do nothing
      `;
      return { supports: await countSupports(app.sql, suggestion.id) };
    },
  );

  // The author's own support stays: their suggestion always has them behind it.
  app.delete<{ Params: IdParams }>(
    '/:id/support',
    { preHandler: requireUser, schema: idParamsSchema, config: SUPPORT_RATE_LIMIT },
    async (request) => {
      const userId = getCurrentUser(request).id;
      const suggestion = await findOpenSuggestion(app.sql, request.params.id);
      if (suggestion.userId === userId) {
        throw new ApiError(409, 'Это ваш вариант — ваш голос за него уже засчитан', 'own_variant');
      }
      await app.sql`
        delete from application_supports
        where application_id = ${suggestion.id} and user_id = ${userId}
      `;
      return { supports: await countSupports(app.sql, suggestion.id) };
    },
  );
}
