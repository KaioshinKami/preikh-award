import type { FastifyInstance } from 'fastify';
import { ApiError } from '../../api-error.ts';
import {
  deleteAbandonedImages,
  detectImageType,
  IMAGE_CONTENT_TYPES,
  saveImage,
} from './images-repository.ts';

// Vercel rejects request bodies over 4.5 MB; the admin page shrinks pictures well below this.
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// The picture is sent as the raw request body with its own Content-Type (image/webp, ...).
export async function imagesAdminRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    [...IMAGE_CONTENT_TYPES],
    { parseAs: 'buffer', bodyLimit: MAX_IMAGE_BYTES },
    (_request, body, done) => done(null, body),
  );

  app.post('/images', async (request, reply) => {
    const data = request.body;
    const contentType = Buffer.isBuffer(data) ? detectImageType(data) : null;
    if (!Buffer.isBuffer(data) || !contentType) {
      throw new ApiError(400, 'Загрузите изображение в формате JPG, PNG или WebP');
    }

    await deleteAbandonedImages(app.sql);
    const url = await saveImage(app.sql, contentType, data);
    return reply.code(201).send({ url });
  });
}
