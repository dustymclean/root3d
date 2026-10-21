import { ArrowRight, CalendarCheck, Mail, Send } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { contactEmail, pipeline } from '../data/company';
import { findConsultant } from '../data/team';
import { asset } from '../lib/data';
import { supabase } from '../lib/supabase';
import { ErrorText, Success } from './ui';

/** The documentation philosophy as a numbered track. */
export function Pipeline({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={`pipeline ${compact ? 'compact' : ''}`}>
      {pipeline.map((s, i) => (
        <li key={s.key}>
          <span className="pipeline-num">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <strong>{s.title}</strong>
            {!compact && <p className="small muted">{s.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Small avatars linking to consultant profiles. */
export function TeamChips({ slugs }: { slugs: string[] }) {
  return (
    <div className="team-chips">
      {slugs.map((s) => {
        const c = findConsultant(s);
        if (!c) return null;
        return (
          <Link key={s} to={`/team/${s}`} className="team-chip">
            <img src={asset(c.photo)} alt="" style={{ objectPosition: c.photoPosition ?? 'center' }} />
            <span>
              <strong>{c.name}</strong>
              <small>{c.focus}</small>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export function CtaBand({ title = 'Fifteen minutes, no cost', children }: { title?: string; children?: ReactNode }) {
  return (
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            <p className="eyebrow">Start small</p>
            <h2>{title}</h2>
            <p>
              {children ??
                'A peer-to-peer discovery call with one of the partners. Tell us where you are, and we will tell you honestly whether we can help.'}
            </p>
          </div>
          <div className="btn-row">
            <Link to="/book?service=discovery" className="btn btn-gold">
              <CalendarCheck size={18} /> Book a discovery call
            </Link>
            <Link to="/contact" className="btn btn-outline-light">
              Send a message <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Opt-in for resource updates. Free resources never require it. */
export function LeadCapture({ source }: { source: string }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent('Resource updates')}&body=${encodeURIComponent(`Please add ${email} to Root3D resource updates.`)}`;
      return;
    }
    const { error } = await supabase
      .from('contact_requests')
      .insert({ name: name || email, email, topic: 'Resource updates', message: `Opted in from ${source}` });
    if (error) setError(error.message);
    else setDone(true);
  }

  return (
    <div className="card lead">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div className="icon-chip" style={{ flex: 'none' }}><Mail size={20} /></div>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Get new guides when we publish them</h3>
          <p className="muted small">Optional. Everything here stays free either way. One email when a guide or rule summary is added or updated.</p>
          {done ? (
            <Success>You are on the list. Unsubscribe any time by replying to any email.</Success>
          ) : (
            <form className="row" style={{ flexWrap: 'wrap' }} onSubmit={submit}>
              <input className="input" style={{ flex: '1 1 160px' }} placeholder="Name (optional)" value={name} onChange={(e) => setName(e.target.value)} aria-label="Name" />
              <input className="input" style={{ flex: '2 1 220px' }} type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button className="btn btn-primary btn-sm"><Send size={16} /> Subscribe</button>
            </form>
          )}
          <ErrorText error={error} />
        </div>
      </div>
    </div>
  );
}

export function Disclaimer({ children }: { children?: ReactNode }) {
  return (
    <p className="disclaimer-note">
      {children ??
        'Educational information only. Not legal advice. Rules change often; confirm requirements with your regulator, and get professional review for compliance-sensitive decisions.'}
    </p>
  );
}

export function Breadcrumb({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumb">
      {items.map((it, i) => (
        <span key={it.label}>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
          {i < items.length - 1 && <span aria-hidden> / </span>}
        </span>
      ))}
    </nav>
  );
}
