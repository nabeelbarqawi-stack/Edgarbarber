import { createHmac, timingSafeEqual } from "node:crypto";
import { requireEnv } from "@/lib/env";

function sign(id: string): string {
  return createHmac("sha256", requireEnv("UNSUBSCRIBE_SECRET")).update(id).digest("base64url");
}

/** Token for one-click unsubscribe links: `{signupId}.{hmac}`. */
export function createUnsubscribeToken(signupId: string): string {
  return `${signupId}.${sign(signupId)}`;
}

/** Returns the signup id for a valid token, otherwise null. */
export function verifyUnsubscribeToken(token: string | null | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(id));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  return id;
}
