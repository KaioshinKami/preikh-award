import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { FOREIGN_KEY_VIOLATION, hasErrorCode, RESTRICT_VIOLATION } from '../../db/sql.ts';
import { listNominations } from './nominations-repository.ts';

type IdParams = { id: number };
type NominationBody = {
  title: string;
  category: string;
  description?: string;
  imageUrl?: string | null;
};
type NomineeBody = { name: string; tagline?: string; avatarUrl?: string | null };

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
};

// A picture uploaded through /api/admin/images, or an external https image.
// Nothing else, so a stored URL can't point at another scheme or site path.
const imageUrlSchema = {
  type: ['string', 'null'],
  maxLength: 500,
  pattern: '^(https://.+|/api/images/[0-9a-f-]{36})$',
};

const nominationSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    required: ['title', 'category'],
    additionalProperties: false,
    properties: {
      title: { type: 'string', minLength: 1, maxLength: 80 },
      category: { type: 'string', minLength: 1, maxLength: 80 },
      description: { type: 'string', maxLength: 400 },
      imageUrl: imageUrlSchema,
    },
  },
};

const nomineeSchema = {
  params: idParamsSchema,
  body: {
    type: 'object',
    required: ['name'],
    additionalProperties: false,
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 80 },
      tagline: { type: 'string', maxLength: 120 },
      avatarUrl: imageUrlSchema,
    },
  },
};

const createNominationSchema = { body: nominationSchema.body };

function requireText(value: string, message: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new ApiError(400, message);
  return trimmed;
}

function assertFound(rows: readonly unknown[], message: string): void {
  if (rows.length === 0) throw new ApiError(404, message);
}

async function deleteUnlessVoted(run: () => Promise<readonly unknown[]>, notFound: string) {
  try {
    assertFound(await run(), notFound);
  } catch (error) {
    if (!hasErrorCode(error, RESTRICT_VIOLATION)) throw error;
    throw new ApiError(409, 'Нельзя удалить: за номинантов уже голосовали');
  }
}

export async function nominationsAdminRoutes(app: FastifyInstance) {
  app.get('/nominations', async () => ({ nominations: await listNominations(app.sql) }));

  app.post<{ Body: NominationBody }>(
    '/nominations',
    { schema: createNominationSchema },
    async (request, reply) => {
      const { title, category, description = '', imageUrl = null } = request.body;
      const [nomination] = await app.sql`
      insert into nominations (title, category, description, image_url)
      values (${requireText(title, 'Укажите название')}, ${requireText(category, 'Укажите категорию')}, ${description.trim()}, ${imageUrl})
      returning id, title, category, description, image_url
    `;
      return reply.code(201).send({ nomination });
    },
  );

  app.put<{ Params: IdParams; Body: NominationBody }>(
    '/nominations/:id',
    { schema: nominationSchema },
    async (request) => {
      const { title, category, description = '', imageUrl = null } = request.body;
      const rows = await app.sql`
      update nominations
      set title = ${requireText(title, 'Укажите название')},
          category = ${requireText(category, 'Укажите категорию')},
          description = ${description.trim()},
          image_url = ${imageUrl}
      where id = ${request.params.id}
      returning id, title, category, description, image_url
    `;
      assertFound(rows, 'Номинация не найдена');
      return { nomination: rows[0] };
    },
  );

  app.delete<{ Params: IdParams }>(
    '/nominations/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      await deleteUnlessVoted(
        () => app.sql`delete from nominations where id = ${request.params.id} returning id`,
        'Номинация не найдена',
      );
      return reply.code(204).send();
    },
  );

  app.post<{ Params: IdParams; Body: NomineeBody }>(
    '/nominations/:id/nominees',
    { schema: nomineeSchema },
    async (request, reply) => {
      const { name, tagline = '', avatarUrl = null } = request.body;
      try {
        const [nominee] = await app.sql`
        insert into nominees (nomination_id, name, tagline, avatar_url)
        values (${request.params.id}, ${requireText(name, 'Укажите имя')}, ${tagline.trim()}, ${avatarUrl})
        returning id, name, tagline, avatar_url
      `;
        return reply.code(201).send({ nominee });
      } catch (error) {
        if (hasErrorCode(error, FOREIGN_KEY_VIOLATION))
          throw new ApiError(404, 'Номинация не найдена');
        throw error;
      }
    },
  );

  app.put<{ Params: IdParams; Body: NomineeBody }>(
    '/nominees/:id',
    { schema: nomineeSchema },
    async (request) => {
      const { name, tagline = '', avatarUrl = null } = request.body;
      const rows = await app.sql`
      update nominees
      set name = ${requireText(name, 'Укажите имя')}, tagline = ${tagline.trim()}, avatar_url = ${avatarUrl}
      where id = ${request.params.id}
      returning id, name, tagline, avatar_url
    `;
      assertFound(rows, 'Номинант не найден');
      return { nominee: rows[0] };
    },
  );

  app.delete<{ Params: IdParams }>(
    '/nominees/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      await deleteUnlessVoted(
        () => app.sql`delete from nominees where id = ${request.params.id} returning id`,
        'Номинант не найден',
      );
      return reply.code(204).send();
    },
  );
}
