/**
 * Site-wide content. Edit this file to change the booking link, shop details, or Edgar's bio.
 * Product details (price, photos, ingredients) are edited in the admin area instead.
 */

/** The only place the booking URL is defined (Constitution II, FR-012). */
export const BOOKING_URL = "https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx";

export const BRAND = {
  name: "Edgar Salazar",
  siteTitle: "Edgar Salazar | Oak and Whiskey Beard Balm",
  description:
    "Homemade Oak and Whiskey Beard Balm by Edgar Salazar, barber at Quality Cuts in Forest Hill, TX. Join the waitlist or book a cut.",
};

export const SHOP = {
  name: "Quality Cuts",
  city: "Forest Hill, TX",
  // TODO(owner): add the street address, e.g. "1234 Example Rd, Forest Hill, TX 76119".
  address: null as string | null,
  // TODO(owner): add shop hours, e.g. [{ days: "Tue–Fri", hours: "10am–7pm" }].
  hours: [] as { days: string; hours: string }[],
};

export const EDGAR = {
  // TODO(owner): replace with Edgar's own words.
  bio: [
    "Edgar Salazar is a barber at Quality Cuts in Forest Hill, TX.",
    "When he isn't behind the chair, he makes his homemade Oak and Whiskey Beard Balm.",
  ],
  video: {
    src: "/video/edgar-cutting.mp4",
    poster: "/video/edgar-cutting-poster.jpg",
    caption: "Edgar with a client at Quality Cuts",
  },
};
