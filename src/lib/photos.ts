// Compression des photos AVANT l'envoi : une photo de téléphone fait souvent 3 à 6 Mo,
// trop lourd en 3G. On la réduit à 1280 px de côté maximum, en JPEG qualité 0,8
// (en général 150 à 400 Ko). Le bucket refuse de toute façon les fichiers de plus de 2 Mo.
const MAX_SIDE = 1280;
const QUALITY = 0.8;
const MAX_BYTES = 2 * 1024 * 1024;

export async function compressPhoto(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`La photo « ${file.name} » n'a pas pu être lue. Essaie une autre photo.`);
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  if (!blob || blob.size > MAX_BYTES) throw new Error(`La photo « ${file.name} » est trop lourde, même compressée.`);
  return blob;
}
