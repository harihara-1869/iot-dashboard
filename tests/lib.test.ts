import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MotorNode } from "@/lib/types";

function motorNode(overrides: Partial<MotorNode> = {}): MotorNode {
  return {
    id: "MOT-1",
    name: "Test Motor",
    type: "Stepper",
    location: "Bay 1",
    status: "Active",
    voltage: "24V",
    torque: "1.8Nm",
    max_rpm: 3200,
    rated_current: "2.5 A",
    iot_device_id: "dev-1",
    created_at: "2026-05-28T00:00:00Z",
    ...overrides,
  };
}

describe("node health", () => {
  it("returns degraded when node is Offline without telemetry", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode({ status: "Offline" }));
    expect(result).toEqual({ status: "Offline", severity: "degraded", message: "Test Motor is offline." });
  });

  it("lets live telemetry override a stale Offline node status", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode({ status: "Offline" }), { status: "critical", temperature: 90 });
    expect(result).toEqual({ status: "Critical", severity: "critical", message: "Test Motorcritical status reported." });
  });

  it("returns critical when telemetry status is critical", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode(), { status: "critical", status_message: "Overheat" });
    expect(result).toEqual({ status: "Critical", severity: "critical", message: "Test Motor: Overheat." });
  });

  it("returns critical on anomaly (temp > 80 or vib > 4.0)", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    expect(getNodeHealth(motorNode(), { temperature: 85 }).severity).toBe("critical");
    expect(getNodeHealth(motorNode(), { vibration: 4.5 }).severity).toBe("critical");
    expect(getNodeHealth(motorNode(), { temperature: 85, vibration: 4.5 }).message).toMatch(/Anomaly/);
  });

  it("returns warning on telemetry warning or maintenance node status", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    expect(getNodeHealth(motorNode(), { status: "warning", status_message: "Temp rising" })).toMatchObject({
      status: "Maintenance", severity: "warning",
    });
    expect(getNodeHealth(motorNode({ status: "Maintenance" }), { temperature: 42, vibration: 1, current: 5, rpm: 1000, status: "ok", timestamp: new Date().toISOString() })).toMatchObject({
      status: "Maintenance", severity: "warning",
    });
  });

  it("returns degraded for elevated thresholds (temp > 50, vib > 2.5, cur > 15, rpm > max, cur > rated)", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    expect(getNodeHealth(motorNode(), { temperature: 55 }).severity).toBe("degraded");
    expect(getNodeHealth(motorNode(), { vibration: 3.0 }).severity).toBe("degraded");
    expect(getNodeHealth(motorNode(), { current: 20 }).severity).toBe("degraded");
    expect(getNodeHealth(motorNode({ max_rpm: 3000 }), { rpm: 3500 }).severity).toBe("degraded");
    expect(getNodeHealth(motorNode({ rated_current: "2.5 A" }), { current: 3.0 }).severity).toBe("degraded");
  });

  it("combines multiple elevated conditions in the message", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode({ max_rpm: 3000 }), { temperature: 55, vibration: 3.0, rpm: 3500 });
    expect(result.message).toMatch(/temp 55°C/);
    expect(result.message).toMatch(/vib 3mm\/s/);
    expect(result.message).toMatch(/rpm 3500 > limit 3300/);
  });

  it("skips rpm/current checks when max_rpm or rated_current is zero", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    expect(getNodeHealth(motorNode({ max_rpm: 0 }), { rpm: 9999 }).severity).toBe("good");
    expect(getNodeHealth(motorNode({ rated_current: "---" }), { current: 10 }).severity).toBe("good");
  });

  it("returns good for idle nodes with no issues", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode({ status: "Idle" }));
    expect(result).toEqual({ status: "Offline", severity: "degraded", message: "Test Motor is offline." });
  });

  it("returns good for active nodes with normal telemetry", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const node = motorNode({ rated_current: "10 A" });
    const result = getNodeHealth(node, { temperature: 42, vibration: 1.2, current: 2.5, rpm: 3000 });
    expect(result).toEqual({ status: "Active", severity: "good", message: "Test Motor: Normal operation." });
  });

  it("handles missing telemetry gracefully with defaults", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode());
    expect(result).toEqual({ status: "Offline", severity: "degraded", message: "Test Motor is offline." });
  });

  it("anomaly temperature takes priority over telemetry warning", async () => {
    const { getNodeHealth } = await import("@/lib/node-health");
    const result = getNodeHealth(motorNode(), { status: "warning", temperature: 85 });
    expect(result.severity).toBe("critical");
  });
});

describe("pure and near-pure lib functions", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("maps known node and type images", async () => {
    const { getNodeImage, IMAGES } = await import("@/lib/images");

    expect(getNodeImage("MOT-17-A")).toBe(IMAGES.node);
    expect(getNodeImage("UNKNOWN", "Stepper")).toBe(IMAGES.node);
    expect(getNodeImage("UNKNOWN", "Servo")).toBeNull();
  });

  it("tracks rate limit windows and resets after expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-28T00:00:00Z"));
    const { checkRateLimit } = await import("@/lib/rate-limit");

    expect(checkRateLimit("test", "user-1", 2, 1000)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkRateLimit("test", "user-1", 2, 1000)).toMatchObject({ allowed: true, remaining: 0 });
    expect(checkRateLimit("test", "user-1", 2, 1000)).toMatchObject({ allowed: false, remaining: 0 });

    vi.setSystemTime(new Date("2026-05-28T00:00:02Z"));
    expect(checkRateLimit("test", "user-1", 2, 1000)).toMatchObject({ allowed: true, remaining: 1 });
  });

  it("creates browser and server Supabase clients with publishable-key env vars and host cookies", async () => {
    const createBrowserClient = vi.fn(() => ({ browser: true }));
    const createServerClient = vi.fn(() => ({ server: true }));
    const cookieStore = { getAll: vi.fn(() => [{ name: "a", value: "b" }]), set: vi.fn() };
    vi.doMock("@supabase/ssr", () => ({ createBrowserClient, createServerClient }));
    vi.doMock("next/headers", () => ({ cookies: vi.fn(async () => cookieStore) }));
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "wrong-key";

    const { createClient } = await import("@/lib/supabase/client");
    const { createServerSupabase } = await import("@/lib/supabase/server");

    expect(createClient()).toEqual({ browser: true });
    expect(await createServerSupabase()).toEqual({ server: true });
    expect(createBrowserClient).toHaveBeenCalledWith("https://project.supabase.co", "publishable-key", expect.objectContaining({
      cookieOptions: expect.objectContaining({ name: "__Host-sb-auth-token", secure: true }),
    }));
    expect(createServerClient).toHaveBeenCalledWith("https://project.supabase.co", "publishable-key", expect.objectContaining({
      cookieOptions: expect.objectContaining({ name: "__Host-sb-auth-token", path: "/" }),
    }));
  });

  it("generates custom device IDs by sanitizing input", async () => {
    vi.doMock("azure-iothub", () => ({ Registry: { fromConnectionString: vi.fn() } }));
    const { generateDeviceId } = await import("@/lib/iot-hub/index");

    expect(generateDeviceId("Ignored", " Pump A_42!! ")).toBe("pumpa42");
  });

  it("registers devices in Azure IoT Hub and extracts credentials", async () => {
    const create = vi.fn((_device, cb) => cb(null, {
      deviceId: "dev-1",
      authentication: { symmetricKey: { primaryKey: "primary-key" } },
    }));
    vi.doMock("azure-iothub", () => ({
      Registry: {
        fromConnectionString: vi.fn(() => ({ create })),
      },
    }));
    process.env.AZURE_IOT_HUB_CONNECTION_STRING = "HostName=hub.azure-devices.net;SharedAccessKeyName=owner;SharedAccessKey=key";
    const { registerDeviceInIotHub } = await import("@/lib/iot-hub/index");

    await expect(registerDeviceInIotHub("dev-1")).resolves.toEqual({
      deviceId: "dev-1",
      iotHubHost: "hub.azure-devices.net",
      primaryKey: "primary-key",
    });
    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      deviceId: "dev-1",
      status: "enabled",
    }), expect.any(Function));
  });

  it("normalizes Azure device status and returns null on registry misses", async () => {
    const get = vi
      .fn()
      .mockResolvedValueOnce({
        responseBody: {
          deviceId: "dev-1",
          connectionState: "connected",
          lastActivityTime: "2026-05-28T00:00:00Z",
          status: "enabled",
        },
      })
      .mockRejectedValueOnce(new Error("not found"));
    vi.doMock("azure-iothub", () => ({
      Registry: {
        fromConnectionString: vi.fn(() => ({ get })),
      },
    }));
    process.env.AZURE_IOT_HUB_CONNECTION_STRING = "HostName=hub.azure-devices.net;SharedAccessKeyName=owner;SharedAccessKey=key";
    const { getDeviceStatus } = await import("@/lib/iot-hub/index");

    await expect(getDeviceStatus("dev-1")).resolves.toEqual({
      deviceId: "dev-1",
      connected: true,
      lastActivityTime: "2026-05-28T00:00:00Z",
      status: "enabled",
    });
    await expect(getDeviceStatus("missing")).resolves.toBeNull();
  });

  it("deletes a device from Azure IoT Hub and ignores missing registries", async () => {
    const del = vi.fn((_id, cb) => cb(null));
    vi.doMock("azure-iothub", () => ({
      Registry: {
        fromConnectionString: vi.fn(() => ({ delete: del })),
      },
    }));
    process.env.AZURE_IOT_HUB_CONNECTION_STRING = "HostName=hub.azure-devices.net;SharedAccessKeyName=owner;SharedAccessKey=key";
    const { deleteDeviceFromIotHub } = await import("@/lib/iot-hub/index");

    await expect(deleteDeviceFromIotHub("dev-1")).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith("dev-1", expect.any(Function));

    vi.resetModules();
    delete process.env.AZURE_IOT_HUB_CONNECTION_STRING;
    const { deleteDeviceFromIotHub: deleteNoReg } = await import("@/lib/iot-hub/index");
    await expect(deleteNoReg("dev-1")).resolves.toBeUndefined();
  });

  it("lists all devices from Azure IoT Hub and returns empty on errors", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        responseBody: [
          { deviceId: "dev-1", connectionState: "connected", lastActivityTime: null, status: "enabled" },
          { deviceId: "dev-2", connectionState: "disconnected", lastActivityTime: "2026-05-28T00:00:00Z", status: "disabled" },
        ],
      })
      .mockRejectedValueOnce(new Error("network error"));
    vi.doMock("azure-iothub", () => ({
      Registry: {
        fromConnectionString: vi.fn(() => ({ list })),
      },
    }));
    process.env.AZURE_IOT_HUB_CONNECTION_STRING = "HostName=hub.azure-devices.net;SharedAccessKeyName=owner;SharedAccessKey=key";
    const { listDevices } = await import("@/lib/iot-hub/index");

    await expect(listDevices()).resolves.toEqual([
      { deviceId: "dev-1", connected: true, lastActivityTime: null, status: "enabled" },
      { deviceId: "dev-2", connected: false, lastActivityTime: "2026-05-28T00:00:00Z", status: "disabled" },
    ]);
    await expect(listDevices()).resolves.toEqual([]);
  });
});
