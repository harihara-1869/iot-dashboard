import { timingSafeEqual } from "node:crypto";
import * as argon2 from "argon2";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  timeCost: 10,
  memoryCost: 65536,
  parallelism: 1,
  hashLength: 32,
} satisfies argon2.Options;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return argon2.verify(hash, password);
}

export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

const DUMMY_HASH =
  "$argon2id$v=19$m=65536,t=10,p=1$dW1taWVzIGR1bW15IHNhbHQ$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function dummyVerify(): Promise<void> {
  await argon2.verify(DUMMY_HASH, "dummy");
}
