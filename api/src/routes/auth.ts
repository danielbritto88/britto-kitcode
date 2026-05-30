import { Hono } from 'hono';
import { generateRandomHex, constantTimeEqual } from '../lib/hmac';
import type { AppEnv } from '../index';

export const authRoute = new Hono<AppEnv>();

// Bootstrap de sessão: troca a senha do cofre por um device_id + device_secret.
// O secret é entregue uma única vez. Cliente persiste cifrado em IndexedDB.
// PROJETO §7.
authRoute.post('/auth', async (c) => {
  // Rate limiting por IP (PROJETO §7.1). Suportado via binding em wrangler.toml.
  if (c.env.AUTH_LIMITER) {
    const ip =
      c.req.header('cf-connecting-ip') ??
      c.req.header('x-forwarded-for') ??
      'unknown';
    const { success } = await c.env.AUTH_LIMITER.limit({ key: ip });
    if (!success) {
      return c.json({ error: 'muitas tentativas, aguarde 1 minuto' }, 429);
    }
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'corpo da requisição inválido' }, 400);
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return c.json({ error: 'corpo inválido' }, 400);
  }

  const { password, deviceLabel, userTag: userTagInput } = body as Record<string, unknown>;

  if (typeof password !== 'string' || !password) {
    return c.json({ error: 'senha obrigatória' }, 400);
  }

  // Constant-time comparison para a senha
  if (!await constantTimeEqual(password, c.env.VAULT_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 400)); // throttle simples
    return c.json({ error: 'senha incorreta' }, 401);
  }

  // App single-user: todos os dispositivos compartilham o mesmo escopo de dados.
  // O user_tag é fixo; o label é o nome de exibição do dispositivo.
  const userTag = 'owner';
  void userTagInput; // ignorado — apenas label é usado para exibição
  const label =
    typeof deviceLabel === 'string' && deviceLabel.trim()
      ? deviceLabel.trim().slice(0, 60)
      : `${userTag} · dispositivo`;

  const deviceId = crypto.randomUUID();
  const deviceSecret = generateRandomHex(32); // 256-bit
  const now = new Date().toISOString();

  await c.env.DB.prepare(
    `INSERT INTO devices (id, label, user_tag, device_secret, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(deviceId, label, userTag, deviceSecret, now, now)
    .run();

  return c.json({
    device_id: deviceId,
    device_secret: deviceSecret,
    user_tag: userTag,
    label,
  });
});
