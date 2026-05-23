import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getDeviceStatus } from "@/lib/iot-hub";
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

    const checks: DiagnosticsCheckResult[] = [];
    const operatorId = user.user_metadata?.operator_id ?? user.email ?? "unknown";

    // 1. Database check (with latency)
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

    // 2. Device ping via Azure IoT Hub (with per-device latency)
    const { data: nodes } = await supabase
      .from("motor_nodes")
      .select("id, name, iot_device_id")
      .not("iot_device_id", "is", null);

    const devicePings: DiagnosticsCheckResult[] = [];

    if (nodes && nodes.length > 0) {
      for (const node of nodes) {
        const pingStart = Date.now();
        let result: DiagnosticsCheckResult;

        try {
          const deviceInfo = await getDeviceStatus(node.iot_device_id!);
          const latency = Date.now() - pingStart;

          if (!deviceInfo) {
            result = {
              check_type: `Device: ${node.name}`,
              result: "ERROR",
              performance: `Not found (${latency}ms)`,
              latency_ms: latency,
              node_id: node.id,
              node_name: node.name,
            };
          } else if (!deviceInfo.connected) {
            result = {
              check_type: `Device: ${node.name}`,
              result: "WARNING",
              performance: `Disconnected (${latency}ms)`,
              latency_ms: latency,
              node_id: node.id,
              node_name: node.name,
            };
          } else {
            result = {
              check_type: `Device: ${node.name}`,
              result: "SUCCESS",
              performance: `${latency}ms`,
              latency_ms: latency,
              node_id: node.id,
              node_name: node.name,
            };
          }
        } catch {
          const latency = Date.now() - pingStart;
          result = {
            check_type: `Device: ${node.name}`,
            result: "ERROR",
            performance: `Request failed (${latency}ms)`,
            latency_ms: latency,
            node_id: node.id,
            node_name: node.name,
          };
        }

        devicePings.push(result);
        checks.push(result);
      }
    }

    // Insert all checks into diagnostics_logs
    for (const check of checks) {
      await supabase.from("diagnostics_logs").insert({
        check_type: check.check_type,
        result: check.result,
        performance: check.performance,
        operator: operatorId,
        node_id: check.node_id ?? null,
      });
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
