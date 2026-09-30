# Edgarbarber Constitution

Edgarbarber is the website for Edgar, barber at Quality Cuts in Forest Hill, TX. It showcases
his work, sells his all-organic, homemade Oak & Whiskey beard balm, runs a product waitlist, and
sends visitors to his existing booking page.

## Core Principles

### I. Product-First

- The Oak & Whiskey beard balm is the hero of the site. The home page MUST present the product
  (photo, name, price, short description) above the fold on mobile.
- Every page MUST offer a clear path to order the balm or, when it is out of stock or not yet
  released, to join the waitlist.
- Barber content (bio, gallery, reviews) supports the product and the brand; it MUST NOT push
  the ordering/waitlist call-to-action out of reach.

Rationale: selling the balm and growing the waitlist are the site's primary business goals.

### II. Booking Stays External

- Appointments are handled only by Edgar's Square booking page:
  `https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx`.
- The site MUST link out to that URL (opening it in a new tab) and MUST NOT rebuild, embed a
  copy of, or store data for any booking/scheduling system.
- The booking URL MUST live in a single configuration value so it can be changed in one place.

Rationale: Square already manages Edgar's schedule and payments; duplicating it adds cost and
risk with no benefit.

### III. Mobile-First, Fast & Accessible

- Layouts MUST be designed for phone widths first, then enhanced for larger screens.
- Pages MUST meet WCAG 2.1 AA (color contrast, keyboard access, alt text on every product and
  gallery image, labelled form fields).
- Pages MUST target "Good" Core Web Vitals on mobile (LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1);
  images MUST be served through `next/image` or an equivalent optimized pipeline.

Rationale: most visitors arrive from phones via social media and local search.

### IV. Simple & Owner-Maintainable

- Prefer built-in Next.js, Supabase, and platform features over new dependencies; every added
  dependency MUST be justified in the feature's plan.
- Product details (name, price, description, ingredients, photos, stock/waitlist status) and
  barber content MUST be editable in one obvious place (a content file or a Supabase table)
  without touching component code.
- YAGNI: no features, abstractions, or infrastructure beyond what an approved spec requires.

Rationale: a small business site must stay cheap to run and easy for the owner to update.

### V. Trust & Privacy

- Collect only what a flow needs: name and email for the waitlist; name, email, and shipping
  address for orders.
- All customer data in Supabase MUST be protected by Row Level Security; service-role keys MUST
  stay server-side and out of the client bundle and the repository.
- Card data MUST NEVER touch our servers or database; payments MUST go through a hosted,
  PCI-compliant checkout.
- Product claims (organic, homemade, ingredients) MUST be accurate and supplied by the owner;
  no invented reviews, badges, or certifications.
- Marketing email MUST only go to people who opted in, and every such email MUST include an
  unsubscribe link.

Rationale: customers are trusting a small local brand with personal data and money.

### VI. Critical Flows Are Tested

- Ordering, waitlist signup, and the booking link MUST each have automated end-to-end tests
  that pass before any release.
- Server-side logic (order creation, waitlist writes, email sends, payment webhooks) MUST have
  unit or integration tests covering success and failure paths.
- A bug found in a critical flow MUST get a regression test with its fix.

Rationale: a broken checkout or signup silently loses sales.

## Technology & Platform Constraints

- **Framework**: Next.js (App Router) with TypeScript in strict mode.
- **Hosting**: Vercel; every pull request gets a preview deployment.
- **Data & auth**: Supabase (Postgres, RLS, Auth only where a spec requires sign-in).
- **Email**: Resend for transactional email (order confirmations, waitlist confirmations).
- **Payments**: a hosted checkout provider, chosen during planning.
- **Secrets**: kept in Vercel/Supabase environment settings, never committed.
- **Testing**: Playwright for end-to-end flows; a standard unit test runner for server logic.

## Development Workflow & Quality Gates

- Features follow the Spec Kit flow: `/speckit-specify` → (`/speckit-clarify`) →
  `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Each plan MUST include a Constitution Check against the principles above; any deviation MUST
  be recorded with its justification in the plan's Complexity Tracking.
- A pull request may merge only when lint, type-check, and all tests pass and its Vercel preview
  has been checked on a phone-sized viewport.

## Governance

- This constitution overrides other project practices and guidance where they conflict.
- Amendments are made through `/speckit-constitution`, recorded in a pull request, and approved
  by the project owner.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR
  for adding a principle or section or materially expanding guidance, PATCH for clarifications.
- Every spec, plan, and pull request review MUST verify compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-09-30
