import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { FOREIGN_KEY_VIOLATION, hasErrorCode } from '../../db/sql.ts';
import { getCurrentUser, requireUser } from '../auth/session.ts';

type ApplicationBody = { nominationId: number; nomineeName: string; comment?: string };

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

const APPLICATION_RATE_LIMIT = { rateLimit: { max: 10, timeWindow: '1 hour' } };

export async function applicationsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireUser);

  app.post<{ Body: ApplicationBody }>(
    '/',
    { schema: applicationSchema, config: APPLICATION_RATE_LIMIT },
    async (request, reply) => {
      const nomineeName = request.body.nomineeName.trim();
      if (!nomineeName) throw new ApiError(400, 'Укажите имя номинанта');

      try {
        await app.sql`
          insert into applications (user_id, nomination_id, nominee_name, comment)
          values (
            ${getCurrentUser(request).id},
            ${request.body.nominationId},
            ${nomineeName},
            ${request.body.comment?.trim() ?? ''}
          )
        `;
      } catch (error) {
        if (hasErrorCode(error, FOREIGN_KEY_VIOLATION)) {
          throw new ApiError(400, 'Такой номинации нет');
        }
        throw error;
      }

      return reply.code(201).send({ status: 'pending' });
    },
  );
}
