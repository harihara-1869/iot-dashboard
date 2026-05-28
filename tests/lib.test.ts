import { beforeEach, describe, expect, it, vi } from "vitest";

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
});
