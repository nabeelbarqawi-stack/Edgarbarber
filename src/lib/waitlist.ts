import { z } from "zod";
import type { SendResult } from "@/lib/email";

export type WaitlistState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; fieldErrors?: Partial<Record<"name" | "email" | "consent", string>>; message?: string };

export type WaitlistInput = {
  name: FormDataEntryValue | null;
  email: FormDataEntryValue | null;
  consent: FormDataEntryValue | null;
  website: FormDataEntryValue | null;
  startedAt: FormDataEntryValue | null;
  ip: string | null;
};

export class RateLimitedError extends Error {
  constructor() {
    super("rate_limited");
  }
}

export type WaitlistDeps = {
  now: () => number;
  hashIp: (ip: string | null) => string | null;
  insertSignup: (args: { name: string; email: string; ipHash: string | null }) => Promise<{ id: string; created: boolean }>;
  sendConfirmation: (args: { name: string; email: string; unsubscribeUrl: string }) => Promise<SendResult>;
  recordEmailResult: (id: string, result: SendResult) => Promise<void>;
  unsubscribeUrl: (id: string) => string;
};

/** Humans take longer than this to fill in the form; faster submissions are treated as bots. */
export const MIN_FILL_MS = 3000;

export const waitlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(80, "Please keep your name under 80 characters."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please enter a valid email address.")),
  consent: z.literal("on", { error: "Please agree to receive product emails." }),
});

type FieldErrors = NonNullable<Extract<WaitlistState, { status: "error" }>["fieldErrors"]>;

/** Validates the form fields; returns the cleaned values or the field errors to show. */
export function validateWaitlistInput(
  input: WaitlistInput,
): { ok: true; data: z.infer<typeof waitlistSchema> } | { ok: false; state: WaitlistState } {
  const parsed = waitlistSchema.safeParse({
    name: typeof input.name === "string" ? input.name : "",
    email: typeof input.email === "string" ? input.email : "",
    consent: input.consent ?? undefined,
  });
  if (parsed.success) return { ok: true, data: parsed.data };

  const fieldErrors: FieldErrors = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0] as keyof FieldErrors;
    fieldErrors[key] ??= issue.message;
  }
  return { ok: false, state: { status: "error", fieldErrors } };
}

export async function joinWaitlist(input: WaitlistInput, deps: WaitlistDeps): Promise<WaitlistState> {
  const validation = validateWaitlistInput(input);
  if (!validation.ok) return validation.state;

  // Bots: pretend it worked so they learn nothing, but save nothing.
  const startedAt = Number(input.startedAt);
  const honeypotFilled = typeof input.website === "string" && input.website.trim() !== "";
  const tooFast = !Number.isFinite(startedAt) || deps.now() - startedAt < MIN_FILL_MS;
  if (honeypotFilled || tooFast) return { status: "success" };

  const { name, email } = validation.data;
  let signup: { id: string; created: boolean };
  try {
    signup = await deps.insertSignup({ name, email, ipHash: deps.hashIp(input.ip) });
  } catch (err) {
    if (err instanceof RateLimitedError) {
      return { status: "error", message: "Too many signups from your connection. Please try again in an hour." };
    }
    console.error("waitlist signup failed", err);
    return { status: "error", message: "Sorry, something went wrong. Please try again in a moment." };
  }

  if (signup.created) {
    const result = await deps.sendConfirmation({ name, email, unsubscribeUrl: deps.unsubscribeUrl(signup.id) });
    try {
      await deps.recordEmailResult(signup.id, result);
    } catch (err) {
      console.error("could not record email result", err);
    }
  }

  return { status: "success" };
}
