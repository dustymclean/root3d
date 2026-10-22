import { ExternalLink, Rss, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loading, Notice, PageHead } from '../../components/ui';

type NewsItem = { id: string; title: string; url: string; source: string; kind: string; category: string; published: string; summary: string };
type Feed = { updated: string; items: NewsItem[] };

const fmt = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const feedUrl = `${import.meta.env.BASE_URL}news/feed.json`;

/** Industry Watch: the daily feed of official regulatory, pesticide, plant-health, and safety updates. */
export function News() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [failed, setFailed] = useState(false);
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const cat = params.get('category');

  useEffect(() => {
    fetch(feedUrl, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((f: Feed) => setFeed(f))
      .catch(() => setFailed(true));
  }, []);

  const categories = useMemo(() => [...new Set((feed?.items ?? []).map((i) => i.category))].sort(), [feed]);
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return (feed?.items ?? []).filter(
      (i) => (!cat || i.category === cat) && words.every((w) => `${i.title} ${i.summary} ${i.source}`.toLowerCase().includes(w)),
    );
  }, [feed, query, cat]);

  const setParam = (k: string, v: string | null) => {
    const n = new URLSearchParams(params);
    v ? n.set(k, v) : n.delete(k);
    setParams(n, { replace: true });
  };

  return (
    <section className="section">
      <div className="container">
        <PageHead eyebrow="Knowledge Base · Industry Watch" title="What changed today in cannabis and hemp">
          Rules, pesticide decisions, plant pests, mold and contaminant notices, and enforcement news, pulled every morning from
          official government sources. Each entry is the agency's own title and summary with a link to the original.
        </PageHead>
        <div className="row between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <p className="muted small" style={{ margin: 0 }}>
            {feed?.updated ? <>Last checked {new Date(feed.updated).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</> : 'Updated daily'}
          </p>
          <a className="row small" href={`${import.meta.env.BASE_URL}news/rss.xml`}><Rss size={16} /> RSS feed</a>
        </div>
        <form className="kb-search mt" onSubmit={(e) => e.preventDefault()}>
          <Search size={20} />
          <input className="input" type="search" value={query} placeholder="Search updates, e.g. “hemp testing” or “pesticide tolerance”"
            onChange={(e) => setParam('q', e.target.value || null)} aria-label="Search industry updates" />
        </form>
        {categories.length > 0 && (
          <div className="chips" role="group" aria-label="Category">
            <button className="chip" aria-pressed={!cat} onClick={() => setParam('category', null)}>All</button>
            {categories.map((c) => <button key={c} className="chip" aria-pressed={cat === c} onClick={() => setParam('category', c)}>{c}</button>)}
          </div>
        )}

        {!feed && !failed && <Loading />}
        {failed && <Notice>The feed could not be loaded right now. Try again in a minute.</Notice>}
        {feed && feed.items.length === 0 && <Notice>The first daily update has not run yet. Check back tomorrow morning.</Notice>}
        {feed && feed.items.length > 0 && shown.length === 0 && <Notice>No updates match that search.</Notice>}

        <div className="stack mt">
          {shown.slice(0, 150).map((i) => (
            <article key={i.id} className="card">
              <p className="small muted" style={{ margin: 0 }}>
                <span className="tag">{i.category}</span> {fmt(i.published)} · {i.source}{i.kind ? ` · ${i.kind}` : ''}
              </p>
              <h3 style={{ margin: '0.5rem 0' }}>
                <a href={i.url} target="_blank" rel="noopener noreferrer">{i.title}</a>
              </h3>
              {i.summary && <p className="muted small" style={{ margin: 0 }}>{i.summary}</p>}
              <a className="row small mt" href={i.url} target="_blank" rel="noopener noreferrer">Read the official source <ExternalLink size={13} /></a>
            </article>
          ))}
        </div>

        <p className="disclaimer small muted mt">
          Root3D collects these items automatically and does not edit them. Always read the linked original, check its effective dates,
          and confirm how it applies in your state. Not legal advice. Want help applying a change?{' '}
          <Link to="/book?service=discovery">Book a free 15-minute call</Link>.
        </p>
      </div>
    </section>
  );
}
