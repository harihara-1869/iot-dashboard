import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  registerDeviceInIotHub,
  generateDeviceId,
  type RegisterDeviceResult,
} from "@/lib/iot-hub/index";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required." } satisfies RegisterDeviceResult,
        { status: 401 },
      );
    }

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

    const iotCredentials = await registerDeviceInIotHub(deviceId);

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
        iot_device_id: iotCredentials.deviceId,
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
      device: {
        deviceId: iotCredentials.deviceId,
        iotHubHost: iotCredentials.iotHubHost,
        primaryKey: iotCredentials.primaryKey,
      },
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
