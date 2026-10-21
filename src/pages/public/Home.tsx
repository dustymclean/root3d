import { ArrowRight, CalendarCheck, FileText, MessagesSquare, ShieldCheck, Sparkles, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { serviceLanes } from '../../data/services';
import { team } from '../../data/team';
import { asset } from '../../lib/data';

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <Reveal>
            <p className="eyebrow">Cannabis consulting, done by operators</p>
            <h1>
              From license to harvest, <em>rooted</em> in real operations.
            </h1>
            <p className="lede">
              Root3D pairs compliance precision with hands-on cultivation science. Pick one consultant or the whole team,
              book in minutes, and keep every file, plan, and invoice in one place.
            </p>
            <div className="btn-row">
              <Link to="/book" className="btn btn-primary">
                Book a free discovery call <ArrowRight size={18} />
              </Link>
              <Link to="/pricing" className="btn btn-ghost">
                See pricing
              </Link>
            </div>
            <div className="trust-row">
              <span><ShieldCheck size={18} /> Inspection-ready SOPs</span>
              <span><Video size={18} /> Live video coaching</span>
              <span><FileText size={18} /> Written action plan every session</span>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="hero-logo">
              <img src={asset('logo-full.jpg')} alt="Root3D Consulting: hardening the cannabis supply chain from seed to sale. People, plants, solutions." width={900} height={900} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What we do</p>
            <h2>Eight lanes, one team, no hand-offs</h2>
            <p className="lede">Regulators and plants both punish guesswork. We cover the paperwork and the canopy so nothing falls between them.</p>
          </div>
          <div className="grid grid-4">
            {serviceLanes.map((s, i) => (
              <Reveal key={s.title} delay={(i % 4) * 70} as="article" className="card hover">
                <div className="icon-chip"><Icon name={s.icon} size={20} /></div>
                <h3>{s.title}</h3>
                <p className="muted small">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">The team</p>
            <h2>Inputs, canopy, and data</h2>
            <p className="lede">Each partner owns a layer of the operation. Book one, or bring all three to the table.</p>
          </div>
          <div className="grid grid-3">
            {team.map((t, i) => (
              <Reveal key={t.slug} delay={i * 90}>
                <Link to={`/team/${t.slug}`} className="card person-card">
                  <div className="photo">
                    <img src={asset(t.photo)} alt={t.name} style={{ objectPosition: t.photoPosition ?? 'center' }} loading="lazy" />
                  </div>
                  <div className="body">
                    <h3>{t.name}</h3>
                    <div className="role">{t.title}</div>
                    <p className="muted small">{t.focus}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">How it works</p>
            <h2>Everything happens here</h2>
            <p>No email chains, no lost attachments, no re-explaining your facility to a new consultant.</p>
          </div>
          <div className="steps">
            {[
              { icon: CalendarCheck, title: 'Book', text: 'Choose a consultant and a time that works. Reschedule or cancel yourself.' },
              { icon: FileText, title: 'Prepare', text: 'Drop photos, lab results, and logs in your pre-call inbox.' },
              { icon: Video, title: 'Meet', text: 'Join a private video room right from your portal.' },
              { icon: Sparkles, title: 'Act', text: 'Get a written action plan with at least three concrete steps.' },
              { icon: MessagesSquare, title: 'Follow up', text: 'Message the team any time. Your history is shared across all three.' },
            ].map((s, i) => (
              <Reveal key={s.title} delay={i * 80} className="step">
                <s.icon size={22} color="var(--gold)" />
                <h3 style={{ marginTop: '0.5rem' }}>{s.title}</h3>
                <p className="small">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="card" >
            <div className="row between">
              <div style={{ maxWidth: 620 }}>
                <p className="eyebrow">Start small</p>
                <h2>Fifteen minutes, no cost</h2>
                <p className="muted">
                  A peer-to-peer discovery call with one of the partners. Tell us where you are and we will tell you
                  honestly whether we can help.
                </p>
              </div>
              <Link to="/book" className="btn btn-primary">
                Pick a time <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
