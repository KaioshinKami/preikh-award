import type { Sql } from '../../db/sql.ts';

export const IMAGE_URL_PREFIX = '/api/images/';
export const IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageContentType = (typeof IMAGE_CONTENT_TYPES)[number];

// Uploads that no nomination or nominee points to after this long are leftovers: a form closed
// without saving, or a picture that was replaced. The delay leaves time to finish the form.
const ABANDONED_AFTER = '1 hour';

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

// Reads the file signature, so only real JPEG/PNG/WebP data is stored and served as an image.
export function detectImageType(data: Buffer): ImageContentType | null {
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg';
  }
  if (data.length >= 8 && data.subarray(0, 8).equals(PNG_SIGNATURE)) return 'image/png';
  if (
    data.length >= 12 &&
    data.toString('latin1', 0, 4) === 'RIFF' &&
    data.toString('latin1', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

// Returns the URL the site uses to show the picture.
export async function saveImage(
  sql: Sql,
  contentType: ImageContentType,
  data: Buffer,
): Promise<string> {
  const [image] = await sql<{ id: string }[]>`
    insert into images (content_type, data) values (${contentType}, ${data}) returning id
  `;
  return `${IMAGE_URL_PREFIX}${image.id}`;
}

export async function findImage(sql: Sql, id: string) {
  const [image] = await sql<{ contentType: ImageContentType; data: Buffer }[]>`
    select content_type, data from images where id = ${id}
  `;
  return image ?? null;
}

export async function deleteAbandonedImages(sql: Sql): Promise<void> {
  await sql`
    delete from images i
    where i.created_at < now() - ${ABANDONED_AFTER}::interval
      and not exists (
        select 1 from nominations where image_url = ${IMAGE_URL_PREFIX}::text || i.id::text
      )
      and not exists (
        select 1 from nominees where avatar_url = ${IMAGE_URL_PREFIX}::text || i.id::text
      )
  `;
}
