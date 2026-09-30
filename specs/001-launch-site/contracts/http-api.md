# HTTP Contracts: Edgarbarber Launch Site

All endpoints are Next.js route handlers or server actions under the site origin. JSON bodies,
UTF-8. Errors use `{ "error": { "code": string, "message": string } }` with the status shown.
Money is integer cents (USD).

## POST /api/checkout

Creates a stock hold and a Square payment link, then the client redirects to `url`.

Request:

```json
{ "productSlug": "oak-and-whiskey-beard-balm", "quantity": 2, "fulfillment": "pickup" }
```

- `quantity`: integer, 1 … min(available, max_per_order)
- `fulfillment`: `"pickup"` | `"shipping"` (must be enabled in `shop_settings`)

Responses:

| Status | Body | When |
|--------|------|------|
| 200 | `{ "url": "https://square.link/u/…", "holdId": "uuid", "expiresAt": "ISO" }` | hold + link created |
| 400 | `invalid_request` | bad quantity / fulfillment / slug |
| 409 | `insufficient_stock` + `{ "available": n }` | not enough available |
| 409 | `fulfillment_unavailable` | shipping disabled (no fee set) |
| 502 | `payment_provider_unavailable` | Square error; hold is released |

Square link parameters: `order.location_id`, `order.reference_id = holdId`, one line item
(name, quantity, `base_price_money`), `order.fulfillments[0].type = PICKUP | SHIPMENT`;
`checkoutOptions.redirectUrl = {SITE_URL}/order/confirmed?hold={holdId}`,
`askForShippingAddress = (fulfillment == shipping)`, `shippingFee` for shipping,
`allowTipping = false`; `idempotencyKey = holdId`.

## POST /api/webhooks/square

Receives Square event notifications.

- Headers: `x-square-hmacsha256-signature` (required).
- Body is read raw and verified with `WebhooksHelper.verifySignature` against
  `SQUARE_WEBHOOK_SIGNATURE_KEY` and `SQUARE_WEBHOOK_URL`.
- Handled events: `payment.created`, `payment.updated`. Acted on only when
  `data.object.payment.status == "COMPLETED"`.

Behavior: fetch Square order → find hold by `reference_id` → `confirm_order(...)` → send
confirmation email (status recorded) → 200.

| Status | When |
|--------|------|
| 200 | processed, duplicate (already confirmed), or ignored event type/status |
| 401 | signature invalid |
| 500 | transient failure (Square retries) |

## GET /order/confirmed?hold={holdId}

Page. Looks up the order by hold. Shows order number, items, total, and pickup (shop address +
hours) or shipping address. If the webhook hasn't arrived yet, shows "Payment received —
finalizing your order" and refreshes every 3 s for up to 30 s, then tells the customer their
email confirmation is on the way. Never creates orders.

## Server action: joinWaitlist(formData)

Fields: `name` (1–80), `email` (valid), `consent` (must be `on`), `source`
(`sold_out` | `new_batches`), `website` (honeypot, must be empty), `startedAt` (ms timestamp,
≥ 3 s before submit).

Result: `{ ok: true }` for new or existing emails (identical message);
`{ ok: false, fieldErrors: {...} }` for validation errors; `{ ok: false, code:
"rate_limited" }` after 5 signups/hour from one IP. Honeypot/too-fast submissions return
`{ ok: true }` silently without saving.

## GET /unsubscribe?token={token}

`token` = base64url(`signupId.hmacSHA256(signupId, UNSUBSCRIBE_SECRET)`). Valid → sets
`unsubscribed_at`, shows confirmation. Invalid → friendly error page (400). Also accepts
`POST` for one-click `List-Unsubscribe-Post`.

## Admin (authenticated owner only)

All routes under `/admin` require a Supabase session whose user passes `is_admin()`;
otherwise redirect to `/admin/login`. Mutations are server actions that re-check `is_admin()`.

| Route / action | Purpose |
|----------------|---------|
| `/admin/login` | magic-link sign-in form |
| `/admin` | dashboard: counts, orders needing attention, failed emails |
| `/admin/product` · `updateProduct` | edit name, tagline, description, ingredients, size, price, stock, images (upload/reorder/remove with alt text); then `revalidateTag("product")` |
| `/admin/settings` · `updateSettings` | shipping fee, enable shipping / pickup |
| `/admin/orders` · `setOrderStatus(id, status)` | list newest first, filter pickup/shipping; `paid → fulfilled` sends shipped / ready-for-pickup email; `→ refunded` records only |
| `/admin/waitlist` | list signups |
| `GET /admin/waitlist/export` | `text/csv`: `name,email,source,signed_up_at,unsubscribed` (subscribed rows by default) |

## Configuration (single source)

`src/content/site.ts` exports `BOOKING_URL =
"https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx"`, shop address, hours,
bio, gallery, and video paths. Every "Book with Edgar" link imports this constant and renders
`target="_blank" rel="noopener noreferrer"`.
