import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StatusChip from "@/components/ui/status-chip";
import KpiCard from "@/components/ui/kpi-card";
import DeviceCard from "@/components/nodes/device-card";
import DiagnosticsGrid from "@/components/health/diagnostics-grid";
import TerminalWindow from "@/components/terminal/terminal-window";
import type { DiagnosticsLog, MotorNode } from "@/lib/types";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/components/nodes/calibrate-dialog", () => ({
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div role="dialog"><button onClick={onClose}>Close calibration</button></div> : null,
}));

function node(overrides: Partial<MotorNode> = {}): MotorNode {
  return {
    id: "MOT-17-A",
    name: "Conveyor Drive",
    type: "Stepper",
    location: "Bay 3",
    status: "Active",
    voltage: "24V",
    torque: "1.8Nm",
    max_rpm: 3200,
    ip_rating: "IP54",
    iot_device_id: "dev-1",
    created_at: "2026-05-28T00:00:00Z",
    ...overrides,
  };
}

describe("key components", () => {
  it("renders status chips with conditional labels and styles", () => {
    const { rerender } = render(<StatusChip status="Active" />);
    expect(screen.getByText("Active")).toHaveClass("bg-secondary/10");

    rerender(<StatusChip status="Maintenance" />);
    expect(screen.getByText("Maintenance Required")).toHaveClass("text-error");

    rerender(<StatusChip status="Offline" />);
    expect(screen.getByText("Offline")).toHaveClass("bg-surface-dim");
  });

  it("renders KPI value, unit, and icon", () => {
    render(<KpiCard label="Temperature" value="42" unit="C" icon={<span data-testid="icon">thermostat</span>} />);

    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toHaveTextContent("thermostat");
  });

  it("renders a device card and navigates to telemetry", async () => {
    const user = userEvent.setup();
    render(<DeviceCard node={node()} />);

    expect(screen.getByRole("img", { name: "Conveyor Drive" })).toHaveAttribute("src", "/images/nema-17-motor.jpg");
    expect(screen.getByText("Bay 3")).toBeInTheDocument();
    expect(screen.getByText("3200")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Telemetry" }));
    expect(push).toHaveBeenCalledWith("/motor/MOT-17-A");
  });

  it("shows maintenance actions and calibration dialog state", async () => {
    const user = userEvent.setup();
    render(<DeviceCard node={node({ status: "Maintenance" })} />);

    expect(screen.getByRole("button", { name: "Order Parts" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Diagnose" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Order Parts" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("summarizes diagnostics and highlights slow edge pings", () => {
    const logs: DiagnosticsLog[] = [
      { id: "1", timestamp: "2026-05-28T00:00:00Z", check_type: "Database", result: "SUCCESS", performance: "42ms", operator: "OP-1", node_id: null },
      { id: "2", timestamp: "2026-05-28T00:00:00Z", check_type: "Device: Fast", result: "SUCCESS", performance: "100ms", operator: "OP-1", node_id: "MOT-1" },
      { id: "3", timestamp: "2026-05-28T00:00:00Z", check_type: "Device: Slow", result: "WARNING", performance: "800ms", operator: "OP-1", node_id: "MOT-2" },
    ];

    render(<DiagnosticsGrid logs={logs} />);

    expect(screen.getByText("Supabase")).toBeInTheDocument();
    expect(screen.getByText("42ms")).toBeInTheDocument();
    expect(screen.getByText("Avg 450ms")).toBeInTheDocument();
    expect(screen.getByText("2 devices pinged")).toBeInTheDocument();
    expect(screen.getByText(/Slow/)).toHaveTextContent("Slow — 800ms");
  });

  it("prompts for diagnostics when no logs exist", () => {
    render(<DiagnosticsGrid logs={[]} />);

    expect(screen.getByText("Run system diagnostics to check infrastructure health.")).toBeInTheDocument();
  });

  it("accepts terminal commands and appends command-specific output", async () => {
    const user = userEvent.setup();
    render(<TerminalWindow />);

    const input = screen.getByPlaceholderText("type command here...");
    await user.type(input, "ping");
    await user.keyboard("{Enter}");

    expect(screen.getByText("ping")).toBeInTheDocument();
    expect(screen.getByText("[PING] 64 bytes from MOT-01-A: time=8ms")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });
});
