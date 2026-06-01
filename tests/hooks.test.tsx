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
