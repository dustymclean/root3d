# Setup (about 10 minutes)

Everything below is free to start. No secret keys ever go in this repository.

## 1. Create the database

1. Sign up at [supabase.com](https://supabase.com) and create a project (any region near Mississippi, for example `us-east-1`).
2. Open **SQL Editor → New query**, paste all of `supabase/migrations/0001_init.sql`, and click **Run**.
3. Open `supabase/migrations/0002_seed.sql`. At the top are the **three admin emails**:

   ```sql
   ('dustjackmcl@gmail.com', 'dusty-mclean'),
   ('dusty_mclean@icloud.com', null),
   ('sales@valleyoffire.co', 'joel-perkins')
   ```

   Change them if needed (the second value links that login to a consultant's calendar), then paste the whole file into a new query and **Run**.

That's the only account setup. Whoever signs up with one of those emails becomes an admin. Everyone else who signs up is a standard client. You can change the list later under **Portal → Users & admins**.

## 2. Configure sign-in links

In Supabase, go to **Authentication → URL Configuration**:

- **Site URL:** `https://r3dconsulting.com` (or `https://dustymclean.github.io/root3d` until the domain is connected)
- **Redirect URLs:** add `https://r3dconsulting.com/**` and `https://dustymclean.github.io/root3d/**`

## 3. Connect the site to the database

In Supabase, go to **Project Settings → API** and copy the **Project URL** and the **anon public** key. The anon key is designed to be public; the database's row-level security is what protects data.

In GitHub, go to the repo's **Settings → Secrets and variables → Actions → Variables** tab and add:

| Variable | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | your Project URL |
| `VITE_SUPABASE_ANON_KEY` | your anon public key |
| `VITE_CONTACT_EMAIL` | optional, defaults to `contact@r3dconsulting.com` |

## 4. Turn on GitHub Pages

1. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the **Deploy to GitHub Pages** workflow by hand). The site appears at `https://dustymclean.github.io/root3d/`.

### Custom domain (r3dconsulting.com)

1. **Settings → Pages → Custom domain:** `r3dconsulting.com`, then tick **Enforce HTTPS** once it's issued.
2. At your DNS provider, add `A` records for `@` pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` pointing to `dustymclean.github.io`.
3. Add a repository variable `BASE_PATH` with the value `/` and re-run the deploy workflow.

## 5. Sign in

Each partner opens the site, clicks **Sign in → Create an account**, and uses their allowlisted email. The Admin section appears in their portal automatically.

## Optional

- **Video.** Sessions use the public `meet.jit.si` server by default, which limits embedded calls to 5 minutes for anonymous users. For real sessions, either self-host Jitsi (set `VITE_JITSI_DOMAIN` to your server) or use 8x8 JaaS (set `VITE_JITSI_DOMAIN=8x8.vc` and `VITE_JITSI_ROOM_PREFIX=<your app id>/`).
- **Email sender.** Supabase's built-in email is rate-limited. For production, add your own SMTP under **Authentication → Emails → SMTP Settings**.
- **Card payments.** Once a processor approves Root3D, create invoices with its hosted payment links (Billing → Pay link). Never add processor secret keys to this repo; a server-side integration belongs in a Supabase Edge Function using Supabase secrets.
