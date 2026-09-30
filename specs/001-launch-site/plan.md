# Implementation Plan: Edgarbarber Launch Site

**Branch**: `001-launch-site` | **Date**: 2026-09-30 (revised: payment deferred) | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-launch-site/spec.md`

## Summary

A mobile-first Next.js site that makes Edgar Salazar's Oak and Whiskey Beard Balm ($20, 62 g /
2 oz) the hero, with "Join the waitlist" as the main action (confirmation email, unsubscribe),
an About Edgar section with bio, video, address and hours, a "Book with Edgar" link to his
Square booking page on every page, and a small owner admin to edit the product and view/export
the waitlist. Online ordering with Square is deferred to a later feature; its research is kept
in [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node.js 20+

**Primary Dependencies**: Next.js 15 (App Router) + React 19, Tailwind CSS 4,
`@supabase/supabase-js` + `@supabase/ssr`, `resend`, `zod`

**Storage**: Supabase Postgres with RLS (`products`, `waitlist_signups`, `admins`); Supabase
Storage bucket `product-images`; launch media in `public/`

**Testing**: Vitest (server logic), Playwright (e2e, mobile viewports), `@axe-core/playwright`

**Target Platform**: Vercel; modern mobile and desktop browsers

**Project Type**: Web application (single Next.js app: public site + admin)

**Performance Goals**: Mobile LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1

**Constraints**: Service-role key server-only; WCAG 2.1 AA; booking only via the external
Square URL; public pages must render even if Supabase is unavailable (fallback content)

**Scale/Scope**: One product, one admin, a few thousand waitlist signups, ~6 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | How the plan complies | Status |
|-----------|----------------------|--------|
| I. Product-First | Home hero = product photo, name, $20, waitlist CTA above the fold; waitlist is the constitution's sanctioned alternative to ordering while online sales are not offered | ✅ |
| II. Booking Stays External | `BOOKING_URL` constant in `src/content/site.ts`, used by header + About; new tab; no booking data stored | ✅ |
| III. Mobile-First, Fast & Accessible | Tailwind mobile-first layout, `next/image` with priority hero, ISR, video `preload="none"` below the fold, axe tests | ✅ |
| IV. Simple & Owner-Maintainable | One Next.js app; 5 runtime deps (below); product editable in admin; bio/hours in one content file | ✅ |
| V. Trust & Privacy | Only name + email collected, with consent; RLS on every table; writes via server-only key; label-sourced claims only; unsubscribe on every email; IPs stored only as salted hash; no card data at all this release | ✅ |
| VI. Critical Flows Are Tested | Playwright e2e for waitlist signup and booking link; Vitest for waitlist logic, tokens, email template. Ordering tests arrive with ordering | ✅ |

Dependency justification (Principle IV): Tailwind (responsive styling), Supabase JS + SSR
(DB/auth/cookies), `resend` (email), `zod` (shared validation).

**Post-design re-check (after Phase 1)**: ✅ No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-launch-site/
├── plan.md
├── research.md          # R1–R8 + Deferred (Square ordering) D1–D4
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── http-api.md
│   └── emails.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
public/
├── images/product/          # 4 launch product photos
└── video/                   # edgar-cutting.mp4 + poster

src/
├── app/
│   ├── layout.tsx           # header (Book with Edgar), footer
│   ├── page.tsx             # product hero, details, waitlist, About Edgar
│   ├── actions.ts           # joinWaitlist server action
│   ├── unsubscribe/{page.tsx,route.ts}
│   └── admin/
│       ├── login/{page.tsx,actions.ts}
│       ├── auth/callback/route.ts
│       ├── page.tsx         # product editor + summary
│       ├── actions.ts       # updateProduct, signOut
│       └── waitlist/{page.tsx,export/route.ts}
├── components/              # SiteHeader, ProductHero, ProductDetails, WaitlistForm, BookingLink, AboutEdgar
├── content/{site.ts,product.ts}
├── lib/
│   ├── env.ts
│   ├── supabase/{server.ts,admin.ts,middleware.ts}
│   ├── products.ts          # getFeaturedProduct (DB → fallback)
│   ├── waitlist.ts          # validation + signup orchestration
│   ├── email.ts             # Resend send + waitlist template
│   ├── tokens.ts            # unsubscribe HMAC
│   └── format.ts
└── middleware.ts            # protects /admin

supabase/
├── migrations/0001_init.sql # tables, RLS, functions, storage bucket
├── seed.sql                 # launch product
└── seed-admin.sql           # how to register the owner

tests/
├── unit/                    # Vitest
└── e2e/                     # Playwright
```

**Structure Decision**: Single Next.js project at the repo root; Supabase schema in
`supabase/`; tests in `tests/unit` and `tests/e2e`.

## Complexity Tracking

No constitution violations to justify.
