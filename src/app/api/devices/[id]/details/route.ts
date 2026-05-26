import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

const VALID_TYPES = ["Stepper", "Induction", "Cooling", "Servo", "Conveyor", "Hydraulic"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid request body." }, { status: 400 });
    }

    const { id } = await params;
    const { type, voltage, torque, max_rpm, ip_rating } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ success: false, error: "Valid motor type is required." }, { status: 400 });
    }
    if (!voltage || typeof voltage !== "string") {
      return NextResponse.json({ success: false, error: "Voltage is required." }, { status: 400 });
    }
    if (max_rpm === undefined || typeof max_rpm !== "number") {
      return NextResponse.json({ success: false, error: "Max RPM is required." }, { status: 400 });
    }
    if (!torque || typeof torque !== "string") {
      return NextResponse.json({ success: false, error: "Torque is required." }, { status: 400 });
    }
    if (!ip_rating || typeof ip_rating !== "string") {
      return NextResponse.json({ success: false, error: "IP rating is required." }, { status: 400 });
    }

    const { data: existing, error: lookupError } = await supabase
      .from("motor_nodes")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (lookupError || !existing) {
      return NextResponse.json({ success: false, error: "Device not found." }, { status: 404 });
    }

    const { data: node, error: updateError } = await supabase
      .from("motor_nodes")
      .update({ type, voltage, torque, max_rpm, ip_rating })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Database error: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, node });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PATCH /api/devices/[id]/details failed:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
