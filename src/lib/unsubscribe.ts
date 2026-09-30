import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/tokens";

export type UnsubscribeResult = "unsubscribed" | "invalid" | "unavailable";

/** Marks the signup behind a valid token as unsubscribed. Safe to call repeatedly. */
export async function unsubscribe(token: string | null): Promise<UnsubscribeResult> {
  let id: string | null;
  try {
    id = verifyUnsubscribeToken(token);
  } catch {
    return "unavailable";
  }
  if (!id) return "invalid";

  const supabase = createSupabaseAdminClient();
  if (!supabase) return "unavailable";
  const { error } = await supabase
    .from("waitlist_signups")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("id", id)
    .is("unsubscribed_at", null);
  return error ? "unavailable" : "unsubscribed";
}
