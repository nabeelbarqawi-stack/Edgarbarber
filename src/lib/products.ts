import "server-only";
import { FALLBACK_PRODUCT } from "@/content/product";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { Product, ProductImage } from "@/lib/types";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  size_label: string;
  price_cents: number;
  images: ProductImage[];
};

export const PRODUCT_COLUMNS =
  "id, slug, name, tagline, description, ingredients, size_label, price_cents, images";

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    ingredients: row.ingredients,
    sizeLabel: row.size_label,
    priceCents: row.price_cents,
    images: Array.isArray(row.images) ? row.images.filter((i) => i?.src && i?.alt) : [],
  };
}

/** The product featured on the home page: first active product, or the launch fallback. */
export async function getFeaturedProduct(): Promise<Product> {
  const supabase = createSupabasePublicClient();
  if (!supabase) return FALLBACK_PRODUCT;
  try {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("is_active", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle<ProductRow>();
    if (error || !data) return FALLBACK_PRODUCT;
    const product = toProduct(data);
    return product.images.length ? product : { ...product, images: FALLBACK_PRODUCT.images };
  } catch {
    return FALLBACK_PRODUCT;
  }
}
