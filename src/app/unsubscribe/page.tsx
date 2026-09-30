import type { Metadata } from "next";
import Link from "next/link";
import { BookingLink } from "@/components/BookingLink";
import { unsubscribe } from "@/lib/unsubscribe";

export const metadata: Metadata = {
  title: "Unsubscribe | Edgar Salazar",
  robots: { index: false },
};

const copy = {
  unsubscribed: {
    title: "You're unsubscribed",
    body: "You won't get any more waitlist emails from us. If you change your mind, you can join again anytime.",
  },
  invalid: {
    title: "That link didn't work",
    body: "This unsubscribe link is invalid or incomplete. Try the link in your most recent email again.",
  },
  unavailable: {
    title: "Something went wrong",
    body: "We couldn't process your request right now. Please try again in a few minutes.",
  },
};

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const result = await unsubscribe(token ?? null);
  const { title, body } = copy[result];

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-label uppercase">{title}</h1>
      <p className="mt-4 text-lg text-ink-muted">{body}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-11 items-center rounded-full border-2 border-ink px-5 font-semibold">
          Back to the site
        </Link>
        <BookingLink />
      </div>
    </div>
  );
}
