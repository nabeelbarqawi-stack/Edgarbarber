import { z } from "zod";
import type { ProductImage } from "@/lib/types";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name must be 80 characters or fewer."),
  tagline: z.string().trim().max(160, "Tagline must be 160 characters or fewer."),
  description: z.string().trim().min(1, "Description is required."),
  ingredients: z
    .string()
    .transform((value) => value.split("\n").map((line) => line.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1, "List at least one ingredient.")),
  sizeLabel: z.string().trim().max(40),
  price: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, "Enter a price like 20 or 20.00.")
    .transform((value) => Math.round(Number(value) * 100))
    .pipe(z.number().int().positive("Price must be more than $0.")),
});

/**
 * Rebuilds the ordered image list from the editor's parallel fields:
 * image_src[i], image_alt[i], image_order[i], and image_remove (values = src to drop).
 */
export function readExistingImages(formData: FormData): { images: ProductImage[]; removed: string[]; error?: string } {
  const srcs = formData.getAll("image_src").map(String);
  const alts = formData.getAll("image_alt").map((v) => String(v).trim());
  const orders = formData.getAll("image_order").map((v) => Number(v));
  const removed = formData.getAll("image_remove").map(String);

  const kept = srcs
    .map((src, i) => ({ src, alt: alts[i] ?? "", order: Number.isFinite(orders[i]) ? orders[i] : i }))
    .filter((image) => !removed.includes(image.src))
    .sort((a, b) => a.order - b.order);

  if (kept.some((image) => !image.alt)) {
    return { images: [], removed, error: "Every photo needs a short description (alt text)." };
  }
  return { images: kept.map(({ src, alt }) => ({ src, alt })), removed };
}
