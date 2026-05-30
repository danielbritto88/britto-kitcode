import { Hono } from 'hono';
import { requireHmac } from '../middleware/hmac';
import { hmacSignHex, constantTimeEqual } from '../lib/hmac';
import type { AppEnv } from '../index';

export const photoRoute = new Hono<AppEnv>();

// Upload exige HMAC do dispositivo.
photoRoute.post('/photo/upload', requireHmac, async (c) => {
  let formData: FormData;
  try {
    formData = await c.req.formData();
  } catch {
    return c.json({ error: 'form data inválido' }, 400);
  }

  const file = formData.get('file');
  if (!file || typeof (file as unknown as File).arrayBuffer !== 'function') {
    return c.json({ error: 'arquivo obrigatório' }, 400);
  }
  const uploadFile = file as unknown as File;
  if (uploadFile.size > 5 * 1024 * 1024) {
    return c.json({ error: 'arquivo muito grande (máx 5 MB)' }, 413);
  }

  const key = `photos/${crypto.randomUUID()}.webp`;
  await c.env.STORAGE.put(key, await uploadFile.arrayBuffer(), {
    httpMetadata: { contentType: 'image/webp' },
  });

  return c.json({ key }, 201);
});

// Emite URL assinada para uma key. PROJETO §7.1 — substitui R2 público.
// Cliente pede via GET /api/photo/sign?key=...; recebe { url, exp }.
// URL inclui ?sig=...&exp=... e pode ser usada direto em <img src>.
photoRoute.get('/photo/sign', requireHmac, async (c) => {
  const key = c.req.query('key');
  if (!key || !key.startsWith('photos/')) {
    return c.json({ error: 'key inválida' }, 400);
  }
  const exp = Math.floor(Date.now() / 1000) + 3600; // 1h TTL
  const sig = await hmacSignHex(c.env.JWT_SECRET, `${key}:${exp}`);
  const url = new URL(c.req.url);
  url.pathname = `/api/photo/${key}`;
  url.search = `?sig=${sig}&exp=${exp}`;
  return c.json({ url: url.toString(), exp });
});

// Servir foto — sem requireHmac, pois o ?sig na própria URL prova autorização.
// Permite uso direto em <img>, cacheável pelo SW.
photoRoute.get('/photo/*', async (c) => {
  const key = c.req.path.replace('/api/photo/', '');
  if (!key || !key.startsWith('photos/')) {
    return c.json({ error: 'key inválida' }, 400);
  }
  const sig = c.req.query('sig');
  const expStr = c.req.query('exp');

  if (!sig || !expStr) {
    return c.json({ error: 'URL não assinada' }, 401);
  }
  const exp = Number.parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) {
    return c.json({ error: 'URL expirada' }, 401);
  }
  const expected = await hmacSignHex(c.env.JWT_SECRET, `${key}:${exp}`);
  if (!constantTimeEqual(expected, sig)) {
    return c.json({ error: 'assinatura inválida' }, 401);
  }

  const obj = await c.env.STORAGE.get(key);
  if (!obj) return c.json({ error: 'não encontrado' }, 404);

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  // Cache só pelo navegador/SW; CDN não, pois URL caduca em 1h.
  headers.set('cache-control', `private, max-age=${Math.max(0, exp - Math.floor(Date.now() / 1000))}, immutable`);
  return new Response(obj.body, { headers });
});
