-- Tanque Cheio v1.5 — Hardening de auth (PROJETO §7).
-- Substitui sessões JWT em localStorage por device tokens HMAC.
-- Cada dispositivo recebe um secret independente, revogável.

CREATE TABLE IF NOT EXISTS devices (
  id            TEXT PRIMARY KEY,             -- UUID, vai no header Authorization
  label         TEXT NOT NULL,                -- apelido visível ("Daniel · Galaxy S23")
  user_tag      TEXT NOT NULL,                -- "Daniel" | "Cônjuge"
  device_secret TEXT NOT NULL,                -- 32 bytes hex, usado para verificar HMAC
  created_at    TEXT NOT NULL,
  last_seen_at  TEXT,                         -- atualizado a cada request autenticada
  revoked_at    TEXT                          -- soft-delete: requests bloqueadas após
);

CREATE INDEX IF NOT EXISTS idx_devices_user ON devices(user_tag);
