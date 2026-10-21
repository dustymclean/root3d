import { CalendarPlus, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Loading, Notice } from '../../components/ui';
import { money } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { ActionPlan, Booking, Invoice } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { useLookups } from './lookups';
import { BookingTable } from './shared';

export function Overview() {
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const look = useLookups();
  const { data, loading } = useAsync(async () => {
    const now = new Date().toISOString();
    let bq = db().from('bookings').select('*').eq('status', 'confirmed').gte('ends_at', now).order('starts_at').limit(8);
    if (isAdmin && profile.consultant_slug) bq = bq.eq('consultant_slug', profile.consultant_slug);
    else if (!isAdmin) bq = bq.eq('client_id', profile.id);
    const [bookings, invoices, plans] = await Promise.all([
      q<Booking[]>(bq),
      q<Invoice[]>(isAdmin ? db().from('invoices').select('*').eq('status', 'open') : db().from('invoices').select('*').eq('status', 'open').eq('client_id', profile.id)),
      isAdmin ? Promise.resolve([] as ActionPlan[]) : q<ActionPlan[]>(db().from('action_plans').select('*').eq('client_id', profile.id)),
    ]);
    return { bookings, invoices, plans };
  }, [profile.id]);

  if (loading || !data || !look.data) return <Loading />;
  const openTasks = data.plans.flatMap((p) => p.steps.filter((s) => !s.done).map((s) => ({ plan: p, step: s }))).slice(0, 6);
  const owed = data.invoices.reduce((a, i) => a + i.amount_cents, 0);

  return (
    <div className="stack">
      <div className="row between">
        <h1 style={{ fontSize: '2rem', margin: 0 }}>Hello, {profile.full_name.split(' ')[0] || 'there'}</h1>
        <Link to="/book" className="btn btn-primary btn-sm"><CalendarPlus size={16} /> Book a session</Link>
      </div>
      {!isAdmin && !profile.intake_completed_at && (
        <Notice>
          Tell us about your operation once and every consultant will see it. <Link to="/portal/profile">Complete your intake</Link>.
        </Notice>
      )}
      <div className="grid grid-3">
        <div className="card"><div className="muted small">Upcoming sessions</div><div className="stat">{data.bookings.length}</div></div>
        <div className="card"><div className="muted small">{isAdmin ? 'Open invoices (all clients)' : 'Balance due'}</div><div className="stat">{money(owed)}</div></div>
        <div className="card"><div className="muted small">{isAdmin ? 'Your role' : 'Open action steps'}</div><div className="stat">{isAdmin ? 'Admin' : openTasks.length}</div></div>
      </div>
      <div className="card">
        <h3>{isAdmin && profile.consultant_slug ? 'Your upcoming sessions' : 'Upcoming sessions'}</h3>
        <BookingTable rows={data.bookings} consultants={look.data.consultants} services={look.data.services} profiles={isAdmin ? look.data.profiles : undefined} />
      </div>
      {!isAdmin && openTasks.length > 0 && (
        <div className="card">
          <h3><ClipboardList size={18} /> Next steps from your action plans</h3>
          <ul>
            {openTasks.map(({ plan, step }, i) => (
              <li key={plan.id + i}>{step.text} <Link to="/portal/plans" className="small">({plan.title})</Link></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
