import { sendWebPush, PushSubscriptionError, type PushSubscription } from './webpush';
import type { WorkerEnv } from '../index';

interface MaintenanceRow {
  id: string;
  vehicle_id: string;
  type: string;
  next_date: string | null;
  next_odometer: number | null;
  archived_at: string | null;
}

interface FuelRow {
  vehicle_id: string;
  odometer: number;
}

interface SubRow {
  endpoint: string;
  p256dh: string;
  auth: string;
}

const TYPE_LABELS: Record<string, string> = {
  oil: 'Óleo',
  tires: 'Pneus',
  filters: 'Filtros',
  revision: 'Revisão',
  brakes: 'Freios',
  battery: 'Bateria',
  other: 'Manutenção',
};

const SOON_DAYS = 15;
const SOON_KM = 500;

export async function sendMaintenanceAlerts(env: WorkerEnv): Promise<void> {
  if (!env.VAPID_PUBLIC || !env.VAPID_PRIVATE) return;

  const [maintRes, fuelRes, subRes] = await env.DB.batch([
    env.DB.prepare(
      `SELECT id, vehicle_id, type, next_date, next_odometer, archived_at
       FROM maintenance_logs WHERE archived_at IS NULL AND (next_date IS NOT NULL OR next_odometer IS NOT NULL)`,
    ),
    env.DB.prepare(
      `SELECT vehicle_id, MAX(odometer) AS odometer FROM fuel_logs WHERE archived_at IS NULL GROUP BY vehicle_id`,
    ),
    env.DB.prepare('SELECT endpoint, p256dh, auth FROM push_subscriptions'),
  ]);

  const subscriptions = (subRes.results as SubRow[]);
  if (!subscriptions.length) return;

  const odometerByVehicle = new Map<string, number>(
    (fuelRes.results as FuelRow[]).map((r) => [r.vehicle_id, r.odometer]),
  );

  const today = new Date();
  today.setUTCHours(12, 0, 0, 0);

  const alerts: { type: string; daysUntil: number | null; kmUntil: number | null }[] = [];

  for (const m of maintRes.results as MaintenanceRow[]) {
    let daysUntil: number | null = null;
    let kmUntil: number | null = null;

    if (m.next_date) {
      const nd = new Date(m.next_date + 'T12:00:00Z');
      if (Number.isFinite(nd.getTime())) {
        daysUntil = Math.round((nd.getTime() - today.getTime()) / 86_400_000);
      }
    }

    const currentKm = odometerByVehicle.get(m.vehicle_id) ?? null;
    if (m.next_odometer != null && currentKm != null) {
      kmUntil = m.next_odometer - currentKm;
    }

    const isOverdue =
      (daysUntil != null && daysUntil < 0) || (kmUntil != null && kmUntil < 0);
    const isSoon =
      !isOverdue &&
      ((daysUntil != null && daysUntil <= SOON_DAYS) ||
        (kmUntil != null && kmUntil <= SOON_KM));

    if (isOverdue || isSoon) {
      alerts.push({ type: m.type, daysUntil, kmUntil });
    }
  }

  if (!alerts.length) return;

  // Build a combined label showing all alert types
  const labels = alerts.map((a) => TYPE_LABELS[a.type] ?? 'Manutenção');
  const uniqueLabels = [...new Set(labels)];
  const label = uniqueLabels.slice(0, 2).join(' + ');
  const extra = uniqueLabels.length > 2 ? ` (+${uniqueLabels.length - 2} outros)` : '';

  let hint = '';
  const { daysUntil, kmUntil } = alerts[0]!;
  if (daysUntil != null && daysUntil < 0) hint = `Venceu há ${Math.abs(daysUntil)} dias`;
  else if (daysUntil != null) hint = `Vence em ${daysUntil} dias`;
  else if (kmUntil != null && kmUntil < 0) hint = `Passou ${Math.abs(kmUntil).toLocaleString()} km`;
  else if (kmUntil != null) hint = `Faltam ${kmUntil.toLocaleString()} km`;

  const pushPayload = {
    title: `Tanque Cheio — ${label}${extra}`,
    body: hint || 'Atenção necessária',
    url: '/manutencao',
  };

  const subject = env.VAPID_SUBJECT ?? 'mailto:admin@tanquecheio.app';

  const deadEndpoints: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub: PushSubscription) => {
      try {
        await sendWebPush(sub, pushPayload, env.VAPID_PUBLIC!, env.VAPID_PRIVATE!, subject);
      } catch (err) {
        if (err instanceof PushSubscriptionError && (err.status === 404 || err.status === 410)) {
          deadEndpoints.push(sub.endpoint);
        }
      }
    }),
  );

  // Clean up dead subscriptions
  for (const endpoint of deadEndpoints) {
    await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?')
      .bind(endpoint)
      .run();
  }
}
