# Feature Specification: Edgarbarber Launch Site

**Feature Branch**: `001-launch-site`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Edgarbarber launch site: a mobile-first website that highlights Edgar as a barber at Quality Cuts (Forest Hill, TX) and features his all-organic, homemade Oak & Whiskey beard balm. Visitors can (1) see the beard balm as the hero product with photos (owner will supply product pictures), price, description and ingredients; (2) order the balm online through a secure hosted checkout and receive an email order confirmation; (3) join a waitlist (name + email) for when the balm is out of stock or for new batches, receiving a confirmation email; (4) learn about Edgar as a barber (bio, photos of his cuts) and book an appointment by following a prominent link to his Square booking page https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx. The owner needs to see orders and waitlist signups and update product details/stock without editing code."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and order the beard balm (Priority: P1)

A visitor arrives (usually on a phone, from social media or a local search) and immediately
sees the Oak & Whiskey beard balm: photos, price, a short description, and the full ingredient
list. They choose a quantity, go through a secure checkout, pay, and receive an order
confirmation by email.

**Why this priority**: Selling the balm is the site's main business goal. This story alone is a
viable launch.

**Independent Test**: Load the home page on a phone-sized screen, confirm the product is visible
without scrolling, complete a test purchase, and confirm the confirmation page and email arrive
and the order appears for the owner.

**Acceptance Scenarios**:

1. **Given** the balm is in stock, **When** a visitor opens the home page on a phone,
   **Then** the product photo, name, price, and an "Order" action are visible without scrolling.
2. **Given** the visitor is viewing the product, **When** they open the product details,
   **Then** they see all photos, the description, the full ingredient list, size, and price.
3. **Given** the balm is in stock, **When** the visitor selects a quantity and completes
   payment, **Then** they see an order confirmation page with an order number, and receive a
   confirmation email within 5 minutes listing items, total paid, and fulfillment details.
4. **Given** the visitor abandons or cancels payment, **When** they return to the site,
   **Then** no order is recorded and no stock is used, and they can try again.
5. **Given** only 2 units are left, **When** a visitor tries to order 3,
   **Then** they are told only 2 are available and cannot check out more than that.

---

### User Story 2 - Join the waitlist (Priority: P2)

When the balm is sold out, or a visitor wants to hear about new batches, they enter their name
and email to join the waitlist and receive a confirmation email.

**Why this priority**: Homemade batches will sell out; the waitlist captures demand instead of
losing it.

**Independent Test**: Mark the balm out of stock, confirm the order action is replaced by the
waitlist form, submit a signup, and confirm the email and the owner's view of the signup.

**Acceptance Scenarios**:

1. **Given** the balm is out of stock, **When** a visitor views the product,
   **Then** ordering is unavailable, the product is labelled "Sold out", and the waitlist
   form is shown in its place.
2. **Given** the balm is in stock, **When** a visitor scrolls the home page,
   **Then** a "Get notified about new batches" waitlist signup is still available.
3. **Given** a visitor enters a valid name and email and consents, **When** they submit,
   **Then** they see a success message and receive a confirmation email within 5 minutes.
4. **Given** an email is already on the waitlist, **When** it is submitted again,
   **Then** the visitor sees the same friendly success message and no duplicate entry is created.
5. **Given** the email is invalid or the name is empty, **When** the visitor submits,
   **Then** they see a clear inline error and nothing is saved.

---

### User Story 3 - Learn about Edgar and book a cut (Priority: P2)

A visitor wants to know who Edgar is and book a haircut. They read his bio, browse photos of his
cuts, see the shop's location and hours, and tap a prominent "Book with Edgar" button that opens
his Square booking page.

**Why this priority**: Edgar's reputation as a barber builds trust in the product and drives
shop bookings; it is simple to deliver because booking already exists on Square.

**Independent Test**: From any page, tap "Book with Edgar" and confirm Edgar's Square booking
page opens in a new tab; view the About section and gallery on a phone.

**Acceptance Scenarios**:

1. **Given** a visitor is on any page, **When** they look at the header or main navigation,
   **Then** a "Book with Edgar" action is visible.
2. **Given** a visitor taps "Book with Edgar", **When** the link opens,
   **Then** it goes to https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx in a
   new tab, leaving the site open.
3. **Given** a visitor opens the About section, **When** it loads,
   **Then** they see Edgar's photo, a short bio, a gallery of his cuts, the Quality Cuts
   address in Forest Hill, TX, and shop hours.

---

### User Story 4 - Owner manages product, orders, and waitlist (Priority: P3)

The owner signs in to a private admin area to update the product (price, description,
ingredients, photos, stock count), view and update orders, and view or export the waitlist.

**Why this priority**: Needed to run the business without a developer, but a first launch can
start with seeded product data while this is finished.

**Independent Test**: Sign in as the owner, change the price and stock, confirm the public page
reflects it, mark an order as shipped, and export the waitlist.

**Acceptance Scenarios**:

1. **Given** someone who is not the owner, **When** they try to open the admin area,
   **Then** they are asked to sign in and cannot see any orders or waitlist data.
2. **Given** the owner is signed in, **When** they change the price, description, ingredients,
   photos, or stock count and save, **Then** the public site shows the change within 1 minute.
3. **Given** the owner sets stock to 0, **When** a visitor views the product,
   **Then** it shows "Sold out" with the waitlist form.
4. **Given** new orders exist, **When** the owner opens the orders list,
   **Then** they see each order's number, date, customer name, email, items, total,
   fulfillment details, and status, newest first.
5. **Given** an order is "Paid", **When** the owner marks it "Fulfilled",
   **Then** its status updates and the customer receives a "your order is on its way / ready"
   email.
6. **Given** the waitlist has signups, **When** the owner opens the waitlist,
   **Then** they see name, email, and signup date for each, and can download them as a CSV file.

---

### Edge Cases

- Two customers try to buy the last unit at the same time: only one order succeeds; the other
  is told it just sold out and is offered the waitlist.
- Payment succeeds but the visitor closes the browser before the confirmation page: the order is
  still recorded and the confirmation email is still sent.
- The confirmation email fails to send: the order or signup is still saved and the failure is
  visible to the owner so they can follow up.
- The payment provider is unavailable: the visitor sees a friendly error and is offered the
  waitlist; no order is recorded.
- A visitor submits the waitlist form repeatedly or with automated spam: repeat submissions are
  deduplicated and obvious bots are rejected without blocking real visitors.
- A product photo fails to load: the product still displays its name, price, and order action
  with descriptive alt text.
- The Square booking page is down: this is outside the site's control; the link still points to
  the configured URL.

## Requirements *(mandatory)*

### Functional Requirements

**Product & content**

- **FR-001**: The home page MUST feature the Oak & Whiskey beard balm first, with photo, name,
  price, and an order (or waitlist) action visible on a phone screen without scrolling.
- **FR-002**: The product details MUST show all owner-supplied photos, description, full
  ingredient list, size/weight, price, and stock state (in stock / low stock / sold out).
- **FR-003**: Product claims (organic, homemade, ingredients) MUST come only from owner-supplied
  content.
- **FR-004**: The site MUST include an About Edgar section with his photo, bio, a gallery of his
  cuts, the Quality Cuts address in Forest Hill, TX, and shop hours.

**Ordering**

- **FR-005**: Visitors MUST be able to order the balm in a quantity from 1 up to the lesser of
  the available stock and a per-order limit of 10.
- **FR-006**: Payment MUST happen on a secure hosted checkout; the site MUST NOT collect or
  store card details.
- **FR-007**: An order MUST be recorded only after payment is confirmed, and stock MUST be
  reduced by the quantity purchased at that moment.
- **FR-008**: The site MUST NOT sell more units than are in stock.
- **FR-009**: After payment, the customer MUST see a confirmation page with an order number and
  MUST receive a confirmation email listing items, total paid, and fulfillment details.
- **FR-010**: Orders MUST support [NEEDS CLARIFICATION: How do customers get the balm — shipped
  to them, picked up at Quality Cuts, or either at their choice?]
- **FR-011**: Checkout MUST collect only the customer's name, email, and (when shipping) the
  shipping address, plus what the payment provider requires.

**Waitlist**

- **FR-012**: Visitors MUST be able to join the waitlist with name and email, with explicit
  consent to receive product emails.
- **FR-013**: When the balm is sold out, the waitlist form MUST replace the order action; when
  in stock, a waitlist signup for new batches MUST remain available.
- **FR-014**: Each email address MUST appear on the waitlist at most once.
- **FR-015**: New waitlist members MUST receive a confirmation email, and every waitlist email
  MUST include a working unsubscribe link that removes them from the list.
- **FR-016**: The waitlist form MUST reject invalid emails and empty names with inline errors
  and MUST include protection against automated spam signups.

**Booking**

- **FR-017**: A "Book with Edgar" action MUST be visible in the header/navigation of every page
  and within the About section.
- **FR-018**: The booking action MUST open
  https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx in a new tab; the site MUST
  NOT handle booking itself.
- **FR-019**: The booking URL MUST be defined in one place so it can be changed without editing
  multiple pages.

**Owner admin**

- **FR-020**: An admin area MUST be accessible only to the owner after signing in.
- **FR-021**: The owner MUST be able to edit product price, description, ingredients, size,
  photos (upload, reorder, remove), and stock count without editing code.
- **FR-022**: The owner MUST be able to view all orders (newest first) with number, date,
  customer, items, total, fulfillment details, and status, and change status from "Paid" to
  "Fulfilled", which sends the customer a notification email.
- **FR-023**: The owner MUST be able to view the waitlist and export it as a CSV file.
- **FR-024**: The owner MUST be able to see when a confirmation email failed to send.

**Quality**

- **FR-025**: All public pages MUST be usable on phones first and meet WCAG 2.1 AA.
- **FR-026**: Every image MUST have descriptive alternative text.

### Key Entities

- **Product**: The beard balm. Name, description, ingredients, size, price, stock count,
  ordered photos, and whether it is currently orderable.
- **Order**: A paid purchase. Order number, date, customer name and email, fulfillment method
  and (if shipped) shipping address, line items (product, quantity, unit price), total paid,
  status (Paid, Fulfilled, Refunded), and confirmation-email status.
- **Waitlist Signup**: A person wanting product updates. Name, email (unique), consent,
  signup date, unsubscribed flag, confirmation-email status.
- **Barber Profile / Site Content**: Edgar's bio, photo, gallery images, shop address, hours,
  and the booking URL.
- **Owner**: The single admin who manages products, orders, and the waitlist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor on a phone can go from landing on the home page to a completed
  purchase in under 3 minutes.
- **SC-002**: A visitor can join the waitlist in under 30 seconds.
- **SC-003**: 100% of paid orders are recorded and visible to the owner, including orders where
  the customer closed the browser after paying.
- **SC-004**: 95% of confirmation emails (orders and waitlist) arrive within 5 minutes.
- **SC-005**: Zero oversold units: completed orders never exceed available stock.
- **SC-006**: The home page loads its main content in under 2.5 seconds on a typical mobile
  connection.
- **SC-007**: The owner can update price or stock and see it live on the site in under 2 minutes,
  without developer help.
- **SC-008**: 100% of pages provide a working "Book with Edgar" link to the Square booking page.

## Assumptions

- There is one product at launch (Oak & Whiskey beard balm, one size); the design should allow
  more products later without rework.
- Customers are in the United States; prices are in USD. Sales tax and shipping costs, if any,
  are calculated by the hosted checkout using owner-configured rates.
- Customers check out as guests; there are no customer accounts in this feature.
- There is a single owner/admin account.
- The owner supplies product photos, description, ingredients, price, size, bio, gallery photos,
  address, and hours; placeholders are used until they are provided.
- Sending a "back in stock" email blast to the waitlist is out of scope; the owner can export
  the list. It may become a later feature.
- Refunds are handled in the payment provider's dashboard; the owner may mark an order
  "Refunded" but the site does not issue refunds itself.
- Booking, rescheduling, and cancellations happen entirely on Square.
