-- Contact methods: Signal, Discord, or the Manna Zoom room (plus on-site visits for audits).
-- No phone calls and no phone numbers. Safe to re-run. Run after 0007.

-- Bookings: new modes, and the meeting link the consultant shares with the client.
alter table public.bookings drop constraint if exists bookings_mode_check;
update public.bookings set mode = 'zoom' where mode = 'virtual';
update public.bookings set mode = 'signal' where mode = 'phone';
alter table public.bookings alter column mode set default 'zoom';
alter table public.bookings add constraint bookings_mode_check check (mode in ('zoom', 'discord', 'signal', 'onsite'));
alter table public.bookings add column if not exists meeting_link text not null default '';

alter table public.consultants alter column modes set default '{zoom,discord,signal,onsite}';
update public.consultants set modes = '{zoom,discord,signal,onsite}'
 where modes && '{virtual,phone}'::text[] or modes = '{}';

-- Saved links admins pick from (the Manna Zoom room, a Discord invite, a Signal group link).
-- Admins only: clients see a link only after it is attached to their own booking.
create table if not exists public.meeting_links (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(label) between 1 and 80),
  method text not null check (method in ('zoom', 'discord', 'signal')),
  url text not null check (url ~ '^https://'),
  sort int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.meeting_links enable row level security;
drop policy if exists admin_all on public.meeting_links;
create policy admin_all on public.meeting_links for all using (is_admin()) with check (is_admin());

-- Phone numbers are no longer collected.
update public.profiles set phone = '' where phone <> '';
update public.contact_requests set phone = '' where phone <> '';

drop function if exists public.book_appointment(text, text, timestamptz, text, text, text);
create or replace function public.book_appointment(
  p_consultant text, p_service text, p_start timestamptz, p_notes text default '',
  p_mode text default 'zoom', p_location text default ''
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
  if p_mode not in ('zoom', 'discord', 'signal', 'onsite') or not (p_mode = any (c.modes)) then
    raise exception 'That contact method is not offered by this consultant';
  end if;
  if p_mode = 'onsite' and length(trim(coalesce(p_location, ''))) < 5 then
    raise exception 'Add the facility address for an on-site visit';
  end if;
  if p_mode in ('discord', 'signal') and length(trim(coalesce(p_location, ''))) < 2 then
    raise exception 'Add your username so your consultant can reach you';
  end if;
  if p_mode <> 'onsite' and p_location ~ '\d{3}\D{0,3}\d{3}\D{0,3}\d{4}' then
    raise exception 'Please use a username, not a phone number';
  end if;
  p_end := p_start + make_interval(mins => s.minutes);
  if not slot_is_open(p_consultant, p_start, p_end) then
    raise exception 'That time is no longer available';
  end if;
  insert into bookings (client_id, consultant_slug, service_id, starts_at, ends_at, notes, mode, location)
  values (auth.uid(), p_consultant, p_service, p_start, p_end, coalesce(p_notes, ''), p_mode, trim(coalesce(p_location, '')))
  returning * into b;
  if s.price_cents > 0 then
    insert into invoices (client_id, booking_id, consultant_slug, description, amount_cents, status, due_date)
    values (auth.uid(), b.id, p_consultant, s.name || ' on ' || to_char(p_start at time zone 'America/Chicago', 'Mon DD, YYYY'),
            s.price_cents, 'open', (p_start at time zone 'America/Chicago')::date);
  end if;
  return b;
end;
$$;
grant execute on function public.book_appointment(text, text, timestamptz, text, text, text) to authenticated;
revoke execute on function public.book_appointment(text, text, timestamptz, text, text, text) from anon, public;
