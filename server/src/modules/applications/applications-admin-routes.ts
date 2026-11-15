import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';

type ApplicationStatus = 'pending' | 'approved' | 'rejected';
type IdParams = { id: number };

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
};

const listSchema = {
  querystring: {
    type: 'object',
    properties: { status: { type: 'string', enum: ['pending', 'approved', 'rejected'] } },
  },
};

const ALREADY_REVIEWED = 'Заявка не найдена или уже рассмотрена';

export async function applicationsAdminRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { status?: ApplicationStatus } }>(
    '/applications',
    { schema: listSchema },
    async (request) => {
      const status = request.query.status ?? 'pending';
      const applications = await app.sql`
        select
          a.id, a.nominee_name, a.comment, a.status, a.created_at,
          a.nomination_id, n.title as nomination_title,
          u.name as author_name, u.email as author_email
        from applications a
        join nominations n on n.id = a.nomination_id
        join users u on u.id = a.user_id
        where a.status = ${status}
        order by a.created_at desc
      `;
      return { applications };
    },
  );

  // Approving turns the application into a nominee of its nomination, in one transaction.
  app.post<{ Params: IdParams }>(
    '/applications/:id/approve',
    { schema: { params: idParamsSchema } },
    async (request) => {
      const nominee = await app.sql.begin(async (transaction) => {
        const [application] = await transaction<{ nominationId: number; nomineeName: string }[]>`
          update applications set status = 'approved', reviewed_at = now()
          where id = ${request.params.id} and status = 'pending'
          returning nomination_id, nominee_name
        `;
        if (!application) throw new ApiError(409, ALREADY_REVIEWED);

        const [created] = await transaction`
          insert into nominees (nomination_id, name)
          values (${application.nominationId}, ${application.nomineeName})
          returning id, nomination_id, name
        `;
        return created;
      });
      return { nominee };
    },
  );

  app.post<{ Params: IdParams }>(
    '/applications/:id/reject',
    { schema: { params: idParamsSchema } },
    async (request) => {
      const rows = await app.sql`
        update applications set status = 'rejected', reviewed_at = now()
        where id = ${request.params.id} and status = 'pending'
        returning id
      `;
      if (rows.length === 0) throw new ApiError(409, ALREADY_REVIEWED);
      return { status: 'rejected' };
    },
  );
}
