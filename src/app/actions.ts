"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sendWaitlistConfirmation } from "@/lib/email";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createUnsubscribeToken } from "@/lib/tokens";
import { RateLimitedError, joinWaitlist as runJoinWaitlist, validateWaitlistInput, type WaitlistState } from "@/lib/waitlist";

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip");

  const input = {
    name: formData.get("name"),
    email: formData.get("email"),
    consent: formData.get("consent"),
    website: formData.get("website"),
    startedAt: formData.get("startedAt"),
    ip: ip ?? null,
  };

  const supabase = createSupabaseAdminClient();
  if (!supabase || !isSupabaseConfigured()) {
    // Still show field errors so the form behaves the same before the database is connected.
    const validation = validateWaitlistInput(input);
    if (!validation.ok) return validation.state;
    return { status: "error", message: "Signups are temporarily unavailable. Please try again soon." };
  }

  return runJoinWaitlist(input, {
    now: () => Date.now(),
    hashIp: (value) => {
      const salt = process.env.IP_HASH_SALT;
      return value && salt ? createHash("sha256").update(`${salt}:${value}`).digest("hex") : null;
    },
    insertSignup: async ({ name, email, ipHash }) => {
      const { data, error } = await supabase.rpc("join_waitlist", {
        p_name: name,
        p_email: email,
        p_consent: true,
        p_ip_hash: ipHash,
      });
      if (error) {
        if (error.message.includes("rate_limited")) throw new RateLimitedError();
        throw new Error(error.message);
      }
      const row = (Array.isArray(data) ? data[0] : data) as { id: string; created: boolean } | undefined;
      if (!row) throw new Error("join_waitlist returned no row");
      return row;
    },
    sendConfirmation: sendWaitlistConfirmation,
    recordEmailResult: async (id, result) => {
      await supabase
        .from("waitlist_signups")
        .update({
          confirmation_email_status: result.ok ? "sent" : "failed",
          email_error: result.ok ? null : result.error,
        })
        .eq("id", id);
    },
    unsubscribeUrl: (id) => `${siteUrl()}/unsubscribe?token=${encodeURIComponent(createUnsubscribeToken(id))}`,
  });
}
