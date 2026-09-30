# Edgarbarber

Website for **Edgar Salazar**, barber at Quality Cuts in Forest Hill, TX, featuring his homemade
**Oak and Whiskey Beard Balm**.

- Product showcase with **Join the waitlist** as the main action (confirmation email + unsubscribe)
- **About Edgar** with video, and a **Book with Edgar** link to his Square booking page on every page
- Owner **admin** (`/admin`) to edit the product and photos, and view/download the waitlist

Online ordering (Square checkout, pickup or shipping) is planned as a later feature. Its research
is in `specs/001-launch-site/research.md` under *Deferred*.

Built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and Resend. Specs, plan, and tasks
live in `specs/001-launch-site/` (GitHub Spec Kit).

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values (see below)
npm run dev                  # http://localhost:3000
```

The public page works without any configuration (it falls back to the launch product in
`src/content/product.ts`). The waitlist and admin need Supabase; confirmation emails need Resend.

### Environment variables

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | Your site URL, e.g. `https://edgarsalazar.com` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page. **Server only, never share.** |
| `RESEND_API_KEY` | Resend → API Keys |
| `EMAIL_FROM` | A sender on a domain verified in Resend, e.g. `Edgar Salazar <hello@yourdomain.com>` |
| `UNSUBSCRIBE_SECRET`, `IP_HASH_SALT` | Any random 32+ character strings (`openssl rand -base64 32`) |

## Database setup (Supabase)

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql` in the SQL editor
   (or `supabase db push` with the CLI).
3. Authentication → Providers → Email: keep enabled, and **turn off "Allow new users to sign up"**.
4. Authentication → URL Configuration: set the Site URL and add `https://<your-site>/admin/auth/callback`
   as a redirect URL.
5. Register the owner: follow `supabase/seed-admin.sql`.

## Editing content

| What | Where |
|------|-------|
| Price, description, ingredients, size, photos | `/admin` (signed in as the owner) |
| Booking link | `BOOKING_URL` in `src/content/site.ts` |
| Edgar's bio, shop address, hours, video | `src/content/site.ts` |

## Checks

```bash
npm run lint
npm run typecheck
npm run test        # unit tests (Vitest)
npm run test:e2e    # browser tests on phone viewports (Playwright)
```

If Playwright's browser isn't installed, either run `npx playwright install chromium` or set
`PLAYWRIGHT_CHROMIUM_PATH` to an existing Chromium binary.

## Deploy

Import the repo in Vercel, add the environment variables above, and deploy.
