# Going live: Vercel + Supabase

The code is ready for this setup:
- `DATABASE_URL` starting with `postgresql://` → Supabase Postgres (otherwise a local SQLite file).
- `S3_BUCKET` set → uploads are stored in Supabase Storage (otherwise in `./media`).
- `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` set → browsers upload files straight to Storage, because a
  request to a Vercel function can carry at most 4.5 MB (case study attachments allow 10 MB, admin uploads 30 MB).
- Upstash Redis set → login and form rate limits are shared by all Vercel instances.

Tested on 3 Nov 2026 on a local Postgres (migrations, admin, demo courses, uploads, private files, admin saves),
a production build (`npm run build` + `npm start`), and a stand-in Redis. Supabase Storage and the direct
browser upload can only be tested once the real project exists: do the checks in step 8 after the first deploy.

## 1. Supabase project
1. https://supabase.com → New project. **Region: Mumbai (ap-south-1)**.
2. Database password: long and random, kept in a password manager. Never paste it in chat or commit it.
3. Plan: **Pro** for the live site (the free plan pauses after a week without traffic and has no backups).

## 2. Database connection string (Vercel = Transaction pooler)
Project → **Connect** → Connection string → **Transaction pooler** (port **6543**). Add `?sslmode=require`:
```
postgresql://postgres.<project-ref>:<db-password>@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require
```
Also set `DATABASE_POOL_MAX=5` (the pooler shares connections; migrations need at least 2).

## 3. Lock down Supabase's automatic API
- Project Settings → **Data API** → remove `public` from "Exposed schemas" (or switch the Data API off).
- The migration `20261103_050000_enable_rls` also turns on row level security on every table, so that API
  can't read anything even if left on. The site connects as the table owner and is unaffected.
- Supabase Auth is not used (the site has its own login). The `anon` key is not needed.

## 4. Storage
1. Storage → **New bucket** → `hsn-media` → **Private**. In the bucket settings set the file size limit to 30 MB.
2. Storage → Settings → **S3 Connection**: enable, copy the **Endpoint** and **Region**.
3. Same page → **S3 Access Keys** → New access key → copy the Access key ID and Secret (shown once).
4. Project Settings → **API Keys**: copy the **Project URL** and the **service_role** (secret) key.
   The service_role key bypasses all security: it goes **only** into Vercel's environment variables
   (never in code, never with a `NEXT_PUBLIC_` prefix). The site uses it only to create one-time upload links.

## 5. Upstash Redis (rate limits)
Vercel project → **Storage** → **Upstash for Redis** → Create (region: Mumbai / ap-south-1) → Connect to the
project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically; nothing else to do.

## 6. Vercel project
1. Import the Git repository in Vercel. Framework: Next.js. `vercel.json` already sets the region to Mumbai
   (`bom1`, next to the database) and the build command `npm run ci`, which runs the database migrations and
   then builds, so every deploy brings the database up to date.
2. Settings → **Environment Variables** (Production; use separate values for Preview if you use previews):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Transaction pooler string from step 2 |
| `DATABASE_POOL_MAX` | `5` |
| `PAYLOAD_SECRET` | 64 random hex characters (new one, not the development one) |
| `SITE_URL` | `https://<your domain>` |
| `S3_BUCKET` | `hsn-media` |
| `S3_ENDPOINT` | from step 4.2 |
| `S3_REGION` | from step 4.2 (usually `ap-south-1`) |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | from step 4.3 |
| `SUPABASE_URL` | Project URL from step 4.4 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key from step 4.4 |
| `MEMBERSHIP_FREE` | `true` while membership is free |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `EMAIL_FROM` | email provider, for log-in codes |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in (redirect URI `https://<domain>/api/auth/google/callback`) |

3. Settings → Domains: add the HSN domain and follow the DNS instructions.

## 7. Admin account and demo courses (once)
Vercel has no terminal, so run these from a computer with the project, pointed at the live database:
```
vercel env pull .env.production.local
# add ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to .env.production.local
NODE_ENV=production npx payload run scripts/create-admin.ts
NODE_ENV=production npx payload run scripts/seed-demo-courses.ts   # optional
```
Then delete `.env.production.local` from that computer.

## 8. Checks after the first deploy
- Open `/admin`, log in, add a Library resource with a PDF over 5 MB, and open it from the admin table.
- Submit a case study from the website with a PDF attachment; open the attachment from Admin → Case studies.
- Open a members-only Library file while logged out: it must send you to log in.
- Try the log-in code 6 times with a wrong code: it must stop you.

## 9. Later schema changes
When a collection changes: `npx payload migrate:create <name>` against a Postgres database, commit the file in
`src/migrations/`. The next Vercel deploy runs it. For new tables, also re-run the RLS migration's SQL
(or keep the Data API off for `public`).

## What to send the developer
No passwords or keys in chat: put them straight into Vercel's Environment Variables.
Only tell the developer the Vercel project name, the domain, and that the variables are filled in.
