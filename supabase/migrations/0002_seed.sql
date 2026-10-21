-- Root3D seed data. Safe to re-run.

-- >>> THE ONLY THING TO EDIT: the three partner emails. <<<
-- Whoever signs up with these emails becomes an admin linked to their consultant profile.
-- Everyone else who signs up is a standard client account.
insert into public.admin_emails (email, consultant_slug) values
  ('dustjackmcl@gmail.com', 'dusty-mclean'),
  ('dusty_mclean@icloud.com', null),
  ('sales@valleyoffire.co', 'joel-perkins')
  -- To give Danny his own login linked to his calendar, add:
  -- ,('danny@his-domain.com', 'danny-davis')
on conflict (email) do update set consultant_slug = excluded.consultant_slug;

insert into public.consultants (slug, name, title, photo, specialties, sort) values
  ('joel-perkins', 'Joel Perkins', 'Executive Consultant · Supply Chain Architect', 'team/joel-perkins.jpg',
    array['Acetate nutrient technology', 'Fertigation & formulation', 'Input sourcing', 'Genetics & distribution', 'Margins & liquidity'], 1),
  ('danny-davis', 'Danny Davis', 'Head Cultivator · Facility Engineer', 'team/danny-davis.jpg',
    array['Irrigation & plumbing', 'Tissue culture', 'Bio-security', 'Facility security & networking', 'Team training'], 2),
  ('dusty-mclean', 'Dusty McLean', 'Systems Architect · Compliance & OSINT', 'team/dusty-mclean.jpg',
    array['Licensing & SOPs', 'Seed-to-sale documentation', 'Sensor alerts & automation', 'Storefronts & data feeds', 'Lab data & Total THC'], 3)
on conflict (slug) do nothing;

-- Default hours: Monday to Friday, 9:00 to 17:00 in each consultant's time zone. Edit in the admin portal.
insert into public.availability (consultant_slug, weekday, start_time, end_time)
select c.slug, d, '09:00', '17:00'
from public.consultants c cross join generate_series(1, 5) d
where not exists (select 1 from public.availability a where a.consultant_slug = c.slug);

-- DRAFT pricing from the master brief. Flip is_draft to false in the admin portal once the team approves.
insert into public.services (id, name, description, kind, minutes, price_cents, response_time, features, bookable, highlight, sort) values
  ('discovery', 'Discovery Call', 'A free 15-minute peer conversation to see where you are and whether we fit.', 'session', 15, 0,
    'Book any open slot', array['No cost, no pressure', 'Talk with an owner, not a sales rep', 'Leave with a clear next step'], true, false, 0),
  ('home-grow', 'Home Grow Quick Call', 'A fast, focused answer for home growers.', 'session', 15, 2000,
    'Book any open slot', array['One question, one consultant', 'Upload photos before the call', 'Written takeaway after'], true, false, 1),
  ('standard', 'Standard Hour', 'No contract. Bring a single issue and leave with a plan.', 'session', 60, 10000,
    'Up to 12 hr, no SLA', array['Licensing, compliance, or cultivation', 'Document and SOP review', 'Action plan with at least 3 steps'], true, false, 2),
  ('grow-coach', 'Grow Coach Video Session', 'Live video coaching with a pre-call inbox for photos, labs, and logs.', 'session', 60, 10000,
    'Video session', array['Pre-call inbox for photos, labs, logs', 'Macro view for close inspection', 'Optional +15 min for $25'], true, false, 3),
  ('grow-coach-3', 'Grow Coach 3-Pack', 'Three Grow Coach sessions at a package rate.', 'package', 60, 30000,
    'Video sessions', array['Three 60-minute sessions', 'Same consultant each time', 'Shared action plan history'], false, false, 4),
  ('tier-1', 'Tier 1', 'A compliance safety net with predictable support.', 'retainer', null, 100000,
    'Response under 6 hr', array['Monthly compliance check', 'Dedicated line', 'SOP maintenance as rules change', 'Renewal and deadline tracking'], false, false, 10),
  ('tier-2', 'Tier 2', 'For teams moving fast who need hands-on help.', 'retainer', null, 150000,
    'Response under 3 hr', array['Bi-weekly audits', 'On-site help', 'Fertigation and nutrient planning', 'Priority task queue'], false, true, 11),
  ('priority', 'Priority', 'Woven into your operation for teams that cannot wait.', 'retainer', null, 200000,
    'Response under 1 hr', array['Emergency escalation', 'Direct executive access', 'Ongoing monitoring', 'Specialist routing'], false, false, 12),
  ('mep-diagnostics', 'MEP Diagnostics', 'Mechanical, electrical, and plumbing review before inspectors find it.', 'fixed', null, 0,
    'Fixed fee, quoted', array[]::text[], false, false, 20),
  ('tc-lab', 'Tissue Culture Lab Build', 'Lab design plus media-prep training for your team.', 'fixed', null, 0,
    'Fixed fee, quoted', array[]::text[], false, false, 21),
  ('inventory-recon', 'Inventory Reconciliation', 'Physical counts reconciled against Metrc or BioTrack.', 'fixed', null, 0,
    'Fixed fee, quoted', array[]::text[], false, false, 22),
  ('mso-gap', 'Multi-State Gap Analysis', 'Cross-market compliance review for multi-state operators.', 'fixed', null, 0,
    'Fixed fee, quoted', array[]::text[], false, false, 23)
on conflict (id) do nothing;
