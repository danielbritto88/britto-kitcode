// v1.7.0 — Cloudflare Workers
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRoute } from './routes/auth';
import { syncRoute } from './routes/sync';
import { photoRoute } from './routes/photo';
import { pushRoute } from './routes/push';
import { devicesRoute } from './routes/devices';
import { sendMaintenanceAlerts } from './lib/alerts';

// Cloudflare Workers Rate Limiting binding (PROJETO §7.1)
export interface RateLimitBinding {
  limit(opts: { key: string }): Promise<{ success: boolean }>;
}

export interface WorkerEnv {
  DB: D1Database;
  STORAGE: R2Bucket;
  VAULT_PASSWORD: string;
  JWT_SECRET: string;             // usado para assinar presigned URLs de foto
  ALLOWED_ORIGINS: string;
  VAPID_PUBLIC?: string;
  VAPID_PRIVATE?: string;
  VAPID_SUBJECT?: string;
  AUTH_LIMITER?: RateLimitBinding;
}

export type AppEnv = {
  Bindings: WorkerEnv;
  Variables: { userTag: string; deviceId: string };
};

const app = new Hono<AppEnv>();

// CORS
app.use('*', async (c, next) => {
  const origins = (c.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return cors({
    origin: (o) => (origins.includes(o) ? o : ''),
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    maxAge: 86400,
  })(c, next);
});

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (c) =>
  c.json({ ok: true, ts: new Date().toISOString(), version: '1.7.0' }),
);

// ── Auth ──────────────────────────────────────────────────────────────────────
app.route('/api', authRoute);

// ── Sync ──────────────────────────────────────────────────────────────────────
app.route('/api', syncRoute);

// ── Photos ────────────────────────────────────────────────────────────────────
app.route('/api', photoRoute);

// ── Push ──────────────────────────────────────────────────────────────────────
app.route('/api', pushRoute);

// ── Devices ───────────────────────────────────────────────────────────────────
app.route('/api', devicesRoute);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.notFound((c) => c.json({ error: 'not found' }, 404));

export default {
  fetch: app.fetch.bind(app),
  async scheduled(_event: ScheduledEvent, env: WorkerEnv, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(sendMaintenanceAlerts(env));
  },
};
