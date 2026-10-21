# Root3D Consulting · r3dconsulting.com

One site where clients find, book, pay, and work with Root3D consultants Joel Perkins, Danny Davis, and Dusty McLean.

**Stack:** Vite · React 18 · TypeScript · Zustand · React Router · Lucide icons, hosted on GitHub Pages.
**Backend:** Supabase (Auth, Postgres with row-level security, Storage, Realtime). Video: Jitsi Meet.

First time? Follow **[SETUP.md](SETUP.md)**. It takes about 10 minutes.

## What's included

| Area | Features |
| --- | --- |
| Public site | Home, services, draft pricing (admin-editable), team profiles with photos, contact form, privacy, terms |
| Accounts | Sign up, sign in, password reset. Allowlisted emails become admins; everyone else is a client |
| Booking | Per-consultant weekly hours, time off, buffers, minimum notice, "available today" urgent filter, book / reschedule / cancel, 24-hour late-cancel rule, no-show marking, double-booking blocked in the database, .ics calendar export |
| Video sessions | Jitsi room per booking with custom Lucide controls, Macro Mode (2.5x zoom), pre-call inbox beside the video, +15 min for $25 extension prompt at 50 min |
| Action plans | Session can't be closed until the consultant submits a plan with 3+ steps (problem, solution, steps, contingencies, test results); clients tick steps off |
| Messaging | Private client threads and support tickets, live updates, visible to all partners so clients never re-explain |
| Files | Private per-client storage, pre-call uploads (up to 50 MB each), consultant deliverables, signed expiring download links |
| Billing | Auto-invoice on booking, manual invoices, payment links, mark paid, void, refunds, printable receipts, retainers with client-chosen billing day and monthly invoice generation |
| Agreements | Proposals, SOWs, contracts, NDAs with typed-name e-signature; retainers can't activate without a signed contract ("No Contract, No Service") |
| Client portal | Overview, appointments, messages, files, action plans, invoices, agreements, profile + intake |
| Admin portal | Revenue and MRR overview, client records with shared notes, availability, pricing editor, billing, time tracking, website inquiries, user roles + admin allowlist, audit log |

## Develop

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev
```

`npm run build` type-checks, builds to `dist/`, and copies `index.html` to `404.html` so deep links work on GitHub Pages.

## Layout

```
src/
  pages/public/      marketing pages, login
  pages/Book.tsx     booking flow
  pages/portal/      client portal (+ admin/ for admin-only pages)
  lib/               Supabase client, types, formatting, time-zone math
  data/              static team bios and fallback pricing
supabase/migrations/ schema, security rules, seed data
```

## Not yet wired (needs an outside account)

- **Card payments.** Stripe restricts cannabis-related businesses. Once a processor approves Root3D in writing, paste its hosted payment links on invoices (works today), or add a server-side integration for card holds, automatic capture, and the 80/20 split.
- **Email/SMS alerts and automatic reminders.** Supabase sends account emails. Booking/invoice reminders need an email or SMS provider (for example Resend or Twilio) and a scheduled Supabase function.
- **Two-way calendar sync.** Each booking exports to any calendar as .ics; live Google/Outlook sync needs OAuth.
