-- Team admin logins. Safe to re-run. Run after 0003_v2.sql.
-- Whoever signs up with one of these emails becomes an admin linked to their consultant calendar.
insert into public.admin_emails (email, consultant_slug) values
  ('dustjackmcl@gmail.com', 'dusty-mclean'),
  ('dusty_mclean@icloud.com', null),
  ('joel@pixies-pantry.com', 'joel-perkins'),
  ('danny@pixies-pantry.com', 'danny-davis'),
  ('sleepy@pixies-pantry.com', 'hunter-porter')
on conflict (email) do update set consultant_slug = excluded.consultant_slug;

-- Joel's earlier address is replaced by joel@pixies-pantry.com.
delete from public.admin_emails where email = 'sales@valleyoffire.co';

-- If any of them already created an account, promote it and link the calendar now.
update public.profiles p
   set role = 'admin', consultant_slug = coalesce(a.consultant_slug, p.consultant_slug)
  from public.admin_emails a
 where p.email = a.email;

update public.consultants c
   set profile_id = p.id
  from public.profiles p
 where p.consultant_slug = c.slug and p.role = 'admin';
