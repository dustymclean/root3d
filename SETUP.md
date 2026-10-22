# Setup (about 10 minutes)

Everything below is free to start. No secret keys ever go in this repository.

## 1. Create the database

1. Sign up at [supabase.com](https://supabase.com) and create a project (any region near Mississippi, for example `us-east-1`).
2. Open **SQL Editor → New query**, paste all of `supabase/migrations/0001_init.sql`, and click **Run**.
3. Paste all of `supabase/migrations/0002_seed.sql` into a new query and **Run**.
4. Paste all of `supabase/migrations/0003_v2.sql` into a new query and **Run**. This adds Hunter, video/phone/on-site appointments, Grow Coach expertise tags, project boards with milestones, and read/unread messages.
5. Paste all of `supabase/migrations/0004_team_logins.sql` into a new query and **Run**.
6. Paste all of `supabase/migrations/0005_team_verified.sql` into a new query and **Run**. This shows the verified badge on all four coaches.
7. Paste all of `supabase/migrations/0006_r3d_emails.sql` into a new query and **Run**. This sets the admin logins:

   | Email | Linked calendar |
   | --- | --- |
   | dusty@r3dconsulting.com | Dusty |
   | joel@r3dconsulting.com | Joel |
   | danny@r3dconsulting.com | Danny |
   | hunter@r3dconsulting.com | Hunter |
   | support@r3dconsulting.com | (admin only) |
   | dustjackmcl@gmail.com, dusty_mclean@icloud.com, joel@ / danny@ / sleepy@pixies-pantry.com | (admin only) |

8. Paste all of `supabase/migrations/0007_backfill_profiles.sql` into a new query and **Run**. It creates profiles for any account made before the database was set up, and locks down internal functions.

9. Paste all of `supabase/migrations/0008_contact_methods.sql` into a new query and **Run**. It switches bookings to Zoom, Discord, Signal, or on-site, removes stored phone numbers, and adds the saved meeting links table.

   If you already ran earlier files, just run the ones you have not run yet. Every file is safe to run more than once.

That's the only account setup. Whoever signs up with one of those emails becomes an admin. Everyone else who signs up is a standard client. You can change the list later under **Portal → Users & admins**.

## 2. Configure sign-in links

In Supabase, go to **Authentication → URL Configuration**:

- **Site URL:** `https://r3dconsulting.com`
- **Redirect URLs:** add `https://r3dconsulting.com/**` and `https://www.r3dconsulting.com/**`

## 3. Connect the site to the database

In Supabase, go to **Project Settings → API** and copy the **Project URL** and the **anon public** key. The anon key is designed to be public; the database's row-level security is what protects data.

In GitHub, go to the repo's **Settings → Secrets and variables → Actions → Variables** tab and add:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |
| `VITE_CONTACT_EMAIL` | optional, defaults to `support@r3dconsulting.com` |

## 4. Turn on GitHub Pages at r3dconsulting.com

The site is built for `https://r3dconsulting.com` (see `public/CNAME`).

1. Repo **Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
2. Same page, **Custom domain:** enter `r3dconsulting.com` and save.
3. At your domain's DNS provider, add:

   | Type | Name | Value |
   | --- | --- | --- |
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | CNAME | `www` | `dustymclean.github.io` |

   Remove any other `A`, `AAAA`, or `CNAME` records on `@` and `www` first (for example old hosting records).
4. Once GitHub shows the DNS check passing (minutes to a few hours), tick **Enforce HTTPS**.
5. Merge to `main` (or run the **Deploy to GitHub Pages** workflow by hand) to publish.

Optional: verify the domain under your GitHub account's **Settings → Pages → Verified domains** so no one else can claim it.

## 5. Sign in

Each partner opens the site, clicks **Sign in → Create an account**, and uses their allowlisted email. The Admin section appears in their portal automatically.

## Optional

- **Calls.** Clients choose Zoom, Discord, or Signal when they book (or on-site for facility work). No phone numbers are collected. Before the call, the consultant opens the booking in the portal and picks a saved link (like the Manna Zoom room) or pastes one; only that client sees it. Save shared links once in the database: `insert into public.meeting_links (label, method, url) values ('Manna Zoom room', 'zoom', 'https://zoom.us/j/...');` Keep links with passcodes out of this repo.
- **Email sender.** Supabase's built-in email is rate-limited. For production, add your own SMTP under **Authentication → Emails → SMTP Settings**.
- **Card payments.** Once a processor approves Root3D, create invoices with its hosted payment links (Billing → Pay link). Never add processor secret keys to this repo; a server-side integration belongs in a Supabase Edge Function using Supabase secrets.
