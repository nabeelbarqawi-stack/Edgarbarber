import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductDetails({ product }: { product: Product }) {
  return (
    <section id="details" data-testid="product-details" aria-labelledby="details-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h2 id="details-heading" className="font-display text-3xl font-bold uppercase">
          What&apos;s in the tin
        </h2>
        <div className="mt-6 grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed">{product.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="font-semibold tracking-wide text-ink-muted uppercase">Size</dt>
                <dd className="mt-1 text-base">{product.sizeLabel}</dd>
              </div>
              <div>
                <dt className="font-semibold tracking-wide text-ink-muted uppercase">Price</dt>
                <dd className="mt-1 text-base">{formatPrice(product.priceCents)}</dd>
              </div>
            </dl>
            <h3 className="mt-8 text-sm font-semibold tracking-wide text-ink-muted uppercase">Ingredients</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {product.ingredients.map((ingredient) => (
                <li key={ingredient} className="rounded-full border border-wood/30 bg-white px-3 py-1 text-sm">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {product.images.map((image) => (
              <div key={image.src} className="relative aspect-[4/5] overflow-hidden rounded-xl">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 640px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
