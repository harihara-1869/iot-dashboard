import { NextResponse } from "next/server";
import { saveSession } from "@/lib/auth/session";
import { authenticate } from "@/lib/auth/passport";
import { dummyVerify } from "@/lib/auth/password";

export async function POST(request: Request) {
  let email = "";
  let password = "";

  try {
    const body = await request.json();
    email = String(body.email ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    await dummyVerify();
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!email || !password) {
    await dummyVerify();
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  try {
    const user = await authenticate(email, password);
    await saveSession(user);

    return NextResponse.json({
      user: { id: user.id, email: user.email, operator_id: user.operator_id },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }
}
