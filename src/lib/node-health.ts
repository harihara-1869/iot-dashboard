import type { MotorNode } from "@/lib/types";

export type Severity = "good" | "warning" | "degraded" | "critical";

export interface NodeHealth {
  status: string;
  message: string;
  severity: Severity;
}

export interface FleetHealth {
  status: string;
  message: string;
  severity: Severity;
}

interface TelemetryFields {
  temperature?: number;
  vibration?: number;
  current?: number;
  rpm?: number;
  status?: string;
  status_message?: string;
}

export function getNodeHealth(node: MotorNode, telemetry?: TelemetryFields | null): NodeHealth {
  if (node.status === "Offline") {
    return { status: "Offline", message: `${node.name} is offline.`, severity: "degraded" };
  }

  const telStatus = telemetry?.status;
  const msg = telemetry?.status_message;
  const temp = telemetry?.temperature ?? 0;
  const vib = telemetry?.vibration ?? 0;
  const cur = telemetry?.current ?? 0;
  const rpm = telemetry?.rpm ?? 0;
  const maxRpm = node.max_rpm ?? 0;
  const ratedCurrent = parseFloat((node.rated_current ?? "").replace(/[^0-9.]/g, "")) || 0;

  if (telStatus === "critical") {
    return {
      status: "Critical",
      severity: "critical",
      message: `${node.name}${msg ? `: ${msg}` : "critical status reported"}.`,
    };
  }

  if (temp > 80 || vib > 4.0) {
    return {
      status: "Critical",
      severity: "critical",
      message: `${node.name}: Anomaly — temp ${temp}°C / vib ${vib}mm/s.`,
    };
  }

  if (telStatus === "warning" || node.status === "Maintenance") {
    return {
      status: "Maintenance Required",
      severity: "warning",
      message: `${node.name}${msg ? `: ${msg}` : "requires maintenance"}.`,
    };
  }

  if (temp > 50 || vib > 2.5 || cur > 15 ||
      (maxRpm > 0 && rpm > maxRpm * 1.1) ||
      (ratedCurrent > 0 && cur > ratedCurrent)) {
    const parts: string[] = [];
    if (temp > 50) parts.push(`temp ${temp}°C`);
    if (vib > 2.5) parts.push(`vib ${vib}mm/s`);
    if (cur > 15) parts.push(`cur ${cur}A`);
    if (maxRpm > 0 && rpm > maxRpm * 1.1) parts.push(`rpm ${rpm} > limit ${maxRpm * 1.1}`);
    if (ratedCurrent > 0 && cur > ratedCurrent) parts.push(`cur ${cur}A > rated ${ratedCurrent}A`);
    return {
      status: "Warning",
      severity: "degraded",
      message: `${node.name}: Elevated — ${parts.join(" / ")}.`,
    };
  }

  if (node.status === "Idle") {
    return { status: "Idle", message: `${node.name} is idle.`, severity: "good" };
  }

  return {
    status: "Active",
    severity: "good",
    message: `${node.name}: Normal operation.`,
  };
}
