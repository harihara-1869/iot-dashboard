import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest, createQueryBuilder, createSupabaseMock } from "./helpers/supabase";

const mocks = vi.hoisted(() => ({
  serverSupabase: undefined as unknown,
  ssrSupabase: undefined as unknown,
  browserSupabase: undefined as unknown,
  cookiesStore: {
    getAll: vi.fn(() => []),
    set: vi.fn(),
  },
  registerDeviceInIotHub: vi.fn(),
  generateDeviceId: vi.fn(),
  getDeviceStatus: vi.fn(),
  rateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: Date.now() + 1000 })),
  eventHubEvents: [] as Array<{ partitionId: string; events: Array<{ offset: string | number; body: unknown }> }>,
  eventHubStartPositions: [] as unknown[],
  eventHubClose: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(async () => mocks.serverSupabase),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => mocks.ssrSupabase),
  createBrowserClient: vi.fn(() => mocks.browserSupabase),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => mocks.serverSupabase),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mocks.cookiesStore),
}));

vi.mock("@/lib/iot-hub/index", () => ({
  registerDeviceInIotHub: mocks.registerDeviceInIotHub,
  generateDeviceId: mocks.generateDeviceId,
  getDeviceStatus: mocks.getDeviceStatus,
}));

vi.mock("@/lib/iot-hub", () => ({
  registerDeviceInIotHub: mocks.registerDeviceInIotHub,
  generateDeviceId: mocks.generateDeviceId,
  getDeviceStatus: mocks.getDeviceStatus,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: mocks.rateLimit,
}));

vi.mock("@azure/event-hubs", () => ({
  earliestEventPosition: { earliest: true },
  EventHubConsumerClient: class {
    constructor() {}
    async getPartitionIds() {
      return mocks.eventHubEvents.map((p) => p.partitionId);
    }
    subscribe(partitionId: string, handlers: { processEvents: (events: unknown[]) => Promise<void> }, options: { startPosition: unknown }) {
      mocks.eventHubStartPositions.push(options.startPosition);
      const group = mocks.eventHubEvents.find((p) => p.partitionId === partitionId);
      void handlers.processEvents(group?.events ?? []);
      return { close: vi.fn() };
    }
    async close() {
      mocks.eventHubClose();
    }
  },
}));

describe("API routes", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.serverSupabase = createSupabaseMock();
    mocks.ssrSupabase = createSupabaseMock();
    mocks.browserSupabase = undefined;
    mocks.registerDeviceInIotHub.mockReset();
    mocks.generateDeviceId.mockReset();
    mocks.getDeviceStatus.mockReset();
    mocks.rateLimit.mockReset().mockReturnValue({ allowed: true, remaining: 9, resetAt: Date.now() + 1000 });
    mocks.cookiesStore.getAll.mockClear();
    mocks.cookiesStore.set.mockClear();
    mocks.eventHubEvents = [];
    mocks.eventHubStartPositions = [];
    mocks.eventHubClose.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.IOT_HUB_EVENTHUB_CONNECTION = "Endpoint=sb://hub/;SharedAccessKeyName=iothub;SharedAccessKey=key;EntityPath=hub";
    process.env.CRON_SECRET = "cron-secret";
  });

  it("signs up a user with operator metadata", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");

    const response = await POST(jsonRequest("https://app.local/api/auth/signup", {
      email: " new@example.com ",
      password: "password123",
      operator_id: " OP-42 ",
    }));

    await expect(response.json()).resolves.toMatchObject({
      user: { id: "user-1", email: "new@example.com" },
      message: "Account created. Check your email to confirm.",
    });
    expect(response.status).toBe(200);
    expect((mocks.ssrSupabase as ReturnType<typeof createSupabaseMock>).auth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
      options: {
        emailRedirectTo: "https://app.local/auth/confirm",
        data: { operator_id: "OP-42" },
      },
    });
  });

  it("rejects invalid signup payloads", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");

    const response = await POST(jsonRequest("https://app.local/api/auth/signup", {
      email: "new@example.com",
      password: "short",
      operator_id: "OP-42",
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Password must be at least 8 characters" });
  });

  it("registers a device after auth and writes motor defaults", async () => {
    const motorNodes = createQueryBuilder({
      maybeSingle: { data: null, error: null },
      insert: { error: null },
    });
    mocks.serverSupabase = createSupabaseMock({ motor_nodes: motorNodes });
    mocks.generateDeviceId.mockReturnValue("conveyor-a1");
    mocks.registerDeviceInIotHub.mockResolvedValue({
      deviceId: "conveyor-a1",
      iotHubHost: "hub.azure-devices.net",
      primaryKey: "primary-key",
    });
    const { POST } = await import("@/app/api/devices/register/route");

    const response = await POST(jsonRequest("https://app.local/api/devices/register", {
      device_name: "Conveyor A1",
      location: "Bay 3",
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      deviceId: "MOT-CONVEYOR",
      device: { deviceId: "conveyor-a1", primaryKey: "primary-key" },
    });
    expect(motorNodes.insert).toHaveBeenCalledWith(expect.objectContaining({
      id: "MOT-CONVEYOR",
      status: "Idle",
      voltage: "—",
      iot_device_id: "conveyor-a1",
    }));
  });

  it("returns 401 when registering a device without a user session", async () => {
    mocks.serverSupabase = createSupabaseMock({}, null);
    const { POST } = await import("@/app/api/devices/register/route");

    const response = await POST(jsonRequest("https://app.local/api/devices/register", {
      device_name: "Conveyor A1",
      location: "Bay 3",
    }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: "Authentication required." });
  });

  it("rejects device registration with missing location", async () => {
    const { POST } = await import("@/app/api/devices/register/route");

    const response = await POST(jsonRequest("https://app.local/api/devices/register", {
      device_name: "Conveyor A1",
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "location is required." });
  });

  it("updates device details after validating input", async () => {
    const motorNodes = createQueryBuilder({
      maybeSingle: { data: { id: "MOT-1" }, error: null },
      single: { data: { id: "MOT-1", type: "Servo" }, error: null },
    });
    mocks.serverSupabase = createSupabaseMock({ motor_nodes: motorNodes });
    const { PATCH } = await import("@/app/api/devices/[id]/details/route");

    const response = await PATCH(
      jsonRequest("https://app.local/api/devices/MOT-1/details", {
        type: "Servo",
        voltage: "24V",
        torque: "1.8Nm",
        max_rpm: 3200,
        ip_rating: "IP54",
      }, { method: "PATCH" }),
      { params: Promise.resolve({ id: "MOT-1" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, node: { id: "MOT-1", type: "Servo" } });
    expect(motorNodes.update).toHaveBeenCalledWith({
      type: "Servo",
      voltage: "24V",
      torque: "1.8Nm",
      max_rpm: 3200,
      ip_rating: "IP54",
    });
  });

  it("rejects invalid device detail input and missing auth", async () => {
    const { PATCH } = await import("@/app/api/devices/[id]/details/route");

    const invalid = await PATCH(jsonRequest("https://app.local/api/devices/MOT-1/details", {
      type: "Bad",
    }, { method: "PATCH" }), { params: Promise.resolve({ id: "MOT-1" }) });
    expect(invalid.status).toBe(400);

    mocks.serverSupabase = createSupabaseMock({}, null);
    vi.resetModules();
    const { PATCH: patchNoAuth } = await import("@/app/api/devices/[id]/details/route");
    const noAuth = await patchNoAuth(jsonRequest("https://app.local/api/devices/MOT-1/details", {}, { method: "PATCH" }), {
      params: Promise.resolve({ id: "MOT-1" }),
    });
    expect(noAuth.status).toBe(401);
  });

  it("runs diagnostics and persists database plus device checks", async () => {
    const motorNodes = createQueryBuilder({
      select: { data: [{ id: "MOT-1", name: "Conveyor", iot_device_id: "dev-1" }], error: null },
    });
    const diagnosticsLogs = createQueryBuilder({ insert: { error: null } });
    mocks.serverSupabase = createSupabaseMock({ motor_nodes: motorNodes, diagnostics_logs: diagnosticsLogs });
    mocks.getDeviceStatus.mockResolvedValue({ deviceId: "dev-1", connected: true, lastActivityTime: null, status: "enabled" });
    const { POST } = await import("@/app/api/diagnostics/run/route");

    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ success: true, summary: "All 2 checks passed" });
    expect(diagnosticsLogs.insert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ check_type: "Database", result: "SUCCESS", operator: "OP-1" }),
      expect.objectContaining({ check_type: "Device: Conveyor", result: "SUCCESS", node_id: "MOT-1" }),
    ]));
  });

  it("rejects diagnostics without auth", async () => {
    mocks.serverSupabase = createSupabaseMock({}, null);
    const { POST } = await import("@/app/api/diagnostics/run/route");

    const response = await POST();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ success: false, error: "Authentication required." });
  });

  it("requires cron authorization before telemetry sync", async () => {
    const { GET } = await import("@/app/api/cron/telemetry-sync/route");

    const response = await GET(new Request("https://app.local/api/cron/telemetry-sync"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("syncs telemetry from fresh checkpoints and upserts duplicate-safe rows", async () => {
    vi.useFakeTimers();
    const checkpoints = createQueryBuilder({
      select: {
        data: [
          { partition_id: "0", event_hub_offset: "10", updated_at: new Date().toISOString() },
          { partition_id: "1", event_hub_offset: "99", updated_at: "2000-01-01T00:00:00.000Z" },
        ],
        error: null,
      },
    });
    const motorNodes = createQueryBuilder({
      select: { data: [{ id: "MOT-1", iot_device_id: "dev-1" }], error: null },
    });
    const telemetryLive = createQueryBuilder({ upsert: { error: null } });
    mocks.serverSupabase = createSupabaseMock({
      telemetry_checkpoints: checkpoints,
      motor_nodes: motorNodes,
      telemetry_live: telemetryLive,
    });
    mocks.eventHubEvents = [
      {
        partitionId: "0",
        events: [
          { offset: "11", body: JSON.stringify({ device_id: "dev-1", timestamp: "2026-05-28T00:00:00Z", rpm: 3400, temperature: 42, vibration: 1.2, current: 10.5, status: "Active" }) },
          { offset: "12", body: { device_id: "unknown", timestamp: "2026-05-28T00:00:01Z", rpm: 100 } },
        ],
      },
      {
        partitionId: "1",
        events: [{ offset: "3", body: "{bad json" }],
      },
    ];
    const { GET } = await import("@/app/api/cron/telemetry-sync/route");

    const pending = GET(new Request("https://app.local/api/cron/telemetry-sync", {
      headers: { Authorization: "Bearer cron-secret" },
    }));
    await vi.advanceTimersByTimeAsync(8000);
    const response = await pending;

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ processed: 1, skipped: 1, errors: 1 });
    expect(mocks.eventHubStartPositions).toEqual([
      { offset: "10", isInclusive: false },
      { earliest: true },
    ]);
    expect(telemetryLive.upsert).toHaveBeenCalledWith([
      expect.objectContaining({
        node_id: "MOT-1",
        partition_id: "0",
        event_hub_offset: "11",
        temperature: 42,
        vibration: 1.2,
        current: 10.5,
      }),
    ], {
      onConflict: "partition_id, event_hub_offset",
      ignoreDuplicates: true,
    });
    expect(checkpoints.upsert).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ partition_id: "0", event_hub_offset: "12" }),
      expect.objectContaining({ partition_id: "1", event_hub_offset: "3" }),
    ]), { onConflict: "partition_id" });
  });

  it("records telemetry insert errors without advancing processed rows", async () => {
    vi.useFakeTimers();
    const telemetryLive = createQueryBuilder({ upsert: { error: { message: "duplicate path failed" } } });
    mocks.serverSupabase = createSupabaseMock({
      telemetry_checkpoints: createQueryBuilder({ select: { data: [], error: null } }),
      motor_nodes: createQueryBuilder({ select: { data: [{ id: "MOT-1", iot_device_id: "dev-1" }], error: null } }),
      telemetry_live: telemetryLive,
    });
    mocks.eventHubEvents = [{
      partitionId: "0",
      events: [{ offset: "1", body: { device_id: "dev-1", timestamp: "2026-05-28T00:00:00Z", rpm: 3400 } }],
    }];
    const { GET } = await import("@/app/api/cron/telemetry-sync/route");

    const pending = GET(new Request("https://app.local/api/cron/telemetry-sync", {
      headers: { Authorization: "Bearer cron-secret" },
    }));
    await vi.advanceTimersByTimeAsync(8000);
    const response = await pending;

    await expect(response.json()).resolves.toMatchObject({ processed: 0, skipped: 0, errors: 1 });
  });
});
