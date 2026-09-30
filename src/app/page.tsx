import { ProductDetails } from "@/components/ProductDetails";
import { ProductHero } from "@/components/ProductHero";
import { WaitlistForm } from "@/components/WaitlistForm";
import { getFeaturedProduct } from "@/lib/products";

export const revalidate = 60;

export default async function Home() {
  const product = await getFeaturedProduct();

  return (
    <>
      <ProductHero product={product} />
      <ProductDetails product={product} />

      <section id="waitlist" aria-labelledby="waitlist-heading" className="scroll-mt-20 bg-wood-dark text-cream">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <h2 id="waitlist-heading" className="font-display text-3xl font-bold uppercase sm:text-4xl">
            Get the next batch
          </h2>
          <p className="mt-2 mb-6 text-cream/85">
            Each batch is homemade. Join the waitlist and we&apos;ll email you as soon as the {product.name} is ready.
          </p>
          <div className="text-ink">
            <WaitlistForm renderedAt={Date.now()} />
          </div>
        </div>
      </section>
    </>
  );
}
