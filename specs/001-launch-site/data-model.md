# Data Model: Edgarbarber Launch Site

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

All tables live in Supabase Postgres (`public` schema) with Row Level Security enabled.
Money is stored as integer cents (USD). Timestamps are `timestamptz`, default `now()`.
Orders, stock, and shipping tables are deferred with online ordering.

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
| images | jsonb | ordered array of `{ src, alt }`; `alt` required; `src` is a `/images/...` path or a Storage public URL |
| is_active | bool | default true |
| sort_order | int | default 0 |
| updated_at | timestamptz | |

## waitlist_signups

| Field | Type | Rules |
|-------|------|-------|
| id | uuid PK | |
| name | text | required, 1–80 chars |
| email | text | required, valid; unique on `lower(email)` |
| consent | bool | must be true |
| ip_hash | text | SHA-256 of IP + secret salt, for rate limiting only |
| unsubscribed_at | timestamptz null | |
| confirmation_email_status | text | `pending` \| `sent` \| `failed` |
| email_error | text null | |
| created_at | timestamptz | |

Resubmitting an existing email returns success without creating a row (FR-007); if that email
had unsubscribed, `unsubscribed_at` is cleared (re-subscribe).

## admins

| Field | Type | Rules |
|-------|------|-------|
| user_id | uuid PK FK → auth.users | the owner's Supabase Auth user |

## Database functions

- `is_admin() → bool` (security definer) — true when `auth.uid()` is in `admins`.
- `join_waitlist(p_name, p_email, p_consent, p_ip_hash) → table(id uuid, created bool)`
  (security definer, execute granted to `service_role` only) — validates consent, enforces the
  per-IP limit (5 per hour) by raising `rate_limited`, upserts on `lower(email)` and
  re-subscribes if needed. `created` is false for an existing subscribed email.

## Row Level Security

| Table | anon | authenticated admin (`is_admin()`) |
|-------|------|------------------------------------|
| products | select where `is_active` | all |
| waitlist_signups | none | select |
| admins | none | select own row |

Waitlist writes and email-status updates happen only in server code using the service-role
key, which never reaches the browser.

## Storage

- Bucket `product-images`: public read; insert/update/delete only when `is_admin()`.
