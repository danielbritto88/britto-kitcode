import { Hono } from 'hono';
import { requireHmac } from '../middleware/hmac';
import type { AppEnv } from '../index';

export const devicesRoute = new Hono<AppEnv>();

devicesRoute.use('*', requireHmac);

interface DeviceListRow {
  id: string;
  label: string;
  user_tag: string;
  created_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
}

// Lista todos os dispositivos vinculados ao cofre (incluindo revogados,
// para histórico). Cliente filtra ativos pelo campo revoked_at.
devicesRoute.get('/devices', async (c) => {
  const res = await c.env.DB.prepare(
    `SELECT id, label, user_tag, created_at, last_seen_at, revoked_at
       FROM devices
       ORDER BY created_at DESC`,
  ).all<DeviceListRow>();
  return c.json({
    devices: res.results ?? [],
    current_device_id: c.var.deviceId,
  });
});

// Revogar um dispositivo. O dispositivo atual NÃO pode revogar a si mesmo via
// esta rota — para isso, basta limpar localStorage no cliente ("Sair desta sessão").
// Só pode revogar dispositivos do mesmo user_tag.
devicesRoute.post('/devices/:id/revoke', async (c) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'id obrigatório' }, 400);
  if (id === c.var.deviceId) {
    return c.json({ error: 'use "Sair desta sessão" para o dispositivo atual' }, 400);
  }

  const callerTag = c.get('userTag');
  const target = await c.env.DB.prepare('SELECT id, user_tag, revoked_at FROM devices WHERE id = ?')
    .bind(id)
    .first<{ id: string; user_tag: string; revoked_at: string | null }>();

  if (!target) return c.json({ error: 'dispositivo não encontrado' }, 404);
  if (target.user_tag !== callerTag) {
    return c.json({ error: 'não autorizado' }, 403);
  }
  if (target.revoked_at) {
    return c.json({ error: 'dispositivo já revogado' }, 409);
  }

  await c.env.DB.prepare('UPDATE devices SET revoked_at = ? WHERE id = ?')
    .bind(new Date().toISOString(), id)
    .run();

  return c.json({ ok: true });
});
