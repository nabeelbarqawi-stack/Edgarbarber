"use client";

import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-xl bg-white p-5 shadow-sm">
        If that email belongs to the site owner, a sign-in link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form action={action} noValidate className="rounded-xl bg-white p-5 shadow-sm">
      <label htmlFor="email" className="block text-sm font-semibold">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        aria-invalid={state.status === "error" ? true : undefined}
        aria-describedby={state.status === "error" ? "login-error" : undefined}
        className="mt-1 block min-h-12 w-full rounded-lg border border-ink/25 bg-cream px-3"
      />
      {state.status === "error" && (
        <p id="login-error" role="alert" className="mt-2 text-sm font-medium text-label-dark">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 font-semibold text-cream disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send sign-in link"}
      </button>
    </form>
  );
}
