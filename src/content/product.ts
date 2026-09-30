import type { Product } from "@/lib/types";

/**
 * Launch product, used when the database is not configured or unreachable so the home page
 * never renders without its hero. Keep in sync with supabase/seed.sql.
 */
export const FALLBACK_PRODUCT: Product = {
  id: "fallback-oak-and-whiskey",
  slug: "oak-and-whiskey-beard-balm",
  name: "Oak and Whiskey Beard Balm",
  tagline: "Luxury oils & butters, conditioning for skin",
  description:
    "Homemade by Edgar Salazar, barber at Quality Cuts in Forest Hill, TX. A blend of luxury oils and butters made to condition your beard and the skin underneath.",
  ingredients: [
    "Hemp Seed Oil",
    "Coconut Oil",
    "Jojoba Oil",
    "Cocoa Butter",
    "Shea Butter",
    "Beeswax",
    "Olive Oil",
    "Fragrance",
  ],
  sizeLabel: "62 g / 2 oz",
  priceCents: 2000,
  images: [
    {
      src: "/images/product/balm-tin-window-light.jpg",
      alt: "Open tin of Oak and Whiskey Beard Balm beside its red label lid on a wooden table",
    },
    {
      src: "/images/product/balm-oak-leaves-linen.jpg",
      alt: "Beard balm tin and lid on linen, surrounded by oak leaves",
    },
    {
      src: "/images/product/balm-stone-flatlay.jpg",
      alt: "Top-down view of the open balm tin and lid on sunlit stone",
    },
    {
      src: "/images/product/balm-open-tin-wood-table.jpg",
      alt: "Open tin showing the golden balm, with the lid propped behind it and a plant in the background",
    },
  ],
};
