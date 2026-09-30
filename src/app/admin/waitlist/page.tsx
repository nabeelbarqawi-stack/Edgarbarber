import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "../AdminNav";

export const metadata: Metadata = { title: "Waitlist | Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

type Signup = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
  confirmation_email_status: "pending" | "sent" | "failed";
  email_error: string | null;
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/Chicago" });

export default async function WaitlistPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("id, name, email, created_at, unsubscribed_at, confirmation_email_status, email_error")
    .order("created_at", { ascending: false })
    .limit(1000)
    .returns<Signup[]>();
  const signups = data ?? [];
  const subscribed = signups.filter((s) => !s.unsubscribed_at).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl font-bold uppercase">Waitlist</h1>
      <AdminNav current="waitlist" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p>
          <strong>{subscribed}</strong> subscribed · {signups.length - subscribed} unsubscribed
        </p>
        <a
          href="/admin/waitlist/export"
          download
          className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-cream"
        >
          Download CSV
        </a>
      </div>

      {error && <p role="alert" className="mt-4 text-label-dark">Couldn&apos;t load the waitlist: {error.message}</p>}

      {signups.length === 0 ? (
        <p className="mt-6 text-ink-muted">No signups yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Waitlist signups, newest first</caption>
            <thead className="border-b border-ink/10 text-xs tracking-wide text-ink-muted uppercase">
              <tr>
                <th scope="col" className="p-3">Name</th>
                <th scope="col" className="p-3">Email</th>
                <th scope="col" className="p-3">Signed up</th>
                <th scope="col" className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3 break-all">{s.email}</td>
                  <td className="p-3 whitespace-nowrap">{dateFormat.format(new Date(s.created_at))}</td>
                  <td className="p-3">
                    {s.unsubscribed_at ? (
                      <span className="text-ink-muted">Unsubscribed</span>
                    ) : s.confirmation_email_status === "failed" ? (
                      <span className="font-semibold text-label-dark" title={s.email_error ?? undefined}>
                        Email failed
                      </span>
                    ) : (
                      "Subscribed"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
