# Implementation Plan: Edgarbarber Launch Site

**Branch**: `001-launch-site` | **Date**: 2026-09-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-launch-site/spec.md`

## Summary

A mobile-first Next.js site that makes Edgar Salazar's Oak and Whiskey Beard Balm ($20, 62 g /
2 oz) the hero, sells it through Square's hosted checkout with a choice of free pickup at
Quality Cuts or flat-rate shipping, captures a waitlist when sold out or for new batches, shows
Edgar's bio, gallery and video with a "Book with Edgar" link to his Square booking page, and
gives the owner a small admin area for product, stock, orders and waitlist. Orders are recorded
only from signed Square webhooks; 30-minute stock holds prevent overselling
([research.md](./research.md) R1–R4).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node.js 20 LTS

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Tailwind CSS, `@supabase/supabase-js`
+ `@supabase/ssr`, `square` (Node SDK v46), `resend`, `zod` (input validation)

**Storage**: Supabase Postgres with RLS (products, shop_settings, stock_holds, orders,
waitlist_signups, admins); Supabase Storage bucket `product-images`; static media in `public/`

**Testing**: Vitest (unit/integration of server logic), Playwright (e2e, mobile viewports,
Square sandbox), `@axe-core/playwright` (accessibility)

**Target Platform**: Vercel (serverless + edge CDN); modern mobile and desktop browsers

**Project Type**: Web application (single Next.js app: public site + admin + API routes)

**Performance Goals**: Mobile LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1; checkout redirect ≤ 2 s

**Constraints**: No card data on our servers; service-role and Square keys server-only; WCAG
2.1 AA; booking handled only by the external Square booking URL

**Scale/Scope**: One product, one admin, low hundreds of orders/month, ~10 pages/screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How the plan complies | Status |
|-----------|----------------------|--------|
| I. Product-First | Home hero = product photo, name, $20, Order/waitlist CTA above the fold; sticky mobile CTA; About content sits below | ✅ |
| II. Booking Stays External | `BOOKING_URL` constant in `src/content/site.ts`, used by header + About; new tab; no booking data stored | ✅ |
| III. Mobile-First, Fast & Accessible | Tailwind mobile-first layout, `next/image`, ISR, video `preload="none"` below the fold, axe tests, Lighthouse budget | ✅ |
| IV. Simple & Owner-Maintainable | One Next.js app; 6 runtime deps each justified (below); product/stock/photos editable in admin; bio/hours in one content file | ✅ |
| V. Trust & Privacy | Square hosted checkout; RLS on every table; writes via security-definer functions with server-only key; minimal fields; label-sourced claims only; unsubscribe on waitlist email; IPs stored only as salted hash | ✅ |
| VI. Critical Flows Are Tested | Playwright e2e for order (pickup + shipping), waitlist, booking link; Vitest for webhook, holds, emails, tokens | ✅ |

Dependency justification (Principle IV): Tailwind (responsive styling without custom CSS
framework), Supabase JS + SSR (DB/auth/cookies), `square` (typed checkout + webhook signature
helper), `resend` (email), `zod` (one validation library shared by forms and API).

**Post-design re-check (after Phase 1)**: ✅ No violations. Data model and contracts add no new
services; stock holds are plain Postgres rows and need no scheduler.

## Project Structure

### Documentation (this feature)

```text
specs/001-launch-site/
├── plan.md              # This file
├── research.md          # Phase 0: decisions R1–R12
├── data-model.md        # Phase 1: tables, functions, RLS
├── quickstart.md        # Phase 1: setup + validation scenarios
├── contracts/
│   ├── http-api.md      # checkout, webhook, waitlist, unsubscribe, admin routes
│   └── emails.md        # transactional email templates
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
public/
├── images/product/          # 4 launch product photos (committed)
└── video/                   # edgar-cutting.mp4 + poster (committed)

src/
├── app/
│   ├── layout.tsx           # header with Book with Edgar, footer
│   ├── page.tsx             # home: product hero, details, waitlist, About Edgar
│   ├── order/confirmed/page.tsx
│   ├── unsubscribe/route.ts # GET + POST one-click
│   ├── api/
│   │   ├── checkout/route.ts
│   │   └── webhooks/square/route.ts
│   └── admin/
│       ├── login/page.tsx
│       ├── page.tsx
│       ├── product/page.tsx
│       ├── settings/page.tsx
│       ├── orders/page.tsx
│       └── waitlist/{page.tsx,export/route.ts}
├── components/              # ProductHero, OrderForm, WaitlistForm, BookingLink, Gallery, VideoCard
├── content/site.ts          # BOOKING_URL, address, hours, bio, gallery, video
├── lib/
│   ├── supabase/{server.ts,browser.ts,admin.ts}
│   ├── square.ts            # client, createPaymentLink, verifyWebhook
│   ├── orders.ts            # hold + confirm orchestration
│   ├── waitlist.ts
│   ├── email/{send.ts,templates/*.ts}
│   ├── tokens.ts            # unsubscribe HMAC
│   └── validation.ts        # zod schemas
└── middleware.ts            # protects /admin

supabase/
├── migrations/              # tables, RLS, functions, storage bucket
└── seed.sql                 # product ($20, label content, launch photos), shop_settings

tests/
├── unit/                    # Vitest
└── e2e/                     # Playwright: order, waitlist, booking, admin, a11y
scripts/
└── webhook-replay.ts        # posts signed sandbox events locally
```

**Structure Decision**: Single Next.js project at the repo root (public site, admin, and API
routes together); Supabase schema in `supabase/`; tests split into `tests/unit` and
`tests/e2e`. No separate backend service is needed.

## Complexity Tracking

No constitution violations to justify.
