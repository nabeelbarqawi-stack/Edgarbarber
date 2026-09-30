# Quickstart & Validation: Edgarbarber Launch Site

How to run the site locally and prove each user story works. See
[contracts/http-api.md](./contracts/http-api.md) and [data-model.md](./data-model.md) for details.

## Prerequisites

- Node.js 20 LTS and npm
- Supabase CLI (local stack needs Docker) **or** a Supabase dev project
- Square Developer account with a **sandbox** application and sandbox location
- Resend account (a test API key is fine; use `delivered@resend.dev` as the recipient in tests)

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | server only |
| `SQUARE_ENVIRONMENT` | `sandbox` or `production` |
| `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` | server only |
| `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL` | webhook verification |
| `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL` | email |
| `UNSUBSCRIBE_SECRET`, `IP_HASH_SALT` | random 32+ byte strings |

## Setup

```bash
npm install
supabase start            # or link to a dev project
supabase db reset         # applies migrations + seed (product at $20.00, launch photos)
npm run dev
```

Make yourself the owner: sign in once at `/admin/login`, then insert your auth user id into
`admins` (`supabase/seed-admin.sql` documents the one-line insert).

## Automated checks

```bash
npm run lint && npm run typecheck
npm run test              # Vitest: webhook, holds, validation, emails, tokens
npm run test:e2e          # Playwright, mobile viewport (Pixel 7 + iPhone 14)
```

## Validation scenarios

| # | Story | Steps | Expected |
|---|-------|-------|----------|
| 1 | US1 | Open `/` at 390×844 | Product photo, name, $20.00, Order button visible without scrolling |
| 2 | US1 | Choose Pickup, qty 1, Order; pay with Square sandbox card `4111 1111 1111 1111` | Redirect to `/order/confirmed`; order number shown with shop address; pickup confirmation email; order in `/admin/orders`; stock −1 |
| 3 | US1 | Same with Shipping | Square asks for address; total = $20 × qty + shipping fee; confirmation shows address |
| 4 | US1 | Start checkout, cancel on Square | No order; hold expires after 30 min; availability restored |
| 5 | US1 | Set stock 2, request qty 3 | 409 `insufficient_stock`, UI shows "Only 2 left" |
| 6 | US1 | Replay the same signed webhook twice (`npm run webhook:replay`) | One order only |
| 7 | US2 | Set stock 0, open `/` | "Sold out" label; waitlist form replaces Order |
| 8 | US2 | Submit name + email + consent | Success message; confirmation email with unsubscribe link; row in `/admin/waitlist` |
| 9 | US2 | Submit same email again | Same success message; no duplicate |
| 10 | US2 | Click unsubscribe link | Confirmation page; row shows unsubscribed |
| 11 | US3 | Tap "Book with Edgar" on every page | Opens the Square booking URL in a new tab |
| 12 | US3 | Open About section | Photo, bio, gallery, address, hours, video with poster and controls (no autoplay) |
| 13 | US4 | Visit `/admin` signed out | Redirect to `/admin/login` |
| 14 | US4 | Change price and stock, save | Public page reflects change within 1 minute |
| 15 | US4 | Mark pickup order Fulfilled | Status updates; ready-for-pickup email sent |
| 16 | US4 | Export waitlist | CSV downloads with subscribed signups |

## Performance & accessibility

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --preset=perf --form-factor=mobile   # LCP ≤ 2.5 s, CLS ≤ 0.1
npm run test:a11y          # axe checks on /, /admin/login, /order/confirmed
```

## Square webhook (sandbox)

In the Square Developer Dashboard → Webhooks, subscribe `payment.created` and
`payment.updated` to `{PREVIEW_OR_TUNNEL_URL}/api/webhooks/square` and copy the signature key.
For local runs, use the replay script instead of exposing localhost.
