import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  registerDeviceInIotHub,
  generateDeviceId,
  type RegisterDeviceResult,
} from "@/lib/iot-hub/index";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_name, location, custom_device_id } = body;

    if (!device_name || typeof device_name !== "string" || !device_name.trim()) {
      return NextResponse.json(
        { success: false, error: "device_name is required." } satisfies RegisterDeviceResult,
        { status: 400 },
      );
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { success: false, error: "location is required." } satisfies RegisterDeviceResult,
        { status: 400 },
      );
    }

    const deviceId = generateDeviceId(
      device_name.trim(),
      custom_device_id?.trim() || undefined,
    );

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "Could not generate a valid device ID." } satisfies RegisterDeviceResult,
        { status: 400 },
      );
    }

    const existingDevice = await supabase
      .from("motor_nodes")
      .select("id")
      .eq("id", deviceId.toUpperCase())
      .maybeSingle();

    if (existingDevice.data) {
      return NextResponse.json(
        { success: false, error: `Device ID "${deviceId.toUpperCase()}" already exists.` } satisfies RegisterDeviceResult,
        { status: 409 },
      );
    }

    let iotCredentials;
    try {
      iotCredentials = await registerDeviceInIotHub(deviceId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("Azure IoT Hub registration skipped:", message);
    }

    const supabaseId = `MOT-${deviceId.toUpperCase().slice(0, 8)}`;

    const { error: insertError } = await supabase
      .from("motor_nodes")
      .insert({
        id: supabaseId,
        name: device_name.trim(),
        type: "Stepper",
        location: location.trim(),
        status: "Idle",
        voltage: "—",
        torque: "—",
        max_rpm: 0,
        ip_rating: "—",
        iot_device_id: iotCredentials?.deviceId ?? deviceId,
      });

    if (insertError) {
      console.error("Supabase insert failed:", insertError.message);
      return NextResponse.json(
        { success: false, error: `Database error: ${insertError.message}` } satisfies RegisterDeviceResult,
        { status: 500 },
      );
    }

    console.log(`Device registered: ${supabaseId} (IoT: ${deviceId})`);

    return NextResponse.json({
      success: true,
      deviceId: supabaseId,
      supabaseId,
      device: iotCredentials
        ? {
            deviceId: iotCredentials.deviceId,
            iotHubHost: iotCredentials.iotHubHost,
            primaryKey: iotCredentials.primaryKey,
          }
        : undefined,
    } satisfies RegisterDeviceResult);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/devices/register failed:", message);
    return NextResponse.json(
      { success: false, error: message } satisfies RegisterDeviceResult,
      { status: 500 },
    );
  }
}
