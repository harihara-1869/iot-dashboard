import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createQueryBuilder } from "./helpers/supabase";

const mocks = vi.hoisted(() => ({
  client: undefined as unknown,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => mocks.client),
}));

describe("Supabase hooks", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("useAuth exposes loading state then maps the current session user", async () => {
    const unsubscribe = vi.fn();
    mocks.client = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              user: {
                id: "user-1",
                email: "operator@example.com",
                user_metadata: { operator_id: "OP-1" },
                email_confirmed_at: "2026-05-28T00:00:00Z",
              },
            },
          },
        }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
      },
    };
    const { useAuth } = await import("@/lib/hooks/useAuth");

    const { result, unmount } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toMatchObject({
      id: "user-1",
      email: "operator@example.com",
      operator_id: "OP-1",
      isVerified: true,
    });
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("useAuth resetPassword calls resetPasswordForEmail and returns errors", async () => {
    const unsubscribe = vi.fn();
    mocks.client = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
        resetPasswordForEmail: vi
          .fn()
          .mockResolvedValueOnce({ error: null })
          .mockResolvedValueOnce({ error: { message: "Rate limit exceeded" } }),
      },
    };
    const { useAuth } = await import("@/lib/hooks/useAuth");
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.resetPassword("operator@example.com")).resolves.toEqual({ error: null });
    });
    expect(mocks.client.auth.resetPasswordForEmail).toHaveBeenCalledWith("operator@example.com", {
      redirectTo: expect.stringContaining("/auth/confirm?next=/update-password"),
    });

    await act(async () => {
      await expect(result.current.resetPassword("bad@example.com")).resolves.toEqual({ error: "Rate limit exceeded" });
    });
  });

  it("useAuth handles signIn success, signIn errors, and signOut", async () => {
    mocks.client = {
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
        onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
        signInWithPassword: vi
          .fn()
          .mockResolvedValueOnce({
            data: {
              user: {
                id: "user-2",
                email: "verified@example.com",
                user_metadata: {},
                email_confirmed_at: "2026-05-28T00:00:00Z",
              },
            },
            error: null,
          })
          .mockResolvedValueOnce({ data: { user: null }, error: { message: "Invalid credentials" } }),
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    const { useAuth } = await import("@/lib/hooks/useAuth");
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await expect(result.current.signIn("verified@example.com", "password123")).resolves.toEqual({ error: null });
    });
    expect(result.current.user).toMatchObject({ id: "user-2", isVerified: true });

    await act(async () => {
      await expect(result.current.signIn("bad@example.com", "wrong")).resolves.toEqual({ error: "Invalid credentials" });
    });
    expect(result.current.user).toMatchObject({ id: "user-2" });

    await act(async () => {
      await result.current.signOut();
    });
    expect(result.current.user).toBeNull();
  });

  it("useDashboardKpis combines active node count with telemetry averages", async () => {
    const motorNodes = createQueryBuilder({ select: { data: [{ status: "Active" }, { status: "Idle" }, { status: "Active" }], error: null } });
    mocks.client = {
      from: vi.fn((table: string) => {
        expect(table).toBe("motor_nodes");
        return motorNodes;
      }),
      rpc: vi.fn().mockResolvedValue({
        data: [{ vibration: 1.24, temperature: 42.3, current: 12.15 }],
        error: null,
      }),
    };
    const { useDashboardKpis } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useDashboardKpis());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.kpis).toEqual({
      activeDevices: 2,
      vibration: "1.2",
      temperature: "42",
      current: "12.2",
    });
  });

  it("useMotorNodes fetches nodes and subscribes to realtime updates", async () => {
    const channel = { name: "motor_nodes_changes" };
    const motorNodes = createQueryBuilder({
      select: { data: [{ id: "MOT-1", name: "Conveyor", status: "Active" }], error: null },
    });
    mocks.client = {
      from: vi.fn(() => motorNodes),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn(() => channel),
        })),
      })),
      removeChannel: vi.fn(),
    };
    const { useMotorNodes } = await import("@/lib/hooks/useSupabase");

    const { result, unmount } = renderHook(() => useMotorNodes());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nodes).toEqual([{ id: "MOT-1", name: "Conveyor", status: "Active" }]);
    unmount();
    expect((mocks.client as { removeChannel: ReturnType<typeof vi.fn> }).removeChannel).toHaveBeenCalledWith(channel);
  });

  it("useTerminalLogs maps command/output rows into terminal entries", async () => {
    const terminalLogs = createQueryBuilder({
      select: {
        data: [
          { command: "status", output: "ok" },
          { command: "ping", output: "pong" },
        ],
        error: null,
      },
    });
    mocks.client = {
      from: vi.fn(() => terminalLogs),
    };
    const { useTerminalLogs } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useTerminalLogs("MOT-1"));

    await waitFor(() => expect(result.current.logs).toHaveLength(4));
    expect(result.current.logs).toEqual([
      { type: "dim", text: "pong" },
      { type: "cmd", prompt: "root@MOT-1:~#", cmd: "ping" },
      { type: "dim", text: "ok" },
      { type: "cmd", prompt: "root@MOT-1:~#", cmd: "status" },
    ]);
  });
});

describe("useReauth", () => {
  let reauthModule: typeof import("@/lib/hooks/useReauth");

  beforeEach(async () => {
    vi.resetModules();
  });

  it("isReauthed returns false initially and after clearReauth", async () => {
    mocks.client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    reauthModule = await import("@/lib/hooks/useReauth");
    expect(reauthModule.isReauthed()).toBe(false);
  });

  it("reauth success sets isReauthed true", async () => {
    mocks.client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    reauthModule = await import("@/lib/hooks/useReauth");
    const { error } = await reauthModule.reauth("op@example.com", "password");
    expect(error).toBeNull();
    expect(reauthModule.isReauthed()).toBe(true);
  });

  it("reauth failure returns error and does not set authed", async () => {
    mocks.client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn().mockResolvedValue({ error: { message: "Invalid login" } }),
      },
    };
    reauthModule = await import("@/lib/hooks/useReauth");
    const { error } = await reauthModule.reauth("op@example.com", "wrong");
    expect(error).toBe("Invalid login");
    expect(reauthModule.isReauthed()).toBe(false);
  });

  it("clearReauth resets isReauthed", async () => {
    mocks.client = {
      auth: {
        getSession: vi.fn(),
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
      },
    };
    reauthModule = await import("@/lib/hooks/useReauth");
    await reauthModule.reauth("op@example.com", "password");
    expect(reauthModule.isReauthed()).toBe(true);
    reauthModule.clearReauth();
    expect(reauthModule.isReauthed()).toBe(false);
  });
});

describe("additional Supabase hooks", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("useFleetHealth evaluates node health across all nodes and reports worst severity", async () => {
    const motorNodes = createQueryBuilder({
      select: {
        data: [
          { id: "MOT-1", name: "Good", type: "Stepper", status: "Active", max_rpm: 3000, rated_current: "10 A" },
          { id: "MOT-2", name: "Bad", type: "Stepper", status: "Active", max_rpm: 3000, rated_current: "10 A" },
        ],
        error: null,
      },
    });
    const telemetryLive = createQueryBuilder({
      select: {
        data: [
          { node_id: "MOT-2", temperature: 90, vibration: 1.0, current: 5, rpm: 2000, status: "ok", status_message: null, timestamp: "2026-05-28T01:00:00Z" },
          { node_id: "MOT-1", temperature: 42, vibration: 1.0, current: 5, rpm: 2000, status: "ok", status_message: null, timestamp: "2026-05-28T01:00:00Z" },
        ],
        error: null,
      },
    });
    mocks.client = {
      from: vi.fn((table: string) => {
        if (table === "motor_nodes") return motorNodes;
        if (table === "telemetry_live") return telemetryLive;
        return createQueryBuilder();
      }),
    };
    const { useFleetHealth } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useFleetHealth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.health).toMatchObject({
      severity: "critical",
      status: "Critical",
    });
    expect(result.current.health!.message).toMatch(/Bad.*Anomaly/);
  });

  it("useFleetHealth returns all-good when no issues exist", async () => {
    const motorNodes = createQueryBuilder({
      select: {
        data: [
          { id: "MOT-1", name: "A", type: "Stepper", status: "Active", max_rpm: 3000, rated_current: "10 A" },
          { id: "MOT-2", name: "B", type: "Stepper", status: "Active", max_rpm: 3000, rated_current: "10 A" },
        ],
        error: null,
      },
    });
    const telemetryLive = createQueryBuilder({
      select: {
        data: [
          { node_id: "MOT-1", temperature: 42, vibration: 1.0, current: 5, rpm: 2000, status: "ok", status_message: null, timestamp: "2026-05-28T01:00:00Z" },
          { node_id: "MOT-2", temperature: 42, vibration: 1.0, current: 5, rpm: 2000, status: "ok", status_message: null, timestamp: "2026-05-28T01:00:00Z" },
        ],
        error: null,
      },
    });
    mocks.client = {
      from: vi.fn((table: string) => {
        if (table === "motor_nodes") return motorNodes;
        if (table === "telemetry_live") return telemetryLive;
        return createQueryBuilder();
      }),
    };
    const { useFleetHealth } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useFleetHealth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.health).toMatchObject({
      severity: "good",
      status: "Good",
    });
  });

  it("useFleetHealth handles empty node set", async () => {
    const motorNodes = createQueryBuilder({ select: { data: [], error: null } });
    mocks.client = { from: vi.fn(() => motorNodes) };
    const { useFleetHealth } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useFleetHealth());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.health).toMatchObject({ status: "Initializing", severity: "good" });
  });

  it("useMotorNode fetches a single node by id", async () => {
    const motorNodes = createQueryBuilder({
      single: { data: { id: "MOT-1", name: "Conveyor", status: "Active" }, error: null },
    });
    mocks.client = { from: vi.fn(() => motorNodes) };
    const { useMotorNode } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useMotorNode("MOT-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.node).toMatchObject({ id: "MOT-1", name: "Conveyor", status: "Active" });
  });

  it("useMotorNode does nothing with undefined id", async () => {
    const { useMotorNode } = await import("@/lib/hooks/useSupabase");
    const { result } = renderHook(() => useMotorNode(undefined));
    expect(result.current.loading).toBe(true);
    expect(result.current.node).toBeNull();
  });

  it("useDiagnosticsLogs fetches paginated logs with total count", async () => {
    const diagnosticsLogs = createQueryBuilder({
      select: {
        data: [
          { id: "1", check_type: "Database", result: "SUCCESS", performance: "10ms", operator: "OP-1", node_id: null, timestamp: "2026-05-28T00:00:00Z" },
        ],
        error: null,
        count: 15,
      },
    });
    mocks.client = { from: vi.fn(() => diagnosticsLogs) };
    const { useDiagnosticsLogs } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useDiagnosticsLogs(2, 10));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.logs).toHaveLength(1);
    expect(result.current.totalCount).toBe(15);
    expect(result.current.totalPages).toBe(2);
  });

  it("useLatestTelemetry fetches latest snapshot for a node", async () => {
    const telemetryLive = createQueryBuilder({
      single: { data: { rpm: 3000, temperature: 42, vibration: 1.2, current: 2.5, status: "ok", status_message: "Normal" }, error: null },
    });
    mocks.client = { from: vi.fn(() => telemetryLive) };
    const { useLatestTelemetry } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useLatestTelemetry("MOT-1"));
    await waitFor(() => expect(result.current.latest).not.toBeNull());
    expect(result.current.latest).toMatchObject({ rpm: 3000, temperature: 42, status: "ok" });
  });

  it("useLatestTelemetry returns null for undefined nodeId", async () => {
    const { useLatestTelemetry } = await import("@/lib/hooks/useSupabase");
    const { result } = renderHook(() => useLatestTelemetry(undefined));
    expect(result.current.latest).toBeNull();
  });

  it("useTelemetryHistory fetches and reverses chronological rows", async () => {
    const telemetryLive = createQueryBuilder({
      select: {
        data: [
          { node_id: "MOT-1", timestamp: "2026-05-28T00:00:02Z", rpm: 3000, temperature: 42, status: "ok" },
          { node_id: "MOT-1", timestamp: "2026-05-28T00:00:01Z", rpm: 2900, temperature: 41, status: "ok" },
        ],
        error: null,
      },
    });
    mocks.client = { from: vi.fn(() => telemetryLive) };
    const { useTelemetryHistory } = await import("@/lib/hooks/useSupabase");

    const { result } = renderHook(() => useTelemetryHistory("MOT-1", 60));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.history).toHaveLength(2);
    expect(result.current.history[0].timestamp).toBe("2026-05-28T00:00:01Z");
    expect(result.current.history[1].timestamp).toBe("2026-05-28T00:00:02Z");
  });

  it("useTelemetryHistory sets loading false immediately for undefined nodeId", async () => {
    const { useTelemetryHistory } = await import("@/lib/hooks/useSupabase");
    const { result } = renderHook(() => useTelemetryHistory(undefined));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.history).toEqual([]);
  });
});
