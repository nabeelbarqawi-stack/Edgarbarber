import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { PRODUCT_COLUMNS, toProduct } from "@/lib/products";
import { AdminNav } from "./AdminNav";
import { updateProduct } from "./actions";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

const input = "mt-1 block w-full rounded-lg border border-ink/25 bg-white px-3 py-2";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { supabase } = await requireAdmin();
  const { saved, error } = await searchParams;

  const [{ data: row }, { count: subscribed }, { count: failed }] = await Promise.all([
    supabase.from("products").select(PRODUCT_COLUMNS).order("sort_order").limit(1).maybeSingle(),
    supabase.from("waitlist_signups").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
    supabase.from("waitlist_signups").select("id", { count: "exact", head: true }).eq("confirmation_email_status", "failed"),
  ]);
  const product = row ? toProduct(row) : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl font-bold uppercase">Admin</h1>
      <AdminNav current="product" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link href="/admin/waitlist" className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-ink-muted">On the waitlist</p>
          <p className="text-3xl font-bold">{subscribed ?? 0}</p>
        </Link>
        <Link href="/admin/waitlist" className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-ink-muted">Emails that failed</p>
          <p className={`text-3xl font-bold ${failed ? "text-label" : ""}`}>{failed ?? 0}</p>
        </Link>
      </div>

      {saved && (
        <p role="status" className="mt-6 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-900">
          Saved. The site will show your changes within a minute.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-label/10 px-3 py-2 text-sm font-medium text-label-dark">
          {error}
        </p>
      )}

      {!product ? (
        <p className="mt-6">No product found. Run <code>supabase/seed.sql</code> to add the launch product.</p>
      ) : (
        <form action={updateProduct} className="mt-6 space-y-5 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold uppercase">Edit product</h2>
          <input type="hidden" name="productId" value={product.id} />

          <label className="block text-sm font-semibold">
            Name
            <input name="name" defaultValue={product.name} maxLength={80} required className={input} />
          </label>
          <label className="block text-sm font-semibold">
            Tagline
            <input name="tagline" defaultValue={product.tagline} maxLength={160} className={input} />
          </label>
          <label className="block text-sm font-semibold">
            Description
            <textarea name="description" defaultValue={product.description} rows={4} required className={input} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold">
              Price (USD)
              <input
                name="price"
                inputMode="decimal"
                defaultValue={(product.priceCents / 100).toFixed(2)}
                required
                className={input}
              />
            </label>
            <label className="block text-sm font-semibold">
              Size
              <input name="sizeLabel" defaultValue={product.sizeLabel} className={input} />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Ingredients (one per line)
            <textarea name="ingredients" defaultValue={product.ingredients.join("\n")} rows={8} required className={input} />
          </label>

          <fieldset>
            <legend className="text-sm font-semibold">Photos (first photo is the main one)</legend>
            <ul className="mt-2 space-y-3">
              {product.images.map((image, i) => (
                <li key={image.src} className="flex gap-3 rounded-xl border border-ink/10 p-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
                    <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="grid flex-1 gap-2">
                    <input type="hidden" name="image_src" value={image.src} />
                    <label className="text-xs font-semibold">
                      Description (alt text)
                      <input name="image_alt" defaultValue={image.alt} required className={input} />
                    </label>
                    <div className="flex items-center gap-4 text-xs">
                      <label className="font-semibold">
                        Position{" "}
                        <input
                          name="image_order"
                          type="number"
                          min={1}
                          defaultValue={i + 1}
                          className="ml-1 w-16 rounded border border-ink/25 px-2 py-1"
                        />
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" name="image_remove" value={image.src} /> Remove
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 rounded-xl border border-dashed border-ink/25 p-3">
              <label className="text-xs font-semibold">
                Add a photo (JPG, PNG or WebP, up to 5 MB)
                <input name="new_image" type="file" accept="image/jpeg,image/png,image/webp" className="mt-1 block text-sm" />
              </label>
              <label className="text-xs font-semibold">
                Description of the new photo
                <input name="new_image_alt" className={input} />
              </label>
            </div>
          </fieldset>

          <button type="submit" className="inline-flex min-h-12 items-center rounded-full bg-label px-7 font-semibold text-white">
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
