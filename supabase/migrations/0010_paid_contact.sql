-- Clients reach us only after they pay. Safe to re-run. Run after 0009.
-- 1) Meeting links move to their own table, which a client can read only once the booking is paid (free sessions count as paid).
-- 2) Each consultant's Discord and Signal contact details, shown only to clients who have paid for a session with them.

-- A booking is paid when it has no charge, or an invoice for it is marked paid.
create or replace function public.booking_is_paid(p_booking uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select not exists (select 1 from invoices i where i.booking_id = p_booking and i.amount_cents > 0 and i.status <> 'void')
      or exists (select 1 from invoices i where i.booking_id = p_booking and i.status = 'paid');
$$;
revoke execute on function public.booking_is_paid(uuid) from public, anon;
grant execute on function public.booking_is_paid(uuid) to authenticated;

create table if not exists public.booking_links (
  booking_id uuid primary key references public.bookings (id) on delete cascade,
  url text not null check (url ~ '^https://'),
  updated_at timestamptz not null default now()
);
alter table public.booking_links enable row level security;
drop policy if exists admin_all on public.booking_links;
create policy admin_all on public.booking_links for all using (is_admin()) with check (is_admin());
drop policy if exists paid_client_read on public.booking_links;
create policy paid_client_read on public.booking_links for select using (
  exists (select 1 from bookings b where b.id = booking_id and b.client_id = auth.uid() and b.status = 'confirmed')
  and booking_is_paid(booking_id)
);

-- Carry over links already shared, then retire the old column (clients could read it before payment).
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bookings' and column_name = 'meeting_link') then
    insert into public.booking_links (booking_id, url)
    select id, meeting_link from public.bookings where meeting_link ~ '^https://'
    on conflict (booking_id) do nothing;
    alter table public.bookings drop column meeting_link;
  end if;
end $$;

create table if not exists public.consultant_contacts (
  consultant_slug text primary key references public.consultants (slug) on delete cascade,
  discord_username text not null default '' check (length(discord_username) <= 64),
  discord_link text not null default '' check (discord_link = '' or discord_link ~ '^https://'),
  signal_username text not null default '' check (length(signal_username) <= 64),
  signal_link text not null default '' check (signal_link = '' or signal_link ~ '^https://'),
  updated_at timestamptz not null default now(),
  check (discord_username !~ '\d{3}\D{0,3}\d{3}\D{0,3}\d{4}' and signal_username !~ '\d{3}\D{0,3}\d{3}\D{0,3}\d{4}')
);
alter table public.consultant_contacts enable row level security;
drop policy if exists admin_all on public.consultant_contacts;
create policy admin_all on public.consultant_contacts for all using (is_admin()) with check (is_admin());

-- What the signed-in person may see: admins see everyone; clients see consultants they have paid for a session.
create or replace function public.my_consultant_contacts()
returns setof consultant_contacts language sql stable security definer set search_path = public as $$
  select cc.* from consultant_contacts cc
   where is_admin()
      or exists (
        select 1 from bookings b join invoices i on i.booking_id = b.id
         where b.client_id = auth.uid() and b.consultant_slug = cc.consultant_slug
           and b.status in ('confirmed', 'completed') and i.status = 'paid' and i.amount_cents > 0
      );
$$;
revoke execute on function public.my_consultant_contacts() from public, anon;
grant execute on function public.my_consultant_contacts() to authenticated;
