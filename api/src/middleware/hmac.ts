import { createMiddleware } from 'hono/factory';
import {
  buildSignaturePayload,
  constantTimeEqual,
  hmacSignHex,
  sha256Hex,
  TS_DRIFT_SECONDS,
} from '../lib/hmac';
import type { AppEnv } from '../index';

interface DeviceRow {
  id: string;
  user_tag: string;
  device_secret: string;
  revoked_at: string | null;
}

// Authorization: TC-HMAC <device_id>:<unix_ts>:<signature_hex>
// signature = HMAC-SHA256(device_secret, METHOD\nPATH\nUNIX_TS\nSHA256(body))
//
// Substitui o middleware Bearer JWT antigo. PROJETO §7.
export const requireHmac = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('TC-HMAC ')) {
    return c.json({ error: 'não autorizado' }, 401);
  }
  const parts = header.slice(8).split(':');
  if (parts.length !== 3) {
    return c.json({ error: 'header malformado' }, 401);
  }
  const deviceId = parts[0]!;
  const tsStr = parts[1]!;
  const signature = parts[2]!;

  const ts = Number.parseInt(tsStr, 10);
  if (!Number.isFinite(ts)) {
    return c.json({ error: 'timestamp inválido' }, 401);
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TS_DRIFT_SECONDS) {
    return c.json({ error: 'timestamp fora da janela (replay protegido)' }, 401);
  }

  const device = await c.env.DB.prepare(
    'SELECT id, user_tag, device_secret, revoked_at FROM devices WHERE id = ?',
  )
    .bind(deviceId)
    .first<DeviceRow>();

  if (!device) {
    return c.json({ error: 'dispositivo desconhecido' }, 401);
  }
  if (device.revoked_at) {
    return c.json({ error: 'dispositivo revogado' }, 401);
  }

  // Recompute signature
  const url = new URL(c.req.url);
  // Recompute signature — always hash the raw body bytes, including multipart.
  // The client serializes FormData via `new Response(formData).arrayBuffer()`
  // to produce the exact bytes the browser will send (see signedFetch.ts).
  const bodyBuf = await c.req.raw.clone().arrayBuffer();
  const bodyHash = await sha256Hex(bodyBuf);
  const expected = await hmacSignHex(
    device.device_secret,
    buildSignaturePayload(c.req.method, url.pathname, ts, bodyHash),
  );
  if (!constantTimeEqual(expected, signature)) {
    return c.json({ error: 'assinatura inválida' }, 401);
  }

  // Touch last_seen_at (best effort, não bloqueia)
  c.executionCtx.waitUntil(
    c.env.DB.prepare('UPDATE devices SET last_seen_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), device.id)
      .run(),
  );

  c.set('userTag', device.user_tag);
  c.set('deviceId', device.id);
  await next();
});
