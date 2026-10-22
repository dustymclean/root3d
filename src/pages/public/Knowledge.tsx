import { ExternalLink, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { Breadcrumb, CtaBand, Disclaimer, LeadCapture, Pipeline } from '../../components/blocks';
import { Notice, PageHead } from '../../components/ui';
import { pipeline } from '../../data/company';
import { faqGroups } from '../../data/faq';
import { articles, categories, findArticle } from '../../data/knowledge';
import { scenarios } from '../../data/scenarios';
import { findConsultant } from '../../data/team';
import { findArea } from '../../data/areas';

const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/** Simple ranked search over articles and FAQ answers: the cultivator Q&A engine. */
function searchAll(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return { arts: [], faqs: [] };
  const score = (hay: string, weight: number) => terms.reduce((n, t) => n + (hay.includes(t) ? weight : 0), 0);
  const arts = articles
    .map((a) => ({
      a,
      s: score(a.title.toLowerCase(), 5) + score(a.tags.join(' ').toLowerCase(), 4) + score(a.summary.toLowerCase(), 2) +
        score(a.sections.map((x) => [x.h, ...(x.p ?? []), ...(x.list ?? [])].join(' ')).join(' ').toLowerCase(), 1),
    }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a);
  const faqs = faqGroups
    .flatMap((g) => g.items)
    .map((f) => ({ f, s: score(f.q.toLowerCase(), 3) + score(f.a.toLowerCase(), 1) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, 5)
    .map((x) => x.f);
  return { arts, faqs };
}

export function KnowledgeBase() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [cat, setCat] = useState<string | null>(params.get('category'));
  const results = useMemo(() => searchAll(query), [query]);
  const shown = query ? results.arts : articles.filter((a) => !cat || a.category === cat);

  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Knowledge Base · Compliance Vault" title="Source-backed answers for cultivators and operators">
            Practical guides with citations and review dates. Ask a question in plain words and we will match it to guides and
            answers.
          </PageHead>
          <form className="kb-search" onSubmit={(e) => e.preventDefault()}>
            <Search size={20} />
            <input className="input" type="search" value={query} placeholder="Ask a question, e.g. “why are my lower leaves yellow” or “how is total THC calculated”"
              onChange={(e) => { const n = new URLSearchParams(params); e.target.value ? n.set('q', e.target.value) : n.delete('q'); setParams(n, { replace: true }); }}
              aria-label="Search the knowledge base" />
          </form>
          {!query && (
            <div className="chips" role="group" aria-label="Category">
              <button className="chip" aria-pressed={!cat} onClick={() => setCat(null)}>All</button>
              {categories.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{c}</button>)}
            </div>
          )}

          {query && results.faqs.length > 0 && (
            <div className="card mt">
              <h3>Quick answers</h3>
              {results.faqs.map((f) => (
                <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          )}

          <div className="grid grid-3 mt">
            {shown.map((a) => (
              <Link key={a.slug} to={`/knowledge-base/${a.slug}`} className="card hover area-card">
                <span className="tag">{a.category} · {a.jurisdiction}</span>
                <h3 style={{ marginTop: '0.75rem' }}>{a.title}</h3>
                <p className="muted small">{a.summary}</p>
                <span className="small muted">Reviewed {fmt(a.updated)}</span>
              </Link>
            ))}
          </div>
          {query && shown.length === 0 && (
            <Notice>
              Nothing matched yet. Try different words, run the <Link to="/resources/troubleshooter">plant troubleshooter</Link>, or{' '}
              <Link to="/book?service=discovery">book a free 15-minute call</Link> and ask a person.
            </Notice>
          )}
          <Disclaimer />
        </div>
      </section>
      <section className="section soft">
        <div className="container"><LeadCapture source="knowledge base" /></div>
      </section>
    </>
  );
}

export function ArticlePage() {
  const { slug = '' } = useParams();
  const a = findArticle(slug);
  if (!a) return <Navigate to="/knowledge-base" replace />;
  const author = findConsultant(a.author);
  const related = articles.filter((x) => x.slug !== a.slug && (x.category === a.category || x.tags.some((t) => a.tags.includes(t)))).slice(0, 3);

  return (
    <>
      <section className="section">
        <div className="container prose">
          <Breadcrumb items={[{ to: '/knowledge-base', label: 'Knowledge Base' }, { label: a.category }]} />
          <span className="tag">{a.category} · {a.jurisdiction}</span>
          <h1 style={{ marginTop: '0.75rem' }}>{a.title}</h1>
          <p className="lede">{a.summary}</p>
          <p className="small muted">
            Reviewed {fmt(a.updated)}{author && <> by <Link to={`/team/${author.slug}`}>{author.name}</Link></>}
          </p>
          {a.sections.map((s) => (
            <div key={s.h}>
              <h2>{s.h}</h2>
              {s.p?.map((p) => <p key={p}>{p}</p>)}
              {s.list && <ul>{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
            </div>
          ))}
          <h2>Sources</h2>
          <ul className="sources">
            {a.sources.map((s) => (
              <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label} <ExternalLink size={14} /></a></li>
            ))}
          </ul>
          <Disclaimer />
          <div className="card mt">
            <h3>Need a human to look at it?</h3>
            <p className="muted">Compliance-sensitive questions deserve a review against your exact situation.</p>
            <div className="btn-row">
              <Link to="/book?service=discovery" className="btn btn-primary">Free discovery call</Link>
            </div>
          </div>
          {related.length > 0 && (
            <>
              <h2>Related guides</h2>
              <ul>{related.map((r) => <li key={r.slug}><Link to={`/knowledge-base/${r.slug}`}>{r.title}</Link></li>)}</ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function CaseStudies() {
  return (
    <>
      <section className="section">
        <div className="container">
          <PageHead eyebrow="Case studies" title="How an engagement actually runs">
            Every project follows the same ten-stage record, from the first symptom to the follow-up. The scenarios below show
            that method on the kinds of problems we are hired for.
          </PageHead>
          <Notice>
            These are illustrative scenarios based on common engagements, not results from named clients. We publish real case
            studies only with a client’s written permission, and we will add them here as they are approved.
          </Notice>
          <Pipeline compact />
        </div>
      </section>
      {scenarios.map((s, i) => (
        <section key={s.slug} className={`section ${i % 2 === 0 ? 'soft' : ''}`} id={s.slug}>
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Scenario {i + 1} · {s.client}</p>
              <h2>{s.title}</h2>
              <div className="chips">
                {s.areas.map((a) => { const ar = findArea(a); return ar ? <Link key={a} className="chip" to={`/services/${a}`}>{ar.title}</Link> : null; })}
                {s.team.map((t) => { const c = findConsultant(t); return c ? <Link key={t} className="chip" to={`/team/${t}`}>{c.name}</Link> : null; })}
              </div>
            </div>
            <ol className="record">
              {pipeline.filter((p) => s.record[p.key]).map((p) => (
                <li key={p.key}>
                  <strong>{p.title}</strong>
                  <p>{s.record[p.key]}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
      <CtaBand title="Have a problem like these?" />
    </>
  );
}

export function Faq() {
  return (
    <>
      <section className="section">
        <div className="container prose">
          <p className="eyebrow">FAQ</p>
          <h1>Frequently asked questions</h1>
          <p className="lede">Still stuck? <Link to="/knowledge-base">Search the Knowledge Base</Link> or <Link to="/contact">send us a note</Link>.</p>
          {faqGroups.map((g) => (
            <div key={g.title}>
              <h2>{g.title}</h2>
              {g.items.map((f) => (
                <details key={f.q} className="faq"><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          ))}
        </div>
      </section>
      <CtaBand />
    </>
  );
}
