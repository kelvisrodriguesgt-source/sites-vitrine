/** Reduz a foto no próprio navegador (WebP) para caber no armazenamento local. Devolve também a proporção original. */
export async function resizeImage(file: File, maxSide = 900, quality = 0.8): Promise<{ url: string; ratio: number }> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha um arquivo de imagem (JPG, PNG ou WebP).');
  if (file.size > 15 * 1024 * 1024) throw new Error('A imagem é muito grande. Use uma de até 15 MB.');
  const bitmap = await createImageBitmap(file);
  const ratio = bitmap.width / bitmap.height;
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
  if (url.length > 690_000) url = canvas.toDataURL('image/jpeg', 0.6);
  if (url.length > 690_000) throw new Error('Mesmo reduzida, a foto ficou pesada. Tente outra, menos detalhada.');
  return { url, ratio };
}
