# inter-cative v2 Waitlist

Waitlist + admin dashboard for **inter-cative v2** — the next version of [inter-cative](https://inter-cative.vercel.app).

## Features

- **Public waitlist page** — clean landing matching the inter-cative aesthetic; email signup
- **Admin dashboard** (`/admin`) — password-protected
  - Set product drop date/time
  - Edit product name & launch email message
  - View full waitlist
  - Trigger launch emails to everyone who hasn’t been notified yet
- **Email** via [Resend](https://resend.com) (falls back to console mock if no API key)
- **Storage** — simple JSON files in `/data` (easy to swap for a real DB later)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin: [http://localhost:3000/admin](http://localhost:3000/admin)  
Default password: `admin123`

## Environment variables

Create a `.env.local`:

```env
ADMIN_PASSWORD=your-secure-password
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=inter-cative <onboarding@resend.dev>
```

- Without `RESEND_API_KEY`, emails are logged to the server console (safe for local testing).
- `EMAIL_FROM` must be a verified domain/sender in Resend (or use the default for testing).

## Deploy

Works on Vercel / any Node host.

1. Push to GitHub
2. Import in Vercel
3. Set the env vars above
4. Note: JSON file storage is ephemeral on serverless — for production, swap `src/lib/db.ts` for Postgres/Supabase/Vercel KV.

## Project structure

```
src/
  app/
    page.tsx          # Waitlist landing
    admin/page.tsx    # Dashboard
    api/
      waitlist/       # POST join, GET count
      admin/          # GET list+settings, PATCH settings, POST send emails
  lib/
    db.ts             # JSON file storage
    email.ts          # Resend helper
```

Built to match the privacy-first, minimal style of inter-cative.
