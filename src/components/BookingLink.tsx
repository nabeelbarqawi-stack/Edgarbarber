import { BOOKING_URL } from "@/content/site";

type Props = {
  variant?: "solid" | "outline" | "outline-light";
  className?: string;
  children?: React.ReactNode;
};

const styles = {
  solid: "bg-label text-white hover:bg-label-dark",
  outline: "border-2 border-ink text-ink hover:bg-ink hover:text-cream",
  "outline-light": "border-2 border-cream text-cream hover:bg-cream hover:text-wood-dark",
};

/** Links to Edgar's Square booking page. Booking is never handled on this site. */
export function BookingLink({ variant = "solid", className = "", children = "Book with Edgar" }: Props) {
  return (
    <a
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="booking-link"
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-semibold tracking-wide uppercase transition-colors ${styles[variant]} ${className}`}
    >
      {children}
      <span className="sr-only"> (opens Square booking in a new tab)</span>
    </a>
  );
}
