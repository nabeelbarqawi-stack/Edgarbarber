# Email Contracts: Edgarbarber Launch Site

Sent with Resend from `EMAIL_FROM` (e.g. `Edgar Salazar <hello@yourdomain>`). Each send result
is stored on the signup (`confirmation_email_status`, `email_error`). A failed send never
removes the signup.

| Template | Trigger | To | Must include |
|----------|---------|----|--------------|
| `waitlist-confirmation` | new waitlist signup (or re-subscribe) | subscriber | greeting by name, product name, what to expect (an email when the balm is available), link back to the site, "Book with Edgar" link, unsubscribe link |

Rules:

- Subject names the product, e.g. "You're on the list for Oak and Whiskey Beard Balm".
- Visible unsubscribe link plus `List-Unsubscribe` and
  `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.
- Plain-text alternative included.
- All customer-supplied values are HTML-escaped.

Order emails are deferred with online ordering.
