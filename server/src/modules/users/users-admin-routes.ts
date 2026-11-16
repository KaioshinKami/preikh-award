import type { FastifyInstance, FastifyRequest } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { toContainsPattern } from '../../db/sql.ts';
import { getCurrentUser, type UserRole } from '../auth/session.ts';

type IdParams = { id: number };

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
};

const listSchema = {
  querystring: {
    type: 'object',
    properties: { search: { type: 'string', maxLength: 100 } },
  },
};

const roleSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    required: ['role'],
    additionalProperties: false,
    properties: { role: { type: 'string', enum: ['user', 'admin'] } },
  },
};

// An admin acting on their own account could lock everyone out of the admin panel.
function assertNotSelf(request: FastifyRequest, userId: number, message: string) {
  if (getCurrentUser(request).id === userId) throw new ApiError(400, message);
}

export async function usersAdminRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { search?: string } }>(
    '/users',
    { schema: listSchema },
    async (request) => {
      const pattern = toContainsPattern(request.query.search);
      const users = await app.sql`
        select
          u.id, u.name, u.email, u.role, u.created_at,
          (select count(*) from votes v where v.user_id = u.id)::int as votes,
          (select count(*) from applications a where a.user_id = u.id)::int as applications
        from users u
        where ${pattern}::text is null or u.name ilike ${pattern} or u.email ilike ${pattern}
        order by u.created_at desc, u.id desc
      `;
      return { users };
    },
  );

  app.put<{ Params: IdParams; Body: { role: UserRole } }>(
    '/users/:id/role',
    { schema: roleSchema },
    async (request) => {
      assertNotSelf(request, request.params.id, 'Нельзя изменить роль своего аккаунта');
      const [user] = await app.sql`
        update users set role = ${request.body.role}
        where id = ${request.params.id}
        returning id, name, email, role
      `;
      if (!user) throw new ApiError(404, 'Пользователь не найден');
      return { user };
    },
  );

  // Deleting a user also deletes their votes and applications (ON DELETE CASCADE).
  app.delete<{ Params: IdParams }>(
    '/users/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      assertNotSelf(request, request.params.id, 'Нельзя удалить свой аккаунт');
      const rows = await app.sql`delete from users where id = ${request.params.id} returning id`;
      if (rows.length === 0) throw new ApiError(404, 'Пользователь не найден');
      return reply.code(204).send();
    },
  );
}
