-- Operators table — stores Argon2id password hashes for dashboard login
-- Run after schema.sql in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS operators (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  operator_id TEXT UNIQUE NOT NULL,
  argon2_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow all on operators" ON operators FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
