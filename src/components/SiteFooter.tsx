import { BookingLink } from "@/components/BookingLink";
import { SHOP } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-wood-dark text-cream">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold tracking-wide uppercase">Edgar Salazar</p>
          <p className="text-sm text-cream/80">
            {SHOP.name} · {SHOP.city}
          </p>
        </div>
        <BookingLink variant="outline-light" />
      </div>
      <p className="border-t border-cream/15 px-4 py-4 text-center text-xs text-cream/70">
        © {new Date().getFullYear()} Edgar Salazar. Homemade in Forest Hill, TX.
      </p>
    </footer>
  );
}
