import { Registry } from "azure-iothub";

function getRegistry(): Registry | null {
  const cs = process.env.AZURE_IOT_HUB_CONNECTION_STRING;
  if (!cs) return null;
  return Registry.fromConnectionString(cs);
}

export interface DeviceCredentials {
  deviceId: string;
  iotHubHost: string;
  primaryKey: string;
}

export interface RegisterDeviceInput {
  deviceName: string;
  location: string;
  customDeviceId?: string;
}

export interface RegisterDeviceResult {
  success: boolean;
  device?: DeviceCredentials;
  deviceId?: string;
  supabaseId?: string;
  error?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

function randomSuffix(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateDeviceId(name: string, customId?: string): string {
  if (customId && customId.trim().length > 0) {
    return customId.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  }
  return `${slugify(name)}-${randomSuffix()}`;
}

function extractHostName(cs: string): string {
  const match = cs.match(/HostName=([^;]+)/);
  return match?.[1] ?? "unknown";
}

export async function registerDeviceInIotHub(
  deviceId: string,
): Promise<DeviceCredentials> {
  const registry = getRegistry();
  const cs = process.env.AZURE_IOT_HUB_CONNECTION_STRING ?? "";

  if (!registry || !cs) {
    throw new Error(
      "AZURE_IOT_HUB_CONNECTION_STRING is not configured.",
    );
  }

  const host = extractHostName(cs);

  try {
    const device = {
      deviceId,
      status: "enabled",
      authentication: {
        symmetricKey: {
          primaryKey: "",
          secondaryKey: "",
        },
      },
    };

    const response = await new Promise<{
      deviceId: string;
      authentication: { symmetricKey: { primaryKey: string } };
    }>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      registry.create(device, (err, deviceInfo: any, _httpResponse) => {
        if (err) {
          reject(err);
        } else if (deviceInfo?.deviceId && deviceInfo?.authentication?.symmetricKey?.primaryKey) {
          resolve(deviceInfo);
        } else {
          reject(new Error("Azure IoT Hub returned incomplete device info"));
        }
      });
    });

    return {
      deviceId: response.deviceId,
      iotHubHost: host,
      primaryKey: response.authentication.symmetricKey.primaryKey,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Azure IoT Hub registration failed: ${message}`);
  }
}

export async function deleteDeviceFromIotHub(deviceId: string): Promise<void> {
  const registry = getRegistry();
  if (!registry) return;

  await new Promise<void>((resolve, reject) => {
    registry.delete(deviceId, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export interface DeviceStatus {
  deviceId: string;
  connected: boolean;
  lastActivityTime: string | null;
  status: "enabled" | "disabled";
}

export async function getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
  const registry = getRegistry();
  if (!registry) return null;

  try {
    const result = await registry.get(deviceId);
    const device = result.responseBody;
    return {
      deviceId: device.deviceId,
      connected: device.connectionState === "connected",
      lastActivityTime: device.lastActivityTime ?? null,
      status: device.status === "disabled" ? "disabled" : "enabled",
    };
  } catch {
    return null;
  }
}

export async function listDevices(): Promise<DeviceStatus[]> {
  const registry = getRegistry();
  if (!registry) return [];

  try {
    const result = await registry.list();
    return result.responseBody.map((device) => ({
      deviceId: device.deviceId,
      connected: device.connectionState === "connected",
      lastActivityTime: device.lastActivityTime ?? null,
      status: device.status === "disabled" ? "disabled" : "enabled",
    }));
  } catch {
    return [];
  }
}
