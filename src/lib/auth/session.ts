import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import type { Operator } from "./passport";

export interface SessionData {
  user?: {
    id: string;
    email: string;
    operator_id: string;
  };
}

const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET ?? "".padEnd(32, "x"),
  cookieName: "kinetic_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8,
    path: "/",
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, SESSION_OPTIONS);
}

export async function saveSession(user: Operator): Promise<void> {
  const session = await getSession();
  session.user = {
    id: user.id,
    email: user.email,
    operator_id: user.operator_id,
  };
  await session.save();
}

export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}
