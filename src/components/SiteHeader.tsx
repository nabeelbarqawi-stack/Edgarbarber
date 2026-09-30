import Link from "next/link";
import { BookingLink } from "@/components/BookingLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
        <Link href="/" className="font-display text-lg leading-tight font-bold tracking-wide uppercase">
          Edgar Salazar
          <span className="block text-xs font-medium tracking-widest text-ink-muted normal-case">
            Barber · Quality Cuts
          </span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4">
          <Link href="/#about" className="hidden text-sm font-medium underline-offset-4 hover:underline sm:inline">
            About Edgar
          </Link>
          <BookingLink />
        </nav>
      </div>
    </header>
  );
}
