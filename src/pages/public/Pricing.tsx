import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/Reveal';
import { Notice, PageHead } from '../../components/ui';
import { useServices } from '../../lib/data';
import { money } from '../../lib/format';
import type { Service } from '../../lib/types';

function PlanCard({ s, cta }: { s: Service; cta: { to: string; label: string } }) {
  return (
    <article className={`card plan ${s.highlight ? 'highlight' : ''}`}>
      <div className="plan-meta">
        <h3 style={{ margin: 0 }}>{s.name}</h3>
        {s.highlight && <span className="tag">Popular</span>}
      </div>
      <div>
        <span className="price">{s.price_cents === 0 ? 'Free' : money(s.price_cents)}</span>{' '}
        <span className="cadence">
          {s.kind === 'retainer' ? '/ month' : s.kind === 'package' ? 'package' : s.minutes ? `/ ${s.minutes} min` : ''}
        </span>
      </div>
      <p className="muted small" style={{ marginTop: '0.5rem' }}>{s.response_time}</p>
      <p>{s.description}</p>
      <ul>
        {s.features.map((f) => (
          <li key={f}><Check size={16} /> {f}</li>
        ))}
      </ul>
      <Link to={cta.to} className={`btn ${s.highlight ? 'btn-primary' : 'btn-ghost'}`}>{cta.label}</Link>
    </article>
  );
}

export function Pricing() {
  const { data } = useServices();
  const services = (data ?? []).filter((s) => s.active);
  const sessions = services.filter((s) => s.kind === 'session' || s.kind === 'package');
  const retainers = services.filter((s) => s.kind === 'retainer');
  const anyDraft = services.some((s) => s.is_draft);

  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Pricing" title="Pay for an hour, or keep us on call">
            Sessions need no contract. Retainers run month to month on the billing date you choose, and start once the
            agreement is signed: no contract, no service.
          </PageHead>
          {anyDraft && <Notice>Draft pricing. These rates are still being finalized and may change before launch.</Notice>}
          <h2 style={{ fontSize: '1.5rem' }}>Sessions</h2>
          <div className="grid grid-4">
            {sessions.map((s, i) => (
              <Reveal key={s.id} delay={i * 60}>
                <PlanCard s={s} cta={s.bookable ? { to: `/book?service=${s.id}`, label: 'Book now' } : { to: '/contact', label: 'Ask about it' }} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Retainers</p>
            <h2>Guaranteed response, every month</h2>
          </div>
          <div className="grid grid-3">
            {retainers.map((s, i) => (
              <Reveal key={s.id} delay={i * 80}>
                <PlanCard s={s} cta={{ to: `/contact?topic=${encodeURIComponent(s.name + ' retainer')}`, label: 'Start the conversation' }} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
