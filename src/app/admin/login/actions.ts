"use server";

import { z } from "zod";
import { siteUrl } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { status: "idle" | "sent" | "error"; message?: string };

export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) return { status: "error", message: "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Admin sign-in isn't set up yet (Supabase is not configured)." };

  const { error } = await supabase.auth.signInWithOtp({
    email: email.data,
    options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl()}/admin/auth/callback` },
  });
  if (error && error.status && error.status >= 500) {
    return { status: "error", message: "Couldn't send the link right now. Please try again." };
  }
  // Same message whether or not the email is registered, so the form doesn't reveal the owner's address.
  return { status: "sent" };
}
