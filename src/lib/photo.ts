import { signedFetch, signedJsonFetch, type SigningContext } from './signedFetch';

const MAX_DIMENSION = 1024;
const QUALITY = 0.8;

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width: w, height: h } = bitmap;

  const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h, 1);
  const cw = Math.round(w * scale);
  const ch = Math.round(h * scale);

  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, cw, ch);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('compressão falhou'))),
      'image/webp',
      QUALITY,
    );
  });
}

// Upload de foto. FormData não entra no HMAC body-hash (ver signedFetch.ts);
// confidencialidade depende do TLS. Resposta entrega a `key` para guardar no veículo.
export async function uploadPhoto(signing: SigningContext, file: File): Promise<string> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append('file', new File([blob], 'photo.webp', { type: 'image/webp' }));

  const res = await signedFetch(signing, '/api/photo/upload', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    let message = `upload falhou: ${res.status}`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as { key: string };
  return data.key;
}

// Cache em memória de URLs assinadas.
// Cada entrada expira ~5min antes da exp real para dar margem ao SW e ao <img>.
interface CachedSignedUrl {
  url: string;
  expiresAt: number; // unix seconds (já com margem)
}

const urlCache = new Map<string, CachedSignedUrl>();
const inflight = new Map<string, Promise<string>>();
const MAX_CACHE_ENTRIES = 200;

const SAFETY_MARGIN_S = 5 * 60;

export async function getSignedPhotoUrl(
  signing: SigningContext,
  key: string,
): Promise<string> {
  const cacheKey = `${signing.device_id}:${key}`;
  const now = Math.floor(Date.now() / 1000);
  const cached = urlCache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.url;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const p = (async () => {
    const data = await signedJsonFetch<{ url: string; exp: number }>(
      signing,
      `/api/photo/sign?key=${encodeURIComponent(key)}`,
      { method: 'GET' },
    );
    urlCache.set(cacheKey, { url: data.url, expiresAt: data.exp - SAFETY_MARGIN_S });
    if (urlCache.size > MAX_CACHE_ENTRIES) {
      const oldest = urlCache.keys().next().value;
      if (oldest) urlCache.delete(oldest);
    }
    return data.url;
  })().finally(() => {
    inflight.delete(cacheKey);
  });

  inflight.set(cacheKey, p);
  return p;
}

export function clearPhotoUrlCache(): void {
  urlCache.clear();
  inflight.clear();
}
