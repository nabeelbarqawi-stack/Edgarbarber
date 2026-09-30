# Data Model: Edgarbarber Launch Site

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

All tables live in Supabase Postgres (`public` schema) with Row Level Security enabled.
Money is stored as integer cents (USD). Timestamps are `timestamptz`, default `now()`.

## products

| Field | Type | Rules |
|-------|------|-------|
| id | uuid PK | |
| slug | text unique | e.g. `oak-and-whiskey-beard-balm` |
| name | text | required, ≤ 80 chars |
| tagline | text | e.g. "Luxury oils & butters, conditioning for skin" |
| description | text | required |
| ingredients | text[] | required, ≥ 1 item |
| size_label | text | e.g. "62 g / 2 oz" |
| price_cents | int | > 0 (launch: 2000) |
| stock_count | int | ≥ 0 |
| low_stock_threshold | int | default 5 |
| max_per_order | int | default 10 |
| images | jsonb | ordered array of `{ path, alt }`; `alt` required |
| is_active | bool | default true |
| updated_at | timestamptz | |

Derived: `available = stock_count − Σ(active stock_holds.quantity)`; state is **sold out**
when `available = 0`, **low stock** when `available ≤ low_stock_threshold`, else **in stock**.

## shop_settings (single row)

| Field | Type | Rules |
|-------|------|-------|
| id | int PK | always 1 |
| shipping_fee_cents | int | ≥ 0; must be set before shipping is offered |
| shipping_enabled | bool | default false until fee is set |
| pickup_enabled | bool | default true |

## stock_holds

| Field | Type | Rules |
|-------|------|-------|
| id | uuid PK | also sent to Square as `order.reference_id` |
| product_id | uuid FK → products | |
| quantity | int | 1…max_per_order |
| fulfillment | text | `pickup` \| `shipping` |
| square_payment_link_id | text | |
| square_order_id | text unique | |
| expires_at | timestamptz | now() + 30 min |
| status | text | `active` → `converted` \| `expired` |

A hold is **active** when `status = 'active' and expires_at > now()`.

## orders

| Field | Type | Rules |
|-------|------|-------|
| id | uuid PK | |
| order_number | text unique | `EB-` + sequence starting 1001 |
| hold_id | uuid FK → stock_holds | |
| square_order_id | text unique | |
| square_payment_id | text unique | idempotency key for webhook |
| customer_name | text | required |
| customer_email | text | required, valid email |
| fulfillment | text | `pickup` \| `shipping` |
| shipping_address | jsonb null | required iff `fulfillment = 'shipping'` |
| items | jsonb | `[{ product_id, name, quantity, unit_price_cents }]` |
| subtotal_cents, shipping_cents, tax_cents, total_cents | int | total = what Square charged |
| status | text | see state machine |
| needs_attention | bool | true when paid after hold expired and stock was short |
| confirmation_email_status | text | `pending` \| `sent` \| `failed` |
| fulfilled_email_status | text null | same values |
| email_error | text null | last send error, shown in admin |
| created_at, fulfilled_at | timestamptz | |

**State machine**: `paid` → `fulfilled`; `paid` → `refunded`; `fulfilled` → `refunded`.
Only the owner changes status. Entering `fulfilled` sends the shipped / ready-for-pickup email.

## waitlist_signups

| Field | Type | Rules |
|-------|------|-------|
| id | uuid PK | |
| name | text | required, 1–80 chars |
| email | text | required, valid; unique on `lower(email)` |
| consent | bool | must be true |
| source | text | `sold_out` \| `new_batches` |
| ip_hash | text | SHA-256 of IP + secret salt, for rate limiting only |
| unsubscribed_at | timestamptz null | |
| confirmation_email_status | text | `pending` \| `sent` \| `failed` |
| email_error | text null | |
| created_at | timestamptz | |

Resubmitting an existing email returns success without creating a row (FR-014); if that
email had unsubscribed, it is re-subscribed.

## admins

| Field | Type | Rules |
|-------|------|-------|
| user_id | uuid PK FK → auth.users | the owner's Supabase Auth user |

## Database functions (security definer, called with service role from server code)

- `is_admin() → bool` — true when `auth.uid()` is in `admins`.
- `create_stock_hold(product_id, quantity, fulfillment) → stock_holds` — locks the product
  row, checks `available ≥ quantity` and `quantity ≤ max_per_order`, inserts the hold; raises
  `insufficient_stock` otherwise.
- `confirm_order(hold_id, square_order_id, square_payment_id, customer…, amounts…) → orders` —
  idempotent on `square_payment_id`; marks hold `converted`, decrements `stock_count`
  (never below 0), sets `needs_attention` if stock was short, inserts the order.
- `join_waitlist(name, email, consent, source, ip_hash) → { created: bool }` — enforces
  dedupe and the per-IP rate limit.

## Row Level Security

| Table | anon | authenticated admin (`is_admin()`) |
|-------|------|------------------------------------|
| products | select where `is_active` | all |
| shop_settings | select | update |
| stock_holds | none | select |
| orders | none | select, update `status` |
| waitlist_signups | none | select |
| admins | none | select own row |

Writes from public flows (holds, orders, waitlist) happen only through the functions above,
invoked by server code with the service-role key, which never reaches the browser.

## Storage

- Bucket `product-images`: public read; insert/update/delete only when `is_admin()`.
