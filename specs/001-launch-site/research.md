# Research: Edgarbarber Launch Site

**Feature**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Date**: 2026-09-30

Square details in the Deferred section were verified against the published `square` Node SDK (v46.0.0) type
definitions (`CreatePaymentLinkRequest`, `CheckoutOptions`, `FulfillmentType`,
`WebhooksHelper`), since Square's developer docs site is not reachable from the build container.

## R1. Owner admin authentication

- **Decision**: Supabase Auth with email magic link. Admin access is granted only to users
  listed in an `admins` table; a SQL helper `is_admin()` is used by every RLS policy and by
  admin route guards (middleware + server-side check). Sign-ups are disabled in Supabase.
- **Rationale**: One owner, no passwords to manage, no extra dependency (Constitution IV).
- **Alternatives considered**: Password auth (worse UX, more to secure); a separate CMS
  (extra service and cost).

## R2. Content and photos

- **Decision**: Product data in the `products` table; photos in a public-read Supabase Storage
  bucket `product-images` with admin-only write. Barber content (bio, hours, address,
  video) lives in `src/content/site.ts` and `public/`, and the booking URL is a single constant
  there (FR-012). Launch photos/video already live in `public/images/product/` and
  `public/video/` and are seeded into the product record.
- **Rationale**: Price and photos change often and must be editable without code (FR-014);
  bio/hours change rarely and are cheaper as a file.
- **Alternatives considered**: Everything in the DB (more admin screens for no current need).

## R3. Freshness after admin edits

- **Decision**: The home page is statically rendered with ISR (`revalidate = 60`), and admin
  saves call `revalidatePath("/")` for an immediate refresh.
- **Rationale**: Fast pages (Constitution III) and changes visible well within 1 minute (SC-005).

## R4. Email

- **Decision**: Resend, sending plain HTML + text templates rendered by small TypeScript
  functions. This release sends one email: waitlist confirmation. Every send
  result is stored (`confirmation_email_status`, `email_error`) so failures show in admin (FR-016). Waitlist emails include an unsubscribe link
  with an HMAC-signed token plus a `List-Unsubscribe` header.
- **Rationale**: Constitution stack; minimal dependencies.

## R5. Waitlist spam protection

- **Decision**: Hidden honeypot field + minimum time-on-form (3 s) + unique email constraint
  (`lower(email)`) + per-IP limit (5 signups/hour) enforced via a count query in the insert
  function.
- **Rationale**: Stops basic bots with no third-party captcha, no cookie banner implications,
  and no extra dependency. Revisit (e.g., Cloudflare Turnstile) only if spam appears.

## R6. Video delivery

- **Decision**: Serve the pre-converted H.264/AAC MP4 (`public/video/edgar-cutting.mp4`,
  ~5.3 MB, 720×1280, 29 s) with `preload="none"`, `controls`, `playsInline`, and the poster
  image. It is placed below the fold in the About section.
- **Rationale**: The original iPhone file was HEVC 10-bit HDR, which Chrome/Android do not play;
  `preload="none"` keeps it from affecting LCP (Constitution III).

## R7. Testing

- **Decision**: Vitest for server logic (waitlist validation and signup, email templates,
  unsubscribe tokens) with the Supabase and Resend clients mocked; Playwright for e2e on mobile
  viewports covering the waitlist, booking link, product content, and admin guard.
- **Rationale**: Constitution VI requires automated coverage of the critical flows; ordering
  tests arrive with the ordering feature.

## R8. Hosting and configuration

- **Decision**: Vercel (preview per PR), Supabase project with migrations in
  `supabase/migrations/`. Secrets only in Vercel/Supabase env settings. Node 20 LTS,
  Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS for styling.
- **Rationale**: Tailwind is the one styling dependency; it avoids hand-writing responsive CSS
  and is the Next.js default, keeping the site owner-maintainable.

## Deferred: Online ordering (future feature)

Kept for the future ordering spec; not built in this release. FR/SC numbers in this section
refer to the pre-revision spec (git history) and will be remapped in the ordering spec.

### D1. Payment: Square hosted checkout

- **Decision**: Use the Square Checkout API `checkout.paymentLinks.create` with a full `order`
  (not `quickPay`), created server-side per checkout attempt. The customer pays on Square's
  hosted page; `checkoutOptions.redirectUrl` returns them to `/order/confirmed`.
- **Rationale**: Owner chose Square; Edgar already has a Square account, so payouts, refunds and
  reporting live in one dashboard. Hosted checkout keeps card data off our servers
  (Constitution V). An `order` lets us set the line item, quantity, fulfillment type, and our own
  reference id.
- **Alternatives considered**: Square Web Payments SDK (embedded card form) — more code and PCI
  surface; `quickPay` links — cannot carry quantity/fulfillment/reference cleanly; Stripe
  Checkout — second payments account for the owner.

### D2. Pickup vs shipping

- **Decision**: The customer picks **Pickup at Quality Cuts** or **Ship to me** on our product
  page *before* redirecting. We then create the payment link with:
  - Pickup: `order.fulfillments = [{ type: "PICKUP", ... }]`, `askForShippingAddress: false`,
    no shipping fee.
  - Shipping: `order.fulfillments = [{ type: "SHIPMENT", ... }]`,
    `checkoutOptions.askForShippingAddress: true`, and
    `checkoutOptions.shippingFee = { name: "Shipping", charge: <flat rate> }`.
- **Rationale**: Square's hosted page does not let the buyer toggle between the two, so the
  choice happens on our side; this also guarantees pickup orders never ask for an address
  (FR-011). The shipping address is collected by Square and read back from the order.
- **Alternatives considered**: Two static payment links (can't enforce stock or quantity);
  collecting the address ourselves (more personal data handled by us).

### D3. Payment confirmation and order recording

- **Decision**: Square webhooks to `POST /api/webhooks/square`, subscribed to `payment.updated`
  (and `payment.created`). On a payment with `status = COMPLETED`, fetch the Square order by
  `payment.order_id`, then call one Postgres function `confirm_order(...)` that inserts the
  order, converts the stock hold, and decrements stock in a single transaction. Idempotent on
  `square_payment_id` (unique).
- Signatures verified with `WebhooksHelper.verifySignature({ requestBody, signatureHeader:
  x-square-hmacsha256-signature, signatureKey, notificationUrl })` using the **raw** request body.
- **Rationale**: Orders are recorded even if the buyer closes the tab after paying (SC-003,
  edge case). The redirect page never creates orders; it only displays status.
- **Alternatives considered**: Creating orders on redirect (lost if the tab closes; spoofable);
  polling Square (slower, more code).

### D4. Preventing overselling with a hosted checkout

- **Decision**: **Stock holds.** When a payment link is created we insert a `stock_hold`
  (quantity, 30-minute expiry) inside a Postgres function that first checks
  `available = stock_count − sum(active holds)`. The product page shows `available`. On payment
  confirmation the hold becomes the order. If a payment completes after its hold expired *and*
  stock is no longer sufficient, the order is still recorded with `needs_attention = true`, the
  owner is alerted in admin, and they refund in Square.
- **Rationale**: Handles two buyers racing for the last tin (edge case, SC-005) without a queue
  or extra service. Expired holds are ignored by the availability query, so no cron is required.
- **Alternatives considered**: Decrement only on webhook (race window for oversell); Square
  Inventory API as source of truth (couples stock edits to the Square dashboard, more calls).

