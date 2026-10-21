-- Root3D Consulting: full schema, row-level security, and business rules.
-- Run once in the Supabase SQL editor (or `supabase db push`).
-- Roles: 'admin' (the three Root3D partners, who are also the consultants) and 'client' (everyone else).

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Admin allowlist. Anyone who signs up with one of these emails becomes an
-- admin and is linked to their consultant profile. Everyone else is a client.
-- Edit the three emails in 0002_seed.sql (or here) before the partners sign up.
-- ---------------------------------------------------------------------------
create table public.admin_emails (
  email text primary key check (email = lower(email)),
  consultant_slug text
);

create table public.consultants (
  slug text primary key,
  profile_id uuid,
  name text not null,
  title text not null default '',
  bio text not null default '',
  photo text not null default '',
  specialties text[] not null default '{}',
  timezone text not null default 'America/Chicago',
  buffer_minutes int not null default 15 check (buffer_minutes between 0 and 240),
  min_notice_hours int not null default 12 check (min_notice_hours between 0 and 336),
  is_available_today boolean not null default false,
  active boolean not null default true,
  sort int not null default 0
);

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text not null default '',
  phone text not null default '',
  company text not null default '',
  license_type text not null default '',
  state text not null default '',
  role text not null default 'client' check (role in ('client', 'admin')),
  consultant_slug text references public.consultants (slug),
  intake jsonb not null default '{}',
  intake_completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.consultants
  add constraint consultants_profile_fk foreign key (profile_id) references public.profiles (id) on delete set null;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- New auth user -> profile. Allowlisted emails become admins.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  allow admin_emails;
begin
  select * into allow from admin_emails where email = lower(new.email);
  insert into profiles (id, email, full_name, role, consultant_slug)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when allow.email is not null then 'admin' else 'client' end,
    allow.consultant_slug
  );
  if allow.consultant_slug is not null then
    update consultants set profile_id = new.id where slug = allow.consultant_slug;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clients cannot change their own role or consultant link.
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.consultant_slug is distinct from old.consultant_slug
      or new.email is distinct from old.email)
     and not is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Services & pricing (admin-editable)
-- ---------------------------------------------------------------------------
create table public.services (
  id text primary key,
  name text not null,
  description text not null default '',
  kind text not null check (kind in ('session', 'package', 'retainer', 'fixed')),
  minutes int,
  price_cents int not null default 0 check (price_cents >= 0),
  response_time text not null default '',
  features text[] not null default '{}',
  bookable boolean not null default false,
  is_draft boolean not null default true,
  active boolean not null default true,
  highlight boolean not null default false,
  sort int not null default 0
);

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  consultant_slug text not null references public.consultants (slug) on delete cascade,
  weekday int not null check (weekday between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  check (end_time > start_time)
);

create table public.time_off (
  id uuid primary key default gen_random_uuid(),
  consultant_slug text not null references public.consultants (slug) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default '',
  check (ends_at > starts_at)
);

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  consultant_slug text not null references public.consultants (slug),
  service_id text not null references public.services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed', 'no_show')),
  notes text not null default '',
  cancel_reason text not null default '',
  late_cancel boolean not null default false,
  room uuid not null default gen_random_uuid(),
  extended_minutes int not null default 0,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at),
  constraint no_double_booking exclude using gist (
    consultant_slug with =,
    tstzrange(starts_at, ends_at) with &&
  ) where (status = 'confirmed')
);
create index bookings_client_idx on public.bookings (client_id, starts_at);
create index bookings_consultant_idx on public.bookings (consultant_slug, starts_at);

-- Busy ranges for a consultant (no client details), used to draw open slots.
create or replace function public.busy_times(p_consultant text, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, ends_at timestamptz)
language sql stable security definer set search_path = public as $$
  select b.starts_at - make_interval(mins => c.buffer_minutes), b.ends_at + make_interval(mins => c.buffer_minutes)
  from bookings b join consultants c on c.slug = b.consultant_slug
  where b.consultant_slug = p_consultant and b.status = 'confirmed'
    and b.starts_at < p_to and b.ends_at > p_from
  union all
  select t.starts_at, t.ends_at from time_off t
  where t.consultant_slug = p_consultant and t.starts_at < p_to and t.ends_at > p_from;
$$;

-- Checks a proposed slot against weekly hours, notice, buffers, and time off.
create or replace function public.slot_is_open(p_consultant text, p_start timestamptz, p_end timestamptz, p_ignore uuid default null)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare
  c consultants;
  local_start timestamp;
  local_end timestamp;
begin
  select * into c from consultants where slug = p_consultant and active;
  if not found then return false; end if;
  if p_start < now() + make_interval(hours => c.min_notice_hours) and not c.is_available_today then
    return false;
  end if;
  if p_start < now() then return false; end if;
  local_start := p_start at time zone c.timezone;
  local_end := p_end at time zone c.timezone;
  if local_start::date <> local_end::date and local_end::time <> '00:00' then return false; end if;
  if not exists (
    select 1 from availability a
    where a.consultant_slug = p_consultant
      and a.weekday = extract(dow from local_start)::int
      and a.start_time <= local_start::time
      and a.end_time >= local_end::time
  ) then return false; end if;
  if exists (
    select 1 from bookings b
    where b.consultant_slug = p_consultant and b.status = 'confirmed'
      and (p_ignore is null or b.id <> p_ignore)
      and tstzrange(b.starts_at - make_interval(mins => c.buffer_minutes), b.ends_at + make_interval(mins => c.buffer_minutes))
          && tstzrange(p_start, p_end)
  ) then return false; end if;
  if exists (
    select 1 from time_off t where t.consultant_slug = p_consultant
      and tstzrange(t.starts_at, t.ends_at) && tstzrange(p_start, p_end)
  ) then return false; end if;
  return true;
end;
$$;

create or replace function public.book_appointment(p_consultant text, p_service text, p_start timestamptz, p_notes text default '')
returns bookings language plpgsql security definer set search_path = public as $$
declare
  s services;
  b bookings;
  p_end timestamptz;
begin
  if auth.uid() is null then raise exception 'Sign in to book'; end if;
  select * into s from services where id = p_service and active and bookable;
  if not found or s.minutes is null then raise exception 'That service cannot be booked online'; end if;
  p_end := p_start + make_interval(mins => s.minutes);
  if not slot_is_open(p_consultant, p_start, p_end) then
    raise exception 'That time is no longer available';
  end if;
  insert into bookings (client_id, consultant_slug, service_id, starts_at, ends_at, notes)
  values (auth.uid(), p_consultant, p_service, p_start, p_end, coalesce(p_notes, ''))
  returning * into b;
  if s.price_cents > 0 then
    insert into invoices (client_id, booking_id, consultant_slug, description, amount_cents, status, due_date)
    values (auth.uid(), b.id, p_consultant, s.name || ' on ' || to_char(p_start at time zone 'America/Chicago', 'Mon DD, YYYY'),
            s.price_cents, 'open', (p_start at time zone 'America/Chicago')::date);
  end if;
  return b;
end;
$$;

create or replace function public.reschedule_booking(p_booking uuid, p_start timestamptz)
returns bookings language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  p_end timestamptz;
begin
  select * into b from bookings where id = p_booking;
  if not found or (b.client_id <> auth.uid() and not is_admin()) then raise exception 'Booking not found'; end if;
  if b.status <> 'confirmed' then raise exception 'Only upcoming bookings can be changed'; end if;
  if b.starts_at < now() + interval '24 hours' and not is_admin() then
    raise exception 'Changes inside 24 hours need a consultant. Send us a message.';
  end if;
  p_end := p_start + (b.ends_at - b.starts_at);
  if not slot_is_open(b.consultant_slug, p_start, p_end, b.id) then
    raise exception 'That time is no longer available';
  end if;
  update bookings set starts_at = p_start, ends_at = p_end where id = p_booking returning * into b;
  return b;
end;
$$;

create or replace function public.cancel_booking(p_booking uuid, p_reason text default '')
returns bookings language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  is_late boolean;
begin
  select * into b from bookings where id = p_booking;
  if not found or (b.client_id <> auth.uid() and not is_admin()) then raise exception 'Booking not found'; end if;
  if b.status <> 'confirmed' then raise exception 'This booking is not active'; end if;
  is_late := b.starts_at < now() + interval '24 hours' and not is_admin();
  update bookings set status = 'cancelled', cancel_reason = coalesce(p_reason, ''), late_cancel = is_late
  where id = p_booking returning * into b;
  -- Cancelling with notice voids the unpaid session invoice; late cancels keep it (no-show rule).
  if not is_late then
    update invoices set status = 'void' where booking_id = p_booking and status = 'open';
  end if;
  return b;
end;
$$;

-- +15 minutes for $25, only if the consultant's calendar allows it.
create or replace function public.extend_booking(p_booking uuid)
returns bookings language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  c consultants;
begin
  select * into b from bookings where id = p_booking;
  if not found or (b.client_id <> auth.uid() and not is_admin()) then raise exception 'Booking not found'; end if;
  if b.status <> 'confirmed' then raise exception 'Session is not active'; end if;
  select * into c from consultants where slug = b.consultant_slug;
  if exists (
    select 1 from bookings o where o.consultant_slug = b.consultant_slug and o.status = 'confirmed' and o.id <> b.id
      and o.starts_at < b.ends_at + interval '15 minutes' + make_interval(mins => c.buffer_minutes)
      and o.ends_at > b.ends_at
  ) then raise exception 'The consultant has another session right after this one'; end if;
  update bookings set ends_at = ends_at + interval '15 minutes', extended_minutes = extended_minutes + 15
  where id = p_booking returning * into b;
  insert into invoices (client_id, booking_id, consultant_slug, description, amount_cents, status, due_date)
  values (b.client_id, b.id, b.consultant_slug, 'Session extension, 15 minutes', 2500, 'open', current_date);
  return b;
end;
$$;

-- ---------------------------------------------------------------------------
-- Action plans (a session can't be completed without one of 3+ steps)
-- ---------------------------------------------------------------------------
create table public.action_plans (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid unique references public.bookings (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  consultant_slug text references public.consultants (slug),
  title text not null default 'Action plan',
  problem text not null default '',
  solution text not null default '',
  contingencies text not null default '',
  test_results text not null default '',
  steps jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.complete_booking(p_booking uuid)
returns bookings language plpgsql security definer set search_path = public as $$
declare
  b bookings;
  n int;
begin
  if not is_admin() then raise exception 'Only a consultant can close a session'; end if;
  select jsonb_array_length(steps) into n from action_plans where booking_id = p_booking;
  if coalesce(n, 0) < 3 then raise exception 'Submit an action plan with at least 3 steps first'; end if;
  update bookings set status = 'completed' where id = p_booking returning * into b;
  return b;
end;
$$;

-- Clients may tick steps done, nothing else.
create or replace function public.toggle_plan_step(p_plan uuid, p_index int, p_done boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  update action_plans
  set steps = jsonb_set(steps, array[p_index::text, 'done'], to_jsonb(p_done)), updated_at = now()
  where id = p_plan and (client_id = auth.uid() or is_admin());
end;
$$;

-- ---------------------------------------------------------------------------
-- Messaging & support tickets
-- ---------------------------------------------------------------------------
create table public.threads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  consultant_slug text references public.consultants (slug),
  subject text not null,
  kind text not null default 'message' check (kind in ('message', 'support')),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(body) between 1 and 10000),
  created_at timestamptz not null default now()
);
create index messages_thread_idx on public.messages (thread_id, created_at);

create or replace function public.touch_thread()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update threads set updated_at = now() where id = new.thread_id;
  return new;
end;
$$;
create trigger messages_touch after insert on public.messages
  for each row execute function public.touch_thread();

-- ---------------------------------------------------------------------------
-- Files (Pre-Call Inbox uploads and deliverables)
-- ---------------------------------------------------------------------------
create table public.files (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  uploaded_by uuid not null references public.profiles (id),
  name text not null,
  path text not null unique,
  size bigint not null default 0,
  mime text not null default '',
  kind text not null default 'upload' check (kind in ('upload', 'deliverable')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Billing: invoices, retainers, agreements, time tracking
-- ---------------------------------------------------------------------------
create sequence public.invoice_number_seq start 1001;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number int not null default nextval('public.invoice_number_seq') unique,
  client_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  retainer_id uuid,
  consultant_slug text references public.consultants (slug),
  description text not null,
  amount_cents int not null check (amount_cents >= 0),
  status text not null default 'open' check (status in ('draft', 'open', 'paid', 'void', 'refunded')),
  due_date date,
  payment_url text not null default '',
  paid_at timestamptz,
  payment_method text not null default '',
  refund_note text not null default '',
  created_at timestamptz not null default now()
);

create table public.agreements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('proposal', 'sow', 'contract', 'nda')),
  title text not null,
  body text not null,
  amount_cents int,
  status text not null default 'sent' check (status in ('sent', 'signed', 'declined', 'void')),
  signed_name text not null default '',
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.sign_agreement(p_agreement uuid, p_name text, p_accept boolean)
returns agreements language plpgsql security definer set search_path = public as $$
declare
  a agreements;
begin
  if length(trim(coalesce(p_name, ''))) < 2 then raise exception 'Type your full name to sign'; end if;
  update agreements
  set status = case when p_accept then 'signed' else 'declined' end,
      signed_name = trim(p_name), signed_at = now()
  where id = p_agreement and client_id = auth.uid() and status = 'sent'
  returning * into a;
  if not found then raise exception 'Agreement not found or already answered'; end if;
  return a;
end;
$$;

create table public.retainers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  service_id text not null references public.services (id),
  agreement_id uuid references public.agreements (id),
  status text not null default 'pending' check (status in ('pending', 'active', 'paused', 'cancelled')),
  billing_day int not null default 1 check (billing_day between 1 and 28),
  started_at date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.invoices
  add constraint invoices_retainer_fk foreign key (retainer_id) references public.retainers (id) on delete set null;

-- "No Contract, No Service": a retainer can't go active until its agreement is signed.
create or replace function public.guard_retainer()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'active' and not exists (
    select 1 from agreements where id = new.agreement_id and status = 'signed'
  ) then
    raise exception 'No Contract, No Service: link a signed agreement before activating';
  end if;
  return new;
end;
$$;
create trigger retainers_guard before insert or update on public.retainers
  for each row execute function public.guard_retainer();

create table public.time_entries (
  id uuid primary key default gen_random_uuid(),
  consultant_slug text not null references public.consultants (slug),
  client_id uuid references public.profiles (id) on delete set null,
  booking_id uuid references public.bookings (id) on delete set null,
  work_date date not null default current_date,
  minutes int not null check (minutes > 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Shared client history, contact inbox, audit log
-- ---------------------------------------------------------------------------
create table public.client_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  email text not null check (length(email) between 3 and 320),
  phone text not null default '',
  topic text not null default '',
  message text not null check (length(message) between 1 and 5000),
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid,
  action text not null,
  entity text not null,
  entity_id text,
  detail jsonb not null default '{}',
  at timestamptz not null default now()
);

create or replace function public.audit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into audit_log (actor_id, action, entity, entity_id, detail)
  values (
    auth.uid(),
    lower(tg_op),
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end) ->> 'id', ''),
    case when tg_op = 'UPDATE' then jsonb_build_object('before', to_jsonb(old), 'after', to_jsonb(new))
         when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end
  );
  return null;
end;
$$;

create trigger audit_bookings after insert or update or delete on public.bookings for each row execute function public.audit();
create trigger audit_invoices after insert or update or delete on public.invoices for each row execute function public.audit();
create trigger audit_profiles after update or delete on public.profiles for each row execute function public.audit();
create trigger audit_services after insert or update or delete on public.services for each row execute function public.audit();
create trigger audit_retainers after insert or update or delete on public.retainers for each row execute function public.audit();
create trigger audit_agreements after insert or update or delete on public.agreements for each row execute function public.audit();

-- ---------------------------------------------------------------------------
-- Row-level security: default deny, then open exactly what each role needs.
-- ---------------------------------------------------------------------------
alter table public.admin_emails enable row level security;
alter table public.consultants enable row level security;
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.availability enable row level security;
alter table public.time_off enable row level security;
alter table public.bookings enable row level security;
alter table public.action_plans enable row level security;
alter table public.threads enable row level security;
alter table public.messages enable row level security;
alter table public.files enable row level security;
alter table public.invoices enable row level security;
alter table public.agreements enable row level security;
alter table public.retainers enable row level security;
alter table public.time_entries enable row level security;
alter table public.client_notes enable row level security;
alter table public.contact_requests enable row level security;
alter table public.audit_log enable row level security;

create policy admin_all on public.admin_emails for all using (is_admin()) with check (is_admin());

create policy public_read on public.consultants for select using (true);
create policy admin_write on public.consultants for all using (is_admin()) with check (is_admin());

create policy own_read on public.profiles for select using (id = auth.uid() or is_admin());
create policy own_update on public.profiles for update using (id = auth.uid() or is_admin()) with check (id = auth.uid() or is_admin());

create policy public_read on public.services for select using (active or is_admin());
create policy admin_write on public.services for all using (is_admin()) with check (is_admin());

create policy public_read on public.availability for select using (true);
create policy admin_write on public.availability for all using (is_admin()) with check (is_admin());

create policy admin_all on public.time_off for all using (is_admin()) with check (is_admin());

-- Bookings are created/changed through the RPCs above; clients only read their own.
create policy own_read on public.bookings for select using (client_id = auth.uid() or is_admin());
create policy admin_write on public.bookings for all using (is_admin()) with check (is_admin());

create policy own_read on public.action_plans for select using (client_id = auth.uid() or is_admin());
create policy admin_write on public.action_plans for all using (is_admin()) with check (is_admin());

create policy own_read on public.threads for select using (client_id = auth.uid() or is_admin());
create policy own_insert on public.threads for insert with check (client_id = auth.uid() or is_admin());
create policy admin_update on public.threads for update using (is_admin() or client_id = auth.uid());

create policy thread_read on public.messages for select using (
  exists (select 1 from threads t where t.id = thread_id and (t.client_id = auth.uid() or is_admin()))
);
create policy thread_insert on public.messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from threads t where t.id = thread_id and (t.client_id = auth.uid() or is_admin()))
);

create policy own_read on public.files for select using (client_id = auth.uid() or is_admin());
create policy own_insert on public.files for insert with check (
  uploaded_by = auth.uid() and (client_id = auth.uid() or is_admin()) and (kind = 'upload' or is_admin())
);
create policy own_delete on public.files for delete using (uploaded_by = auth.uid() or is_admin());

create policy own_read on public.invoices for select using ((client_id = auth.uid() and status <> 'draft') or is_admin());
create policy admin_write on public.invoices for all using (is_admin()) with check (is_admin());

create policy own_read on public.agreements for select using (client_id = auth.uid() or is_admin());
create policy admin_write on public.agreements for all using (is_admin()) with check (is_admin());

create policy own_read on public.retainers for select using (client_id = auth.uid() or is_admin());
create policy admin_write on public.retainers for all using (is_admin()) with check (is_admin());

create policy admin_all on public.time_entries for all using (is_admin()) with check (is_admin());
create policy admin_all on public.client_notes for all using (is_admin()) with check (is_admin());

create policy anyone_insert on public.contact_requests for insert with check (handled = false);
create policy admin_all on public.contact_requests for all using (is_admin()) with check (is_admin());

create policy admin_read on public.audit_log for select using (is_admin());

-- ---------------------------------------------------------------------------
-- Storage: private bucket, one folder per client (<client_id>/...)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('client-files', 'client-files', false, 52428800)
on conflict (id) do nothing;

create policy "client files read" on storage.objects for select
  using (bucket_id = 'client-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "client files write" on storage.objects for insert
  with check (bucket_id = 'client-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "client files delete" on storage.objects for delete
  using (bucket_id = 'client-files' and (owner = auth.uid() or public.is_admin()));

-- Live updates for chat.
alter publication supabase_realtime add table public.messages;

-- Explicit API grants (row-level security above still decides which rows each user sees).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant select on public.consultants, public.services, public.availability to anon;
grant insert on public.contact_requests to anon;
grant execute on function public.busy_times(text, timestamptz, timestamptz), public.slot_is_open(text, timestamptz, timestamptz, uuid) to anon, authenticated;
