# HSN website (Healthcare Sustainability Network)

Next.js 16 + Payload CMS 3. Public site, member login, courses, and the admin panel (`/admin`) in one app.
Pages are ported from the approved design in `D:\HSN-Design-System` and keep its exact markup and CSS.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env` and fill it in (a SQLite file is used in development).
3. `npm run dev`, then open http://localhost:3000. The first visit to `/admin` asks you to create the first admin account.
4. Optional demo courses (delete them later from the admin panel): `npx payload run scripts/seed-demo-courses.ts`

Without SMTP settings, sign-in codes are printed in the dev server console.

## Where things are
- `src/app/(frontend)/(site)/`: public pages (header and footer come from its layout)
- `src/app/(frontend)/(player)/`: course lesson player (sign-in required)
- `src/app/(frontend)/ar/`: Arabic pages
- `src/collections/`: CMS content types (courses, case studies, library, members, form submissions)
- `src/lib/auth/`: member sign-in (email one-time code, Google)
- `src/lib/payments/`: membership payments. Free today; set `PAYMENT_PROVIDER=razorpay` or `stripe` plus keys to charge.
- `src/app/(frontend)/styles/`: the design system CSS (`hsn.css`, `hsn2.css`, `site.css`) and per-page CSS

## Design check
`tools/compare.mjs` compares each page with its design board at 390, 834 and 1440 px
(needs the design preview running: `D:\HSN-Design-System\START-PREVIEW.bat`).
`tools/dc2jsx.mjs` converts a design board into JSX when porting a new page.

## Security notes
- `PAYLOAD_SECRET` must be a random value of 32+ characters (64 hex recommended). Changing it logs everyone out.
- Rate limits (`src/lib/rate-limit.ts`) use Upstash Redis when `KV_REST_API_URL`/`KV_REST_API_TOKEN` are set (needed on Vercel), otherwise memory.
- Hosting: Vercel (`vercel.json`, region bom1, build runs migrations). Files over 4.5 MB go straight from the browser to Supabase Storage (`src/lib/uploads/`).
- `MEMBERSHIP_FREE=true` gives membership away while no `PAYMENT_PROVIDER` is set. Without it, applications wait for an admin.
- Webhooks need `RAZORPAY_WEBHOOK_SECRET` / `STRIPE_WEBHOOK_SECRET`; without them every webhook call is refused.
- Production database and file storage: Supabase (Postgres + Storage). Setup steps are in `SUPABASE-SETUP.md`.
