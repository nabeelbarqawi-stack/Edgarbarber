import { describe, expect, it } from "vitest";
import { productFormSchema, readExistingImages } from "@/lib/product-form";

const valid = {
  name: "Oak and Whiskey Beard Balm",
  tagline: "Luxury oils & butters",
  description: "Homemade.",
  ingredients: "Hemp Seed Oil\n\n Beeswax \n",
  sizeLabel: "62 g / 2 oz",
  price: "20",
};

describe("productFormSchema", () => {
  it("converts price to cents and splits ingredients by line", () => {
    const parsed = productFormSchema.parse(valid);
    expect(parsed.price).toBe(2000);
    expect(parsed.ingredients).toEqual(["Hemp Seed Oil", "Beeswax"]);
  });

  it("accepts cents and rejects bad or zero prices", () => {
    expect(productFormSchema.parse({ ...valid, price: "19.99" }).price).toBe(1999);
    expect(productFormSchema.safeParse({ ...valid, price: "abc" }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, price: "0" }).success).toBe(false);
  });

  it("requires a name of at most 80 characters and at least one ingredient", () => {
    expect(productFormSchema.safeParse({ ...valid, name: "x".repeat(81) }).success).toBe(false);
    expect(productFormSchema.safeParse({ ...valid, ingredients: " \n " }).success).toBe(false);
  });
});

describe("readExistingImages", () => {
  function form(entries: [string, string][]) {
    const fd = new FormData();
    for (const [k, v] of entries) fd.append(k, v);
    return fd;
  }

  it("orders by the order field and drops removed images", () => {
    const result = readExistingImages(
      form([
        ["image_src", "/a.jpg"], ["image_alt", "A"], ["image_order", "2"],
        ["image_src", "/b.jpg"], ["image_alt", "B"], ["image_order", "1"],
        ["image_src", "/c.jpg"], ["image_alt", "C"], ["image_order", "3"],
        ["image_remove", "/c.jpg"],
      ]),
    );
    expect(result.images).toEqual([{ src: "/b.jpg", alt: "B" }, { src: "/a.jpg", alt: "A" }]);
    expect(result.removed).toEqual(["/c.jpg"]);
  });

  it("requires alt text on kept images", () => {
    const result = readExistingImages(form([["image_src", "/a.jpg"], ["image_alt", " "], ["image_order", "1"]]));
    expect(result.error).toMatch(/alt text/);
  });
});
