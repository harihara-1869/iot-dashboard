const connectionString = process.env.AZURE_IOT_HUB_CONNECTION_STRING ?? "";

export function getIotHubConfig() {
  return { connectionString };
}

export interface DeviceCommand {
  deviceId: string;
  methodName: string;
  payload: Record<string, unknown>;
  responseTimeoutInSeconds?: number;
}

export async function invokeDeviceMethod(_command: DeviceCommand): Promise<Record<string, unknown>> {
  throw new Error("Azure IoT Hub direct method requires server-side SDK. Use API route proxy.");
}

export async function sendCloudToDeviceMessage(
  _deviceId: string,
  _message: Record<string, unknown>,
): Promise<void> {
  throw new Error("Azure IoT Hub C2D messaging requires server-side SDK. Use API route proxy.");
}
