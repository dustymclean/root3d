import { Loading } from '../../../components/ui';
import { money } from '../../../lib/format';
import { db, q } from '../../../lib/supabase';
import type { Booking, Invoice, Profile, Retainer } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useLookups } from '../lookups';

export function AdminOverview() {
  const look = useLookups();
  const { data, loading } = useAsync(async () => {
    const since = new Date();
    since.setMonth(since.getMonth() - 5, 1);
    since.setHours(0, 0, 0, 0);
    const [invoices, bookings, retainers, clients] = await Promise.all([
      q<Invoice[]>(db().from('invoices').select('*').gte('created_at', since.toISOString())),
      q<Booking[]>(db().from('bookings').select('*').gte('starts_at', since.toISOString())),
      q<Retainer[]>(db().from('retainers').select('*').eq('status', 'active')),
      q<Profile[]>(db().from('profiles').select('*').eq('role', 'client').gte('created_at', since.toISOString())),
    ]);
    return { invoices, bookings, retainers, clients };
  }, []);
  if (loading || !data || !look.data) return <Loading />;

  const paid = data.invoices.filter((i) => i.status === 'paid');
  const months = Array.from({ length: 6 }, (_, k) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - k), 1);
    return d.toISOString().slice(0, 7);
  });
  const byMonth = months.map((m) => ({ m, cents: paid.filter((i) => (i.paid_at ?? i.created_at).startsWith(m)).reduce((a, i) => a + i.amount_cents, 0) }));
  const max = Math.max(1, ...byMonth.map((x) => x.cents));
  const byConsultant = look.data.consultantList.map((c) => ({
    c,
    cents: paid.filter((i) => i.consultant_slug === c.slug).reduce((a, i) => a + i.amount_cents, 0),
    sessions: data.bookings.filter((b) => b.consultant_slug === c.slug && b.status === 'completed').length,
  }));
  const open = data.invoices.filter((i) => i.status === 'open').reduce((a, i) => a + i.amount_cents, 0);
  const mrr = data.retainers.reduce((a, r) => a + (look.data!.services[r.service_id]?.price_cents ?? 0), 0);
  const weekAhead = data.bookings.filter((b) => b.status === 'confirmed' && new Date(b.starts_at).getTime() - Date.now() < 7 * 86400_000 && new Date(b.starts_at).getTime() > Date.now()).length;
  const misses = data.bookings.filter((b) => b.status === 'no_show' || b.late_cancel).length;

  return (
    <div className="stack">
      <h2>Business overview</h2>
      <div className="grid grid-4">
        <div className="card"><div className="muted small">Collected (6 mo)</div><div className="stat">{money(paid.reduce((a, i) => a + i.amount_cents, 0))}</div></div>
        <div className="card"><div className="muted small">Outstanding</div><div className="stat">{money(open)}</div></div>
        <div className="card"><div className="muted small">Retainer MRR</div><div className="stat">{money(mrr)}</div></div>
        <div className="card"><div className="muted small">Sessions next 7 days</div><div className="stat">{weekAhead}</div></div>
      </div>
      <div className="card">
        <h3>Revenue by month</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', alignItems: 'end', height: 180 }}>
          {byMonth.map((x) => (
            <div key={x.m} style={{ display: 'grid', gap: 4, alignContent: 'end', height: '100%' }} title={money(x.cents)}>
              <span className="small muted" style={{ textAlign: 'center' }}>{x.cents ? money(x.cents) : ''}</span>
              <div style={{ height: `${(x.cents / max) * 120}px`, minHeight: 2, background: 'var(--emerald-600)', borderRadius: '6px 6px 0 0' }} />
              <span className="small muted" style={{ textAlign: 'center' }}>{new Date(x.m + '-15').toLocaleDateString('en-US', { month: 'short' })}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>By consultant (6 months)</h3>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Consultant</th><th>Collected</th><th>Completed sessions</th></tr></thead>
            <tbody>
              {byConsultant.map(({ c, cents, sessions }) => (
                <tr key={c.slug}><td>{c.name}</td><td>{money(cents)}</td><td>{sessions}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted small mt">New clients in this period: {data.clients.length} · No-shows and late cancels: {misses}</p>
      </div>
    </div>
  );
}
