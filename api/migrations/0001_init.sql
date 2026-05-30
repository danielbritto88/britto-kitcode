-- Tanque Cheio — Schema v1
-- Entidades baseadas em UUID para merge sem conflito (PROJETO.md §6)

CREATE TABLE IF NOT EXISTS vehicles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  brand       TEXT NOT NULL,
  model       TEXT NOT NULL,
  year        INTEGER,
  plate       TEXT,
  fuel_type   TEXT NOT NULL DEFAULT 'gasoline',
  photo_key   TEXT,
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  archived_at TEXT
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id              TEXT PRIMARY KEY,
  vehicle_id      TEXT NOT NULL,
  date            TEXT NOT NULL,
  odometer        INTEGER NOT NULL,
  liters          REAL NOT NULL,
  total_cost      REAL NOT NULL,
  price_per_liter REAL NOT NULL,
  full_tank       INTEGER NOT NULL DEFAULT 1,
  gas_station     TEXT,
  notes           TEXT,
  created_by      TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL,
  archived_at     TEXT
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id            TEXT PRIMARY KEY,
  vehicle_id    TEXT NOT NULL,
  type          TEXT NOT NULL,
  date          TEXT NOT NULL,
  odometer      INTEGER,
  cost          REAL,
  shop          TEXT,
  notes         TEXT,
  next_date     TEXT,
  next_odometer INTEGER,
  created_by    TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL,
  archived_at   TEXT
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id         TEXT PRIMARY KEY,
  user_tag   TEXT NOT NULL,
  device_id  TEXT,
  endpoint   TEXT NOT NULL UNIQUE,
  p256dh     TEXT NOT NULL,
  auth       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle  ON fuel_logs(vehicle_id, date);
CREATE INDEX IF NOT EXISTS idx_maint_vehicle ON maintenance_logs(vehicle_id, date);
CREATE INDEX IF NOT EXISTS idx_push_device   ON push_subscriptions(device_id);
