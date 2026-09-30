export type ProductImage = { src: string; alt: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  sizeLabel: string;
  priceCents: number;
  images: ProductImage[];
};
