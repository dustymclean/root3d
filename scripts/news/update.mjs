// Daily cannabis industry feed. Pulls official sources only, keeps each item's own title, date, summary,
// and link, and writes public/news/feed.json + public/news/rss.xml. New items are posted to Discord when
// DISCORD_NEWS_WEBHOOK is set. No dependencies; runs on Node 20+.
//
//   node scripts/news/update.mjs            update the feed
//   DRY_RUN=1 node scripts/news/update.mjs  fetch and report without writing or posting

import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SITE = 'https://r3dconsulting.com';
const FEED_JSON = 'public/news/feed.json';
const FEED_RSS = 'public/news/rss.xml';
const KEEP = 600; // items kept in the feed
const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS ?? 10);
const dry = !!process.env.DRY_RUN;
const webhook = process.env.DISCORD_NEWS_WEBHOOK ?? '';

const sources = JSON.parse(await readFile(new URL('./sources.json', import.meta.url), 'utf8'));
const log = [];

async function get(url, accept) {
  const res = await fetch(url, { headers: { 'user-agent': 'Root3D-News/1.0 (+https://r3dconsulting.com/news)', accept } , signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

const decode = (s) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

const clip = (s, n = 600) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, '')}…` : s);
const since = new Date(Date.now() - LOOKBACK_DAYS * 864e5).toISOString().slice(0, 10);

async function federalRegister(q) {
  const p = new URLSearchParams({ 'conditions[term]': q.term, 'conditions[publication_date][gte]': since, order: 'newest', per_page: '100' });
  if (q.agency) p.append('conditions[agencies][]', q.agency);
  for (const t of q.types ?? []) p.append('conditions[type][]', t);
  for (const f of ['title', 'html_url', 'publication_date', 'abstract', 'type', 'agencies', 'document_number']) p.append('fields[]', f);
  const json = JSON.parse(await get(`https://www.federalregister.gov/api/v1/documents.json?${p}`, 'application/json'));
  const match = q.match ? new RegExp(q.match, 'i') : null;
  const skip = q.exclude ? new RegExp(q.exclude, 'i') : null;
  return (json.results ?? []).filter((d) => (!match || match.test(`${d.title} ${d.abstract ?? ''}`)) && !(skip && skip.test(d.title))).map((d) => ({
    id: `fr-${d.document_number}`,
    title: d.title,
    url: d.html_url,
    source: `Federal Register · ${(d.agencies ?? []).map((a) => a.name).filter(Boolean).join(', ') || 'U.S. government'}`,
    kind: d.type,
    category: q.category,
    published: d.publication_date,
    summary: clip(d.abstract ?? ''),
  }));
}

async function rss(s) {
  const xml = await get(s.url, 'application/rss+xml, application/xml, text/xml');
  const match = s.match ? new RegExp(s.match, 'i') : null;
  const tag = (block, name) => decode(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))?.[1] ?? '');
  const items = [...xml.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((m) => m[0]);
  return items
    .map((b) => {
      const link = tag(b, 'link') || b.match(/<link[^>]*href="([^"]+)"/i)?.[1] || '';
      const date = new Date(tag(b, 'pubDate') || tag(b, 'updated') || tag(b, 'published') || tag(b, 'dc:date'));
      return {
        id: `${s.name}:${tag(b, 'guid') || link}`,
        title: tag(b, 'title'),
        url: link.trim(),
        source: s.name,
        kind: 'News release',
        category: s.category,
        published: Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10),
        summary: clip(tag(b, 'description') || tag(b, 'summary')),
      };
    })
    .filter((i) => i.title && /^https:\/\//.test(i.url) && i.published && i.published >= since)
    .filter((i) => !match || match.test(`${i.title} ${i.summary}`));
}

const jobs = [
  ...sources.federalRegister.map((q) => [`Federal Register "${q.term}"`, () => federalRegister(q)]),
  ...sources.rss.map((s) => [s.name, () => rss(s)]),
];

const exclude = sources.exclude ? new RegExp(sources.exclude, 'i') : null;
const fresh = [];
for (const [name, run] of jobs) {
  try {
    const got = (await run()).filter((i) => !(exclude && exclude.test(i.title)));
    fresh.push(...got);
    log.push(`ok    ${name}: ${got.length}`);
  } catch (e) {
    log.push(`FAIL  ${name}: ${e.message}`);
  }
}

let existing = [];
// RESET=1 rebuilds the feed from the lookback window, for example after tightening the filters.
if (!process.env.RESET) try {
  existing = JSON.parse(await readFile(FEED_JSON, 'utf8')).items ?? [];
} catch {
  /* first run */
}
const seen = new Set(existing.flatMap((i) => [i.id, i.url]));
const added = [];
for (const i of fresh) {
  if (seen.has(i.id) || seen.has(i.url)) continue;
  seen.add(i.id).add(i.url);
  added.push(i);
}
const items = [...added, ...existing]
  .sort((a, b) => b.published.localeCompare(a.published) || a.title.localeCompare(b.title))
  .slice(0, KEEP);

log.push(`${added.length} new, ${items.length} in feed`);
console.log(log.join('\n'));
if (dry) {
  for (const i of added.slice(0, 20)) console.log(`  ${i.published}  [${i.category}]  ${i.title}`);
  process.exit(0);
}

const updated = new Date().toISOString();
await mkdir('public/news', { recursive: true });
await writeFile(FEED_JSON, `${JSON.stringify({ updated, items }, null, 1)}\n`);

const x = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Root3D Industry Watch</title><link>${SITE}/news</link>
<description>Daily cannabis and hemp regulation, pesticide, plant health, and safety updates from official sources.</description>
<lastBuildDate>${new Date(updated).toUTCString()}</lastBuildDate>
${items
  .slice(0, 100)
  .map(
    (i) =>
      `<item><title>${x(i.title)}</title><link>${x(i.url)}</link><guid isPermaLink="false">${x(i.id)}</guid><pubDate>${new Date(`${i.published}T12:00:00Z`).toUTCString()}</pubDate><category>${x(i.category)}</category><description>${x(`${i.source}. ${i.summary}`)}</description></item>`,
  )
  .join('\n')}
</channel></rss>
`;
await writeFile(FEED_RSS, rssXml);

// Discord: one message per new item, oldest first, capped so a first run does not flood the channel.
if (webhook && added.length) {
  const post = added.slice(0, 25).reverse();
  for (const i of post) {
    const body = {
      username: 'Root3D Industry Watch',
      embeds: [{ title: clip(i.title, 250), url: i.url, description: clip(i.summary, 900) || undefined, color: 0xd4af6a, footer: { text: `${i.category} · ${i.source} · ${i.published}` } }],
      allowed_mentions: { parse: [] },
    };
    const res = await fetch(webhook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (res.status === 429) await new Promise((r) => setTimeout(r, 2000));
    await new Promise((r) => setTimeout(r, 600));
  }
  if (added.length > post.length) console.log(`posted ${post.length} of ${added.length} to Discord; the rest are on ${SITE}/news`);
}
