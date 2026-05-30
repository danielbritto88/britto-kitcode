import { Hono } from 'hono';
import { requireHmac } from '../middleware/hmac';
import type { AppEnv } from '../index';

export const syncRoute = new Hono<AppEnv>();

syncRoute.use('*', requireHmac);

interface VehicleRow {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
  fuel_type: string;
  photo_key: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

interface FuelLogRow {
  id: string;
  vehicle_id: string;
  date: string;
  odometer: number;
  liters: number;
  total_cost: number;
  price_per_liter: number;
  full_tank: number; // 0 | 1 in SQLite
  gas_station: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

interface MaintenanceLogRow {
  id: string;
  vehicle_id: string;
  type: string;
  date: string;
  odometer: number | null;
  cost: number | null;
  shop: string | null;
  notes: string | null;
  next_date: string | null;
  next_odometer: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

syncRoute.get('/sync', async (c) => {
  const [vehiclesRes, fuelRes, maintRes] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT * FROM vehicles ORDER BY created_at ASC'),
    c.env.DB.prepare('SELECT f.* FROM fuel_logs f JOIN vehicles v ON f.vehicle_id = v.id ORDER BY f.date ASC, f.created_at ASC'),
    c.env.DB.prepare('SELECT m.* FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.id ORDER BY m.date ASC, m.created_at ASC'),
  ]);

  return c.json({
    vehicles: (vehiclesRes.results as VehicleRow[]) ?? [],
    fuel_logs: (fuelRes.results as FuelLogRow[]) ?? [],
    maintenance_logs: (maintRes.results as MaintenanceLogRow[]) ?? [],
    ts: new Date().toISOString(),
  });
});

syncRoute.post('/sync', async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'corpo inválido' }, 400);
  }

  // Validate that array fields are actually arrays — prevent string iteration corruption
  const parsed = body as Record<string, unknown>;
  const vehicles = Array.isArray(parsed.vehicles) ? parsed.vehicles as VehicleRow[] : [];
  const fuel_logs = Array.isArray(parsed.fuel_logs) ? parsed.fuel_logs as FuelLogRow[] : [];
  const maintenance_logs = Array.isArray(parsed.maintenance_logs) ? parsed.maintenance_logs as MaintenanceLogRow[] : [];
  const deletions = Array.isArray(parsed.deletions) ? parsed.deletions as { type: 'vehicle' | 'fuel_log' | 'maintenance_log'; id: string }[] : [];

  // Server-authoritative creator tag — never trust client-provided created_by
  const userTag = c.var.userTag;

  const stmts: ReturnType<D1Database['prepare']>[] = [];

  for (const v of vehicles) {
    if (typeof v !== 'object' || v === null || typeof v.id !== 'string' || typeof v.name !== 'string') continue;
    if (v.year != null && (!Number.isFinite(v.year) || v.year < 1900 || v.year > 2100)) continue;
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO vehicles
          (id, name, brand, model, year, plate, fuel_type, photo_key,
           created_by, created_at, updated_at, archived_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name        = CASE WHEN excluded.updated_at > updated_at THEN excluded.name        ELSE name        END,
          brand       = CASE WHEN excluded.updated_at > updated_at THEN excluded.brand       ELSE brand       END,
          model       = CASE WHEN excluded.updated_at > updated_at THEN excluded.model       ELSE model       END,
          year        = CASE WHEN excluded.updated_at > updated_at THEN excluded.year        ELSE year        END,
          plate       = CASE WHEN excluded.updated_at > updated_at THEN excluded.plate       ELSE plate       END,
          fuel_type   = CASE WHEN excluded.updated_at > updated_at THEN excluded.fuel_type   ELSE fuel_type   END,
          photo_key   = CASE WHEN excluded.updated_at > updated_at THEN excluded.photo_key   ELSE photo_key   END,
          archived_at = CASE WHEN excluded.updated_at > updated_at THEN excluded.archived_at ELSE archived_at END,
          updated_at  = CASE WHEN excluded.updated_at > updated_at THEN excluded.updated_at  ELSE updated_at  END
      `).bind(
        v.id, v.name, v.brand ?? '', v.model ?? '', v.year ?? null,
        v.plate ?? null, v.fuel_type || 'gasoline', v.photo_key ?? null,
        userTag, v.created_at, v.updated_at, v.archived_at ?? null,
      ),
    );
  }

  for (const f of fuel_logs) {
    if (typeof f !== 'object' || f === null || typeof f.id !== 'string' || typeof f.vehicle_id !== 'string') continue;
    if (!Number.isFinite(f.odometer) || f.odometer < 0) continue;
    if (!Number.isFinite(f.liters) || f.liters < 0) continue;
    if (!Number.isFinite(f.total_cost) || f.total_cost < 0) continue;
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO fuel_logs
          (id, vehicle_id, date, odometer, liters, total_cost, price_per_liter,
           full_tank, gas_station, notes, created_by, created_at, updated_at, archived_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          date            = CASE WHEN excluded.updated_at > updated_at THEN excluded.date            ELSE date            END,
          odometer        = CASE WHEN excluded.updated_at > updated_at THEN excluded.odometer        ELSE odometer        END,
          liters          = CASE WHEN excluded.updated_at > updated_at THEN excluded.liters          ELSE liters          END,
          total_cost      = CASE WHEN excluded.updated_at > updated_at THEN excluded.total_cost      ELSE total_cost      END,
          price_per_liter = CASE WHEN excluded.updated_at > updated_at THEN excluded.price_per_liter ELSE price_per_liter END,
          full_tank       = CASE WHEN excluded.updated_at > updated_at THEN excluded.full_tank       ELSE full_tank       END,
          gas_station     = CASE WHEN excluded.updated_at > updated_at THEN excluded.gas_station     ELSE gas_station     END,
          notes           = CASE WHEN excluded.updated_at > updated_at THEN excluded.notes           ELSE notes           END,
          archived_at     = CASE WHEN excluded.updated_at > updated_at THEN excluded.archived_at     ELSE archived_at     END,
          updated_at      = CASE WHEN excluded.updated_at > updated_at THEN excluded.updated_at      ELSE updated_at      END
      `).bind(
        f.id, f.vehicle_id, f.date, f.odometer, f.liters, f.total_cost,
        f.price_per_liter, Number(f.full_tank) ? 1 : 0,
        f.gas_station ?? null, f.notes ?? null,
        userTag, f.created_at, f.updated_at, f.archived_at ?? null,
      ),
    );
  }

  for (const m of maintenance_logs) {
    if (typeof m !== 'object' || m === null || typeof m.id !== 'string' || typeof m.vehicle_id !== 'string') continue;
    if (m.odometer != null && (!Number.isFinite(m.odometer) || m.odometer < 0)) continue;
    if (m.cost != null && (!Number.isFinite(m.cost) || m.cost < 0)) continue;
    if (m.next_odometer != null && (!Number.isFinite(m.next_odometer) || m.next_odometer < 0)) continue;
    stmts.push(
      c.env.DB.prepare(`
        INSERT INTO maintenance_logs
          (id, vehicle_id, type, date, odometer, cost, shop, notes,
           next_date, next_odometer, created_by, created_at, updated_at, archived_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          type          = CASE WHEN excluded.updated_at > updated_at THEN excluded.type          ELSE type          END,
          date          = CASE WHEN excluded.updated_at > updated_at THEN excluded.date          ELSE date          END,
          odometer      = CASE WHEN excluded.updated_at > updated_at THEN excluded.odometer      ELSE odometer      END,
          cost          = CASE WHEN excluded.updated_at > updated_at THEN excluded.cost          ELSE cost          END,
          shop          = CASE WHEN excluded.updated_at > updated_at THEN excluded.shop          ELSE shop          END,
          notes         = CASE WHEN excluded.updated_at > updated_at THEN excluded.notes         ELSE notes         END,
          next_date     = CASE WHEN excluded.updated_at > updated_at THEN excluded.next_date     ELSE next_date     END,
          next_odometer = CASE WHEN excluded.updated_at > updated_at THEN excluded.next_odometer ELSE next_odometer END,
          archived_at   = CASE WHEN excluded.updated_at > updated_at THEN excluded.archived_at   ELSE archived_at   END,
          updated_at    = CASE WHEN excluded.updated_at > updated_at THEN excluded.updated_at    ELSE updated_at    END
      `).bind(
        m.id, m.vehicle_id, m.type, m.date,
        m.odometer ?? null, m.cost ?? null, m.shop ?? null, m.notes ?? null,
        m.next_date ?? null, m.next_odometer ?? null,
        userTag, m.created_at, m.updated_at, m.archived_at ?? null,
      ),
    );
  }

  for (const del of deletions) {
    if (del.type === 'vehicle') {
      // Filhos antes do pai — FK constraint: fuel_logs/maintenance_logs REFERENCES vehicles(id)
      stmts.push(c.env.DB.prepare('DELETE FROM fuel_logs WHERE vehicle_id = ?').bind(del.id));
      stmts.push(c.env.DB.prepare('DELETE FROM maintenance_logs WHERE vehicle_id = ?').bind(del.id));
      stmts.push(c.env.DB.prepare('DELETE FROM vehicles WHERE id = ? AND created_by = ?').bind(del.id, userTag));
    } else if (del.type === 'fuel_log') {
      stmts.push(c.env.DB.prepare('DELETE FROM fuel_logs WHERE id = ?').bind(del.id));
    } else if (del.type === 'maintenance_log') {
      stmts.push(c.env.DB.prepare('DELETE FROM maintenance_logs WHERE id = ?').bind(del.id));
    } else {
      return c.json({ error: `tipo de deleção desconhecido: ${del.type}` }, 400);
    }
  }

  if (stmts.length > 0) {
    // D1 batch já executa tudo em uma única transação — BEGIN/COMMIT são desnecessários e inválidos no D1.
    await c.env.DB.batch(stmts);
  }

  const [vehiclesRes, fuelRes, maintRes] = await c.env.DB.batch([
    c.env.DB.prepare('SELECT * FROM vehicles ORDER BY created_at ASC'),
    c.env.DB.prepare('SELECT f.* FROM fuel_logs f JOIN vehicles v ON f.vehicle_id = v.id ORDER BY f.date ASC, f.created_at ASC'),
    c.env.DB.prepare('SELECT m.* FROM maintenance_logs m JOIN vehicles v ON m.vehicle_id = v.id ORDER BY m.date ASC, m.created_at ASC'),
  ]);

  return c.json({
    vehicles: (vehiclesRes.results as VehicleRow[]) ?? [],
    fuel_logs: (fuelRes.results as FuelLogRow[]) ?? [],
    maintenance_logs: (maintRes.results as MaintenanceLogRow[]) ?? [],
    ts: new Date().toISOString(),
  });
});
