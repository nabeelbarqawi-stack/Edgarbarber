# HTTP Contracts: Edgarbarber Launch Site

Routes are Next.js pages, route handlers, and server actions under the site origin.

## Server action: joinWaitlist(prevState, formData)

Fields: `name` (1–80 chars, trimmed), `email` (valid, lower-cased), `consent` (must be `on`),
`website` (honeypot, must be empty), `startedAt` (ms timestamp; submit must be ≥ 3 s later).

Result (`WaitlistState`):

| Result | When |
|--------|------|
| `{ status: "success" }` | new signup, existing email (same message), or silent bot rejection (honeypot / too fast) |
| `{ status: "error", fieldErrors: { name?, email?, consent? } }` | validation failure; nothing saved |
| `{ status: "error", message }` | rate limited (5 per hour per IP) or unexpected failure |

Side effects for a new signup: row inserted, confirmation email sent, status recorded
(`sent` / `failed` + error).

## GET /unsubscribe?token={token}

`token` = `{signupId}.{base64url(HMAC-SHA256(signupId, UNSUBSCRIBE_SECRET))}`. Valid → sets
`unsubscribed_at`, shows confirmation page. Invalid → friendly error page.

## POST /api/unsubscribe?token={token}

One-click unsubscribe for `List-Unsubscribe-Post`. 200 `{ result: "unsubscribed" }`,
400 for an invalid token, 503 if the database is unavailable.

## Admin (authenticated owner only)

All routes under `/admin` except `/admin/login` and `/admin/auth/callback` require a Supabase
session whose user passes `is_admin()`; otherwise redirect to `/admin/login`. Mutations are
server actions that re-check `is_admin()`.

| Route / action | Purpose |
|----------------|---------|
| `/admin/login` · `sendMagicLink` | email magic-link sign-in (no sign-ups) |
| `/admin/auth/callback` | exchanges the auth code for a session |
| `/admin` | product editor + waitlist summary (count, failed emails) |
| `updateProduct(formData)` | edit name, tagline, description, ingredients (one per line), size, price, image list (upload, reorder, remove, alt text); then `revalidatePath("/")` |
| `/admin/waitlist` | list signups newest first with status and email-failure flag |
| `GET /admin/waitlist/export` | `text/csv` attachment: `name,email,signed_up_at` for subscribed signups |
| `signOut` | ends session |

## Configuration (single source)

`src/content/site.ts` exports `BOOKING_URL =
"https://square.site/book/3RETERR2XTKY5/quality-cuts-forest-hill-tx"`, shop name, address,
hours, bio, and video paths. Every "Book with Edgar" link imports this constant and renders
`target="_blank" rel="noopener noreferrer"`.

## Fallback content

If Supabase is not configured or unreachable, the home page renders the launch product from
`src/content/product.ts` (same fields as `products`) so the public site never shows an empty
hero. The waitlist form then shows a friendly "signups are temporarily unavailable" error.
