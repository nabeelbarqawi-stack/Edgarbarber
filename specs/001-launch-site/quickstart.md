# Quickstart & Validation: Edgarbarber Launch Site

How to run the site locally and prove each user story works. See
[contracts/http-api.md](./contracts/http-api.md) and [data-model.md](./data-model.md) for details.

## Prerequisites

- Node.js 20+ and npm
- A Supabase project (or the Supabase CLI local stack)
- A Resend account (test key is fine; `delivered@resend.dev` accepts test mail)

The public pages run without Supabase or Resend configured (fallback product content); the
waitlist and admin need them.

## Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | server only |
| `RESEND_API_KEY`, `EMAIL_FROM` | email |
| `UNSUBSCRIBE_SECRET`, `IP_HASH_SALT` | random 32+ byte strings |

## Setup

```bash
npm install
# apply supabase/migrations/*.sql and supabase/seed.sql (supabase db push, or SQL editor)
npm run dev
```

Make yourself the owner: sign in once at `/admin/login`, then run the insert documented in
`supabase/seed-admin.sql` with your auth user id.

## Automated checks

```bash
npm run lint && npm run typecheck
npm run test              # Vitest
npm run test:e2e          # Playwright, mobile viewports
```

## Validation scenarios

| # | Story | Steps | Expected |
|---|-------|-------|----------|
| 1 | US1 | Open `/` at 390×844 | Product photo, name, $20.00, "Join the waitlist" visible without scrolling |
| 2 | US1 | Scroll product details | All 4 photos with alt text, tagline, description, 8 ingredients, 62 g / 2 oz |
| 3 | US1 | Submit name + email + consent | Success message; confirmation email with unsubscribe link; row in `/admin/waitlist` |
| 4 | US1 | Submit the same email again | Same success message; no duplicate |
| 5 | US1 | Submit with bad email / no consent | Inline errors; nothing saved |
| 6 | US1 | Click unsubscribe link | Confirmation page; row shows unsubscribed |
| 7 | US2 | Tap "Book with Edgar" in header and About | Opens the Square booking URL in a new tab |
| 8 | US2 | Open About section | Bio, address, hours, video with poster and controls (no autoplay) |
| 9 | US3 | Visit `/admin` signed out | Redirect to `/admin/login` |
| 10 | US3 | Change price, save | Public page shows new price within 1 minute |
| 11 | US3 | Export waitlist | CSV downloads with subscribed signups |

## Performance & accessibility

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --form-factor=mobile   # LCP ≤ 2.5 s, CLS ≤ 0.1
```

Axe accessibility checks run inside `npm run test:e2e`.
