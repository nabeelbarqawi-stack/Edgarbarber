---

description: "Task list for the Edgarbarber launch site (payment deferred)"
---

# Tasks: Edgarbarber Launch Site

**Input**: Design documents from `/specs/001-launch-site/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included. Constitution VI requires automated tests for the waitlist signup and
booking link before release.

**Organization**: Tasks are grouped by user story so each story can be built and tested alone.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = product + waitlist, US2 = About Edgar + booking, US3 = owner admin

Paths are relative to the repository root (single Next.js project).

---

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Create `package.json` (Next.js 15, React 19, TypeScript 5, Tailwind CSS 4 via `@tailwindcss/postcss`, `@supabase/supabase-js`, `@supabase/ssr`, `resend`, `zod`; dev: `vitest`, `@playwright/test`, `@axe-core/playwright`, `eslint`, `eslint-config-next`) with scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`
- [ ] T002 [P] Add `tsconfig.json` (strict, `@/*` → `src/*`), `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`
- [ ] T003 [P] Add `.gitignore` (node_modules, .next, .env*.local, test-results, playwright-report) and `.env.example` listing `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `UNSUBSCRIBE_SECRET`, `IP_HASH_SALT`
- [ ] T004 [P] Add `vitest.config.ts` (node env, `@` alias, `tests/unit/**`) and `playwright.config.ts` (projects: Pixel 7 and iPhone 14 viewports; `webServer` runs `npm run build && npm run start`)
- [ ] T005 [P] Add `src/app/globals.css` with Tailwind import and brand tokens (label red `#b3261e`-range, warm wood brown, cream background, near-black text; all text pairs ≥ 4.5:1 contrast)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ No user story work can begin until this phase is complete**

- [ ] T006 Write `supabase/migrations/0001_init.sql`: `products` (id uuid PK, slug text unique, name text "required, ≤ 80 chars", tagline, description "required", ingredients text[] "required, ≥ 1 item", size_label, price_cents int "> 0", images jsonb "ordered array of { src, alt }; alt required", is_active bool default true, sort_order int default 0, updated_at); `waitlist_signups` (name "required, 1–80 chars", email "required, valid; unique on lower(email)", consent bool "must be true", ip_hash, unsubscribed_at, confirmation_email_status "pending | sent | failed", email_error, created_at); `admins` (user_id PK FK auth.users); `is_admin()`; `join_waitlist(p_name, p_email, p_consent, p_ip_hash)` with 5-per-hour-per-IP limit raising `rate_limited`, upsert on lower(email), re-subscribe, returns (id, created) and executable by `service_role` only; RLS per data-model.md; storage bucket `product-images` (public read, admin write)
- [ ] T007 [P] Write `supabase/seed.sql` inserting the launch product (label content from spec FR-003, price_cents 2000, the four `/images/product/*.jpg` photos with descriptive alt text) and `supabase/seed-admin.sql` documenting the owner insert
- [ ] T008 [P] Implement `src/lib/env.ts` (typed accessors; `isSupabaseConfigured()`, `isEmailConfigured()`; server-only secrets never imported by client code)
- [ ] T009 [P] Implement `src/lib/supabase/server.ts` (cookie-based SSR client), `src/lib/supabase/admin.ts` (service-role client, `server-only`), `src/lib/supabase/middleware.ts` (session refresh helper)
- [ ] T010 [P] Create `src/content/site.ts` exporting `BOOKING_URL = "https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx"`, shop name "Quality Cuts", city "Forest Hill, TX", address/hours placeholders marked TODO for the owner, Edgar's bio placeholder, video + poster paths
- [ ] T011 [P] Create `src/content/product.ts` with the fallback launch product (same shape as `products`) and `src/lib/format.ts` (`formatPrice(cents)` → "$20.00")
- [ ] T012 Implement `src/lib/products.ts` `getFeaturedProduct()` — reads the first active product from Supabase, falls back to `src/content/product.ts` when unconfigured or on error
- [ ] T013 Create `src/components/BookingLink.tsx` (imports `BOOKING_URL`, `target="_blank" rel="noopener noreferrer"`, accessible label "Book with Edgar (opens Square booking in a new tab)") and `src/components/SiteHeader.tsx` + footer, wired into `src/app/layout.tsx` with metadata (title, description, Open Graph image = product photo)

**Checkpoint**: `npm run build` succeeds; layout with header + Book with Edgar renders.

---

## Phase 3: User Story 1 — Discover the balm and join the waitlist (Priority: P1) 🎯 MVP

**Goal**: Product hero + details with "Join the waitlist" as the main action, confirmation
email, unsubscribe.

**Independent Test**: Quickstart scenarios 1–6.

### Tests for User Story 1

- [ ] T014 [P] [US1] Unit tests in `tests/unit/waitlist.test.ts`: schema rejects empty name, name > 80 chars, invalid email, missing consent; lower-cases/trims email; honeypot or < 3 s submit → silent success without DB call; existing email → success, no email sent; new email → email sent and status `sent`; send failure → status `failed` with error; `rate_limited` → error message
- [ ] T015 [P] [US1] Unit tests in `tests/unit/tokens.test.ts` (sign/verify round trip, tampered token rejected) and `tests/unit/email.test.ts` (template escapes HTML in name, contains unsubscribe URL, text alternative present)
- [ ] T016 [P] [US1] E2E in `tests/e2e/home.spec.ts`: at mobile viewport, product image, name, "$20.00", and "Join the waitlist" are within the first viewport; all 4 photos have non-empty alt; 8 ingredients and "62 g / 2 oz" shown; waitlist form shows inline errors for bad email / no consent; axe finds no serious violations

### Implementation for User Story 1

- [ ] T017 [P] [US1] Implement `src/lib/tokens.ts` (`createUnsubscribeToken(id)`, `verifyUnsubscribeToken(token)` with HMAC-SHA256 and timing-safe compare)
- [ ] T018 [P] [US1] Implement `src/lib/email.ts` (`sendWaitlistConfirmation({ name, email, unsubscribeUrl })` via Resend with HTML + text, `List-Unsubscribe` and `List-Unsubscribe-Post` headers; escapes input; returns `{ ok, error? }`)
- [ ] T019 [US1] Implement `src/lib/waitlist.ts` (zod schema; `joinWaitlist(input, deps)` orchestration: bot checks, IP hashing with `IP_HASH_SALT`, `join_waitlist` RPC, email send, status update) with injectable deps for tests
- [ ] T020 [US1] Implement server action `src/app/actions.ts` `joinWaitlist(prevState, formData)` returning `WaitlistState` per contracts/http-api.md; friendly error when Supabase is unconfigured
- [ ] T021 [P] [US1] Build `src/components/ProductHero.tsx` (priority `next/image`, name, tagline, price, "Join the waitlist" anchor to the form; mobile-first above the fold)
- [ ] T022 [P] [US1] Build `src/components/ProductDetails.tsx` (photo gallery of all images with alt text, description, ingredient list, size, "by Edgar Salazar")
- [ ] T023 [P] [US1] Build client component `src/components/WaitlistForm.tsx` (`useActionState`; labelled name/email fields, consent checkbox, hidden honeypot `website`, hidden `startedAt`; inline errors with `aria-describedby`; success message with `role="status"`)
- [ ] T024 [US1] Compose `src/app/page.tsx` (hero → details → waitlist section `id="waitlist"`; ISR `revalidate = 60`)
- [ ] T025 [US1] Implement `src/app/unsubscribe/page.tsx` (GET: verify token, set `unsubscribed_at`, show result) and `src/app/unsubscribe/route.ts`-equivalent POST handler for one-click unsubscribe (place POST at `src/app/api/unsubscribe/route.ts` and point `List-Unsubscribe-Post` there)

**Checkpoint**: US1 fully functional and testable on its own.

---

## Phase 4: User Story 2 — Learn about Edgar and book a cut (Priority: P2)

**Goal**: About Edgar section with bio, video, address, hours; Book with Edgar everywhere.

**Independent Test**: Quickstart scenarios 7–8.

### Tests for User Story 2

- [ ] T026 [P] [US2] E2E in `tests/e2e/booking.spec.ts`: every "Book with Edgar" link on `/` and `/unsubscribe` has the exact `BOOKING_URL`, `target="_blank"`, `rel` contains `noopener`; header link visible at mobile viewport; About section shows bio, address, hours; video has `controls`, `poster`, no `autoplay`, `preload="none"`

### Implementation for User Story 2

- [ ] T027 [US2] Build `src/components/AboutEdgar.tsx` (bio, video card with `controls playsInline preload="none"` + poster + caption, address, hours, BookingLink) and add it to `src/app/page.tsx` below the waitlist

**Checkpoint**: US1 + US2 work independently.

---

## Phase 5: User Story 3 — Owner manages product and waitlist (Priority: P3)

**Goal**: Magic-link admin to edit the product and view/export the waitlist.

**Independent Test**: Quickstart scenarios 9–11.

### Tests for User Story 3

- [ ] T028 [P] [US3] E2E in `tests/e2e/admin.spec.ts`: `/admin` and `/admin/waitlist/export` redirect to `/admin/login` when signed out; login page renders labelled email field
- [ ] T029 [P] [US3] Unit tests in `tests/unit/csv.test.ts` for waitlist CSV (header row, quoting of commas/quotes, formula-injection guard for values starting with `= + - @`)

### Implementation for User Story 3

- [ ] T030 [US3] Implement `src/middleware.ts` (refresh Supabase session; redirect unauthenticated `/admin/*` except `/admin/login` and `/admin/auth/callback`)
- [ ] T031 [US3] Implement `src/lib/admin.ts` `requireAdmin()` (server-side session + `is_admin()` check; redirect otherwise) and `src/lib/csv.ts` (`toCsv(rows)`)
- [ ] T032 [US3] Implement `src/app/admin/login/page.tsx` + `src/app/admin/login/actions.ts` (`sendMagicLink` with `shouldCreateUser: false`) and `src/app/admin/auth/callback/route.ts`
- [ ] T033 [US3] Implement `src/app/admin/page.tsx` + `src/app/admin/actions.ts` (`updateProduct` with zod validation: name ≤ 80, price > 0, ingredients one per line ≥ 1, images with required alt, upload to `product-images`, reorder/remove; `revalidatePath("/")`; `signOut`) and a waitlist summary (count, failed emails)
- [ ] T034 [US3] Implement `src/app/admin/waitlist/page.tsx` (newest first; name, email, date, subscribed/unsubscribed, email-failed flag) and `src/app/admin/waitlist/export/route.ts` (CSV attachment `name,email,signed_up_at` for subscribed rows; `requireAdmin`)

**Checkpoint**: All stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T035 [P] Add `README.md` (what the site is, setup per quickstart.md, env vars, where to edit content, how to register the owner, deferred ordering note)
- [ ] T036 [P] Add `src/app/robots.ts`, `src/app/sitemap.ts`, and favicon/app icon from brand colors
- [ ] T037 Run `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, and `npm run test:e2e`; fix failures
- [ ] T038 Review mobile screenshots of `/` at 390×844 against FR-001 and Constitution I/III

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories.
- **US1 (P1)**: needs Phase 2 only. MVP.
- **US2 (P2)**: needs Phase 2 only (BookingLink from T013); adds a section to `src/app/page.tsx`
  (edit after T024 to avoid conflicts).
- **US3 (P3)**: needs Phase 2 (T006 schema, T009 clients); independent of US1/US2 UI.
- **Polish**: after the stories you intend to ship.

Within each story: tests first (they should fail), then lib → server actions/routes → UI.

## Parallel Opportunities

- Setup: T002, T003, T004, T005 together after T001.
- Foundational: T007–T011 together after T006; T012 after T011; T013 after T010.
- US1: T014–T016 together; T017, T018, T021, T022, T023 together; then T019 → T020 → T024 → T025.
- US3: T028, T029 together; T030–T031 before T032–T034.

## Implementation Strategy

1. **MVP**: Phases 1–3 (US1). Deployable: product showcase + working waitlist.
2. Add US2 (About + booking) — small, high trust value.
3. Add US3 (admin) — until then, the owner can edit via the Supabase dashboard.
4. Polish, then launch. Online ordering follows as a separate feature (002).
