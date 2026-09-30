import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Owner sign-in", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-bold uppercase">Owner sign-in</h1>
      <p className="mt-2 mb-6 text-ink-muted">We&apos;ll email you a one-time sign-in link.</p>
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-label/10 px-3 py-2 text-sm font-medium text-label-dark">
          {error === "not-admin"
            ? "That account doesn't have admin access."
            : "That sign-in link didn't work or has expired. Please request a new one."}
        </p>
      )}
      <LoginForm />
    </div>
  );
}
