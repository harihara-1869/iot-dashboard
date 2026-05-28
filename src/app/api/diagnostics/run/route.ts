import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDeviceStatus } from "@/lib/iot-hub";
import { checkRateLimit } from "@/lib/rate-limit";
import type { DiagnosticsCheckResult, DiagnosticsRunResult } from "@/lib/types";

export async function POST() {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, checks: [], summary: "", error: "Authentication required." } satisfies DiagnosticsRunResult,
        { status: 401 },
      );
    }

    const rl = checkRateLimit("diagnostics-run", user.id, 1, 30 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, checks: [], summary: "", error: "Diagnostics already ran recently. Wait before repeating." } satisfies DiagnosticsRunResult,
        { status: 429 },
      );
    }

    const checks: DiagnosticsCheckResult[] = [];
    const operatorId = user.user_metadata?.operator_id ?? user.email ?? "unknown";

    const dbStart = Date.now();
    let dbResult: DiagnosticsCheckResult;
    try {
      const { error: dbError } = await supabase.from("motor_nodes").select("count", { count: "exact", head: true });
      const dbLatency = Date.now() - dbStart;
      dbResult = {
        check_type: "Database",
        result: dbError ? "ERROR" : "SUCCESS",
        performance: dbError ? dbError.message : `${dbLatency}ms`,
        latency_ms: dbLatency,
      };
    } catch (e) {
      dbResult = {
        check_type: "Database",
        result: "ERROR",
        performance: e instanceof Error ? e.message : "Query failed",
      };
    }
    checks.push(dbResult);

    const { data: nodes } = await supabase
      .from("motor_nodes")
      .select("id, name, iot_device_id")
      .not("iot_device_id", "is", null);

    if (nodes && nodes.length > 0) {
      const DEVICE_TIMEOUT = 25_000;

      const pingDevice = async (node: { id: string; name: string; iot_device_id: string }): Promise<DiagnosticsCheckResult> => {
        const pingStart = Date.now();
        try {
          const deviceInfo = await getDeviceStatus(node.iot_device_id);
          const latency = Date.now() - pingStart;

          if (!deviceInfo) {
            return { check_type: `Device: ${node.name}`, result: "ERROR", performance: `Not found (${latency}ms)`, latency_ms: latency, node_id: node.id, node_name: node.name };
          }
          if (!deviceInfo.connected) {
            return { check_type: `Device: ${node.name}`, result: "WARNING", performance: `Disconnected (${latency}ms)`, latency_ms: latency, node_id: node.id, node_name: node.name };
          }
          return { check_type: `Device: ${node.name}`, result: "SUCCESS", performance: `${latency}ms`, latency_ms: latency, node_id: node.id, node_name: node.name };
        } catch {
          const latency = Date.now() - pingStart;
          return { check_type: `Device: ${node.name}`, result: "ERROR", performance: `Request failed (${latency}ms)`, latency_ms: latency, node_id: node.id, node_name: node.name };
        }
      };

      const pings = nodes.map(pingDevice);

      await Promise.race([
        Promise.all(pings).then((results) => { checks.push(...results); }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Diagnostics timeout")), DEVICE_TIMEOUT)),
      ]).catch((err) => {
        console.error("Diagnostics device ping failed:", err instanceof Error ? err.message : String(err));
      });
    }

    const insertRows = checks.map((check) => ({
      check_type: check.check_type,
      result: check.result,
      performance: check.performance,
      operator: operatorId,
      node_id: check.node_id ?? null,
    }));
    if (insertRows.length > 0) {
      await supabase.from("diagnostics_logs").insert(insertRows);
    }

    const errorCount = checks.filter((c) => c.result === "ERROR").length;
    const warningCount = checks.filter((c) => c.result === "WARNING").length;

    let summary: string;
    if (errorCount > 0) {
      summary = `SYSTEM DEGRADED: ${errorCount} error${errorCount !== 1 ? "s" : ""}${warningCount > 0 ? `, ${warningCount} warning${warningCount !== 1 ? "s" : ""}` : ""}`;
    } else if (warningCount > 0) {
      summary = `SYSTEM WARNING: ${warningCount} warning${warningCount !== 1 ? "s" : ""}`;
    } else {
      summary = `All ${checks.length} checks passed`;
    }

    return NextResponse.json({
      success: true,
      checks,
      summary,
    } satisfies DiagnosticsRunResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, checks: [], summary: "", error: message } satisfies DiagnosticsRunResult,
      { status: 500 },
    );
  }
}
