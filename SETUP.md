# Setup (about 10 minutes)

Everything below is free to start. No secret keys ever go in this repository.

## 1. Create the database

1. Sign up at [supabase.com](https://supabase.com) and create a project (any region near Mississippi, for example `us-east-1`).
2. Open **SQL Editor → New query**, paste all of `supabase/migrations/0001_init.sql`, and click **Run**.
3. Paste all of `supabase/migrations/0002_seed.sql` into a new query and **Run**.
4. Paste all of `supabase/migrations/0003_v2.sql` into a new query and **Run**. This adds Hunter, video/phone/on-site appointments, Grow Coach expertise tags, project boards with milestones, and read/unread messages.
5. Paste all of `supabase/migrations/0004_team_logins.sql` into a new query and **Run**. This sets the admin logins:

   | Email | Linked calendar |
   | --- | --- |
   | dustjackmcl@gmail.com | Dusty |
   | dusty_mclean@icloud.com | (admin only) |
   | joel@pixies-pantry.com | Joel |
   | danny@pixies-pantry.com | Danny |
   | sleepy@pixies-pantry.com | Hunter |

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
| `VITE_CONTACT_EMAIL` | optional, defaults to `contact@r3dconsulting.com` |

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

- **Video.** Sessions use the public `meet.jit.si` server by default, which limits embedded calls to 5 minutes for anonymous users. For real sessions, either self-host Jitsi (set `VITE_JITSI_DOMAIN` to your server) or use 8x8 JaaS (set `VITE_JITSI_DOMAIN=8x8.vc` and `VITE_JITSI_ROOM_PREFIX=<your app id>/`).
- **Email sender.** Supabase's built-in email is rate-limited. For production, add your own SMTP under **Authentication → Emails → SMTP Settings**.
- **Card payments.** Once a processor approves Root3D, create invoices with its hosted payment links (Billing → Pay link). Never add processor secret keys to this repo; a server-side integration belongs in a Supabase Edge Function using Supabase secrets.
