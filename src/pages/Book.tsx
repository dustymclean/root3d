import { ArrowRight, CalendarCheck, Download, Upload, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ErrorText, Field, Loading, Notice, PageHead, Success } from '../components/ui';
import { asset, useConsultants, useServices } from '../lib/data';
import { dateTime, icsFor, money, timeOnly } from '../lib/format';
import { q, supabase } from '../lib/supabase';
import { openSlots, todayIn, weekdayOf } from '../lib/time';
import type { Availability, Booking } from '../lib/types';
import { useAuth } from '../store/auth';

export function Book() {
  const [params, setParams] = useSearchParams();
  const services = useServices();
  const consultants = useConsultants();
  const profile = useAuth((s) => s.profile);
  const navigate = useNavigate();

  const serviceId = params.get('service');
  const slug = params.get('consultant');
  const day = params.get('day');
  const time = params.get('time');
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [notes, setNotes] = useState('');
  const [hours, setHours] = useState<Availability[]>([]);
  const [slots, setSlots] = useState<Date[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<Booking | null>(null);

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) v === null ? next.delete(k) : next.set(k, v);
    setParams(next, { replace: true });
  };

  const bookable = (services.data ?? []).filter((s) => s.bookable && s.active);
  const service = bookable.find((s) => s.id === serviceId);
  const list = (consultants.data ?? []).filter((c) => c.active && (!urgentOnly || c.is_available_today));
  const consultant = (consultants.data ?? []).find((c) => c.slug === slug);
  const tz = consultant?.timezone ?? 'America/Chicago';

  useEffect(() => {
    if (!supabase || !slug) return;
    void q(supabase.from('availability').select('*').eq('consultant_slug', slug)).then((r) => setHours(r as Availability[]));
  }, [slug]);

  const days = useMemo(() => {
    const workdays = new Set(hours.map((h) => h.weekday));
    return Array.from({ length: 28 }, (_, i) => todayIn(tz, i)).filter((d) => workdays.has(weekdayOf(d)));
  }, [hours, tz]);

  useEffect(() => {
    if (!supabase || !consultant || !service?.minutes || !day) return;
    setSlots(null);
    const windows = hours.filter((h) => h.weekday === weekdayOf(day));
    const from = new Date(day + 'T00:00:00Z');
    from.setUTCDate(from.getUTCDate() - 1);
    const to = new Date(day + 'T00:00:00Z');
    to.setUTCDate(to.getUTCDate() + 2);
    void supabase
      .rpc('busy_times', { p_consultant: consultant.slug, p_from: from.toISOString(), p_to: to.toISOString() })
      .then(({ data }) =>
        setSlots(
          openSlots({
            day, timeZone: tz, windows, busy: data ?? [], minutes: service.minutes!,
            minNoticeHours: consultant.min_notice_hours, urgent: consultant.is_available_today,
          }),
        ),
      );
  }, [consultant, service, day, hours, tz]);

  async function confirm() {
    if (!supabase || !consultant || !service || !time) return;
    if (!profile) {
      navigate('/login', { state: { from: `/book?${params.toString()}` } });
      return;
    }
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc('book_appointment', {
      p_consultant: consultant.slug, p_service: service.id, p_start: time, p_notes: notes,
    });
    setBusy(false);
    if (error) {
      setError(error.message.includes('no_double_booking') ? 'That time was just taken. Please pick another.' : error.message);
      update({ time: null });
    } else setBooked(data as Booking);
  }

  if (services.loading || consultants.loading) return <Loading />;

  if (booked && consultant && service) {
    return (
      <section className="section">
        <div className="container" style={{ maxWidth: 680 }}>
          <Success>
            <strong>You're booked.</strong> {service.name} with {consultant.name}, {dateTime(booked.starts_at)}.
          </Success>
          <div className="card mt stack">
            <p>
              Add photos, lab results, schematics, or logs to your pre-call inbox so {consultant.name.split(' ')[0]} can
              review them before the session starts.
            </p>
            <div className="btn-row">
              <Link className="btn btn-primary" to={`/portal/appointments/${booked.id}`}><Upload size={18} /> Open pre-call inbox</Link>
              <a className="btn btn-ghost" download="root3d-session.ics"
                href={icsFor({ id: booked.id, title: `${service.name} with ${consultant.name}`, start: booked.starts_at, end: booked.ends_at, url: window.location.origin + import.meta.env.BASE_URL + `portal/appointments/${booked.id}` })}>
                <Download size={18} /> Add to calendar
              </a>
            </div>
            {service.price_cents > 0 && <p className="muted small">An invoice for {money(service.price_cents)} is in your portal.</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <PageHead eyebrow="Book" title="Schedule a session">
          Pick what you need, who you want, and when. You can reschedule or cancel from your portal up to 24 hours ahead.
        </PageHead>
        {!supabase && <Notice>Online booking turns on once the site's database is connected. Until then, please use the contact page.</Notice>}
        <div className="booking">
          <div>
            <div className="booking-step">
              <h3><span className="step-num">1</span> What do you need?</h3>
              <div className="option-grid">
                {bookable.map((s) => (
                  <button key={s.id} className="option" aria-pressed={s.id === serviceId} onClick={() => update({ service: s.id, time: null })}>
                    <div>
                      <strong>{s.name}</strong>
                      <small>{s.minutes} min · {s.price_cents ? money(s.price_cents) : 'Free'}</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="booking-step">
              <div className="row between">
                <h3 style={{ margin: 0 }}><span className="step-num">2</span> Who would you like?</h3>
                <label className="check small">
                  <input type="checkbox" checked={urgentOnly} onChange={(e) => setUrgentOnly(e.target.checked)} />
                  <Zap size={14} /> Available today
                </label>
              </div>
              <div className="option-grid mt">
                {list.map((c) => (
                  <button key={c.slug} className="option" aria-pressed={c.slug === slug} onClick={() => update({ consultant: c.slug, day: null, time: null })}>
                    <img src={asset(c.photo)} alt="" />
                    <div>
                      <strong>{c.name}</strong>
                      <small>{c.is_available_today ? 'Same-day available' : c.title.split('·')[0]}</small>
                    </div>
                  </button>
                ))}
                {list.length === 0 && <p className="muted">No one is marked available today. Turn off the filter to see upcoming times.</p>}
              </div>
            </div>

            {consultant && service && (
              <div className="booking-step">
                <h3><span className="step-num">3</span> When?</h3>
                <p className="muted small">Times shown in your local time zone.</p>
                <div className="days" role="listbox" aria-label="Day">
                  {days.map((d) => {
                    const dt = new Date(d + 'T12:00:00');
                    return (
                      <button key={d} className="option day" aria-pressed={d === day} onClick={() => update({ day: d, time: null })}>
                        <small>{dt.toLocaleDateString('en-US', { weekday: 'short' })}</small>
                        <strong>{dt.getDate()}</strong>
                        <small>{dt.toLocaleDateString('en-US', { month: 'short' })}</small>
                      </button>
                    );
                  })}
                </div>
                {day && (slots === null ? <Loading label="Checking the calendar" /> : slots.length === 0 ? (
                  <p className="muted mt">No open times that day. Try another.</p>
                ) : (
                  <div className="slots">
                    {slots.map((s) => (
                      <button key={s.toISOString()} className="option slot" aria-pressed={s.toISOString() === time} onClick={() => update({ time: s.toISOString() })}>
                        {timeOnly(s)}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {time && (
              <div className="booking-step">
                <h3><span className="step-num">4</span> Anything we should know?</h3>
                <Field label="Notes for your consultant (optional)">
                  <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Facility type, license status, what's going wrong…" />
                </Field>
              </div>
            )}
          </div>

          <aside className="card summary">
            <h3>Summary</h3>
            <dl>
              <dt>Service</dt><dd>{service?.name ?? '—'}</dd>
              <dt>Consultant</dt><dd>{consultant?.name ?? '—'}</dd>
              <dt>When</dt><dd>{time ? dateTime(time) : '—'}</dd>
              <dt>Length</dt><dd>{service?.minutes ? `${service.minutes} min` : '—'}</dd>
              <dt>Price</dt><dd>{service ? (service.price_cents ? money(service.price_cents) : 'Free') : '—'}</dd>
            </dl>
            <ErrorText error={error} />
            <button className="btn btn-primary" style={{ width: '100%' }} disabled={!time || busy || !supabase} onClick={confirm}>
              <CalendarCheck size={18} /> {profile ? 'Confirm booking' : 'Sign in to confirm'} {!profile && <ArrowRight size={16} />}
            </button>
            <p className="muted small mt">Free cancellation up to 24 hours before. Later cancellations and no-shows may be charged.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
