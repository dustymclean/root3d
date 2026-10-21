-- Mark the four Root3D consultants as verified Grow Coach experts. Safe to re-run.
update public.consultants set verified = true
 where slug in ('joel-perkins', 'danny-davis', 'dusty-mclean', 'hunter-porter');
