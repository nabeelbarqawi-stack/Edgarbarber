import { requireAdmin } from "@/lib/admin";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("name, email, created_at")
    .is("unsubscribed_at", null)
    .order("created_at", { ascending: true })
    .returns<{ name: string; email: string; created_at: string }[]>();
  if (error) return new Response("Could not export the waitlist.", { status: 500 });

  const csv = toCsv(
    ["name", "email", "signed_up_at"],
    (data ?? []).map((s) => [s.name, s.email, s.created_at]),
  );
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
