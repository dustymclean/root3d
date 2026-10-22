import { ArrowRight, CheckCircle2, Leaf, Wrench } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Breadcrumb, CtaBand, TeamChips } from '../../components/blocks';
import { Icon } from '../../components/Icon';
import { Reveal } from '../../components/Reveal';
import { Notice, PageHead } from '../../components/ui';
import { areas, coreServices, findArea } from '../../data/areas';
import { useServices } from '../../lib/data';
import { money } from '../../lib/format';
import type { Service } from '../../lib/types';

export function Services() {
  const { data } = useServices();
  const fixed = (data ?? []).filter((s) => s.kind === 'fixed' && s.active);
  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Services" title="Seven practice areas, from the root zone to the register">
            Individual consulting or combined engagements with the whole team. Project-based audits and remediation
            packages come with defined deliverables and an individual quote.
          </PageHead>
          <div className="grid grid-2">
            {areas.map((a, i) => (
              <Reveal key={a.slug} delay={(i % 2) * 80}>
                <Link to={`/services/${a.slug}`} className="card hover area-row">
                  <div className="icon-chip" style={{ flex: 'none' }}><Icon name={a.icon} size={20} /></div>
                  <div>
                    <h3>{a.title}</h3>
                    <p className="muted">{a.short}</p>
                    <span className="more">See the details <ArrowRight size={14} /></span>
                  </div>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={80}>
              <Link to="/grow-coach" className="card hover area-row feature">
                <div className="icon-chip" style={{ flex: 'none' }}><Leaf size={20} /></div>
                <div>
                  <h3>Grow Coach Connection</h3>
                  <p>Live coaching for home growers, hobbyists, and commercial cultivators.</p>
                  <span className="more">Find a coach <ArrowRight size={14} /></span>
                </div>
              </Link>
            </Reveal>
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
            <Link to="/contact?topic=Project%20quote" className="btn btn-primary">Request a quote <ArrowRight size={18} /></Link>
            <Link to="/book?service=discovery" className="btn btn-ghost">Book a discovery call</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Full list</p>
            <h2>Core consulting services</h2>
          </div>
          <ul className="check-grid">
            {coreServices.map((s) => <li key={s}><CheckCircle2 size={16} /> {s}</li>)}
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function PackageCard({ s }: { s: Service }) {
  const price = s.kind === 'fixed' || s.price_cents === 0 ? 'Quoted' : money(s.price_cents);
  const cadence = s.kind === 'retainer' ? ' / month' : s.minutes && s.kind === 'session' ? ` / ${s.minutes} min` : '';
  return (
    <div className="card">
      <h3>{s.name}</h3>
      <p className="price" style={{ fontSize: '1.6rem' }}>{price}<span className="cadence">{cadence}</span></p>
      <p className="muted small">{s.description}</p>
      <Link className="btn btn-ghost btn-sm" to={s.bookable ? `/book?service=${s.id}` : `/contact?topic=${encodeURIComponent(s.name)}`}>
        {s.bookable ? 'Book' : 'Ask about it'}
      </Link>
    </div>
  );
}

export function AreaPage() {
  const { slug = '' } = useParams();
  const a = findArea(slug);
  const { data } = useServices();
  if (!a) return <Navigate to="/services" replace />;
  const packages = a.packages.map((id) => data?.find((s) => s.id === id)).filter((s): s is Service => !!s && s.active);
  const others = areas.filter((x) => x.slug !== a.slug);

  return (
    <>
      <section className="section">
        <div className="container">
          <Breadcrumb items={[{ to: '/services', label: 'Services' }, { label: a.title }]} />
          <div className="split">
            <div>
              <div className="icon-chip lg"><Icon name={a.icon} size={26} /></div>
              <h1>{a.title}</h1>
              <p className="lede">{a.intro}</p>
              <div className="btn-row mt">
                <Link to="/book?service=discovery" className="btn btn-primary">Book a discovery call <ArrowRight size={16} /></Link>
                <Link to={`/contact?topic=${encodeURIComponent(a.title)}`} className="btn btn-ghost">Request a quote</Link>
              </div>
            </div>
            <div className="card">
              <h3>Sound familiar?</h3>
              <ul className="claim-list">
                {a.problems.map((p) => <li key={p}><CheckCircle2 size={16} /><span>{p}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section soft">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">What you get</p>
            <h2>Deliverables</h2>
          </div>
          <div className="grid grid-2">
            {a.deliverables.map((d, i) => (
              <Reveal key={d.title} delay={(i % 2) * 70} className="card">
                <h3>{d.title}</h3>
                <p className="muted">{d.text}</p>
              </Reveal>
            ))}
          </div>
          <Notice>We do not guarantee regulatory outcomes or specific technical results. We promise careful diagnosis, honest recommendations, and documentation you own.</Notice>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Who leads it</p>
            <h2>Your team for {a.title.toLowerCase()}</h2>
          </div>
          <TeamChips slugs={a.leads} />
        </div>
      </section>

      {packages.length > 0 && (
        <section className="section soft">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Ways to engage</p>
              <h2>Packages that fit</h2>
            </div>
            <div className="grid grid-3">{packages.map((s) => <PackageCard key={s.id} s={s} />)}</div>
            {packages.some((s) => s.is_draft) && <p className="muted small mt">Draft pricing pending final approval.</p>}
          </div>
        </section>
      )}

      {a.faqs.length > 0 && (
        <section className="section">
          <div className="container prose">
            <h2>Questions</h2>
            {a.faqs.map((f) => (
              <details key={f.q} className="faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <Link to="/faq" className="small">More answers in the FAQ</Link>
          </div>
        </section>
      )}

      <section className="section soft">
        <div className="container">
          <h2 style={{ fontSize: '1.4rem' }}>Other practice areas</h2>
          <div className="chips">
            {others.map((o) => <Link key={o.slug} to={`/services/${o.slug}`} className="chip">{o.title}</Link>)}
            <Link to="/grow-coach" className="chip">Grow Coach Connection</Link>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
