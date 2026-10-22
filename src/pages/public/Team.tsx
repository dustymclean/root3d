import { ArrowLeft, CalendarCheck, CheckCircle2, Clock, Quote } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { CtaBand } from '../../components/blocks';
import { Reveal } from '../../components/Reveal';
import { Notice, PageHead } from '../../components/ui';
import { findArea } from '../../data/areas';
import { positioning, synergy } from '../../data/company';
import { findConsultant, team } from '../../data/team';
import { asset } from '../../lib/data';

function Pending() {
  return <span className="tag review">pending review</span>;
}

export function Team() {
  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Meet the consultants" title={positioning}>
            Joel handles inputs, chemistry, and margins. Danny owns the canopy, infrastructure, and training. Dusty runs
            data, documentation, and storefronts. Hunter reads the rules and knows molds and devices. Hire one of us or the
            whole team. Your history is shared, so you never repeat
            yourself.
          </PageHead>
          <div className="grid team-grid">
            {team.map((t, i) => (
              <Reveal key={t.slug} delay={i * 90}>
                <Link to={`/team/${t.slug}`} className="card person-card">
                  <div className="photo">
                    <img src={asset(t.photo)} alt={t.photoAlt} style={{ objectPosition: t.photoPosition ?? 'center' }} />
                  </div>
                  <div className="body">
                    <h3>{t.name}</h3>
                    <div className="role">{t.headline}</div>
                    <p className="muted small">{t.summary}</p>
                    <div className="chips">
                      {t.specialties.slice(0, 3).map((s) => <span className="chip" key={s.title}>{s.title}</span>)}
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Working together</p>
            <h2>One engagement, four specialists</h2>
          </div>
          <div className="grid grid-2">
            {synergy.map((s) => (
              <div key={s.area} className="card">
                <h3>{s.area}</h3>
                <dl className="synergy-dl">
                  <dt>Joel</dt><dd>{s.joel}</dd>
                  <dt>Danny</dt><dd>{s.danny}</dd>
                  <dt>Dusty</dt><dd>{s.dusty}</dd>
                  <dt>Hunter</dt><dd>{s.hunter}</dd>
                </dl>
              </div>
            ))}
          </div>
          <div className="btn-row mt">
            <Link to="/book" className="btn btn-primary"><CalendarCheck size={18} /> Book a session</Link>
            <Link to="/contact?topic=Full%20team%20engagement" className="btn btn-ghost">Ask about a full-team engagement</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export function TeamProfile() {
  const { slug = '' } = useParams();
  const c = findConsultant(slug);
  if (!c) return <Navigate to="/team" replace />;
  const pending = c.background.some((b) => b.needsReview) || c.story.some((s) => s.needsReview);
  const others = team.filter((t) => t.slug !== c.slug);

  return (
    <>
      <section className="section">
        <div className="container">
          <Link to="/team" className="row small" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> All consultants
          </Link>
          <div className="profile">
            <div>
              <div className="photo">
                <img src={asset(c.photo)} alt={c.photoAlt} style={{ objectPosition: c.photoPosition ?? 'center' }} />
              </div>
              <div className="card mt">
                <h3 style={{ fontSize: '1.05rem' }}>Book {c.first}</h3>
                <p className="muted small">Zoom, Discord, or Signal. Free 15-minute discovery calls available.</p>
                <div className="stack">
                  <Link to={`/book?consultant=${c.slug}&service=discovery`} className="btn btn-primary"><CalendarCheck size={18} /> Free discovery call</Link>
                  <Link to={`/book?consultant=${c.slug}`} className="btn btn-ghost">All session types</Link>
                  <Link to={`/contact?topic=${encodeURIComponent('Question for ' + c.name)}`} className="btn btn-ghost">Ask a question</Link>
                </div>
              </div>
              {c.video && (
                <figure className="profile-video">
                  <video src={asset(c.video)} muted loop playsInline autoPlay controls preload="metadata" aria-label={`Short clip of ${c.name}`} />
                  <figcaption>Meet {c.first}</figcaption>
                </figure>
              )}
            </div>
            <div>
              <p className="eyebrow">{c.focus}</p>
              <h1>{c.name}</h1>
              <p className="role" style={{ color: 'var(--gold)', fontWeight: 600 }}>{c.headline}</p>
              <p className="muted small">{c.title}</p>
              <p className="lede">{c.summary}</p>
              <blockquote className="approach"><Quote size={18} /> {c.approach}</blockquote>

              {pending && (
                <Notice>Some details below come from our internal brief and are pending verification with {c.first}. They are marked until confirmed.</Notice>
              )}

              <h2 style={{ fontSize: '1.4rem' }}>Story</h2>
              <div className="story">
                {c.story.map((s) => (
                  <p key={s.text}>{s.text} {s.needsReview && <Pending />}</p>
                ))}
              </div>

              <h2 style={{ fontSize: '1.4rem' }}>Specialties</h2>
              <div className="grid grid-2">
                {c.specialties.map((s) => (
                  <div key={s.title} className="card specialty">
                    <h3>{s.title} {s.needsReview && <Pending />}</h3>
                    <p className="muted small">{s.text}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ fontSize: '1.4rem', marginTop: '2rem' }}>Background & credentials</h2>
              <ul className="claim-list">
                {c.background.map((b) => (
                  <li key={b.text}>
                    {b.needsReview ? <Clock size={16} color="var(--warn-fg)" /> : <CheckCircle2 size={16} />}
                    <span>{b.text} {b.needsReview && <Pending />}</span>
                  </li>
                ))}
              </ul>

              <h2 style={{ fontSize: '1.4rem' }}>Consultation categories</h2>
              <div className="chips">
                {c.categories.map((s) => <span className="chip" key={s}>{s}</span>)}
              </div>

              <h2 style={{ fontSize: '1.4rem', marginTop: '2rem' }}>Practice areas</h2>
              <div className="chips">
                {c.areas.map((a) => {
                  const area = findArea(a);
                  return area ? (
                    <Link className="chip" key={a} to={`/services/${a}`}>{area.title}</Link>
                  ) : a === 'grow-coach' ? (
                    <Link className="chip" key={a} to="/grow-coach">Grow Coach Connection</Link>
                  ) : null;
                })}
              </div>

              <h2 style={{ fontSize: '1.4rem', marginTop: '2rem' }}>Works with</h2>
              <p className="muted">
                {c.first} regularly pairs with {others.map((o) => <Link key={o.slug} to={`/team/${o.slug}`}>{o.name}</Link>).reduce<ReactNode[]>((acc, el, i, all) => (i === 0 ? [el] : [...acc, i === all.length - 1 ? ', and ' : ', ', el]), [])} on combined engagements.
              </p>
            </div>
          </div>
        </div>
      </section>
      <CtaBand title={`Talk with ${c.first}`} />
    </>
  );
}
