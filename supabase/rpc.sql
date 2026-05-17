-- RPC function for dashboard KPI averages
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION latest_telemetry_averages()
RETURNS TABLE(
  rpm NUMERIC,
  temperature_c NUMERIC,
  vibration_mms NUMERIC,
  current_a NUMERIC,
  voltage_v NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    AVG(t.rpm)::NUMERIC(8,1),
    AVG(t.temperature_c)::NUMERIC(5,1),
    AVG(t.vibration_mms)::NUMERIC(5,2),
    AVG(t.current_a)::NUMERIC(5,2),
    AVG(t.voltage_v)::NUMERIC(6,1)
  FROM telemetry_live t
  INNER JOIN (
    SELECT node_id, MAX(timestamp) AS max_ts
    FROM telemetry_live
    GROUP BY node_id
  ) latest ON t.node_id = latest.node_id AND t.timestamp = latest.max_ts;
$$;
