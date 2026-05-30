import { Hono } from 'hono';
import { requireHmac } from '../middleware/hmac';
import type { AppEnv } from '../index';

export const pushRoute = new Hono<AppEnv>();

pushRoute.use('*', requireHmac);

interface SubBody {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

// Register or refresh a push subscription — scoped to the authenticated device's user_tag
pushRoute.post('/push/subscribe', async (c) => {
  const userTag = c.get('userTag');
  const deviceId = c.get('deviceId');
  let body: SubBody;
  try {
    body = (await c.req.json()) as SubBody;
  } catch {
    return c.json({ error: 'invalid body' }, 400);
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return c.json({ error: 'missing fields' }, 400);
  }

  // Validate endpoint is a URL
  try {
    new URL(body.endpoint);
  } catch {
    return c.json({ error: 'endpoint inválido' }, 400);
  }

  // Basic base64url validation for keys
  const b64urlRe = /^[A-Za-z0-9_-]+={0,2}$/;
  if (!b64urlRe.test(body.keys.p256dh) || !b64urlRe.test(body.keys.auth)) {
    return c.json({ error: 'chaves inválidas' }, 400);
  }

  await c.env.DB.prepare(`
    INSERT INTO push_subscriptions (id, user_tag, device_id, endpoint, p256dh, auth, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(endpoint) DO UPDATE SET
      user_tag   = excluded.user_tag,
      device_id  = excluded.device_id,
      p256dh     = excluded.p256dh,
      auth       = excluded.auth
  `).bind(
    crypto.randomUUID(),
    userTag,
    deviceId,
    body.endpoint,
    body.keys.p256dh,
    body.keys.auth,
    new Date().toISOString(),
  ).run();

  return c.json({ ok: true });
});

// Remove a subscription — only if it belongs to the caller's user_tag
pushRoute.delete('/push/unsubscribe/:endpoint', async (c) => {
  const userTag = c.get('userTag');
  const endpoint = decodeURIComponent(c.req.param('endpoint'));

  await c.env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_tag = ?')
    .bind(endpoint, userTag)
    .run();

  return c.json({ ok: true });
});
