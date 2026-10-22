-- Grow Coach Connection is moving to its own site. Hide its services here (kept, not deleted,
-- so they can move or come back). Safe to re-run. Run after 0008.
update public.services set active = false, bookable = false
 where id in ('home-grow', 'grow-coach', 'grow-coach-3', 'grow-coach-followup');
