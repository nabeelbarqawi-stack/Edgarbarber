# Email Contracts: Edgarbarber Launch Site

Sent with Resend from `EMAIL_FROM` (e.g. `Edgar Salazar <orders@yourdomain>`). Each send result
is stored on the related row (`*_email_status`, `email_error`). A failed send never rolls back
the order or signup.

| Template | Trigger | To | Must include |
|----------|---------|----|--------------|
| `order-confirmation-pickup` | order confirmed, fulfillment = pickup | customer | order number, items × qty, total paid, "Pick up at Quality Cuts" + address + hours, note that we'll email when it's ready |
| `order-confirmation-shipping` | order confirmed, fulfillment = shipping | customer | order number, items × qty, shipping fee, total paid, shipping address |
| `order-ready-for-pickup` | owner marks pickup order fulfilled | customer | order number, "ready for pickup", address + hours |
| `order-shipped` | owner marks shipping order fulfilled | customer | order number, shipping address, "on its way" |
| `waitlist-confirmation` | new waitlist signup | subscriber | thanks, what to expect, unsubscribe link |
| `owner-new-order` | order confirmed | owner (`OWNER_EMAIL`) | order number, fulfillment method, link to `/admin/orders` |

Rules:

- Subject lines name the product or order number; no misleading claims.
- Every waitlist/marketing email has a visible unsubscribe link and `List-Unsubscribe` +
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.
- Plain-text alternative included for every HTML email.
- All customer-supplied values are HTML-escaped.
