import { CalendarClock, Clock, Download, ExternalLink, FileText, Link2, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DirectContact } from '../../components/DirectContact';
import { ErrorText, Field, Loading, StatusPill, Success } from '../../components/ui';
import { modeBlurbs, modeIcons, modeLabels } from '../../lib/contact';
import { dateTime, icsFor, timeOnly } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import { openSlots, todayIn, weekdayOf } from '../../lib/time';
import type { ActionPlan, Availability, Booking, BookingLink, Consultant, FileRow, MeetingLink, PlanStep } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { personName, useLookups } from './lookups';
import { BookingTable, FilePanel } from './shared';

export function Appointments() {
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const look = useLookups();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, loading } = useAsync(() => q<Booking[]>(db().from('bookings').select('*').order('starts_at', { ascending: false }).limit(500)), []);
  if (loading || !data || !look.data) return <Loading />;
  const now = Date.now();
  const rows = data.filter((b) => (tab === 'upcoming' ? new Date(b.ends_at).getTime() >= now && b.status === 'confirmed' : !(new Date(b.ends_at).getTime() >= now && b.status === 'confirmed')));
  if (tab === 'upcoming') rows.reverse();
  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>{isAdmin ? 'All appointments' : 'Appointments'}</h2>
        <Link to="/book" className="btn btn-primary btn-sm"><Plus size={16} /> New booking</Link>
      </div>
      <div className="tabs mt" role="tablist">
        <button role="tab" aria-selected={tab === 'upcoming'} onClick={() => setTab('upcoming')}>Upcoming</button>
        <button role="tab" aria-selected={tab === 'past'} onClick={() => setTab('past')}>Past & cancelled</button>
      </div>
      <BookingTable rows={rows} consultants={look.data.consultants} services={look.data.services} profiles={isAdmin ? look.data.profiles : undefined} />
    </div>
  );
}

export function AppointmentDetail() {
  const { id = '' } = useParams();
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const look = useLookups();
  const booking = useAsync(() => q<Booking>(db().from('bookings').select('*').eq('id', id).single()), [id]);
  const files = useAsync(() => q<FileRow[]>(db().from('files').select('*').eq('booking_id', id).order('created_at')), [id]);
  const plan = useAsync(() => q<ActionPlan | null>(db().from('action_plans').select('*').eq('booking_id', id).maybeSingle()), [id]);
  const link = useAsync(() => q<BookingLink | null>(db().from('booking_links').select('*').eq('booking_id', id).maybeSingle()), [id]);
  const paid = useAsync(async () => {
    const { data } = await db().rpc('booking_is_paid', { p_booking: id });
    return data === true;
  }, [id]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'none' | 'reschedule' | 'cancel'>('none');
  const [reason, setReason] = useState('');

  if (booking.loading || !look.data) return <Loading />;
  const meetingUrl = link.data?.url ?? '';
  if (!booking.data) return <ErrorText error={booking.error ?? 'Not found'} />;
  const b = booking.data;
  const c = look.data.consultants[b.consultant_slug];
  const s = look.data.services[b.service_id];
  const start = new Date(b.starts_at).getTime();
  const end = new Date(b.ends_at).getTime();
  const now = Date.now();
  const live = b.status === 'confirmed' && now > start - 15 * 60_000 && now < end + 30 * 60_000;
  const ModeIcon = modeIcons[b.mode] ?? Link2;
  const upcoming = b.status === 'confirmed' && start > now;

  async function rpc(name: string, args: Record<string, unknown>) {
    setError(null);
    const { error } = await db().rpc(name, args);
    if (error) setError(error.message);
    else {
      setMode('none');
      void booking.reload();
    }
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>{s?.name}</p>
            <h2 style={{ margin: 0 }}>{dateTime(b.starts_at)}</h2>
            <p className="muted">
              with {c?.name}
              {isAdmin && <> · client <Link to={`/portal/admin/clients/${b.client_id}`}>{personName(look.data, b.client_id)}</Link></>}
              {b.extended_minutes > 0 && <> · extended {b.extended_minutes} min</>}
            </p>
          </div>
          <StatusPill status={b.late_cancel ? 'late cancel' : b.status} />
        </div>
        <p className="row small">
          <ModeIcon size={16} />
          <span>
            <strong>{modeLabels[b.mode] ?? b.mode}.</strong>{' '}
            {b.mode === 'onsite'
              ? `On-site visit at ${b.location}`
              : b.location
                ? `${isAdmin ? 'Client' : 'Your'} ${modeLabels[b.mode]} username: ${b.location}`
                : modeBlurbs[b.mode]}
          </span>
        </p>
        {b.status === 'confirmed' && b.mode !== 'onsite' && !meetingUrl && !isAdmin && (
          <p className="muted small">
            {paid.data === false
              ? `Your ${modeLabels[b.mode]} link appears here once this session's invoice is paid.`
              : `Your consultant will post the ${modeLabels[b.mode]} link here before the call.`}
          </p>
        )}
        {live && <SessionClock start={start} end={end} />}
        {b.notes && <p><strong>Notes:</strong> {b.notes}</p>}
        <div className="btn-row">
          {meetingUrl && b.status === 'confirmed' && (
            <a className="btn btn-primary" href={meetingUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} /> Open {modeLabels[b.mode]}</a>
          )}
          {(b.status === 'completed' || plan.data) && (
            <Link className="btn btn-ghost" to={`/portal/appointments/${b.id}/report`}><FileText size={18} /> Session report</Link>
          )}
          {upcoming && <button className="btn btn-ghost" onClick={() => setMode('reschedule')}><CalendarClock size={18} /> Reschedule</button>}
          {upcoming && <button className="btn btn-ghost" onClick={() => setMode('cancel')}><XCircle size={18} /> Cancel</button>}
          <a className="btn btn-ghost" download="root3d-session.ics" href={icsFor({ id: b.id, title: `${s?.name} with ${c?.name}`, start: b.starts_at, end: b.ends_at })}>
            <Download size={18} /> Calendar
          </a>
          {isAdmin && b.status === 'confirmed' && start < now && (
            <button className="btn btn-ghost" onClick={() => void db().from('bookings').update({ status: 'no_show' }).eq('id', b.id).then(() => booking.reload())}>Mark no-show</button>
          )}
        </div>
        {mode === 'cancel' && (
          <div className="stack mt">
            {start - now < 24 * 3600_000 && !isAdmin && <p className="error-text">This is inside 24 hours, so the session fee still applies.</p>}
            <Field label="Reason (optional)"><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => void rpc('cancel_booking', { p_booking: b.id, p_reason: reason })}>Confirm cancellation</button>
              <button className="btn btn-ghost" onClick={() => setMode('none')}>Keep it</button>
            </div>
          </div>
        )}
        {mode === 'reschedule' && c && s?.minutes && (
          <Reschedule consultant={c} minutes={s.minutes + b.extended_minutes} onPick={(iso) => void rpc('reschedule_booking', { p_booking: b.id, p_start: iso })} onClose={() => setMode('none')} />
        )}
        <ErrorText error={error} />
        {!isAdmin && c && <div className="mt"><DirectContact slug={c.slug} first={c.name.split(' ')[0]} compact /></div>}
        {isAdmin && b.status === 'confirmed' && b.mode !== 'onsite' && (
          <MeetingLinkEditor booking={b} current={meetingUrl} paid={paid.data !== false} onSaved={() => void link.reload()} />
        )}
      </div>

      <div className="card">
        <h3>Pre-call inbox</h3>
        <FilePanel clientId={b.client_id} bookingId={b.id} files={files.data ?? []} onChange={() => void files.reload()} />
      </div>

      <div className="card">
        <h3>Action plan</h3>
        {plan.loading ? <Loading /> : isAdmin ? (
          <PlanEditor booking={b} plan={plan.data} onSaved={() => { void plan.reload(); void booking.reload(); }} />
        ) : plan.data ? (
          <PlanView plan={plan.data} onChange={() => void plan.reload()} />
        ) : (
          <p className="muted">Your consultant will post a written plan with at least three steps after the session.</p>
        )}
      </div>
    </div>
  );
}

function Reschedule({ consultant, minutes, onPick, onClose }: { consultant: Consultant; minutes: number; onPick: (iso: string) => void; onClose: () => void }) {
  const [hours, setHours] = useState<Availability[]>([]);
  const [day, setDay] = useState('');
  const [slots, setSlots] = useState<Date[]>([]);
  const tz = consultant.timezone;
  useEffect(() => {
    void q<Availability[]>(db().from('availability').select('*').eq('consultant_slug', consultant.slug)).then(setHours);
  }, [consultant.slug]);
  useEffect(() => {
    if (!day) return;
    const from = new Date(day + 'T00:00:00Z');
    from.setUTCDate(from.getUTCDate() - 1);
    const to = new Date(from.getTime() + 3 * 86400_000);
    void db().rpc('busy_times', { p_consultant: consultant.slug, p_from: from.toISOString(), p_to: to.toISOString() }).then(({ data }) =>
      setSlots(openSlots({ day, timeZone: tz, windows: hours.filter((h) => h.weekday === weekdayOf(day)), busy: data ?? [], minutes, minNoticeHours: consultant.min_notice_hours, urgent: consultant.is_available_today })),
    );
  }, [day, hours, consultant, minutes, tz]);
  const workdays = new Set(hours.map((h) => h.weekday));
  const days = Array.from({ length: 28 }, (_, i) => todayIn(tz, i)).filter((d) => workdays.has(weekdayOf(d)));
  return (
    <div className="stack mt">
      <Field label="New day">
        <select className="select" value={day} onChange={(e) => setDay(e.target.value)}>
          <option value="">Choose a day</option>
          {days.map((d) => <option key={d} value={d}>{new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</option>)}
        </select>
      </Field>
      {day && (
        <div className="slots">
          {slots.map((s) => <button key={s.toISOString()} className="option slot" onClick={() => onPick(s.toISOString())}>{timeOnly(s)}</button>)}
          {slots.length === 0 && <p className="muted">No open times that day.</p>}
        </div>
      )}
      <div><button className="btn btn-ghost btn-sm" onClick={onClose}>Never mind</button></div>
    </div>
  );
}

export function PlanView({ plan, onChange }: { plan: ActionPlan; onChange: () => void }) {
  const toggle = async (i: number, done: boolean) => {
    await db().rpc('toggle_plan_step', { p_plan: plan.id, p_index: i, p_done: done });
    onChange();
  };
  return (
    <div className="stack">
      {plan.problem && <div><strong>Problem</strong><p>{plan.problem}</p></div>}
      {plan.solution && <div><strong>Solution</strong><p>{plan.solution}</p></div>}
      <div>
        <strong>Steps</strong>
        <div className="stack" style={{ gap: '0.4rem', marginTop: '0.5rem' }}>
          {plan.steps.map((s, i) => (
            <label key={i} className="check">
              <input type="checkbox" checked={s.done} onChange={(e) => void toggle(i, e.target.checked)} />
              <span style={{ textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
            </label>
          ))}
        </div>
      </div>
      {plan.contingencies && <div><strong>Contingencies</strong><p>{plan.contingencies}</p></div>}
      {plan.test_results && <div><strong>Test results</strong><p>{plan.test_results}</p></div>}
    </div>
  );
}

function PlanEditor({ booking, plan, onSaved }: { booking: Booking; plan: ActionPlan | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: plan?.title ?? 'Action plan',
    problem: plan?.problem ?? '',
    solution: plan?.solution ?? '',
    contingencies: plan?.contingencies ?? '',
    test_results: plan?.test_results ?? '',
  });
  const [steps, setSteps] = useState<PlanStep[]>(plan?.steps.length ? plan.steps : [{ text: '', done: false }, { text: '', done: false }, { text: '', done: false }]);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function save(complete: boolean) {
    setError(null);
    setMsg(null);
    const clean = steps.filter((s) => s.text.trim());
    const row = { ...form, steps: clean, booking_id: booking.id, client_id: booking.client_id, consultant_slug: booking.consultant_slug, updated_at: new Date().toISOString() };
    const res = plan ? await db().from('action_plans').update(row).eq('id', plan.id) : await db().from('action_plans').insert(row);
    if (res.error) return setError(res.error.message);
    if (complete) {
      const { error } = await db().rpc('complete_booking', { p_booking: booking.id });
      if (error) return setError(error.message);
    }
    setMsg(complete ? 'Plan saved and session closed.' : 'Plan saved.');
    onSaved();
  }

  return (
    <div className="form">
      <Field label="Title"><input className="input" value={form.title} onChange={set('title')} /></Field>
      <Field label="Problem"><textarea className="textarea" value={form.problem} onChange={set('problem')} /></Field>
      <Field label="Solution"><textarea className="textarea" value={form.solution} onChange={set('solution')} /></Field>
      <div>
        <span className="field-label">Steps (at least 3 to close the session)</span>
        <div className="stack" style={{ gap: '0.5rem', marginTop: '0.4rem' }}>
          {steps.map((s, i) => (
            <div className="row" key={i} style={{ flexWrap: 'nowrap' }}>
              <input className="input" value={s.text} placeholder={`Step ${i + 1}`} onChange={(e) => setSteps(steps.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} />
              <button className="linkish" aria-label="Remove step" onClick={() => setSteps(steps.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
            </div>
          ))}
          <div><button className="btn btn-ghost btn-sm" onClick={() => setSteps([...steps, { text: '', done: false }])}><Plus size={16} /> Add step</button></div>
        </div>
      </div>
      <Field label="Contingencies"><textarea className="textarea" value={form.contingencies} onChange={set('contingencies')} /></Field>
      <Field label="Test results"><textarea className="textarea" value={form.test_results} onChange={set('test_results')} /></Field>
      <ErrorText error={error} />
      {msg && <Success>{msg}</Success>}
      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => void save(false)}>Save plan</button>
        {booking.status === 'confirmed' && <button className="btn btn-primary" onClick={() => void save(true)}>Save and close session</button>}
      </div>
    </div>
  );
}

/** Shows how much of the booked time is left, so the consultant can wrap up on time. */
function SessionClock({ start, end }: { start: number; end: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const left = end - now;
  const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;
  const text = now < start ? `Starts in ${fmt(start - now)}` : left > 0 ? `${fmt(left)} left · ends at ${timeOnly(new Date(end))}` : `Time is up (ended at ${timeOnly(new Date(end))})`;
  return (
    <p className={`row small ${left <= 0 ? 'error-text' : ''}`} aria-live="polite">
      <Clock size={16} /> <strong className="timer">{text}</strong>
    </p>
  );
}

/** Admins attach the Zoom, Discord, or Signal link for this booking. Clients only ever see their own booking's link. */
function MeetingLinkEditor({ booking, current, paid, onSaved }: { booking: Booking; current: string; paid: boolean; onSaved: () => void }) {
  const presets = useAsync(() => q<MeetingLink[]>(db().from('meeting_links').select('*').order('sort')), []);
  const [url, setUrl] = useState(current);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const matching = (presets.data ?? []).filter((p) => p.method === booking.mode);

  async function save(value: string) {
    setErr(null);
    setMsg(null);
    if (value && !/^https:\/\//.test(value)) return setErr('Links must start with https://');
    const { error } = value.trim()
      ? await db().from('booking_links').upsert({ booking_id: booking.id, url: value.trim(), updated_at: new Date().toISOString() })
      : await db().from('booking_links').delete().eq('booking_id', booking.id);
    if (error) setErr(error.message);
    else {
      setMsg(value ? (paid ? 'Link shared with the client.' : 'Link saved. The client sees it once the invoice is paid.') : 'Link removed.');
      onSaved();
    }
  }

  return (
    <div className="stack mt">
      <h3 style={{ margin: 0 }}>{modeLabels[booking.mode]} link for this client</h3>
      {matching.length > 0 && (
        <div className="btn-row">
          {matching.map((p) => (
            <button key={p.id} className="btn btn-ghost btn-sm" onClick={() => { setUrl(p.url); void save(p.url); }}>Use {p.label}</button>
          ))}
        </div>
      )}
      {!paid && <p className="error-text small">This session's invoice is not paid yet. The client will not see the link until it is marked paid in Billing.</p>}
      <Field label="Or paste a link" hint="Only this client can see it, in their appointment page, and only once the session is paid.">
        <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />
      </Field>
      <div className="btn-row">
        <button className="btn btn-primary btn-sm" onClick={() => void save(url)}>Share link</button>
        {current && <button className="btn btn-ghost btn-sm" onClick={() => { setUrl(''); void save(''); }}>Remove</button>}
      </div>
      {msg && <Success>{msg}</Success>}
      <ErrorText error={err} />
    </div>
  );
}
