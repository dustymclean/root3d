-- Root3D v2: appointment modes, Grow Coach taxonomy, project workspaces, and read/unread messages.
-- Run after 0001_init.sql and 0002_seed.sql. Safe to re-run.

-- ---------------------------------------------------------------------------
-- Grow Coach Connection: expert taxonomy and manual verification
-- ---------------------------------------------------------------------------
alter table public.consultants add column if not exists expertise text[] not null default '{}';
alter table public.consultants add column if not exists verified boolean not null default false;
alter table public.consultants add column if not exists modes text[] not null default '{virtual,phone,onsite}';

update public.consultants set expertise = array['Commercial Hydro', 'Living Soil', 'Nutrient Formulation', 'Genetics'] where slug = 'joel-perkins' and expertise = '{}';
update public.consultants set expertise = array['Commercial Hydro', 'Living Soil', 'Tissue Culture', 'IPM', 'Irrigation'] where slug = 'danny-davis' and expertise = '{}';
update public.consultants set expertise = array['Compliance', 'Lab Data', 'Automation'] where slug = 'dusty-mclean' and expertise = '{}';

-- The Grow Coach package from the brief: one hour plus two 30-minute follow-ups.
update public.services
set name = 'Grow Coach Package',
    description = 'An initial one-hour Grow Coach consultation plus two 30-minute follow-ups with the same coach.',
    features = array['One 60-minute video consultation', 'Two 30-minute follow-ups', 'Same coach every time', 'Action plan after each session']
where id = 'grow-coach-3' and name = 'Grow Coach 3-Pack';

insert into public.services (id, name, description, kind, minutes, price_cents, response_time, features, bookable, highlight, sort) values
  ('grow-coach-followup', 'Grow Coach Follow-up', 'A 30-minute check-in that is part of a Grow Coach Package. Your coach schedules it with you.', 'session', 30, 0,
    'Included in package', array['Review progress on your action plan', 'Fresh photos welcome in the pre-call inbox'], false, false, 5)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Appointment modes: virtual, telephone, or on-site
-- ---------------------------------------------------------------------------
alter table public.bookings add column if not exists mode text not null default 'virtual';
alter table public.bookings add column if not exists location text not null default '';
do $$ begin
  alter table public.bookings add constraint bookings_mode_check check (mode in ('virtual', 'phone', 'onsite'));
exception when duplicate_object then null; end $$;

drop function if exists public.book_appointment(text, text, timestamptz, text);
create or replace function public.book_appointment(
  p_consultant text, p_service text, p_start timestamptz, p_notes text default '',
  p_mode text default 'virtual', p_location text default ''
)
returns bookings language plpgsql security definer set search_path = public as $$
declare
  s services;
  c consultants;
  b bookings;
  p_end timestamptz;
begin
  if auth.uid() is null then raise exception 'Sign in to book'; end if;
  select * into s from services where id = p_service and active and bookable;
  if not found or s.minutes is null then raise exception 'That service cannot be booked online'; end if;
  select * into c from consultants where slug = p_consultant and active;
  if not found then raise exception 'That consultant is not taking bookings'; end if;
  if p_mode not in ('virtual', 'phone', 'onsite') or not (p_mode = any (c.modes)) then
    raise exception 'That appointment type is not offered by this consultant';
  end if;
  if p_mode = 'onsite' and length(trim(coalesce(p_location, ''))) < 5 then
    raise exception 'Add the facility address for an on-site visit';
  end if;
  p_end := p_start + make_interval(mins => s.minutes);
  if not slot_is_open(p_consultant, p_start, p_end) then
    raise exception 'That time is no longer available';
  end if;
  insert into bookings (client_id, consultant_slug, service_id, starts_at, ends_at, notes, mode, location)
  values (auth.uid(), p_consultant, p_service, p_start, p_end, coalesce(p_notes, ''), p_mode, coalesce(p_location, ''))
  returning * into b;
  if s.price_cents > 0 then
    insert into invoices (client_id, booking_id, consultant_slug, description, amount_cents, status, due_date)
    values (auth.uid(), b.id, p_consultant, s.name || ' on ' || to_char(p_start at time zone 'America/Chicago', 'Mon DD, YYYY'),
            s.price_cents, 'open', (p_start at time zone 'America/Chicago')::date);
  end if;
  return b;
end;
$$;

-- ---------------------------------------------------------------------------
-- Project workspaces: Kanban tasks, milestones, and the documentation record
-- (Initial Problem > Investigation > Idea > Proposed Fix > Implementation >
--  Validation > Backup Plan > Cross-Correlation > Final Report > Follow-Up)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  summary text not null default '',
  status text not null default 'active' check (status in ('active', 'on_hold', 'done')),
  consultants text[] not null default '{}',
  record jsonb not null default '{}',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_client_idx on public.projects (client_id);

create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (length(title) between 1 and 300),
  detail text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'review', 'done')),
  assignee text references public.consultants (slug),
  due_date date,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists project_tasks_project_idx on public.project_tasks (project_id, status, sort);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null check (length(title) between 1 and 300),
  deliverable text not null default '',
  due_date date,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists milestones_project_idx on public.milestones (project_id, due_date);

create or replace function public.touch_project()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update projects set updated_at = now() where id = new.project_id;
  return new;
end;
$$;
drop trigger if exists tasks_touch on public.project_tasks;
create trigger tasks_touch after insert or update on public.project_tasks
  for each row execute function public.touch_project();
drop trigger if exists milestones_touch on public.milestones;
create trigger milestones_touch after insert or update on public.milestones
  for each row execute function public.touch_project();

alter table public.projects enable row level security;
alter table public.project_tasks enable row level security;
alter table public.milestones enable row level security;

drop policy if exists own_read on public.projects;
create policy own_read on public.projects for select using (client_id = auth.uid() or is_admin());
drop policy if exists admin_write on public.projects;
create policy admin_write on public.projects for all using (is_admin()) with check (is_admin());

drop policy if exists own_read on public.project_tasks;
create policy own_read on public.project_tasks for select using (
  exists (select 1 from projects p where p.id = project_id and (p.client_id = auth.uid() or is_admin()))
);
drop policy if exists admin_write on public.project_tasks;
create policy admin_write on public.project_tasks for all using (is_admin()) with check (is_admin());

drop policy if exists own_read on public.milestones;
create policy own_read on public.milestones for select using (
  exists (select 1 from projects p where p.id = project_id and (p.client_id = auth.uid() or is_admin()))
);
drop policy if exists admin_write on public.milestones;
create policy admin_write on public.milestones for all using (is_admin()) with check (is_admin());

drop trigger if exists audit_projects on public.projects;
create trigger audit_projects after insert or update or delete on public.projects for each row execute function public.audit();

-- ---------------------------------------------------------------------------
-- Read/unread status for message threads
-- ---------------------------------------------------------------------------
create table if not exists public.thread_reads (
  thread_id uuid not null references public.threads (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (thread_id, user_id)
);
alter table public.thread_reads enable row level security;
drop policy if exists own_rows on public.thread_reads;
create policy own_rows on public.thread_reads for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.mark_thread_read(p_thread uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from threads t where t.id = p_thread and (t.client_id = auth.uid() or is_admin())) then
    raise exception 'Conversation not found';
  end if;
  insert into thread_reads (thread_id, user_id, read_at) values (p_thread, auth.uid(), now())
  on conflict (thread_id, user_id) do update set read_at = excluded.read_at;
end;
$$;

-- Unread counts per thread for the signed-in user (messages from others since they last opened it).
create or replace function public.my_unread()
returns table (thread_id uuid, unread int)
language sql stable security definer set search_path = public as $$
  select t.id, count(m.id)::int
  from threads t
  join messages m on m.thread_id = t.id and m.sender_id <> auth.uid()
  left join thread_reads r on r.thread_id = t.id and r.user_id = auth.uid()
  where (t.client_id = auth.uid() or is_admin())
    and m.created_at > coalesce(r.read_at, '-infinity'::timestamptz)
  group by t.id;
$$;

-- ---------------------------------------------------------------------------
-- Grants for the new tables and functions
-- ---------------------------------------------------------------------------
grant select, insert, update, delete on public.projects, public.project_tasks, public.milestones, public.thread_reads to authenticated;
grant execute on function public.book_appointment(text, text, timestamptz, text, text, text) to authenticated;
grant execute on function public.mark_thread_read(uuid), public.my_unread() to authenticated;
