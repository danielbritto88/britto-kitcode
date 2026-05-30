import type { MaintenanceLog, MaintenanceWithStatus, MaintenanceStatus } from '@/types/maintenance';
import type { FuelLog } from '@/types/fuel';

const MAINTENANCE_KEY = 'tc_maintenance_logs';

export function loadMaintenanceLogs(): MaintenanceLog[] {
  try {
    return JSON.parse(localStorage.getItem(MAINTENANCE_KEY) ?? '[]') as MaintenanceLog[];
  } catch {
    return [];
  }
}

export function saveMaintenanceLogs(logs: MaintenanceLog[]): void {
  localStorage.setItem(MAINTENANCE_KEY, JSON.stringify(logs));
}

export function mergeMaintenanceLogs(
  server: MaintenanceLog[],
  local: MaintenanceLog[],
): MaintenanceLog[] {
  const map = new Map<string, MaintenanceLog>();
  for (const l of server) map.set(l.id, l);
  for (const l of local) {
    const existing = map.get(l.id);
    if (!existing || l.updated_at > existing.updated_at) map.set(l.id, l);
  }
  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

// Estimate average km/day from fuel logs (needs ≥ 2 fill-ups)
function kmPerDay(fuelLogs: FuelLog[]): number | null {
  const active = fuelLogs.filter((l) => !l.archived_at).sort((a, b) => a.odometer - b.odometer);
  if (active.length < 2) return null;
  const first = active[0]!;
  const last = active[active.length - 1]!;
  const km = last.odometer - first.odometer;
  const days = Math.max(
    1,
    (new Date(last.date + 'T12:00:00').getTime() - new Date(first.date + 'T12:00:00').getTime()) /
      86_400_000,
  );
  return km / days;
}

function calcStatus(
  log: MaintenanceLog,
  today: Date,
  currentOdometer: number | null,
  kpd: number | null,
): Pick<MaintenanceWithStatus, 'status' | 'daysUntilNext' | 'kmUntilNext'> {
  const SOON_DAYS = 15;
  const SOON_KM = 500;

  let daysUntilNext: number | null = null;
  let kmUntilNext: number | null = null;

  if (log.next_date) {
    const nextDate = new Date(log.next_date + 'T12:00:00');
    daysUntilNext = Math.round((nextDate.getTime() - today.getTime()) / 86_400_000);
  }

  if (log.next_odometer != null && currentOdometer != null) {
    kmUntilNext = log.next_odometer - currentOdometer;
    // refine daysUntilNext using km/day if no explicit date
    if (daysUntilNext == null && kpd != null && kpd > 0) {
      daysUntilNext = Math.round(kmUntilNext / kpd);
    }
  }

  let status: MaintenanceStatus = 'ok';

  const isOverdue =
    (daysUntilNext != null && daysUntilNext < 0) ||
    (kmUntilNext != null && kmUntilNext < 0);

  const isSoon =
    !isOverdue &&
    ((daysUntilNext != null && daysUntilNext <= SOON_DAYS) ||
      (kmUntilNext != null && kmUntilNext <= SOON_KM));

  if (isOverdue) status = 'overdue';
  else if (isSoon) status = 'soon';

  return { status, daysUntilNext, kmUntilNext };
}

export function enrichLogs(
  logs: MaintenanceLog[],
  fuelLogs: FuelLog[],
): MaintenanceWithStatus[] {
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  const activeFuel = fuelLogs.filter((l) => !l.archived_at);
  const kpd = kmPerDay(activeFuel);
  const currentOdometer = activeFuel.length
    ? Math.max(...activeFuel.map((l) => l.odometer))
    : null;

  return logs
    .filter((l) => !l.archived_at)
    .map((l) => ({
      ...l,
      ...calcStatus(l, today, currentOdometer, kpd),
    }))
    .sort((a, b) => {
      // Sort: overdue first, then soon, then ok; within same status by next_date asc
      const order: Record<MaintenanceStatus, number> = { overdue: 0, soon: 1, ok: 2 };
      const diff = order[a.status] - order[b.status];
      if (diff !== 0) return diff;
      return (a.next_date ?? a.date).localeCompare(b.next_date ?? b.date);
    });
}
