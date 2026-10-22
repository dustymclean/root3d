-- Team logins move to @r3dconsulting.com. Safe to re-run. Run after 0005.
-- Work addresses are linked to each consultant's calendar. Personal addresses stay admins
-- without a calendar link, so either one can sign in to manage the business.
insert into public.admin_emails (email, consultant_slug) values
  ('dusty@r3dconsulting.com', 'dusty-mclean'),
  ('joel@r3dconsulting.com', 'joel-perkins'),
  ('danny@r3dconsulting.com', 'danny-davis'),
  ('hunter@r3dconsulting.com', 'hunter-porter'),
  ('support@r3dconsulting.com', null),
  ('dustjackmcl@gmail.com', null),
  ('dusty_mclean@icloud.com', null),
  ('joel@pixies-pantry.com', null),
  ('danny@pixies-pantry.com', null),
  ('sleepy@pixies-pantry.com', null)
on conflict (email) do update set consultant_slug = excluded.consultant_slug;

-- Promote any of these that already have an account.
update public.profiles p set role = 'admin'
  from public.admin_emails a where p.email = a.email;

-- Link calendars to the work accounts that already exist (the rest link when they sign up).
update public.profiles p set consultant_slug = a.consultant_slug
  from public.admin_emails a where p.email = a.email and a.consultant_slug is not null;
update public.consultants c set profile_id = p.id
  from public.profiles p, public.admin_emails a
 where p.email = a.email and a.consultant_slug = c.slug;
