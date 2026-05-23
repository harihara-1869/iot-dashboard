export type MotorStatus = "Active" | "Idle" | "Maintenance" | "Offline";

export type MotorType = "Stepper" | "Induction" | "Cooling" | "Servo" | "Conveyor" | "Hydraulic";

export interface MotorNode {
  id: string;
  name: string;
  type: MotorType;
  location: string;
  status: MotorStatus;
  voltage: string;
  torque: string;
  max_rpm: number;
  ip_rating: string;
  iot_device_id: string | null;
  created_at: string;
}

export interface TelemetryPoint {
  id: string;
  node_id: string;
  timestamp: string;
  rpm: number;
  temperature_c: number;
  vibration_mms: number;
  current_a: number;
  voltage_v: number;
}

export interface TelemetrySnapshot {
  rpm: number;
  temperature: number;
  vibration: number;
  current: number;
}

export interface DiagnosticsLog {
  id: string;
  timestamp: string;
  check_type: string;
  result: "SUCCESS" | "WARNING" | "ERROR";
  performance: string;
  operator: string;
  node_id: string | null;
}

export interface TerminalLog {
  id: string;
  node_id: string;
  timestamp: string;
  command: string;
  output: string;
  operator_id: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  operator_id?: string;
}

export interface DiagnosticsCheckResult {
  check_type: string;
  result: "SUCCESS" | "WARNING" | "ERROR";
  performance: string;
  latency_ms?: number;
  node_id?: string;
  node_name?: string;
}

export interface DiagnosticsRunResult {
  success: boolean;
  checks: DiagnosticsCheckResult[];
  summary: string;
  error?: string;
}
