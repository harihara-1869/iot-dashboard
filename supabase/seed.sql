-- Seed data for Kinetic Industrial Dashboard
-- Run after schema.sql

-- Motor Nodes
INSERT INTO motor_nodes (id, name, type, location, status, voltage, torque, max_rpm, ip_rating, image_url)
VALUES
  ('MOT-17-A', 'NEMA-17-Precision', 'Stepper', 'Room 4 Stepper', 'Active', '12.0 V DC', '0.45 Nm', 3000, 'IP54', 'https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0'),
  ('MOT-01-A', 'Main Induction Drive', 'Induction', 'Bay 01 Main', 'Active', '480.0 V AC', '150.2 Nm', 1750, 'IP67', NULL),
  ('MOT-FAN-B', 'Cooling Fan Motor', 'Cooling', 'HVAC Zone 02', 'Maintenance', '230.0 V AC', '12.5 Nm', 2400, 'IP44', NULL),
  ('MOT-CON-03', 'Conveyor Drive', 'Conveyor', 'Line 3 Feed', 'Idle', '110.0 V DC', '45.0 Nm', 1200, 'IP65', NULL),
  ('MOT-SRV-09', 'High-Torque Servo', 'Servo', 'Arm A-4 Axis 1', 'Active', '48.0 V DC', '8.2 Nm', 6000, 'IP68', NULL),
  ('MOT-PMP-12', 'Hydraulic Pump Drive', 'Hydraulic', 'Coolant Pump', 'Active', '208.0 V AC', '22.0 Nm', 3500, 'IP66', NULL),
  ('STP-MR-02', 'Stepper Motor', 'Stepper', 'Motor Room', 'Active', '12.0 V DC', '0.45 Nm', 3000, 'IP54', 'https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0'),
  ('STP-CP-03', 'Stepper Motor', 'Stepper', 'Control Panel', 'Idle', '12.0 V DC', '0.40 Nm', 2800, 'IP52', NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  location = EXCLUDED.location,
  status = EXCLUDED.status,
  voltage = EXCLUDED.voltage,
  torque = EXCLUDED.torque,
  max_rpm = EXCLUDED.max_rpm,
  ip_rating = EXCLUDED.ip_rating,
  image_url = EXCLUDED.image_url;

-- Diagnostics Logs
INSERT INTO diagnostics_logs (timestamp, check_type, result, performance, operator)
VALUES
  ('2025-05-17 14:30:12+00', 'Full System Diagnostics', 'SUCCESS', 'All services nominal', 'SYSTEM_AUTO'),
  ('2025-05-17 12:00:01+00', 'Edge Node Ping', 'WARNING', 'STP-CP-03 Latency > 100ms', 'SYSTEM_AUTO'),
  ('2025-05-17 08:00:00+00', 'Full System Diagnostics', 'SUCCESS', 'All services nominal', 'OP_042'),
  ('2025-05-16 20:00:45+00', 'DB Integrity Check', 'SUCCESS', '0 corrupted blocks', 'SYSTEM_AUTO'),
  ('2025-05-16 16:15:33+00', 'IOT Server Heartbeat', 'SUCCESS', 'Uptime reset confirmed', 'OP_088'),
  ('2025-05-16 10:00:00+00', 'Edge Node Ping', 'WARNING', 'MOT-FAN-B response timeout', 'SYSTEM_AUTO'),
  ('2025-05-15 22:30:00+00', 'Full System Diagnostics', 'SUCCESS', 'All services nominal', 'OP_042'),
  ('2025-05-15 14:00:00+00', 'Thermal Scan', 'SUCCESS', 'All nodes within thermal limits', 'SYSTEM_AUTO')
ON CONFLICT DO NOTHING;

-- Telemetry (last 24 hours of simulated data for each active node)
DO $$
DECLARE
  node_record RECORD;
  t TIMESTAMPTZ;
  base_rpm NUMERIC;
  base_temp NUMERIC;
  base_vib NUMERIC;
  base_cur NUMERIC;
BEGIN
  FOR node_record IN SELECT id, type FROM motor_nodes LOOP
    -- Base values per motor type
    CASE node_record.type
      WHEN 'Stepper' THEN base_rpm := 3000; base_temp := 42; base_vib := 1.2; base_cur := 1.5;
      WHEN 'Induction' THEN base_rpm := 1750; base_temp := 55; base_vib := 2.1; base_cur := 12.1;
      WHEN 'Cooling' THEN base_rpm := 2400; base_temp := 38; base_vib := 0.8; base_cur := 5.0;
      WHEN 'Servo' THEN base_rpm := 6000; base_temp := 48; base_vib := 1.5; base_cur := 3.2;
      WHEN 'Conveyor' THEN base_rpm := 1200; base_temp := 35; base_vib := 1.8; base_cur := 8.0;
      WHEN 'Hydraulic' THEN base_rpm := 3500; base_temp := 50; base_vib := 2.5; base_cur := 7.5;
      ELSE base_rpm := 2000; base_temp := 40; base_vib := 1.5; base_cur := 5.0;
    END CASE;

    -- Generate 24 hours of data at 5-minute intervals
    t := now() - INTERVAL '24 hours';
    WHILE t <= now() LOOP
      INSERT INTO telemetry_live (node_id, timestamp, rpm, temperature_c, vibration_mms, current_a, voltage_v)
      VALUES (
        node_record.id, t,
        base_rpm + (random() * 20 - 10),
        base_temp + (random() * 4 - 2),
        base_vib + (random() * 0.4 - 0.2),
        base_cur + (random() * 0.5 - 0.25),
        CASE node_record.type WHEN 'Induction' THEN 480 WHEN 'Cooling' THEN 230 WHEN 'Hydraulic' THEN 208 ELSE 12 END
      );
      t := t + INTERVAL '5 minutes';
    END LOOP;
  END LOOP;
END $$;
