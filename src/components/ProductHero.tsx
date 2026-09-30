import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductHero({ product }: { product: Product }) {
  const hero = product.images[0];
  return (
    <section data-testid="product-hero" aria-labelledby="product-name" className="bg-parchment">
      <div className="mx-auto grid max-w-5xl gap-4 px-4 pt-3 pb-8 sm:grid-cols-2 sm:items-center sm:gap-10 sm:py-12">
        {hero && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md sm:aspect-[4/5]">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              priority
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover object-[50%_40%]"
            />
          </div>
        )}
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-ink-muted uppercase">Homemade by Edgar Salazar</p>
          <h1 id="product-name" className="mt-1 font-display text-4xl leading-none font-bold text-label uppercase sm:text-6xl">
            {product.name}
          </h1>
          {product.tagline && <p className="mt-2 text-base text-ink-muted sm:text-lg">{product.tagline}</p>}
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatPrice(product.priceCents)}</span>
            {product.sizeLabel && <span className="text-sm text-ink-muted">· {product.sizeLabel} tin</span>}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="#waitlist"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-label px-7 text-base font-semibold text-white shadow-sm transition-colors hover:bg-label-dark"
            >
              Join the waitlist
            </a>
            <a href="#details" className="text-sm font-medium underline underline-offset-4">
              See ingredients
            </a>
          </div>
          <p className="mt-3 text-sm text-ink-muted">Online ordering is coming soon. Get on the list to hear first.</p>
        </div>
      </div>
    </section>
  );
}
