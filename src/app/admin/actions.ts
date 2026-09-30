"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, productFormSchema, readExistingImages } from "@/lib/product-form";

const BUCKET = "product-images";

function fail(message: string): never {
  redirect(`/admin?error=${encodeURIComponent(message)}`);
}

export async function updateProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) fail("Product not found.");

  const parsed = productFormSchema.safeParse({
    name: formData.get("name") ?? "",
    tagline: formData.get("tagline") ?? "",
    description: formData.get("description") ?? "",
    ingredients: formData.get("ingredients") ?? "",
    sizeLabel: formData.get("sizeLabel") ?? "",
    price: formData.get("price") ?? "",
  });
  if (!parsed.success) fail(parsed.error.issues[0]?.message ?? "Please check the form.");

  const existing = readExistingImages(formData);
  if (existing.error) fail(existing.error);
  const images = [...existing.images];

  const upload = formData.get("new_image");
  if (upload instanceof File && upload.size > 0) {
    const ext = ALLOWED_IMAGE_TYPES[upload.type];
    if (!ext) fail("Photos must be JPG, PNG, or WebP.");
    if (upload.size > MAX_UPLOAD_BYTES) fail("Photos must be 5 MB or smaller.");
    const alt = String(formData.get("new_image_alt") ?? "").trim();
    if (!alt) fail("Add a short description (alt text) for the new photo.");

    const path = `products/${randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, upload, { contentType: upload.type });
    if (error) fail(`Photo upload failed: ${error.message}`);
    images.push({ src: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl, alt });
  }
  if (images.length === 0) fail("Keep at least one photo.");

  const { name, tagline, description, ingredients, sizeLabel, price } = parsed.data;
  const { error } = await supabase
    .from("products")
    .update({ name, tagline, description, ingredients, size_label: sizeLabel, price_cents: price, images })
    .eq("id", productId);
  if (error) fail(`Save failed: ${error.message}`);

  // Clean up uploaded photos that were removed (launch photos in /public are left alone).
  const storagePaths = existing.removed
    .map((src) => src.split(`/storage/v1/object/public/${BUCKET}/`)[1])
    .filter((p): p is string => Boolean(p));
  if (storagePaths.length) await supabase.storage.from(BUCKET).remove(storagePaths);

  revalidatePath("/");
  redirect("/admin?saved=1");
}

export async function signOut() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
