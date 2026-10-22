import { Plus, Save, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Empty, ErrorText, Field, Loading, StatusPill, Success } from '../../../components/ui';
import { dateOnly, dateTime, money } from '../../../lib/format';
import { db, q } from '../../../lib/supabase';
import type { AuditRow, ConsultantContact, Availability, Consultant, ContactRequest, Invoice, Retainer, Service, TimeEntry, TimeOff } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useAuth } from '../../../store/auth';
import { personName, useLookups } from '../lookups';
import { contactModes, modeLabels } from '../../../lib/contact';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* ---------------- Availability ---------------- */
export function Schedule() {
  const me = useAuth((s) => s.profile)!;
  const look = useLookups();
  const [slug, setSlug] = useState(me.consultant_slug ?? '');
  const current = slug || look.data?.consultantList[0]?.slug || '';
  if (!look.data) return <Loading />;
  const c = look.data.consultants[current];
  return (
    <div className="stack">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Availability</h2>
        <select className="select" style={{ maxWidth: 240 }} value={current} onChange={(e) => setSlug(e.target.value)} aria-label="Consultant">
          {look.data.consultantList.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </select>
      </div>
      {c && <ConsultantSettings key={c.slug} c={c} onSaved={() => void look.reload()} />}
      {c && <ContactSettings key={'c' + c.slug} c={c} />}
      {c && <WeeklyHours key={'h' + c.slug} slug={c.slug} />}
      {c && <TimeOffPanel key={'t' + c.slug} slug={c.slug} />}
    </div>
  );
}

/** Each consultant's Discord and Signal details. Clients see them only after paying for a session with that consultant. */
function ContactSettings({ c }: { c: Consultant }) {
  const empty = { discord_username: '', discord_link: '', signal_username: '', signal_link: '' };
  const row = useAsync(() => q<ConsultantContact | null>(db().from('consultant_contacts').select('*').eq('consultant_slug', c.slug).maybeSingle()), [c.slug]);
  const [f, setF] = useState<typeof empty | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (row.loading) return <Loading />;
  const v = f ?? { ...empty, ...(row.data ? { discord_username: row.data.discord_username, discord_link: row.data.discord_link, signal_username: row.data.signal_username, signal_link: row.data.signal_link } : {}) };
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setF({ ...v, [k]: e.target.value });
  const phone = /\d{3}\D{0,3}\d{3}\D{0,3}\d{4}/;

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    if (phone.test(v.discord_username) || phone.test(v.signal_username)) return setError('Use usernames, not phone numbers.');
    if ([v.discord_link, v.signal_link].some((l) => l && !/^https:\/\//.test(l))) return setError('Links must start with https://');
    const { error } = await db().from('consultant_contacts').upsert({ consultant_slug: c.slug, ...v, updated_at: new Date().toISOString() });
    if (error) setError(error.message);
    else setMsg('Saved. Clients who have paid for a session with ' + c.name.split(' ')[0] + ' can now see these.');
  }

  return (
    <form className="card form" onSubmit={save}>
      <h3>{c.name}: direct contact (paid clients only)</h3>
      <p className="muted small" style={{ marginTop: 0 }}>
        Shown on {c.name.split(' ')[0]}'s profile and appointment pages, only to clients with a paid session. Usernames and links only, never a phone number.
      </p>
      <div className="form-row">
        <Field label="Discord username" hint="Discord → your profile picture → Username."><input className="input" value={v.discord_username} onChange={set('discord_username')} /></Field>
        <Field label="Discord invite or profile link" hint="Server → Invite People → Edit invite link → Never expire. Starts with https://discord.gg/"><input className="input" value={v.discord_link} onChange={set('discord_link')} placeholder="https://discord.gg/…" /></Field>
      </div>
      <div className="form-row">
        <Field label="Signal username" hint="Signal → Settings → Profile → Username (ends in two numbers, like name.42)."><input className="input" value={v.signal_username} onChange={set('signal_username')} /></Field>
        <Field label="Signal username link" hint="Signal → Settings → Profile → Username → QR code or link → Copy link. Starts with https://signal.me/"><input className="input" value={v.signal_link} onChange={set('signal_link')} placeholder="https://signal.me/#eu/…" /></Field>
      </div>
      <ErrorText error={error} />
      {msg && <Success>{msg}</Success>}
      <div><button className="btn btn-primary btn-sm"><Save size={16} /> Save contact details</button></div>
    </form>
  );
}

function ConsultantSettings({ c, onSaved }: { c: Consultant; onSaved: () => void }) {
  const [f, setF] = useState({
    is_available_today: c.is_available_today, buffer_minutes: c.buffer_minutes, min_notice_hours: c.min_notice_hours, timezone: c.timezone, active: c.active,
    verified: c.verified ?? false, expertise: c.expertise ?? [], modes: c.modes?.filter((m) => contactModes.includes(m)) ?? contactModes,
  });
  const toggleIn = <T extends string>(list: T[], v: T, on: boolean) => (on ? [...list, v] : list.filter((x) => x !== v));
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('consultants').update(f).eq('slug', c.slug);
    if (error) setError(error.message);
    else {
      setMsg('Saved.');
      onSaved();
    }
  }
  return (
    <form className="card form" onSubmit={save}>
      <h3>{c.name}: booking rules</h3>
      <label className="check"><input type="checkbox" checked={f.is_available_today} onChange={(e) => setF({ ...f, is_available_today: e.target.checked })} /> Available today for urgent, same-day sessions</label>
      <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Accepting bookings</label>
      <fieldset className="fieldset">
        <legend className="field-label">Ways clients can connect</legend>
        {contactModes.map((m) => (
          <label key={m} className="check"><input type="checkbox" checked={f.modes.includes(m)} onChange={(e) => setF({ ...f, modes: toggleIn(f.modes, m, e.target.checked) })} /> {modeLabels[m]}</label>
        ))}
      </fieldset>
      <div className="form-row">
        <Field label="Buffer between sessions (min)"><input className="input" type="number" min={0} max={240} value={f.buffer_minutes} onChange={(e) => setF({ ...f, buffer_minutes: Number(e.target.value) })} /></Field>
        <Field label="Minimum notice (hours)"><input className="input" type="number" min={0} max={336} value={f.min_notice_hours} onChange={(e) => setF({ ...f, min_notice_hours: Number(e.target.value) })} /></Field>
        <Field label="Time zone"><input className="input" value={f.timezone} onChange={(e) => setF({ ...f, timezone: e.target.value })} /></Field>
      </div>
      <ErrorText error={error} />
      {msg && <Success>{msg}</Success>}
      <div><button className="btn btn-primary btn-sm"><Save size={16} /> Save rules</button></div>
    </form>
  );
}

function WeeklyHours({ slug }: { slug: string }) {
  const hours = useAsync(() => q<Availability[]>(db().from('availability').select('*').eq('consultant_slug', slug).order('weekday').order('start_time')), [slug]);
  const [f, setF] = useState({ weekday: 1, start_time: '09:00', end_time: '17:00' });
  const [error, setError] = useState<string | null>(null);
  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('availability').insert({ ...f, consultant_slug: slug });
    if (error) setError(error.message);
    else void hours.reload();
  }
  return (
    <div className="card">
      <h3>Weekly hours</h3>
      <div className="table-wrap">
        <table className="table">
          <tbody>
            {(hours.data ?? []).map((h) => (
              <tr key={h.id}>
                <td>{days[h.weekday]}</td>
                <td>{h.start_time.slice(0, 5)} to {h.end_time.slice(0, 5)}</td>
                <td><button className="linkish" aria-label="Remove" onClick={() => void db().from('availability').delete().eq('id', h.id).then(() => hours.reload())}><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form className="row mt" onSubmit={add}>
        <select className="select" style={{ width: 'auto' }} value={f.weekday} onChange={(e) => setF({ ...f, weekday: Number(e.target.value) })} aria-label="Day">
          {days.map((d, i) => <option key={d} value={i}>{d}</option>)}
        </select>
        <input className="input" style={{ width: 'auto' }} type="time" value={f.start_time} onChange={(e) => setF({ ...f, start_time: e.target.value })} aria-label="Start" />
        <input className="input" style={{ width: 'auto' }} type="time" value={f.end_time} onChange={(e) => setF({ ...f, end_time: e.target.value })} aria-label="End" />
        <button className="btn btn-ghost btn-sm"><Plus size={16} /> Add hours</button>
      </form>
      <ErrorText error={error} />
    </div>
  );
}

function TimeOffPanel({ slug }: { slug: string }) {
  const rows = useAsync(() => q<TimeOff[]>(db().from('time_off').select('*').eq('consultant_slug', slug).gte('ends_at', new Date().toISOString()).order('starts_at')), [slug]);
  const [f, setF] = useState({ starts_at: '', ends_at: '', reason: '' });
  const [error, setError] = useState<string | null>(null);
  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('time_off').insert({ consultant_slug: slug, starts_at: new Date(f.starts_at).toISOString(), ends_at: new Date(f.ends_at).toISOString(), reason: f.reason });
    if (error) setError(error.message);
    else void rows.reload();
  }
  return (
    <div className="card">
      <h3>Time off & blocked time</h3>
      {(rows.data ?? []).map((t) => (
        <p key={t.id} className="row">
          {dateTime(t.starts_at)} to {dateTime(t.ends_at)} {t.reason && `· ${t.reason}`}
          <button className="linkish" aria-label="Remove" onClick={() => void db().from('time_off').delete().eq('id', t.id).then(() => rows.reload())}><Trash2 size={16} /></button>
        </p>
      ))}
      <form className="form-row mt" onSubmit={add}>
        <Field label="From"><input className="input" type="datetime-local" required value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} /></Field>
        <Field label="To"><input className="input" type="datetime-local" required value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} /></Field>
        <Field label="Reason"><input className="input" value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></Field>
        <div style={{ alignSelf: 'end' }}><button className="btn btn-ghost btn-sm">Block time</button></div>
      </form>
      <ErrorText error={error} />
    </div>
  );
}

/* ---------------- Services & pricing ---------------- */
export function ServicesAdmin() {
  const rows = useAsync(() => q<Service[]>(db().from('services').select('*').order('sort')), []);
  if (rows.loading) return <Loading />;
  return (
    <div className="stack">
      <h2>Pricing & services</h2>
      <p className="muted">Changes go live on the pricing and booking pages immediately. Untick "Draft" once the team approves a price.</p>
      {(rows.data ?? []).map((s) => <ServiceRow key={s.id} s={s} onSaved={() => void rows.reload()} />)}
      <NewService onSaved={() => void rows.reload()} />
    </div>
  );
}

function ServiceRow({ s, onSaved }: { s: Service; onSaved: () => void }) {
  const [f, setF] = useState({ ...s, price: (s.price_cents / 100).toString(), featuresText: s.features.join('\n') });
  const [state, setState] = useState<string | null>(null);
  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('services').update({
      name: f.name, description: f.description, minutes: f.minutes || null, price_cents: Math.round(Number(f.price) * 100), response_time: f.response_time,
      features: f.featuresText.split('\n').map((x) => x.trim()).filter(Boolean), bookable: f.bookable, is_draft: f.is_draft, active: f.active, highlight: f.highlight, sort: f.sort,
    }).eq('id', s.id);
    setState(error ? error.message : 'Saved');
    if (!error) onSaved();
  }
  return (
    <details className="card">
      <summary className="row between" style={{ cursor: 'pointer' }}>
        <strong>{s.name}</strong>
        <span className="muted small">{s.kind} · {money(s.price_cents)} {s.is_draft && <span className="tag review">draft</span>} {!s.active && <span className="tag">hidden</span>}</span>
      </summary>
      <form className="form mt" onSubmit={save}>
        <div className="form-row">
          <Field label="Name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
          <Field label="Price (USD)"><input className="input" type="number" min="0" step="0.01" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></Field>
          <Field label="Minutes"><input className="input" type="number" min="0" value={f.minutes ?? ''} onChange={(e) => setF({ ...f, minutes: e.target.value ? Number(e.target.value) : null })} /></Field>
          <Field label="Sort"><input className="input" type="number" value={f.sort} onChange={(e) => setF({ ...f, sort: Number(e.target.value) })} /></Field>
        </div>
        <Field label="Description"><input className="input" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Response time / subtitle"><input className="input" value={f.response_time} onChange={(e) => setF({ ...f, response_time: e.target.value })} /></Field>
        <Field label="Features (one per line)"><textarea className="textarea" value={f.featuresText} onChange={(e) => setF({ ...f, featuresText: e.target.value })} /></Field>
        <div className="row">
          <label className="check"><input type="checkbox" checked={f.bookable} onChange={(e) => setF({ ...f, bookable: e.target.checked })} /> Bookable online</label>
          <label className="check"><input type="checkbox" checked={f.is_draft} onChange={(e) => setF({ ...f, is_draft: e.target.checked })} /> Draft</label>
          <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Visible</label>
          <label className="check"><input type="checkbox" checked={f.highlight} onChange={(e) => setF({ ...f, highlight: e.target.checked })} /> Highlight</label>
        </div>
        <div className="row"><button className="btn btn-primary btn-sm"><Save size={16} /> Save</button>{state && <span className="small muted">{state}</span>}</div>
      </form>
    </details>
  );
}

function NewService({ onSaved }: { onSaved: () => void }) {
  const [f, setF] = useState({ id: '', name: '', kind: 'session' });
  const [error, setError] = useState<string | null>(null);
  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('services').insert({ ...f, id: f.id.toLowerCase().replace(/[^a-z0-9-]+/g, '-'), sort: 50 });
    if (error) setError(error.message);
    else onSaved();
  }
  return (
    <form className="card coming form-row" onSubmit={add}>
      <Field label="New service id"><input className="input" required placeholder="e.g. soil-audit" value={f.id} onChange={(e) => setF({ ...f, id: e.target.value })} /></Field>
      <Field label="Name"><input className="input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
      <Field label="Kind">
        <select className="select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>
          <option value="session">Session</option><option value="package">Package</option><option value="retainer">Retainer</option><option value="fixed">Fixed fee</option>
        </select>
      </Field>
      <div style={{ alignSelf: 'end' }}><button className="btn btn-ghost btn-sm"><Plus size={16} /> Add</button></div>
      <ErrorText error={error} />
    </form>
  );
}

/* ---------------- Billing & retainers ---------------- */
export function Billing() {
  const look = useLookups();
  const inv = useAsync(() => q<Invoice[]>(db().from('invoices').select('*').order('created_at', { ascending: false }).limit(500)), []);
  const ret = useAsync(() => q<Retainer[]>(db().from('retainers').select('*').order('created_at', { ascending: false })), []);
  const [filter, setFilter] = useState<'open' | 'all'>('open');
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (inv.loading || ret.loading || !look.data) return <Loading />;
  const rows = (inv.data ?? []).filter((i) => filter === 'all' || i.status === 'open' || i.status === 'draft');

  async function act(i: Invoice, patch: Partial<Invoice>) {
    setError(null);
    const { error } = await db().from('invoices').update(patch).eq('id', i.id);
    if (error) setError(error.message);
    else void inv.reload();
  }

  async function runRetainers() {
    const month = new Date().toISOString().slice(0, 7);
    const today = new Date().getDate();
    let made = 0;
    for (const r of (ret.data ?? []).filter((x) => x.status === 'active' && x.billing_day <= today)) {
      const exists = (inv.data ?? []).some((i) => i.retainer_id === r.id && i.created_at.startsWith(month));
      if (exists) continue;
      const s = look.data!.services[r.service_id];
      const { error } = await db().from('invoices').insert({
        client_id: r.client_id, retainer_id: r.id, description: `${s?.name ?? 'Retainer'}, ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        amount_cents: s?.price_cents ?? 0, status: 'open', due_date: new Date().toISOString().slice(0, 10),
      });
      if (error) return setError(error.message);
      made++;
    }
    setMsg(made ? `Created ${made} retainer invoice${made > 1 ? 's' : ''}.` : 'All retainer invoices for this month already exist.');
    void inv.reload();
  }

  async function setRetainer(r: Retainer, status: Retainer['status']) {
    setError(null);
    const { error } = await db().from('retainers').update({ status, started_at: status === 'active' && !r.started_at ? new Date().toISOString().slice(0, 10) : r.started_at }).eq('id', r.id);
    if (error) setError(error.message);
    else void ret.reload();
  }

  return (
    <div className="stack">
      <h2>Billing & retainers</h2>
      <ErrorText error={error} />
      {msg && <Success>{msg}</Success>}
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}>Invoices</h3>
          <div className="tabs" role="tablist" style={{ margin: 0, border: 0 }}>
            <button role="tab" aria-selected={filter === 'open'} onClick={() => setFilter('open')}>Open</button>
            <button role="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>All</button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>#</th><th>Client</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td><Link to={`/portal/invoices/${i.id}`}>{i.number}</Link></td>
                  <td>{personName(look.data, i.client_id)}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: 180 }}>{i.description}</td>
                  <td>{money(i.amount_cents)}</td>
                  <td><StatusPill status={i.status} /></td>
                  <td>
                    <div className="row" style={{ gap: '0.4rem' }}>
                      {i.status === 'open' && (
                        <>
                          <button className="btn btn-ghost btn-sm" onClick={() => { const m = prompt('Payment method (card, ACH, cash, check…)', 'card'); if (m !== null) void act(i, { status: 'paid', paid_at: new Date().toISOString(), payment_method: m }); }}>Mark paid</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => { const u = prompt('Paste a hosted payment link from your processor', i.payment_url); if (u !== null) void act(i, { payment_url: u }); }}>Pay link</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => confirm('Void this invoice?') && void act(i, { status: 'void' })}>Void</button>
                        </>
                      )}
                      {i.status === 'paid' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => { const n = prompt('Refund note (amount, method, reason). Issue the refund in your processor first.'); if (n) void act(i, { status: 'refunded', refund_note: n }); }}>Refund</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <Empty>Nothing outstanding.</Empty>}
        </div>
      </div>
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}>Retainers</h3>
          <button className="btn btn-primary btn-sm" onClick={() => void runRetainers()}>Generate this month's invoices</button>
        </div>
        <div className="table-wrap mt">
          <table className="table">
            <thead><tr><th>Client</th><th>Plan</th><th>Bills on</th><th>Status</th><th /></tr></thead>
            <tbody>
              {(ret.data ?? []).map((r) => (
                <tr key={r.id}>
                  <td><Link to={`/portal/admin/clients/${r.client_id}`}>{personName(look.data, r.client_id)}</Link></td>
                  <td>{look.data!.services[r.service_id]?.name}</td>
                  <td>Day {r.billing_day}</td>
                  <td><StatusPill status={r.status} /></td>
                  <td>
                    <select className="select" style={{ width: 'auto' }} value={r.status} onChange={(e) => void setRetainer(r, e.target.value as Retainer['status'])} aria-label="Retainer status">
                      <option value="pending">Pending</option><option value="active">Active</option><option value="paused">Paused</option><option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(ret.data ?? []).length === 0 && <Empty>No retainers yet. Start one from a client's Billing tab.</Empty>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Time tracking ---------------- */
export function TimeTracking() {
  const me = useAuth((s) => s.profile)!;
  const look = useLookups();
  const rows = useAsync(() => q<TimeEntry[]>(db().from('time_entries').select('*').order('work_date', { ascending: false }).limit(300)), []);
  const [f, setF] = useState({ consultant_slug: me.consultant_slug ?? '', client_id: '', work_date: new Date().toISOString().slice(0, 10), minutes: '60', note: '' });
  const [error, setError] = useState<string | null>(null);
  if (!look.data || rows.loading) return <Loading />;
  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('time_entries').insert({ ...f, client_id: f.client_id || null, minutes: Number(f.minutes), consultant_slug: f.consultant_slug || look.data!.consultantList[0].slug });
    if (error) setError(error.message);
    else {
      setF({ ...f, note: '' });
      void rows.reload();
    }
  }
  const month = new Date().toISOString().slice(0, 7);
  return (
    <div className="stack">
      <h2>Time tracking</h2>
      <div className="grid grid-3">
        {look.data.consultantList.map((c) => (
          <div className="card" key={c.slug}>
            <div className="muted small">{c.name}, this month</div>
            <div className="stat">{((rows.data ?? []).filter((r) => r.consultant_slug === c.slug && r.work_date.startsWith(month)).reduce((a, r) => a + r.minutes, 0) / 60).toFixed(1)} h</div>
          </div>
        ))}
      </div>
      <form className="card form" onSubmit={add}>
        <div className="form-row">
          <Field label="Consultant">
            <select className="select" value={f.consultant_slug} onChange={(e) => setF({ ...f, consultant_slug: e.target.value })}>
              {look.data.consultantList.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Client">
            <select className="select" value={f.client_id} onChange={(e) => setF({ ...f, client_id: e.target.value })}>
              <option value="">Internal</option>
              {look.data.profileList.filter((p) => p.role === 'client').map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
            </select>
          </Field>
          <Field label="Date"><input className="input" type="date" value={f.work_date} onChange={(e) => setF({ ...f, work_date: e.target.value })} /></Field>
          <Field label="Minutes"><input className="input" type="number" min={1} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} /></Field>
        </div>
        <Field label="What did you work on?"><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        <ErrorText error={error} />
        <div><button className="btn btn-primary btn-sm"><Plus size={16} /> Log time</button></div>
      </form>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Date</th><th>Consultant</th><th>Client</th><th>Time</th><th>Note</th></tr></thead>
          <tbody>
            {(rows.data ?? []).map((r) => (
              <tr key={r.id}>
                <td>{dateOnly(r.work_date)}</td>
                <td>{look.data!.consultants[r.consultant_slug]?.name}</td>
                <td>{personName(look.data, r.client_id) || 'Internal'}</td>
                <td>{r.minutes} min</td>
                <td style={{ whiteSpace: 'normal' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Website inquiries ---------------- */
export function InboxAdmin() {
  const rows = useAsync(() => q<ContactRequest[]>(db().from('contact_requests').select('*').order('created_at', { ascending: false }).limit(200)), []);
  if (rows.loading) return <Loading />;
  return (
    <div className="stack">
      <h2>Website inquiries</h2>
      {(rows.data ?? []).length === 0 && <div className="card"><Empty>No inquiries yet.</Empty></div>}
      {(rows.data ?? []).map((r) => (
        <div key={r.id} className="card" style={{ opacity: r.handled ? 0.6 : 1 }}>
          <div className="row between">
            <strong>{r.name} · <a href={`mailto:${r.email}?subject=${encodeURIComponent('Re: ' + (r.topic || 'your inquiry'))}`}>{r.email}</a></strong>
            <span className="muted small">{dateTime(r.created_at)}</span>
          </div>
          {r.topic && <p className="eyebrow" style={{ margin: '0.5rem 0' }}>{r.topic}</p>}
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.message}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => void db().from('contact_requests').update({ handled: !r.handled }).eq('id', r.id).then(() => rows.reload())}>
            {r.handled ? 'Mark unhandled' : 'Mark handled'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Users & admins ---------------- */
export function UsersAdmin() {
  const me = useAuth((s) => s.profile)!;
  const look = useLookups();
  const allow = useAsync(() => q<{ email: string; consultant_slug: string | null }[]>(db().from('admin_emails').select('*')), []);
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!look.data || allow.loading) return <Loading />;

  async function setRole(id: string, role: 'client' | 'admin') {
    setError(null);
    const { error } = await db().from('profiles').update({ role }).eq('id', id);
    if (error) setError(error.message);
    else void look.reload();
  }
  async function addAllow(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('admin_emails').upsert({ email: email.toLowerCase().trim(), consultant_slug: slug || null });
    if (error) setError(error.message);
    else {
      setEmail('');
      void allow.reload();
    }
  }

  return (
    <div className="stack">
      <h2>Users & admins</h2>
      <div className="card">
        <h3>Admin allowlist</h3>
        <p className="muted small">Anyone who signs up with one of these emails becomes an admin automatically. Everyone else is a standard client.</p>
        {(allow.data ?? []).map((a) => (
          <p key={a.email} className="row">
            {a.email} {a.consultant_slug && <span className="tag">{look.data!.consultants[a.consultant_slug]?.name}</span>}
            <button className="linkish" aria-label="Remove" onClick={() => void db().from('admin_emails').delete().eq('email', a.email).then(() => allow.reload())}><Trash2 size={16} /></button>
          </p>
        ))}
        <form className="row mt" onSubmit={addAllow}>
          <input className="input" style={{ maxWidth: 280 }} type="email" required placeholder="partner@email.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
          <select className="select" style={{ width: 'auto' }} value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Linked consultant">
            <option value="">No consultant profile</option>
            {look.data.consultantList.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm"><Plus size={16} /> Add</button>
        </form>
      </div>
      <ErrorText error={error} />
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th /></tr></thead>
          <tbody>
            {look.data.profileList.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name}</td>
                <td>{p.email}</td>
                <td><span className="tag">{p.role}</span></td>
                <td>{dateOnly(p.created_at)}</td>
                <td>
                  {p.id !== me.id && (p.role === 'admin'
                    ? <button className="btn btn-ghost btn-sm" onClick={() => confirm(`Remove admin access for ${p.email}?`) && void setRole(p.id, 'client')}>Make client</button>
                    : <button className="btn btn-ghost btn-sm" onClick={() => confirm(`Give ${p.email} full admin access?`) && void setRole(p.id, 'admin')}>Make admin</button>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Audit log ---------------- */
export function AuditAdmin() {
  const look = useLookups();
  const rows = useAsync(() => q<AuditRow[]>(db().from('audit_log').select('id, actor_id, action, entity, entity_id, at').order('at', { ascending: false }).limit(300)), []);
  if (rows.loading || !look.data) return <Loading />;
  return (
    <div className="card">
      <h2>Audit log</h2>
      <p className="muted small">Every change to bookings, invoices, profiles, services, retainers, and agreements.</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Record</th></tr></thead>
          <tbody>
            {(rows.data ?? []).map((r) => (
              <tr key={r.id}>
                <td>{dateTime(r.at)}</td>
                <td>{personName(look.data, r.actor_id) || 'system'}</td>
                <td>{r.action}</td>
                <td>{r.entity} <span className="muted small">{r.entity_id.slice(0, 8)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
