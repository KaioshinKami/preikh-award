import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import { findImage } from './images-repository.ts';

type ImageParams = { id: string };

const UUID_PATTERN = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

// An image never changes under its id (a new upload gets a new id), so browsers and the CDN
// may keep it for a year; s-maxage is what makes Vercel's CDN cache the function response.
const IMMUTABLE_CACHE = 'public, max-age=31536000, s-maxage=31536000, immutable';

const imageSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: { id: { type: 'string', pattern: UUID_PATTERN } },
  },
};

export async function imagesRoutes(app: FastifyInstance) {
  app.get<{ Params: ImageParams }>(
    '/images/:id',
    { schema: imageSchema },
    async (request, reply) => {
      const image = await findImage(app.sql, request.params.id);
      if (!image) throw new ApiError(404, 'Изображение не найдено');

      return reply
        .header('Cache-Control', IMMUTABLE_CACHE)
        .header('X-Content-Type-Options', 'nosniff')
        .type(image.contentType)
        .send(image.data);
    },
  );
}
