-- Launch product. Content is taken from the product label (spec FR-003).
insert into public.products (slug, name, tagline, description, ingredients, size_label, price_cents, images, sort_order)
values (
  'oak-and-whiskey-beard-balm',
  'Oak and Whiskey Beard Balm',
  'Luxury oils & butters, conditioning for skin',
  'Homemade by Edgar Salazar, barber at Quality Cuts in Forest Hill, TX. A blend of luxury oils and butters made to condition your beard and the skin underneath.',
  array['Hemp Seed Oil', 'Coconut Oil', 'Jojoba Oil', 'Cocoa Butter', 'Shea Butter', 'Beeswax', 'Olive Oil', 'Fragrance'],
  '62 g / 2 oz',
  2000,
  '[
    {"src": "/images/product/balm-tin-window-light.jpg", "alt": "Open tin of Oak and Whiskey Beard Balm beside its red label lid on a wooden table"},
    {"src": "/images/product/balm-oak-leaves-linen.jpg", "alt": "Beard balm tin and lid on linen, surrounded by oak leaves"},
    {"src": "/images/product/balm-stone-flatlay.jpg", "alt": "Top-down view of the open balm tin and lid on sunlit stone"},
    {"src": "/images/product/balm-open-tin-wood-table.jpg", "alt": "Open tin showing the golden balm, with the lid propped behind it and a plant in the background"}
  ]'::jsonb,
  0
)
on conflict (slug) do nothing;
