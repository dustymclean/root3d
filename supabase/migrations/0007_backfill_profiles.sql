-- 1) Let maintenance SQL (SQL Editor, migrations: no signed-in user) adjust roles. Signed-in
--    users still need to be admins, and row-level security already blocks anonymous updates.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.consultant_slug is distinct from old.consultant_slug
      or new.email is distinct from old.email)
     and auth.uid() is not null and not is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end;
$$;

-- 2) Accounts created before 0001 ran have no profile. Create one, applying the admin allowlist.
insert into public.profiles (id, email, full_name, role, consultant_slug)
select u.id, lower(u.email), coalesce(u.raw_user_meta_data ->> 'full_name', ''),
       case when a.email is not null then 'admin' else 'client' end, a.consultant_slug
  from auth.users u
  left join public.admin_emails a on a.email = lower(u.email)
 where not exists (select 1 from public.profiles p where p.id = u.id);

update public.profiles p set role = 'admin'
  from public.admin_emails a where p.email = a.email and p.role <> 'admin';
update public.consultants c set profile_id = p.id
  from public.profiles p, public.admin_emails a
 where p.email = a.email and a.consultant_slug = c.slug;

-- 3) Trigger-only functions should not be callable through the public API.
revoke execute on function public.audit(), public.guard_profile_update(), public.guard_retainer(),
  public.handle_new_user(), public.touch_project(), public.touch_thread()
  from public, anon, authenticated;
