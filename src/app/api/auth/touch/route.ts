import { NextResponse } from "next/server";
import { touchSession } from "@/lib/auth/session";

export async function POST() {
  const session = await touchSession();

  if (!session) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  return NextResponse.json({
    active: true,
    lastActivity: session.lastActivity,
  });
}
