import { ArrowRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { PageHead } from '../../components/ui';
import { serviceLanes } from '../../data/services';
import { useServices } from '../../lib/data';

export function Services() {
  const { data } = useServices();
  const fixed = (data ?? []).filter((s) => s.kind === 'fixed' && s.active);
  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Services" title="Compliance and cultivation, under one roof">
            We work the whole operation: the application, the SOP binder, the irrigation lines, and the nutrient tank.
            Every engagement ends with a written plan you own.
          </PageHead>
          <div className="grid grid-2">
            {serviceLanes.map((s, i) => (
              <Reveal key={s.title} delay={(i % 2) * 80} as="article" className="card">
                <div className="row" style={{ alignItems: 'flex-start' }}>
                  <div className="icon-chip" style={{ flex: 'none' }}><Icon name={s.icon} size={20} /></div>
                  <div>
                    <h3>{s.title}</h3>
                    <p className="muted">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Pre-audit remediation</p>
            <h2>Fixed-fee projects</h2>
            <p className="lede">Scoped, quoted, and delivered with a written report before the inspector arrives.</p>
          </div>
          <div className="grid grid-4">
            {fixed.map((s) => (
              <article key={s.id} className="card">
                <div className="icon-chip"><Wrench size={20} /></div>
                <h3>{s.name}</h3>
                <p className="muted small">{s.description}</p>
              </article>
            ))}
          </div>
          <div className="btn-row mt">
            <Link to="/contact" className="btn btn-primary">Request a quote <ArrowRight size={18} /></Link>
            <Link to="/book" className="btn btn-ghost">Book a discovery call</Link>
          </div>
        </div>
      </section>
    </>
  );
}
