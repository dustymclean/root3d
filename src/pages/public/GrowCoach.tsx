import { ArrowRight, BadgeCheck, CalendarCheck, Search, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CtaBand } from '../../components/blocks';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { Loading, Notice } from '../../components/ui';
import { gearLocker, howItWorks, sessionFeatures, taxonomy } from '../../data/growcoach';
import { findConsultant } from '../../data/team';
import { asset, useConsultants, useServices } from '../../lib/data';
import { money } from '../../lib/format';

/** A drawn trichome field that demonstrates the 2.5x Macro Mode zoom used in video rooms. */
function MacroDemo() {
  const [on, setOn] = useState(false);
  const heads = Array.from({ length: 34 }, (_, i) => ({ x: (i * 37) % 300 + 10, y: ((i * 53) % 170) + 20, h: 14 + ((i * 7) % 16), amber: i % 5 === 0 }));
  return (
    <div className="card macro-demo">
      <div className="macro-frame">
        <svg viewBox="0 0 320 210" className={on ? 'zoomed' : ''} role="img" aria-label="Illustration of trichomes on a leaf surface">
          <rect width="320" height="210" fill="#2f5d3a" />
          {heads.map((t, i) => (
            <g key={i}>
              <line x1={t.x} y1={t.y + t.h} x2={t.x} y2={t.y} stroke="#e8efe4" strokeWidth="1.6" />
              <circle cx={t.x} cy={t.y} r="3.6" fill={t.amber ? '#d9a441' : '#f4f6ef'} opacity="0.95" />
            </g>
          ))}
        </svg>
      </div>
      <div className="row between" style={{ marginTop: '0.75rem' }}>
        <p className="small muted" style={{ margin: 0 }}>Macro Mode: 2.5× digital zoom for trichomes, stomata, and pests.</p>
        <button className="btn btn-ghost btn-sm" aria-pressed={on} onClick={() => setOn(!on)}>{on ? 'Zoom out' : 'Try 2.5×'}</button>
      </div>
    </div>
  );
}

export function GrowCoach() {
  const consultants = useConsultants();
  const services = useServices();
  const [tag, setTag] = useState<string | null>(null);
  const [today, setToday] = useState(false);
  const [text, setText] = useState('');

  const list = useMemo(() => {
    const t = text.trim().toLowerCase();
    return (consultants.data ?? []).filter((c) => {
      if (!c.active) return false;
      if (today && !c.is_available_today) return false;
      if (tag && !c.expertise.includes(tag)) return false;
      if (!t) return true;
      const bio = findConsultant(c.slug);
      const hay = [c.name, c.title, ...c.expertise, ...c.specialties, bio?.summary ?? ''].join(' ').toLowerCase();
      return hay.includes(t);
    });
  }, [consultants.data, tag, today, text]);

  const coachServices = ['home-grow', 'grow-coach', 'grow-coach-3'].map((id) => services.data?.find((s) => s.id === id)).filter(Boolean);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Grow Coach Connection</p>
            <h1>Show us your plants. <em>Get a plan.</em></h1>
            <p className="lede">
              Live video coaching for home growers, hobbyists, and commercial cultivators. Upload photos before the call, meet
              in a private room, zoom in with Macro Mode, and leave with a written action plan.
            </p>
            <div className="btn-row">
              <Link to="/book?service=home-grow" className="btn btn-primary">15-minute quick call <ArrowRight size={16} /></Link>
              <Link to="/book?service=grow-coach" className="btn btn-ghost">Full one-hour session</Link>
            </div>
          </div>
          <MacroDemo />
        </div>
      </section>

      <section className="section soft" id="coaches">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Find a coach</p>
            <h2>Search by growing style or problem</h2>
          </div>
          <div className="coach-filters">
            <label className="search">
              <Search size={18} />
              <input className="input" placeholder="Try “mites”, “living soil”, or “irrigation”" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search coaches" />
            </label>
            <label className="check">
              <input type="checkbox" checked={today} onChange={(e) => setToday(e.target.checked)} />
              <Zap size={16} /> Urgent care: available today
            </label>
          </div>
          <div className="chips" role="group" aria-label="Expertise">
            <button className="chip" aria-pressed={tag === null} onClick={() => setTag(null)}>All</button>
            {taxonomy.map((t) => (
              <button key={t} className="chip" aria-pressed={tag === t} onClick={() => setTag(tag === t ? null : t)}>{t}</button>
            ))}
          </div>
          {consultants.loading ? (
            <Loading />
          ) : (
            <div className="grid grid-3 mt">
              {list.map((c) => {
                const bio = findConsultant(c.slug);
                return (
                  <article key={c.slug} className="card coach">
                    <div className="row">
                      <img className="avatar" src={asset(c.photo)} alt="" style={{ objectPosition: bio?.photoPosition ?? 'center' }} />
                      <div>
                        <h3 style={{ margin: 0 }}>{c.name} {c.verified && <BadgeCheck size={16} aria-label="Verified expert" color="var(--gold)" />}</h3>
                        <span className="small muted">{bio?.focus ?? c.title}</span>
                      </div>
                    </div>
                    {c.is_available_today && <span className="tag today"><Zap size={12} /> Available today</span>}
                    <p className="small muted">{bio?.summary}</p>
                    <div className="chips">{c.expertise.map((e) => <span key={e} className="chip sm">{e}</span>)}</div>
                    <div className="btn-row">
                      <Link to={`/book?consultant=${c.slug}&service=grow-coach`} className="btn btn-primary btn-sm"><CalendarCheck size={16} /> Book</Link>
                      <Link to={`/team/${c.slug}`} className="btn btn-ghost btn-sm">Profile</Link>
                    </div>
                  </article>
                );
              })}
              {list.length === 0 && (
                <p className="muted">No coach matches that filter{today ? ' today' : ''}. Clear a filter, or book the next open time.</p>
              )}
            </div>
          )}
          <p className="muted small mt">Every coach is manually verified by Root3D before they appear here.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Six steps from photo to plan</h2>
          </div>
          <ol className="howto">
            {howItWorks.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 60}>
                <span className="step-num">{i + 1}</span>
                <div><strong>{s.title}</strong><p className="small muted">{s.text}</p></div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Inside a session</p>
            <h2>Built for looking closely</h2>
          </div>
          <div className="grid grid-4">
            {sessionFeatures.map((f) => (
              <div key={f.title} className="dark-card">
                <Icon name={f.icon} size={20} color="var(--gold)" />
                <h3>{f.title}</h3>
                <p className="small">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Pricing</p>
            <h2>Grow Coach sessions</h2>
          </div>
          <div className="grid grid-3">
            {coachServices.map((s) => s && (
              <div key={s.id} className={`card plan ${s.highlight ? 'highlight' : ''}`}>
                <h3>{s.name}</h3>
                <div><span className="price">{money(s.price_cents)}</span> <span className="cadence">{s.kind === 'package' ? 'package' : `/ ${s.minutes} min`}</span></div>
                <p className="small">{s.description}</p>
                <ul>{s.features.map((f) => <li key={f}>{f}</li>)}</ul>
                <Link className={`btn ${s.highlight ? 'btn-primary' : 'btn-ghost'}`} to={s.bookable ? `/book?service=${s.id}` : `/contact?topic=${encodeURIComponent(s.name)}`}>
                  {s.bookable ? 'Book now' : 'Get the package'}
                </Link>
              </div>
            ))}
          </div>
          <p className="muted small mt">Extensions: $25 per additional 15 minutes. All pricing is draft and pending final approval.</p>
          <Notice>Card payments go live only after our payment processor approves Root3D for this kind of consulting. Until then, sessions are invoiced in your portal.</Notice>
        </div>
      </section>

      <section className="section soft" id="gear-locker">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Gear Locker</p>
            <h2>What our coaches ask growers to have on hand</h2>
            <p className="lede">Brand-neutral picks chosen by our coaches. If we ever add affiliate links, they will be labeled.</p>
          </div>
          <div className="grid grid-2">
            {gearLocker.map((g) => (
              <div key={g.category} className="card">
                <h3>{g.category}</h3>
                <ul className="gear">
                  {g.items.map((it) => <li key={it.name}><strong>{it.name}</strong><span className="small muted">{it.why}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="card row between" style={{ flexWrap: 'wrap' }}>
            <div style={{ maxWidth: 620 }}>
              <h3>Not sure what is wrong yet?</h3>
              <p className="muted">Run the free plant troubleshooter first. It narrows down common leaf symptoms and tells you what to photograph for your coach.</p>
            </div>
            <Link to="/resources/troubleshooter" className="btn btn-ghost">Open the troubleshooter <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
