/** Shrinks a photo to at most 1400px on the long side and converts it to WebP (JPEG if the browser cannot make WebP). */
export interface ResizedImage {
  blob: Blob;
  ext: 'webp' | 'jpg';
  contentType: string;
}

const MAX_SIDE = 1400;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function resizeImage(file: File): Promise<ResizedImage> {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not a picture.`);
  if (file.size > MAX_INPUT_BYTES) throw new Error(`${file.name} is too big (over 30 MB).`);

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch {
      throw new Error(`${file.name} could not be read. Try a JPG or PNG picture.`);
    }
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser cannot resize pictures.');
    ctx.drawImage(img, 0, 0, w, h);

    const webp = await toBlob(canvas, 'image/webp', 0.82);
    if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp', contentType: 'image/webp' };
    const jpg = await toBlob(canvas, 'image/jpeg', 0.85); // older Safari cannot encode WebP
    if (jpg) return { blob: jpg, ext: 'jpg', contentType: 'image/jpeg' };
    throw new Error(`${file.name} could not be converted.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
