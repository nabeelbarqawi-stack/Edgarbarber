"use client";

import { useActionState, useEffect, useState } from "react";
import { joinWaitlist } from "@/app/actions";
import type { WaitlistState } from "@/lib/waitlist";

const initialState: WaitlistState = { status: "idle" };

export function WaitlistForm({ renderedAt }: { renderedAt: number }) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);
  // Server value works without JavaScript; the client replaces it with the real page-open time.
  const [startedAt, setStartedAt] = useState(renderedAt);
  useEffect(() => setStartedAt(Date.now()), []);

  if (state.status === "success") {
    return (
      <div role="status" className="rounded-2xl bg-white p-6 text-center shadow-sm">
        <p className="font-display text-2xl font-bold text-label uppercase">You&apos;re on the list!</p>
        <p className="mt-2 text-ink-muted">Check your inbox for a confirmation. We&apos;ll email you when the balm is available.</p>
      </div>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const message = state.status === "error" ? state.message : undefined;

  return (
    <form action={formAction} aria-label="Join the waitlist" noValidate className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" type="text" autoComplete="name" error={errors.name} />
        <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      </div>

      <div className="mt-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="consent"
            className="mt-0.5 size-5 shrink-0 accent-label"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>Email me when the Oak and Whiskey Beard Balm is available. I can unsubscribe anytime.</span>
        </label>
        {errors.consent && (
          <p id="consent-error" className="mt-1 text-sm font-medium text-label-dark">
            {errors.consent}
          </p>
        )}
      </div>

      {/* Spam protection: humans never see or fill this field. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      {message && (
        <p role="alert" className="mt-4 rounded-lg bg-label/10 px-3 py-2 text-sm font-medium text-label-dark">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-label px-6 font-semibold text-white transition-colors hover:bg-label-dark disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  error?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        maxLength={name === "name" ? 80 : 254}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="mt-1 block min-h-12 w-full rounded-lg border border-ink/25 bg-cream px-3 text-base aria-[invalid=true]:border-label"
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm font-medium text-label-dark">
          {error}
        </p>
      )}
    </div>
  );
}
