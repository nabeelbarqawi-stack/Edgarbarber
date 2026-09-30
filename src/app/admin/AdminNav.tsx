import Link from "next/link";
import { signOut } from "./actions";

export function AdminNav({ current }: { current: "product" | "waitlist" }) {
  const link = (href: string, label: string, key: typeof current) => (
    <Link
      href={href}
      aria-current={current === key ? "page" : undefined}
      className="rounded-full px-4 py-2 text-sm font-semibold aria-[current=page]:bg-ink aria-[current=page]:text-cream"
    >
      {label}
    </Link>
  );
  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-4">
      <div className="flex gap-1">
        {link("/admin", "Product", "product")}
        {link("/admin/waitlist", "Waitlist", "waitlist")}
      </div>
      <form action={signOut}>
        <button type="submit" className="text-sm font-medium underline underline-offset-4">
          Sign out
        </button>
      </form>
    </nav>
  );
}
