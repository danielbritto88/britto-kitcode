-- Add device_id to push_subscriptions for ownership scoping (2026-05-20)
ALTER TABLE push_subscriptions ADD COLUMN device_id TEXT REFERENCES devices(id);

-- Index for device-scoped queries
CREATE INDEX IF NOT EXISTS idx_push_device ON push_subscriptions(device_id);
