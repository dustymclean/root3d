import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CtaBand, Pipeline } from '../../components/blocks';
import { Reveal } from '../../components/Reveal';
import { coreServices } from '../../data/areas';
import { coreMessage, mission, philosophy, positioning, synergy, tagline, triadThesis, values } from '../../data/company';
import { team } from '../../data/team';
import { asset } from '../../lib/data';

export function About() {
  return (
    <>
      <section className="section">
        <div className="container split">
          <div>
            <p className="eyebrow">About Root3D</p>
            <h1>{tagline}</h1>
            <p className="lede">{mission}</p>
            <p>{philosophy}</p>
            <p className="core-line">{coreMessage.join(' ')}</p>
          </div>
          <div className="hero-logo">
            <img src={asset('logo-full.jpg')} alt="Root3D Consulting logo" width={900} height={900} />
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The operational triad</p>
            <h2>{positioning}</h2>
            {triadThesis.map((p) => <p key={p} className="lede">{p}</p>)}
          </div>
          <div className="grid grid-3">
            {team.map((t, i) => (
              <Reveal key={t.slug} delay={i * 90}>
                <Link to={`/team/${t.slug}`} className="card person-card">
                  <div className="photo">
                    <img src={asset(t.photo)} alt={t.photoAlt} style={{ objectPosition: t.photoPosition ?? 'center' }} loading="lazy" />
                  </div>
                  <div className="body">
                    <p className="eyebrow" style={{ marginBottom: '0.25rem' }}>{t.focus}</p>
                    <h3>{t.name}</h3>
                    <div className="role">{t.headline}</div>
                    <p className="muted small">“{t.approach}”</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Synergy</p>
            <h2>What each of us brings to the same job</h2>
          </div>
          <div className="grid grid-2">
            {synergy.map((s) => (
              <div key={s.area} className="card">
                <h3>{s.area}</h3>
                <dl className="synergy-dl">
                  <dt>Joel</dt><dd>{s.joel}</dd>
                  <dt>Danny</dt><dd>{s.danny}</dd>
                  <dt>Dusty</dt><dd>{s.dusty}</dd>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Documentation philosophy</p>
            <h2>If it is not written down, it did not happen</h2>
            <p>Every engagement moves through ten stages. Cross-correlation connects evidence and lessons across agriculture, engineering, compliance, technology, and business, and we keep citations, sources, decisions, and version history along the way.</p>
          </div>
          <Pipeline />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we believe</p>
            <h2>How we work</h2>
          </div>
          <div className="grid grid-3">
            {values.map((v) => (
              <div key={v.title} className="card">
                <h3>{v.title}</h3>
                <p className="muted small">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Core consulting services</p>
            <h2>Everything from the root zone to the register</h2>
          </div>
          <ul className="check-grid">
            {coreServices.map((s) => <li key={s}><CheckCircle2 size={16} /> {s}</li>)}
          </ul>
          <div className="btn-row mt">
            <Link to="/services" className="btn btn-primary">Browse practice areas <ArrowRight size={16} /></Link>
            <Link to="/team" className="btn btn-ghost">Meet the consultants</Link>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
