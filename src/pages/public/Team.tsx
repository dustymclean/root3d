import { ArrowLeft, CalendarCheck, CheckCircle2, Clock } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Reveal } from '../../components/Reveal';
import { Notice, PageHead } from '../../components/ui';
import { findConsultant, team } from '../../data/team';
import { asset } from '../../lib/data';

export function Team() {
  return (
    <section className="section">
      <div className="container">
        <PageHead eyebrow="Team" title="Three partners, one shared playbook">
          Joel handles inputs, chemistry, and margins. Danny owns the canopy, plumbing, and training. Dusty runs data,
          alerts, and storefronts. Your history is shared, so you never repeat yourself.
        </PageHead>
        <div className="grid grid-3">
          {team.map((t, i) => (
            <Reveal key={t.slug} delay={i * 90}>
              <Link to={`/team/${t.slug}`} className="card person-card">
                <div className="photo">
                  <img src={asset(t.photo)} alt={t.name} style={{ objectPosition: t.photoPosition ?? 'center' }} />
                </div>
                <div className="body">
                  <h3>{t.name}</h3>
                  <div className="role">{t.title}</div>
                  <p className="muted small">{t.summary}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TeamProfile() {
  const { slug = '' } = useParams();
  const c = findConsultant(slug);
  if (!c) return <Navigate to="/team" replace />;
  const pending = c.background.some((b) => b.needsReview);

  return (
    <section className="section">
      <div className="container">
        <Link to="/team" className="row small" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> All consultants
        </Link>
        <div className="profile">
          <div className="photo">
            <img src={asset(c.photo)} alt={c.name} style={{ objectPosition: c.photoPosition ?? 'center' }} />
          </div>
          <div>
            <p className="eyebrow">{c.focus}</p>
            <h1>{c.name}</h1>
            <p className="role" style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>{c.title}</p>
            <p className="lede">{c.summary}</p>
            <div className="btn-row" style={{ margin: '1.5rem 0 2rem' }}>
              <Link to={`/book?consultant=${c.slug}`} className="btn btn-primary">
                <CalendarCheck size={18} /> Book with {c.name.split(' ')[0]}
              </Link>
              <Link to={`/contact?topic=${encodeURIComponent('Question for ' + c.name)}`} className="btn btn-ghost">Ask a question</Link>
            </div>

            <h2 style={{ fontSize: '1.4rem' }}>Background</h2>
            {pending && (
              <Notice>Some background items below are pending verification and are marked as such until confirmed.</Notice>
            )}
            <ul className="claim-list">
              {c.background.map((b) => (
                <li key={b.text}>
                  {b.needsReview ? <Clock size={16} color="var(--warn-fg)" /> : <CheckCircle2 size={16} />}
                  <span>
                    {b.text} {b.needsReview && <span className="tag review">pending review</span>}
                  </span>
                </li>
              ))}
            </ul>

            <h2 style={{ fontSize: '1.4rem' }}>Specialties</h2>
            <div className="chips">
              {c.specialties.map((s) => (
                <span className="chip" key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
