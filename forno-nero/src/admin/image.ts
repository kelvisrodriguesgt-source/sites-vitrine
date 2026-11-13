/** Reduz a foto no próprio navegador (máx. 900 px, WebP) para caber no armazenamento local. */
export async function resizeImage(file: File, maxSide = 900, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (JPG, PNG ou WebP).');
  if (file.size > 12 * 1024 * 1024) throw new Error('A imagem é muito grande. Use uma de até 12 MB.');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Não foi possível processar a imagem neste navegador.');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let url = canvas.toDataURL('image/webp', quality);
  if (!url.startsWith('data:image/webp')) url = canvas.toDataURL('image/jpeg', quality);
  return url;
}
