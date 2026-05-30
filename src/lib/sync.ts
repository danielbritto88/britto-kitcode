import type { Vehicle } from '@/types/vehicle';
import { signedJsonFetch, type SigningContext } from './signedFetch';

const VEHICLES_KEY = 'tc_vehicles';
const LAST_SYNC_KEY = 'tc_last_sync';
const DELETIONS_KEY = 'tc_deletions';

export interface Deletion {
  type: 'vehicle' | 'fuel_log' | 'maintenance_log';
  id: string;
}

export function loadDeletions(): Deletion[] {
  try {
    return JSON.parse(localStorage.getItem(DELETIONS_KEY) ?? '[]') as Deletion[];
  } catch {
    return [];
  }
}

export function saveDeletions(deletions: Deletion[]): void {
  localStorage.setItem(DELETIONS_KEY, JSON.stringify(deletions));
}

export function addDeletion(type: Deletion['type'], id: string): void {
  const current = loadDeletions();
  if (!current.some((d) => d.type === type && d.id === id)) {
    current.push({ type, id });
    saveDeletions(current);
  }
}

export function clearDeletions(sentDeletions: Deletion[]): void {
  const current = loadDeletions();
  const remaining = current.filter(
    (c) => !sentDeletions.some((s) => s.type === c.type && s.id === c.id)
  );
  saveDeletions(remaining);
}

export function loadLastSyncTime(): string | null {
  return localStorage.getItem(LAST_SYNC_KEY);
}

export function loadVehicles(): Vehicle[] {
  try {
    return JSON.parse(localStorage.getItem(VEHICLES_KEY) ?? '[]') as Vehicle[];
  } catch {
    return [];
  }
}

export function saveVehicles(vehicles: Vehicle[]): void {
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(vehicles));
}

export function mergeVehicles(server: Vehicle[], local: Vehicle[]): Vehicle[] {
  const map = new Map<string, Vehicle>();

  for (const v of server) map.set(v.id, v);

  for (const v of local) {
    const existing = map.get(v.id);
    if (!existing || v.updated_at > existing.updated_at) {
      map.set(v.id, v);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
}

export async function syncVehicles(
  signing: SigningContext,
  local: Vehicle[],
  deletions: Deletion[] = [],
): Promise<Vehicle[]> {
  const data = await signedJsonFetch<{ vehicles: Vehicle[]; ts: string }>(
    signing,
    '/api/sync',
    {
      method: 'POST',
      body: JSON.stringify({ vehicles: local, deletions }),
    },
  );
  localStorage.setItem(LAST_SYNC_KEY, data.ts);
  return data.vehicles;
}
