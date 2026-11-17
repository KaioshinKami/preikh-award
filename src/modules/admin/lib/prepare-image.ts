// The site shows pictures at a few hundred pixels, while phone photos weigh several megabytes.
// Shrinking them in the browser keeps uploads fast and well under the server's 4 MB limit.
const MAX_SIDE_PX = 1200;
const WEBP_QUALITY = 0.86;
const JPEG_QUALITY = 0.88;
const MAX_PNG_BYTES = 2.5 * 1024 * 1024;

const UNREADABLE_FILE = 'Не удалось открыть файл. Выберите картинку JPG, PNG или WebP';

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(UNREADABLE_FILE);
  });
  const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error(UNREADABLE_FILE);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WebP keeps logo transparency and is small; browsers that can't encode it return PNG instead.
  const webp = await canvasToBlob(canvas, 'image/webp', WEBP_QUALITY);
  if (webp?.type === 'image/webp') return webp;

  const png = await canvasToBlob(canvas, 'image/png');
  if (png && png.size <= MAX_PNG_BYTES) return png;

  const jpeg = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY);
  if (!jpeg) throw new Error(UNREADABLE_FILE);
  return jpeg;
}
