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
  rated_current TEXT NOT NULL DEFAULT '---',
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
  temperature NUMERIC(5,1) NOT NULL,
  vibration NUMERIC(5,2) NOT NULL,
  current NUMERIC(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  status_message TEXT,
  partition_id TEXT,
  event_hub_offset TEXT,
  UNIQUE(partition_id, event_hub_offset)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_node_time ON telemetry_live(node_id, timestamp DESC);

-- Alter existing table (safe if table already exists from old schema)
ALTER TABLE IF EXISTS telemetry_live ADD COLUMN IF NOT EXISTS partition_id TEXT;
ALTER TABLE IF EXISTS telemetry_live ADD COLUMN IF NOT EXISTS event_hub_offset TEXT;
ALTER TABLE IF EXISTS telemetry_live DROP CONSTRAINT IF EXISTS uq_telemetry_partition_offset;
ALTER TABLE IF EXISTS telemetry_live ADD CONSTRAINT uq_telemetry_partition_offset UNIQUE(partition_id, event_hub_offset);

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

-- Profiles — extended user data linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  operator_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cron checkpoints for telemetry ingestion
CREATE TABLE IF NOT EXISTS telemetry_checkpoints (
  partition_id TEXT PRIMARY KEY,
  event_hub_offset TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies — require authentication for all access
ALTER TABLE motor_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_live ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostics_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_checkpoints ENABLE ROW LEVEL SECURITY;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow all on motor_nodes" ON motor_nodes;
DROP POLICY IF EXISTS "Allow all on telemetry_live" ON telemetry_live;
DROP POLICY IF EXISTS "Allow all on diagnostics_logs" ON diagnostics_logs;
DROP POLICY IF EXISTS "Allow all on terminal_logs" ON terminal_logs;
DROP POLICY IF EXISTS "Allow all on profiles" ON profiles;

-- Recreate authenticated-only policies (idempotent)
DROP POLICY IF EXISTS "Authenticated access on motor_nodes" ON motor_nodes;
DROP POLICY IF EXISTS "Authenticated access on telemetry_live" ON telemetry_live;
DROP POLICY IF EXISTS "Authenticated access on diagnostics_logs" ON diagnostics_logs;
DROP POLICY IF EXISTS "Authenticated access on terminal_logs" ON terminal_logs;
DROP POLICY IF EXISTS "Authenticated access on profiles" ON profiles;

CREATE POLICY "Authenticated access on motor_nodes" ON motor_nodes FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access on telemetry_live" ON telemetry_live FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access on diagnostics_logs" ON diagnostics_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated access on terminal_logs" ON terminal_logs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Profiles: user-scoped — each operator can only see/modify their own profile
DROP POLICY IF EXISTS "Authenticated access on profiles" ON profiles;
CREATE POLICY "Own profile only" ON profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "deny_authenticated" ON telemetry_checkpoints;
CREATE POLICY "deny_authenticated" ON telemetry_checkpoints
  FOR ALL TO authenticated USING (false);

-- Profiles trigger — auto-create profile on email-confirmed signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (id, operator_id, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'operator_id', 'KNS-' || substring(NEW.id::text, 1, 6)),
      NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles trigger — create profile when email is confirmed post-signup
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime for telemetry_live (skip if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE telemetry_live;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable Realtime for motor_nodes (skip if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE motor_nodes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
