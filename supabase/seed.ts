// @ts-nocheck
/**
 * Seed script for Kinetic Industrial Dashboard
 * Run with: npx tsx supabase/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const motorNodes = [
  { id: "MOT-17-A", name: "NEMA-17-Precision", type: "Stepper", location: "Room 4 Stepper", status: "Active", voltage: "12.0 V DC", torque: "0.45 Nm", max_rpm: 3000, ip_rating: "IP54", image_url: "https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0" },
  { id: "MOT-01-A", name: "Main Induction Drive", type: "Induction", location: "Bay 01 Main", status: "Active", voltage: "480.0 V AC", torque: "150.2 Nm", max_rpm: 1750, ip_rating: "IP67", image_url: null },
  { id: "MOT-FAN-B", name: "Cooling Fan Motor", type: "Cooling", location: "HVAC Zone 02", status: "Maintenance", voltage: "230.0 V AC", torque: "12.5 Nm", max_rpm: 2400, ip_rating: "IP44", image_url: null },
  { id: "MOT-CON-03", name: "Conveyor Drive", type: "Conveyor", location: "Line 3 Feed", status: "Idle", voltage: "110.0 V DC", torque: "45.0 Nm", max_rpm: 1200, ip_rating: "IP65", image_url: null },
  { id: "MOT-SRV-09", name: "High-Torque Servo", type: "Servo", location: "Arm A-4 Axis 1", status: "Active", voltage: "48.0 V DC", torque: "8.2 Nm", max_rpm: 6000, ip_rating: "IP68", image_url: null },
  { id: "MOT-PMP-12", name: "Hydraulic Pump Drive", type: "Hydraulic", location: "Coolant Pump", status: "Active", voltage: "208.0 V AC", torque: "22.0 Nm", max_rpm: 3500, ip_rating: "IP66", image_url: null },
  { id: "STP-MR-02", name: "Stepper Motor", type: "Stepper", location: "Motor Room", status: "Active", voltage: "12.0 V DC", torque: "0.45 Nm", max_rpm: 3000, ip_rating: "IP54", image_url: "https://lh3.googleusercontent.com/aida/ADBb0uhxb3d990zYoyeJwV7Pl4pk9_jTypUUJMVBjFIKYjiPsAl6Rgw9u7vc8qfm6tW2h62O745WBuhmgXmwiADzrp0DV5KZ9HMjUNQGg2V8rssH8FtEB-SZfpgGwFICyG5xjneEN3jr0RQnwKUiKkDx14td4TbgD7VT_2WNWC6159l1rRdegWEHTIO2B72TcEpU7AMGMCuf8JVbOPF5m-I_vOZ4AN7Ag26XASzyCZiAHgdZ4KueDeA6hmbiNj0" },
  { id: "STP-CP-03", name: "Stepper Motor", type: "Stepper", location: "Control Panel", status: "Idle", voltage: "12.0 V DC", torque: "0.40 Nm", max_rpm: 2800, ip_rating: "IP52", image_url: null },
];

const diagnosticsLogs = [
  { timestamp: "2025-05-17T14:30:12Z", check_type: "Full System Diagnostics", result: "SUCCESS", performance: "All services nominal", operator: "SYSTEM_AUTO" },
  { timestamp: "2025-05-17T12:00:01Z", check_type: "Edge Node Ping", result: "WARNING", performance: "STP-CP-03 Latency > 100ms", operator: "SYSTEM_AUTO" },
  { timestamp: "2025-05-17T08:00:00Z", check_type: "Full System Diagnostics", result: "SUCCESS", performance: "All services nominal", operator: "OP_042" },
  { timestamp: "2025-05-16T20:00:45Z", check_type: "DB Integrity Check", result: "SUCCESS", performance: "0 corrupted blocks", operator: "SYSTEM_AUTO" },
  { timestamp: "2025-05-16T16:15:33Z", check_type: "IOT Server Heartbeat", result: "SUCCESS", performance: "Uptime reset confirmed", operator: "OP_088" },
  { timestamp: "2025-05-16T10:00:00Z", check_type: "Edge Node Ping", result: "WARNING", performance: "MOT-FAN-B response timeout", operator: "SYSTEM_AUTO" },
  { timestamp: "2025-05-15T22:30:00Z", check_type: "Full System Diagnostics", result: "SUCCESS", performance: "All services nominal", operator: "OP_042" },
  { timestamp: "2025-05-15T14:00:00Z", check_type: "Thermal Scan", result: "SUCCESS", performance: "All nodes within thermal limits", operator: "SYSTEM_AUTO" },
];

const baseValues: Record<string, { rpm: number; temp: number; vib: number; cur: number; volt: number }> = {
  Stepper: { rpm: 3000, temp: 42, vib: 1.2, cur: 1.5, volt: 12 },
  Induction: { rpm: 1750, temp: 55, vib: 2.1, cur: 12.1, volt: 480 },
  Cooling: { rpm: 2400, temp: 38, vib: 0.8, cur: 5.0, volt: 230 },
  Servo: { rpm: 6000, temp: 48, vib: 1.5, cur: 3.2, volt: 48 },
  Conveyor: { rpm: 1200, temp: 35, vib: 1.8, cur: 8.0, volt: 110 },
  Hydraulic: { rpm: 3500, temp: 50, vib: 2.5, cur: 7.5, volt: 208 },
};

function jitter(val: number, range: number) {
  return +(val + (Math.random() * range * 2 - range)).toFixed(1);
}

async function seed() {
  console.log("Seeding motor_nodes...");
  for (const node of motorNodes) {
    const { error } = await supabase.from("motor_nodes").upsert(node, { onConflict: "id" });
    if (error) console.error(`  Failed to upsert ${node.id}:`, error.message);
    else console.log(`  Upserted ${node.id}`);
  }

  console.log("Seeding diagnostics_logs...");
  for (const log of diagnosticsLogs) {
    const { error } = await supabase.from("diagnostics_logs").insert(log);
    if (error) console.error(`  Failed to insert log:`, error.message);
    else console.log(`  Inserted ${log.check_type}`);
  }

  console.log("Generating 24h telemetry at 5-min intervals...");
  const now = new Date();
  const rows: Array<Record<string, unknown>> = [];

  for (const node of motorNodes) {
    const base = baseValues[node.type] ?? baseValues.Stepper;
    for (let t = new Date(now.getTime() - 24 * 60 * 60 * 1000); t <= now; t = new Date(t.getTime() + 5 * 60 * 1000)) {
      rows.push({
        node_id: node.id,
        timestamp: t.toISOString(),
        rpm: jitter(base.rpm, 10),
        temperature_c: jitter(base.temp, 2),
        vibration_mms: jitter(base.vib, 0.2),
        current_a: jitter(base.cur, 0.25),
        voltage_v: jitter(base.volt, 1),
      });
    }
  }

  // Insert in batches of 500
  for (let i = 0; i < rows.length; i += 500) {
    const batch = rows.slice(i, i + 500);
    const { error } = await supabase.from("telemetry_live").insert(batch);
    if (error) console.error(`  Batch ${i / 500} failed:`, error.message);
    else console.log(`  Batch ${i / 500 + 1}/${Math.ceil(rows.length / 500)} inserted (${batch.length} rows)`);
  }

  console.log(`Done. Seeded ${motorNodes.length} nodes, ${diagnosticsLogs.length} logs, ~${rows.length} telemetry rows.`);
}

seed().catch(console.error);
