import {
  ArrowRight, BookOpen, Calculator, ClipboardList, FileText, Leaf, ShieldCheck, Stethoscope, Thermometer, Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CtaBand, Pipeline } from '../../components/blocks';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { areas } from '../../data/areas';
import { audiences, coreMessage, mission, pillars, positioning, synergy, triadThesis } from '../../data/company';
import { sessionFeatures } from '../../data/growcoach';
import { team } from '../../data/team';
import { asset, useServices } from '../../lib/data';
import { money } from '../../lib/format';

const tools = [
  { to: '/resources/sop-generator', icon: ClipboardList, title: 'SOP Generator', text: 'Pick your business type and state, answer a few questions, and download an editable SOP draft.' },
  { to: '/resources/total-thc', icon: Calculator, title: 'Total THC calculator', text: 'Run (THCA × 0.877) + Δ9-THC from your COA and compare it with a limit.' },
  { to: '/resources/vpd', icon: Thermometer, title: 'VPD calculator', text: 'Turn temperature and humidity into vapor pressure deficit, with leaf-temperature offset.' },
  { to: '/resources/troubleshooter', icon: Stethoscope, title: 'Plant troubleshooter', text: 'A decision tree that narrows down common leaf symptoms and tells you what to check first.' },
  { to: '/knowledge-base', icon: BookOpen, title: 'Compliance Vault', text: 'Source-backed guides on Total THC, seed-to-sale, hemp, IPM, irrigation, and more.' },
];

export function Home() {
  const { data } = useServices();
  const price = (id: string) => data?.find((s) => s.id === id)?.price_cents;

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <Reveal>
            <p className="eyebrow">{pillars.join(' · ')}</p>
            <h1>
              Hardening the cannabis supply chain <em>from seed to sale.</em>
            </h1>
            <p className="lede">{positioning} Root3D combines commercial cultivation, agricultural science, facility engineering, compliance, and technology so the fix works in the room, on paper, and on the balance sheet.</p>
            <div className="btn-row">
              <Link to="/book?service=discovery" className="btn btn-primary">
                Book a free discovery call <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="btn btn-ghost">Explore services</Link>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={18} /> Inspection-ready documentation</span>
              <span><Video size={18} /> Video, phone, or on-site</span>
              <span><FileText size={18} /> A written action plan every session</span>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="hero-logo">
              <img src={asset('logo-full.jpg')} alt="Root3D Consulting: hardening the cannabis supply chain from seed to sale. People, plants, solutions." width={900} height={900} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="message-band" aria-label="Core message">
        <div className="container">
          <p>
            {coreMessage.map((w, i) => (
              <span key={w} className={i === coreMessage.length - 1 ? 'accent' : ''}>{w} </span>
            ))}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <Reveal>
            <p className="eyebrow">Why Root3D</p>
            <h2>Problems do not stay in one department. Neither do we.</h2>
            {triadThesis.map((p) => <p key={p} className="muted">{p}</p>)}
            <p className="muted">{mission}</p>
            <Link to="/about" className="btn btn-ghost mt">About Root3D <ArrowRight size={16} /></Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="triad">
              {team.map((t) => (
                <Link to={`/team/${t.slug}`} key={t.slug} className="triad-item">
                  <img src={asset(t.photo)} alt="" style={{ objectPosition: t.photoPosition ?? 'center' }} />
                  <div>
                    <strong>{t.name}</strong>
                    <span className="small muted">{t.focus}</span>
                  </div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we do</p>
            <h2>Seven practice areas, one team</h2>
            <p className="lede">Hire us for one problem or the whole operation. Each area has a lead, and every engagement draws on the whole team when it needs to.</p>
          </div>
          <div className="grid grid-3">
            {areas.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 3) * 70}>
                <Link to={`/services/${a.slug}`} className="card hover area-card">
                  <div className="icon-chip"><Icon name={a.icon} size={20} /></div>
                  <h3>{a.title}</h3>
                  <p className="muted small">{a.short}</p>
                  <span className="more">Learn more <ArrowRight size={14} /></span>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={140}>
              <Link to="/grow-coach" className="card hover area-card feature">
                <div className="icon-chip"><Leaf size={20} /></div>
                <h3>Grow Coach Connection</h3>
                <p className="small">Live video coaching for home growers and commercial cultivators, with Macro Mode, a pre-call inbox, and a written action plan.</p>
                <span className="more">Meet a coach <ArrowRight size={14} /></span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Meet the consultants</p>
            <h2>Four backgrounds. Four perspectives.</h2>
            <p className="lede">One commitment to solving real problems. Book one consultant, or bring the whole team to the table.</p>
          </div>
          <div className="grid team-grid">
            {team.map((t, i) => (
              <Reveal key={t.slug} delay={i * 90}>
                <Link to={`/team/${t.slug}`} className="card person-card">
                  <div className="photo">
                    <img src={asset(t.photo)} alt={t.photoAlt} style={{ objectPosition: t.photoPosition ?? 'center' }} loading="lazy" />
                  </div>
                  <div className="body">
                    <h3>{t.name}</h3>
                    <div className="role">{t.headline}</div>
                    <p className="muted small">{t.summary}</p>
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
            <p className="eyebrow">How we work together</p>
            <h2>Inputs, canopy, and data on every job</h2>
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
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <div className="split">
            <div>
              <p className="eyebrow">Grow Coach Connection</p>
              <h2>A real cultivator, looking at your plants, today.</h2>
              <p>Upload photos and logs, meet in a private video room, zoom in with Macro Mode, and leave with an action plan of at least three steps. Same-day coaches are flagged so you can get help when it matters.</p>
              <div className="btn-row mt">
                <Link to="/grow-coach" className="btn btn-gold">Find a coach <ArrowRight size={16} /></Link>
                <Link to="/book?service=home-grow" className="btn btn-outline-light">Quick 15-minute call</Link>
              </div>
            </div>
            <ul className="feature-list">
              {sessionFeatures.slice(0, 6).map((f) => (
                <li key={f.title}>
                  <Icon name={f.icon} size={18} />
                  <div><strong>{f.title}</strong><span>{f.text}</span></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How every engagement is documented</p>
            <h2>From the first symptom to the follow-up</h2>
            <p className="lede">Every project moves through the same ten stages and is written down as it goes, so the evidence, decisions, and lessons are yours to keep.</p>
          </div>
          <Pipeline />
          <Link to="/case-studies" className="btn btn-ghost mt">See how it plays out <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Free resources</p>
            <h2>Useful before you ever pay us</h2>
            <p className="lede">No sign-up wall. Use the tools, read the guides, and call us when you want a second set of eyes.</p>
          </div>
          <div className="grid grid-3">
            {tools.map((t, i) => (
              <Reveal key={t.to} delay={(i % 3) * 70}>
                <Link to={t.to} className="card hover area-card">
                  <div className="icon-chip"><t.icon size={20} /></div>
                  <h3>{t.title}</h3>
                  <p className="muted small">{t.text}</p>
                  <span className="more">Open <ArrowRight size={14} /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Pricing</p>
            <h2>Start free. Pay by the hour. Keep us on call.</h2>
          </div>
          <div className="grid grid-3">
            <div className="card price-teaser">
              <h3>Discovery call</h3>
              <p className="price">Free</p>
              <p className="muted small">15 minutes with a partner. A peer conversation, not a pitch.</p>
            </div>
            <div className="card price-teaser">
              <h3>Sessions</h3>
              <p className="price">{money(price('standard') ?? 10000)}<span className="cadence"> / hour</span></p>
              <p className="muted small">No contract. Home Grow quick calls from {money(price('home-grow') ?? 2000)}. Grow Coach package {money(price('grow-coach-3') ?? 30000)}.</p>
            </div>
            <div className="card price-teaser">
              <h3>Retainers</h3>
              <p className="price">From {money(price('tier-1') ?? 100000)}<span className="cadence"> / month</span></p>
              <p className="muted small">Target response times from six hours down to one, compliance checks, audits, and priority access.</p>
            </div>
          </div>
          <p className="muted small mt">Draft pricing pending final approval.</p>
          <Link to="/pricing" className="btn btn-ghost">Full pricing <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Who we work with</p>
            <h2>Commercial enough for operators. Welcoming enough for home growers.</h2>
          </div>
          <div className="grid grid-3">
            {audiences.map((a) => (
              <div key={a.title} className="card">
                <h3>{a.title}</h3>
                <p className="muted small">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
