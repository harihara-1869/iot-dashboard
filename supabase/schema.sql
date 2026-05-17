-- Kinetic Industrial Dashboard — Database Schema
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Motor Nodes Inventory
CREATE TABLE IF NOT EXISTS motor_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Stepper', 'Induction', 'Cooling', 'Servo', 'Conveyor', 'Hydraulic')),
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Idle', 'Maintenance', 'Offline')),
  voltage TEXT NOT NULL,
  torque TEXT NOT NULL,
  max_rpm INTEGER NOT NULL,
  ip_rating TEXT NOT NULL,
  image_url TEXT,
  iot_device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live Telemetry (Realtime enabled)
CREATE TABLE IF NOT EXISTS telemetry_live (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES motor_nodes(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  rpm NUMERIC(8,1) NOT NULL,
  temperature_c NUMERIC(5,1) NOT NULL,
  vibration_mms NUMERIC(5,2) NOT NULL,
  current_a NUMERIC(5,2) NOT NULL,
  voltage_v NUMERIC(6,1) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON telemetry_live(node_id, timestamp DESC);

-- Diagnostics Logs
CREATE TABLE IF NOT EXISTS diagnostics_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('SUCCESS', 'WARNING', 'ERROR')),
  performance TEXT NOT NULL,
  operator TEXT NOT NULL,
  node_id TEXT REFERENCES motor_nodes(id) ON DELETE SET NULL
);

-- Terminal Logs
CREATE TABLE IF NOT EXISTS terminal_logs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  node_id TEXT NOT NULL REFERENCES motor_nodes(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  command TEXT NOT NULL,
  output TEXT NOT NULL,
  operator_id TEXT NOT NULL
);

-- RLS Policies (allow all authenticated users)
ALTER TABLE motor_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all on motor_nodes" ON motor_nodes FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all on telemetry_live" ON telemetry_live FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all on diagnostics_logs" ON diagnostics_logs FOR ALL USING (true) WITH CHECK (true);
  CREATE POLICY "Allow all on terminal_logs" ON terminal_logs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable Realtime for telemetry_live (skip if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_live;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
