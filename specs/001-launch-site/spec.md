# Feature Specification: Edgarbarber Launch Site

**Feature Branch**: `001-launch-site`

**Created**: 2026-09-30

**Status**: Draft (revised 2026-09-30: online payment deferred)

**Input**: User description: "Edgarbarber launch site: a mobile-first website that highlights Edgar as a barber at Quality Cuts (Forest Hill, TX) and features his all-organic, homemade Oak & Whiskey beard balm. Visitors can (1) see the beard balm as the hero product with photos (owner will supply product pictures), price, description and ingredients; (2) order the balm online through a secure hosted checkout and receive an email order confirmation; (3) join a waitlist (name + email) for when the balm is out of stock or for new batches, receiving a confirmation email; (4) learn about Edgar as a barber (bio, photos of his cuts) and book an appointment by following a prominent link to his Square booking page https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx. The owner needs to see orders and waitlist signups and update product details/stock without editing code."

**Scope revision**: The owner decided to skip online payment for this launch. Item (2),
ordering and checkout, moves to a later feature (see *Deferred: Online Ordering*). In this
release, the waitlist is the product's main call to action.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover the beard balm and join the waitlist (Priority: P1)

A visitor arrives (usually on a phone, from social media or a local search) and immediately
sees the Oak and Whiskey Beard Balm: photos, price, tagline, description, and full ingredient
list. The main action is "Join the waitlist". They enter their name and email, agree to receive
product emails, and get a confirmation email.

**Why this priority**: Showcasing the balm and capturing buyers' contact details is the core
business value until online ordering is added. This story alone is a viable launch.

**Independent Test**: Load the home page on a phone-sized screen, confirm the product and the
waitlist action are visible without scrolling, submit a signup, and confirm the success
message, the confirmation email, and the owner's view of the signup.

**Acceptance Scenarios**:

1. **Given** a visitor opens the home page on a phone, **When** it loads, **Then** the product
   photo, name, price, and a "Join the waitlist" action are visible without scrolling.
2. **Given** the visitor is viewing the product, **When** they open the product details,
   **Then** they see all photos, the tagline, description, full ingredient list, size, and price.
3. **Given** a visitor enters a valid name and email and consents, **When** they submit,
   **Then** they see a success message and receive a confirmation email within 5 minutes.
4. **Given** an email is already on the waitlist, **When** it is submitted again,
   **Then** the visitor sees the same friendly success message and no duplicate is created.
5. **Given** the email is invalid, the name is empty, or consent is not given, **When** the
   visitor submits, **Then** they see a clear inline error and nothing is saved.
6. **Given** a subscriber clicks the unsubscribe link in a waitlist email, **When** the page
   opens, **Then** they are removed from the list and see a confirmation.

---

### User Story 2 - Learn about Edgar and book a cut (Priority: P2)

A visitor wants to know who Edgar is and book a haircut. They read his bio, watch the video of
him with a client, browse photos, see the shop's location and hours, and tap a prominent
"Book with Edgar" button that opens his Square booking page.

**Why this priority**: Edgar's reputation as a barber builds trust in the product and drives
shop bookings; it is simple to deliver because booking already exists on Square.

**Independent Test**: From any page, tap "Book with Edgar" and confirm Edgar's Square booking
page opens in a new tab; view the About section on a phone.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they look at the header or main navigation,
   **Then** a "Book with Edgar" action is visible.
2. **Given** a visitor taps "Book with Edgar", **When** the link opens,
   **Then** it goes to https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx in a
   new tab, leaving the site open.
3. **Given** a visitor opens the About section, **When** it loads, **Then** they see Edgar's
   photo, a short bio, the video with a still preview and play controls, the Quality Cuts
   address in Forest Hill, TX, and shop hours.

---

### User Story 3 - Owner manages the product and waitlist (Priority: P3)

The owner signs in to a private admin area to update the product (price, tagline,
description, ingredients, size, photos) and to view and export the waitlist.

**Why this priority**: Needed to run the site without a developer, but launch can start with
seeded product content while this is finished.

**Independent Test**: Sign in as the owner, change the price, confirm the public page reflects
it, and export the waitlist.

**Acceptance Scenarios**:

1. **Given** someone who is not the owner, **When** they try to open the admin area,
   **Then** they are asked to sign in and cannot see any waitlist data.
2. **Given** the owner is signed in, **When** they change the price, tagline, description,
   ingredients, size, or photos and save, **Then** the public site shows the change within
   1 minute.
3. **Given** the waitlist has signups, **When** the owner opens the waitlist, **Then** they
   see name, email, signup date, and subscription status for each, newest first, and can
   download subscribed signups as a CSV file.
4. **Given** a confirmation email failed to send, **When** the owner views the waitlist,
   **Then** that signup is flagged so they can follow up.

---

### Edge Cases

- A visitor submits the waitlist form repeatedly or with automated spam: repeat submissions are
  deduplicated and obvious bots are rejected without blocking real visitors.
- The confirmation email fails to send: the signup is still saved and flagged for the owner.
- Someone who unsubscribed signs up again: they are re-subscribed.
- A product photo fails to load: the product still shows its name, price, and waitlist action,
  with descriptive alt text.
- The video cannot play on a device: the still preview image and the rest of the page remain
  usable.
- The Square booking page is down: this is outside the site's control; the link still points
  to the configured URL.

## Requirements *(mandatory)*

### Functional Requirements

**Product & content**

- **FR-001**: The home page MUST feature the Oak and Whiskey Beard Balm first, with photo,
  name, price, and the "Join the waitlist" action visible on a phone screen without scrolling.
- **FR-002**: The product details MUST show all owner-supplied photos, tagline, description,
  full ingredient list, size, and price.
- **FR-003**: Product claims (organic, homemade, ingredients) MUST come only from owner-supplied
  content. Launch content, taken from the product label:
  - Name: Oak and Whiskey Beard Balm, by Edgar Salazar
  - Tagline: Luxury oils & butters, conditioning for skin
  - Ingredients: Hemp Seed Oil, Coconut Oil, Jojoba Oil, Cocoa Butter, Shea Butter, Beeswax,
    Olive Oil, Fragrance
  - Size: 62 g / 2 oz tin
  - Price: $20.00
  - Photos: four owner-supplied product photos
- **FR-004**: The site MUST include an About Edgar section with his photo, bio, the Quality
  Cuts address in Forest Hill, TX, and shop hours.
- **FR-005**: The About section MUST include the owner-supplied video of Edgar with a client.
  It MUST NOT autoplay with sound, MUST have visible play controls and a still preview image,
  and MUST NOT delay the product from appearing.

**Waitlist**

- **FR-006**: Visitors MUST be able to join the waitlist with name and email, with explicit
  consent to receive product emails.
- **FR-007**: Each email address MUST appear on the waitlist at most once; resubmitting shows
  the same success message.
- **FR-008**: New waitlist members MUST receive a confirmation email, and every waitlist email
  MUST include a working unsubscribe link that removes them from the list.
- **FR-009**: The waitlist form MUST reject invalid emails, empty names, and missing consent
  with inline errors, and MUST include protection against automated spam signups.

**Booking**

- **FR-010**: A "Book with Edgar" action MUST be visible in the header/navigation of every page
  and within the About section.
- **FR-011**: The booking action MUST open
  https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx in a new tab; the site MUST
  NOT handle booking itself.
- **FR-012**: The booking URL MUST be defined in one place so it can be changed without editing
  multiple pages.

**Owner admin**

- **FR-013**: An admin area MUST be accessible only to the owner after signing in.
- **FR-014**: The owner MUST be able to edit product price, tagline, description, ingredients,
  size, and photos (upload, reorder, remove, with alt text) without editing code.
- **FR-015**: The owner MUST be able to view the waitlist and export subscribed signups as a
  CSV file.
- **FR-016**: The owner MUST be able to see which signups' confirmation emails failed to send.

**Quality**

- **FR-017**: All public pages MUST be usable on phones first and meet WCAG 2.1 AA.
- **FR-018**: Every image MUST have descriptive alternative text.

### Key Entities

- **Product**: The beard balm. Name, tagline, description, ingredients, size, price, ordered
  photos with alt text, and whether it is shown on the site.
- **Waitlist Signup**: A person wanting product updates. Name, email (unique), consent,
  signup date, unsubscribed date, confirmation-email status.
- **Barber Profile / Site Content**: Edgar's bio, photo, video, shop address, hours, and the
  booking URL.
- **Owner**: The single admin who manages the product and the waitlist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor on a phone can join the waitlist in under 30 seconds from landing.
- **SC-002**: 95% of waitlist confirmation emails arrive within 5 minutes.
- **SC-003**: 100% of valid signups are saved and visible to the owner, including ones whose
  confirmation email failed.
- **SC-004**: The home page loads its main content in under 2.5 seconds on a typical mobile
  connection.
- **SC-005**: The owner can update the price or photos and see it live on the site in under
  2 minutes, without developer help.
- **SC-006**: 100% of pages provide a working "Book with Edgar" link to the Square booking page.

## Deferred: Online Ordering *(future feature)*

Out of scope for this release, recorded so it can become its own spec later:

- Order the balm online through Square's hosted checkout, choosing free pickup at Quality Cuts
  or flat-rate US shipping, with order confirmation, "shipped" and "ready for pickup" emails.
- Stock tracking with no overselling, sold-out state, and an orders view in admin.
- The technical research for this is kept in [research.md](./research.md) (Deferred section).

## Assumptions

- There is one product at launch (Oak and Whiskey Beard Balm, 62 g / 2 oz tin, $20.00); the
  design should allow more products later without rework.
- The price is shown for information; there is no online purchase in this release.
- There is a single owner/admin account.
- The owner supplies bio, Edgar's photo, address, and hours; placeholders are used until then.
- Sending a "now available" email blast to the waitlist is out of scope; the owner can export
  the list.
- Booking, rescheduling, and cancellations happen entirely on Square.
- The client shown in the barber video has agreed to appear on the website.
