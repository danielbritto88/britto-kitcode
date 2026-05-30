import type { FuelLog, FuelStats, ChartPoint } from '@/types/fuel';

const FUEL_LOGS_KEY = 'tc_fuel_logs';

export function loadFuelLogs(): FuelLog[] {
  try {
    return JSON.parse(localStorage.getItem(FUEL_LOGS_KEY) ?? '[]') as FuelLog[];
  } catch {
    return [];
  }
}

export function saveFuelLogs(logs: FuelLog[]): void {
  localStorage.setItem(FUEL_LOGS_KEY, JSON.stringify(logs));
}

export function mergeFuelLogs(server: FuelLog[], local: FuelLog[]): FuelLog[] {
  const map = new Map<string, FuelLog>();
  for (const f of server) map.set(f.id, f);
  for (const f of local) {
    const existing = map.get(f.id);
    if (!existing || f.updated_at > existing.updated_at) map.set(f.id, f);
  }
  return Array.from(map.values()).sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : a.created_at.localeCompare(b.created_at);
  });
}

// Returns km/L between two consecutive full-tank entries (sorted by odometer ascending)
function calcConsumptions(logs: FuelLog[]): { kml: number; date: string }[] {
  const active = logs.filter((l) => !l.archived_at).sort((a, b) => a.odometer - b.odometer);
  const results: { kml: number; date: string }[] = [];

  for (let i = 1; i < active.length; i++) {
    const curr = active[i]!;
    const prev = active[i - 1]!;
    if (!curr.full_tank) continue;
    const km = curr.odometer - prev.odometer;
    if (km > 0 && curr.liters > 0) {
      results.push({ kml: km / curr.liters, date: curr.date });
    }
  }
  return results;
}

export function calcStats(logs: FuelLog[]): FuelStats {
  const active = logs.filter((l) => !l.archived_at);
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthLogs = active.filter((l) => l.date.startsWith(monthPrefix));
  const monthCost = monthLogs.reduce((s, l) => s + l.total_cost, 0);
  const monthLiters = monthLogs.reduce((s, l) => s + l.liters, 0);

  const consumptions = calcConsumptions(active);
  const lastConsumption = consumptions.at(-1)?.kml ?? null;

  const monthConsumptions = consumptions.filter((c) => c.date.startsWith(monthPrefix));
  const monthAvgConsumption =
    monthConsumptions.length > 0
      ? monthConsumptions.reduce((s, c) => s + c.kml, 0) / monthConsumptions.length
      : null;

  return { lastConsumption, monthAvgConsumption, monthCost, monthLiters };
}

export function buildChartPoints(logs: FuelLog[]): ChartPoint[] {
  const active = logs.filter((l) => !l.archived_at).sort((a, b) => a.date.localeCompare(b.date));
  const consumptions = calcConsumptions(active);
  const kmlByDate = new Map(consumptions.map((c) => [c.date, c.kml]));

  return active.slice(-12).map((l) => ({
    date: l.date.slice(5), // MM-DD
    ppl: l.price_per_liter,
    kml: kmlByDate.get(l.date) ?? null,
  }));
}

// Validate that odometer > last recorded odometer for the vehicle
export function validateOdometer(logs: FuelLog[], newOdometer: number): string | null {
  const last = logs
    .filter((l) => !l.archived_at)
    .sort((a, b) => b.odometer - a.odometer)[0];
  if (last && newOdometer <= last.odometer) {
    return `Hodômetro deve ser maior que ${last.odometer.toLocaleString('pt-BR')} km`;
  }
  return null;
}
