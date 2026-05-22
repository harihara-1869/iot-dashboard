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

export interface SystemHealthService {
  name: string;
  service_id: string;
  status: "Online" | "Active" | "Warning" | "Offline";
  metric: string;
}

export interface EdgeNodePing {
  node_id: string;
  latency_ms: number;
  status: "good" | "warning" | "critical";
}

export interface AuthUser {
  id: string;
  email: string;
  operator_id?: string;
}
