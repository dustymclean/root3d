/**
 * Builds discord/server.json: the full Root3D Discord server (roles, channels, permissions, and every post),
 * generated from the same data files the website uses, so the server always matches r3dconsulting.com.
 *
 *   npm run discord:generate
 *
 * Then build or update the server with discord/build.mjs (see discord/README.md).
 */
import { writeFileSync } from 'node:fs';
import { areas, coreServices } from '../src/data/areas';
import { audiences, coreMessage, mission, philosophy, pillars, pipeline, positioning, synergy, tagline, triadThesis, values } from '../src/data/company';
import { nodes } from '../src/data/diagnose';
import { faqGroups } from '../src/data/faq';
import { articles, categories } from '../src/data/knowledge';
import { scenarios } from '../src/data/scenarios';
import { fallbackServices, serviceLanes } from '../src/data/services';
import { businessTypes, jurisdictions, topics } from '../src/data/sop';
import { team } from '../src/data/team';

const SITE = 'https://r3dconsulting.com';
const MAX = 1900;
const disclaimer =
  '-# Educational information only. Not legal advice. Rules change often; confirm requirements with your regulator, and get professional review for compliance-sensitive decisions.';

type Access = 'public-read' | 'public-chat' | 'public-forum' | 'insider-read' | 'insider-chat' | 'insider-forum' | 'client-chat' | 'client-forum' | 'team' | 'voice-public' | 'voice-client' | 'voice-team';
type Post = { title: string; tags?: string[]; messages: string[] };
type Channel = {
  key: string;
  name: string;
  type: 'text' | 'announcement' | 'forum' | 'voice';
  access: Access;
  topic?: string;
  tags?: string[];
  userLimit?: number;
  /** Plain messages for text channels. `{#key}` becomes a link to that channel or post. */
  messages?: string[];
  /** Forum posts. */
  posts?: Post[];
  /** Pin the first message. */
  pin?: boolean;
  /** Post after everything else, so links to other channels and posts resolve. */
  deferred?: boolean;
};
type Category = { name: string; access: Access; channels: Channel[] };

/* ------------------------------ helpers ------------------------------ */

const money = (c: number) => (c ? `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : 'Free');
const link = (path: string) => `<${SITE}${path}>`;
const bullets = (items: readonly string[]) => items.map((i) => `- ${i}`).join('\n');
const personName = (slug: string) => team.find((t) => t.slug === slug)?.name ?? slug;
const title100 = (s: string) => (s.length <= 100 ? s : s.slice(0, 97).trimEnd() + '…');

/** Splits text into Discord-sized messages, breaking on paragraphs, then lines, then words. */
function chunk(text: string): string[] {
  const out: string[] = [];
  let cur = '';
  const push = () => {
    if (cur.trim()) out.push(cur.trim());
    cur = '';
  };
  for (const para of text.split(/\n{2,}/)) {
    const piece = para.trim();
    if (!piece) continue;
    if ((cur + '\n\n' + piece).length <= MAX) {
      cur = cur ? cur + '\n\n' + piece : piece;
      continue;
    }
    push();
    if (piece.length <= MAX) {
      cur = piece;
      continue;
    }
    for (const line of piece.split('\n')) {
      if ((cur + '\n' + line).length <= MAX) {
        cur = cur ? cur + '\n' + line : line;
        continue;
      }
      push();
      let rest = line;
      while (rest.length > MAX) {
        const cut = rest.lastIndexOf(' ', MAX);
        out.push(rest.slice(0, cut > 0 ? cut : MAX));
        rest = rest.slice(cut > 0 ? cut + 1 : MAX);
      }
      cur = rest;
    }
  }
  push();
  return out;
}
const msgs = (...parts: string[]) => chunk(parts.filter(Boolean).join('\n\n'));
const guide = (what: string, how: string[], who: string) =>
  msgs(`## About this channel\n${what}`, `**How it works**\n${bullets(how)}`, `-# ${who}`);

/* ------------------------------ content ------------------------------ */

const sessions = fallbackServices.filter((s) => s.active && (s.kind === 'session' || s.kind === 'package'));
const retainers = fallbackServices.filter((s) => s.active && s.kind === 'retainer');
const fixed = fallbackServices.filter((s) => s.active && s.kind === 'fixed');

const welcome = msgs(
  `# Welcome to Root3D Consulting\n**${tagline}**\n${coreMessage.join(' ')}`,
  `${mission}\n\n${positioning}`,
  `## Find your way around\n- {#rules}: house rules. Read these first.\n- {#how-to-search}: how to find any answer in seconds.\n- {#announcements}: news from the partners.\n- {#book-a-call}: free 15-minute discovery call, sessions, and retainers.\n- {#kb-index}: every Knowledge Base article in one list.\n- {#ask-root3d}: ask the partners a question.`,
  `## Access levels\n- **Everyone**: Start Here, About Root3D, the full Knowledge Base, Tools & Reference, and Community.\n- **Insider**: subscriber channels with ongoing briefings and Q&A.\n- **Client**: client support and lounge, plus private client rooms.\n- **Root3D Partner**: Dusty, Danny, Joel, and Hunter. Partners run the server.`,
  `Website: ${link('')}\nEmail: support@r3dconsulting.com\n${pillars.join('  ✦  ')}`,
);

const rules = msgs(
  '# Server rules',
  bullets([
    '**Be respectful.** No harassment, hate, or personal attacks.',
    '**No phone numbers.** Do not post or ask for phone numbers. We meet on Zoom, Discord, or Signal usernames only.',
    '**No buying, selling, or trading** cannabis, plants, seeds, or controlled products here.',
    '**Protect privacy.** Never post client names, license numbers, addresses, lab reports, or files that are not yours to share. Share sensitive files in your client portal instead.',
    '**Education, not legal advice.** Information here is educational. Confirm requirements with your regulator, and book a session for advice on your situation.',
    '**Stay on topic.** Use the channel that fits. Questions go in {#ask-root3d}, so answers stay searchable.',
    '**No spam or self-promotion** without a partner\'s OK.',
    '**Follow Discord\'s Terms of Service and Community Guidelines.**',
  ]),
  'Partners may remove posts or members that break these rules.',
);

const howToSearch = msgs(
  '# How to find an answer fast',
  `## Search the whole server\nClick the search box (top right) or press **Ctrl+F** (**⌘F** on Mac) and type a few words, such as \`total thc\` or \`metrc\`.\n\nNarrow it down with filters:\n- \`in: #knowledge-base vpd\`: only Knowledge Base posts\n- \`in: #sop-library sanitation\`: only SOPs\n- \`in: #faq cancel\`: only FAQ answers\n- \`from: Root3D\`: only posts from a partner or the bot\n- \`has: link\`: only posts with links`,
  `## Browse by tag\nForum channels have tags. Open {#knowledge-base} and click a tag (Compliance, Cultivation, Facility, Technology, Business) to see only those posts. Each forum also has its own search bar.`,
  `## Where things live\n- **Knowledge Base articles**: {#knowledge-base} (index in {#kb-index})\n- **Service areas**: {#service-areas}\n- **FAQ**: {#faq}\n- **SOP templates**: {#sop-library}\n- **Regulators by state**: {#regulators-by-state}\n- **Plant problems**: {#plant-troubleshooter}\n- **Calculators**: {#calculators}\n- **Team bios**: {#meet-the-team}\n- **Prices and policies**: {#services-and-pricing} and {#policies}`,
  `Still stuck? Ask in {#ask-root3d} and a partner will answer.`,
);

const bookACall = msgs(
  '# Book a call',
  `## Free 15-minute discovery call\nA peer conversation with a partner to see where you are and whether we fit. Book any open slot: ${link('/book?service=discovery')}`,
  `## How we meet\nYou choose **Zoom, Discord, or Signal** when you book. Your consultant posts the link in your client portal before the call. On-site visits are available for facility work. **We never ask for or share phone numbers.**`,
  `## Sessions\n${sessions.map((s) => `- **${s.name}**: ${money(s.price_cents)}${s.minutes ? ` · ${s.minutes} min` : ''}. ${s.description}`).join('\n')}`,
  `## Retainers (monthly)\n${retainers.map((s) => `- **${s.name}**: ${money(s.price_cents)}/month · ${s.response_time}. ${s.description}`).join('\n')}`,
  `Full pricing: ${link('/pricing')} · Book: ${link('/book')} · Contact: ${link('/contact')}\n-# Prices marked draft on the website are pending final approval. The price on your invoice at booking is the price you pay.`,
);

const aboutUs = msgs(
  '# About Root3D',
  `**${tagline}**\n${coreMessage.join(' ')}`,
  `## Mission\n${mission}`,
  `## Philosophy\n${philosophy}`,
  `## Why four disciplines\n${triadThesis.join('\n\n')}`,
  `## What we value\n${values.map((v) => `- **${v.title}.** ${v.text}`).join('\n')}`,
  `## Who we work with\n${audiences.map((a) => `- **${a.title}.** ${a.text}`).join('\n')}`,
  `More: ${link('/about')}`,
);

const howWeWork = msgs(
  '# How an engagement runs',
  'Every engagement moves through these stages and is documented as it goes. You own the final record.',
  pipeline.map((p, i) => `**${i + 1}. ${p.title}**\n${p.text}`).join('\n\n'),
  `# How the four of us combine`,
  ...synergy.map((s) => `## ${s.area}\n- **Joel:** ${s.joel}\n- **Danny:** ${s.danny}\n- **Dusty:** ${s.dusty}\n- **Hunter:** ${s.hunter}`),
  `Example engagements: {#case-studies}`,
);

const servicesAndPricing = msgs(
  '# Services',
  serviceLanes.map((l) => `- **${l.title}.** ${l.text}`).join('\n'),
  `## Practice areas\n${areas.map((a) => `- **${a.title}.** ${a.short}`).join('\n')}\nDetails for each: {#service-areas}`,
  `## Everything we cover\n${coreServices.join(' · ')}`,
  `# Pricing\n## Sessions\n${sessions.map((s) => `- **${s.name}**: ${money(s.price_cents)}${s.minutes ? ` · ${s.minutes} min` : ''}\n  ${s.description}${s.features.length ? `\n  ${s.features.join(' · ')}` : ''}`).join('\n')}`,
  `## Retainers (monthly)\n${retainers.map((s) => `- **${s.name}**: ${money(s.price_cents)}/month · ${s.response_time}\n  ${s.description}\n  ${s.features.join(' · ')}`).join('\n')}`,
  `## Fixed-fee projects (quoted in writing)\n${fixed.map((s) => `- **${s.name}.** ${s.description}`).join('\n')}`,
  `-# Prices marked draft on the website are pending final approval. Current prices: ${link('/pricing')}`,
);

const policies = msgs(
  '# Policies (summary)',
  `## Payment\n- Paid sessions create an invoice in your portal when you book.\n- Fixed-fee projects are quoted in writing and invoiced per the signed proposal or statement of work, which may include a deposit or milestones.\n- Retainers bill monthly on the day you choose (1st to 28th) and begin only after the agreement is signed.\n- Session extensions are $25 per additional 15 minutes.\n- Online card payment turns on only after our payment processor approves Root3D. **Until then, we will never ask for card details by email or message.**\n- Session invoices are due by the session date. Unpaid retainer invoices may pause retainer services.`,
  `## Cancellation and rescheduling\n- Reschedule or cancel from your portal up to 24 hours before the start time at no charge.\n- Cancellations within 24 hours are late and may be charged in full. No-shows may be charged in full.\n- If we cancel or miss a session, you are not charged, and we help you rebook or refund what you paid.\n- Retainers are month to month. Cancel in writing before your next billing date.\n- Genuine emergencies: tell us, and we may waive late-cancellation charges.`,
  `## Refunds\n- Cancelled more than 24 hours ahead, cancelled or missed by us, technical failure on our side, or duplicate charges: refunded or voided.\n- Late cancellations, no-shows, completed sessions (tell us within 7 days), fixed-fee projects, and partial retainer months are reviewed case by case.\n- Request one through a support ticket in your portal or ${link('/contact')} with the invoice number.`,
  `Full text: ${link('/policies/payment')} · ${link('/policies/cancellation')} · ${link('/policies/refunds')} · ${link('/privacy')} · ${link('/terms')} · ${link('/accessibility')}\n-# Policies are plain-language drafts pending business and legal review.`,
);

const teamPosts: Post[] = team.map((c) => ({
  title: `${c.name} · ${c.title}`,
  tags: [c.first],
  messages: msgs(
    `# ${c.name}\n**${c.headline}**\n${c.title}`,
    c.summary,
    c.story.length ? `## Story\n${c.story.map((s) => s.text).join('\n\n')}` : '',
    c.background.length ? `## Background\n${bullets(c.background.map((b) => b.text))}` : '',
    c.specialties.length ? `## Specialties\n${c.specialties.map((s) => `- **${s.title}.** ${s.text}`).join('\n')}` : '',
    c.approach ? `## Approach\n${c.approach}` : '',
    c.focus ? `## Focus\n${c.focus}` : '',
    c.areas.length ? `## Practice areas\n${bullets(c.areas.map((a) => areas.find((x) => x.slug === a)?.title ?? a))}` : '',
    `Profile: ${link(`/team/${c.slug}`)}${c.bookable ? ` · Book with ${c.first}: ${link(`/book?consultant=${c.slug}`)}` : ''}`,
  ),
}));

const kbPosts: Post[] = articles.map((a) => ({
  title: title100(a.title),
  tags: [a.category],
  messages: [
    ...msgs(
      `# ${a.title}\n${a.summary}`,
      `**Category:** ${a.category} · **Jurisdiction:** ${a.jurisdiction} · **Reviewed:** ${a.updated} · **Author:** ${personName(a.author)}\n**Tags:** ${a.tags.join(', ')}`,
      ...a.sections.map((s) => [`## ${s.h}`, ...(s.p ?? []), s.list ? bullets(s.list) : ''].filter(Boolean).join('\n\n')),
    ),
    ...msgs(`## Sources\n${a.sources.map((s) => `- ${s.label}: <${s.url}>`).join('\n')}`, `Read on the website: ${link(`/knowledge-base/${a.slug}`)}`, disclaimer),
  ],
}));

const areaPosts: Post[] = areas.map((a) => ({
  title: a.title,
  messages: msgs(
    `# ${a.title}\n${a.short}`,
    a.intro,
    `## Problems we solve\n${bullets(a.problems)}`,
    `## What you get\n${a.deliverables.map((d) => `- **${d.title}.** ${d.text}`).join('\n')}`,
    a.packages.length ? `## Related services\n${bullets(a.packages.map((id) => fallbackServices.find((s) => s.id === id)).filter((s) => s && s.active).map((s) => `${s!.name}${s!.price_cents ? ` (${money(s!.price_cents)}${s!.kind === 'retainer' ? '/month' : ''})` : s!.kind === 'fixed' ? ' (fixed fee, quoted)' : ''}`))}` : '',
    a.leads.length ? `## Who leads it\n${a.leads.map(personName).join(', ')}` : '',
    a.faqs.length ? `## Questions\n${a.faqs.map((f) => `**${f.q}**\n${f.a}`).join('\n\n')}` : '',
    `More: ${link(`/services/${a.slug}`)}`,
  ),
}));

const faqPosts: Post[] = faqGroups.flatMap((g) =>
  g.items.map((f) => ({ title: title100(f.q), tags: [g.title], messages: msgs(`**${f.q}**`, f.a, `-# From the FAQ: ${link('/faq')}`) })),
);

/** Plant troubleshooter: one post per outcome, with the questions that lead to it. */
type Q = Extract<(typeof nodes)[number], { question: string }>;
type R = Extract<(typeof nodes)[number], { result: string }>;
const byId = new Map(nodes.map((n) => [n.id, n]));
const paths = new Map<string, string[]>();
(function walk(id: string, trail: string[]) {
  const n = byId.get(id);
  if (!n) return;
  if ('result' in n) {
    if (!paths.has(id)) paths.set(id, trail);
    return;
  }
  for (const o of (n as Q).options) walk(o.next, [...trail, `${(n as Q).question} → **${o.label}**`]);
})('start', []);
const results = nodes.filter((n): n is R => 'result' in n);
const troublePosts: Post[] = [
  {
    title: 'Start here: how to use the troubleshooter',
    tags: ['Start here'],
    messages: msgs(
      '# Plant troubleshooter',
      'Each post below is one possible outcome of the decision tree on our website. Read the path at the top of each post to see the symptoms that lead there, or use the interactive version: ' + link('/resources/troubleshooter'),
      `## The first question\n${(byId.get('start') as Q).question}\n${bullets((byId.get('start') as Q).options.map((o) => o.label))}`,
      'This narrows the possibilities. It does not diagnose. For a second opinion, book a free discovery call in {#book-a-call} and upload sharp photos to your client portal.',
    ),
  },
  ...results.map((r) => {
    const art = r.article ? articles.find((a) => a.slug === r.article) : undefined;
    return {
      title: title100(r.result),
      tags: ['Outcome'],
      messages: msgs(
        `# ${r.result}`,
        paths.get(r.id)?.length ? `**How you get here**\n${bullets(paths.get(r.id)!)}` : '',
        `## Possible causes\n${bullets(r.likely)}`,
        `## Check first\n${bullets(r.checkFirst)}`,
        `## Next steps\n${bullets(r.next)}`,
        art ? `Read more: ${art.title} ${link(`/knowledge-base/${art.slug}`)}` : '',
        '-# Educational only. This narrows the possibilities; it does not diagnose.',
      ),
    };
  }),
];

const typeLabel = (id: string) => businessTypes.find((b) => b.id === id)?.label ?? id;
const placeholder = (s: string) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => `[${{ company: 'Company', facility: 'Facility', owner: 'Owner', tracking: 'Tracking system', retention: 'Record retention', cameraRetention: 'Camera retention', license: 'License', approver: 'Approver', effective: 'Effective date' }[k] ?? k}]`);
const sopPosts: Post[] = [
  {
    title: 'Start here: how to use the SOP library',
    tags: ['Start here'],
    messages: msgs(
      '# SOP library',
      'Every SOP template from our free SOP Generator, one post per procedure. Words in [brackets] are placeholders to replace with your own details, such as your company name, tracking system, and record-retention period.',
      `To build a complete, formatted SOP for your business type and state, with Word and PDF download, use the generator: ${link('/resources/sop-generator')}`,
      `Business types: ${businessTypes.map((b) => b.label).join(', ')}. Filter by tag to see the procedures for yours. State regulators and tracking systems: {#regulators-by-state}`,
      disclaimer,
    ),
  },
  ...topics.map((t) => ({
    title: title100(t.title),
    tags: t.types.map(typeLabel),
    messages: msgs(
      `# ${t.title}\n**Applies to:** ${t.types.map(typeLabel).join(', ')}`,
      `## Purpose\n${placeholder(t.purpose)}`,
      `## Scope\n${placeholder(t.scope)}`,
      `## Responsibilities\n${bullets(t.responsibilities.map(placeholder))}`,
      `## Procedure\n${t.steps.map((s, i) => `${i + 1}. ${placeholder(s)}`).join('\n')}`,
      `## Records to keep\n${bullets(t.records.map(placeholder))}`,
      disclaimer,
    ),
  })),
];

const regulators = msgs(
  '# Regulators and tracking systems by jurisdiction',
  'The agencies our SOP Generator cites for each jurisdiction, with official links. Always confirm against the current rules.',
  ...jurisdictions.map((j) => `## ${j.label}\n${j.regulators.map((r) => `- ${r.name}: <${r.url}>`).join('\n')}\n**Tracking:** ${j.tracking}`),
  disclaimer,
);

const calculators = msgs(
  '# Calculators',
  `## Total THC\n**Total THC = (THCA × 0.877) + Δ9-THC**\nUse the THCA and Δ9-THC values from your certificate of analysis, both in percent. For mg/g, divide by 10 to get percent. Multiply percent by 10 for mg per gram.\n\nExample: THCA 0.25% and Δ9-THC 0.05% gives (0.25 × 0.877) + 0.05 = **0.269%**.\n0.3% is the federal hemp threshold. Use your own rule's limit.\nCalculator: ${link('/resources/total-thc')}`,
  `## VPD (vapor pressure deficit)\nSaturation vapor pressure, in kPa, at temperature T in °C: **SVP = 0.6108 × e^(17.27 × T ÷ (T + 237.3))**\n- Actual vapor pressure = SVP(air) × RH ÷ 100\n- Air VPD = SVP(air) − actual vapor pressure\n- Leaf VPD = SVP(leaf) − actual vapor pressure, where leaf temperature = air temperature + leaf offset (often around 2 °F cooler)\n\nGuide bands (leaf VPD): Propagation 0.4–0.8 kPa · Vegetative 0.8–1.2 kPa · Flower 1.2–1.6 kPa\nCalculator: ${link('/resources/vpd')}`,
  `Background: {#knowledge-base} (search \`total thc\` or \`vpd\`).`,
);

const casePosts: Post[] = [
  {
    title: 'Read first: these are illustrative examples',
    messages: msgs('# Case studies', 'These scenarios show how an engagement runs from the first symptom to the follow-up. **They are illustrative, not client results.** Real case studies will replace them once clients approve publication in writing.', `Website: ${link('/case-studies')}`),
  },
  ...scenarios.map((s) => ({
    title: title100(s.title),
    messages: msgs(
      `# ${s.title}\n**Client type:** ${s.client}\n**Team:** ${s.team.map(personName).join(', ')}\n**Areas:** ${s.areas.map((a) => areas.find((x) => x.slug === a)?.title ?? a).join(', ')}`,
      ...pipeline.filter((p) => s.record[p.key]).map((p) => `## ${p.title}\n${s.record[p.key]}`),
      '-# Illustrative scenario, not a client result.',
    ),
  })),
];

/* --------------------------- channel guides --------------------------- */

const partnersPost = 'Partners post here. Members can react.';
const insiderStart = msgs(
  '# Insider access',
  'Insider channels carry ongoing briefings from the partners: regulatory changes as they happen, cultivation and facility notes from the field, systems and data tips, and market observations, plus a Q&A forum where Insiders ask the partners directly.',
  `## How to get access\nInsider is a paid subscription. Ask a partner in {#ask-root3d} or email support@r3dconsulting.com. Once your subscription is active, a partner gives you the **Insider** role and these channels appear. Every active **Client** gets Insider access too.`,
  `## Where to look\n- {#regulatory-watch}: rule changes, deadlines, and what they mean\n- {#cultivation-notes}: cultivation, inputs, and facility notes\n- {#systems-and-data}: tracking systems, automation, and data\n- {#market-and-business}: licensing, retail, and commercialization\n- {#insider-qa}: ask the partners\n- {#insider-lounge}: talk with other Insiders`,
  '-# Insider posts are educational, not legal advice. Do not share Insider content outside this server.',
);
const clientStart = msgs(
  '# Client hub',
  `Welcome. Your client portal at ${link('/portal')} is where your private work lives:\n- **Appointments**: book, reschedule, or cancel (free up to 24 hours ahead)\n- **Pre-call inbox**: upload photos, lab results, logs, and schematics before a session\n- **Meeting links**: your consultant posts your Zoom, Discord, or Signal link on the appointment\n- **Messages**: private threads with your consultants\n- **Files and action plans**: deliverables and written plans with at least three steps\n- **Invoices and agreements**`,
  `## Here on Discord\n- {#client-support}: open a post for a question. A partner replies, and the answer stays searchable for you.\n- {#client-lounge}: talk with other clients.\n- **Private room**: ask a partner for a private channel for your team.\n- **Call rooms**: Consult Room 1 and 2 are for scheduled Discord calls.`,
  '-# Keep confidential files and lab reports in your portal or your private room, not in shared channels.',
);
const teamStart = msgs(
  '# Partner guide',
  'Everyone with the **Root3D Partner** role (Dusty, Danny, Joel, and Hunter) is a server admin and can edit channels, post anywhere, pin, and manage roles.',
  `## Give someone access\nRight-click their name → **Roles** → add **Client** or **Insider**. Remove the role to take access away.\n- **Insider**: paid subscribers. Grant after their subscription invoice is paid in the portal.\n- **Client**: active consulting clients. Clients also see Insider channels.`,
  `## Make a private client room\nRight-click the **CLIENTS** category → **Create Channel** → name it \`client-<company>\` → turn on **Private Channel** → add the client and the partners on the account.`,
  `## Post a briefing\nPost in the Insider channel that fits, start with a one-line bold headline, and add the date and your sources. Draft in {#content-drafts} first if you want a second set of eyes. Use **Publish** in {#announcements} to push news to followers.`,
  `## Add to the Knowledge Base\nThe public library mirrors ${link('/knowledge-base')}. Add new articles on the website first, then run the Discord builder again (see the handbook). It only adds what is missing.`,
  `## Calls\nClients choose Zoom, Discord, or Signal when they book. For Zoom, use the saved Manna Zoom room link in the portal (it is shared and open 24 hours, so check no one else is using it). For Discord, use Consult Room 1 or 2. No phone numbers.`,
  `## Moderation\nDelete rule-breaking posts, and time out or ban repeat offenders (right-click the user). Discord system notices go to {#mod-log}.`,
);

/* ------------------------------ layout ------------------------------ */

export const server = {
  name: 'Root3D Consulting',
  icon: 'public/mark.png',
  roles: [
    { key: 'partner', name: 'Root3D Partner', color: 0xd4af6a, hoist: true, mentionable: true, admin: true },
    { key: 'client', name: 'Client', color: 0x4cc38a, hoist: true, mentionable: false, admin: false },
    { key: 'insider', name: 'Insider', color: 0x9b7bff, hoist: true, mentionable: false, admin: false },
  ],
  categories: [
    {
      name: '📌 START HERE',
      access: 'public-read',
      channels: [
        { key: 'welcome', name: 'welcome', type: 'text', access: 'public-read', topic: `${tagline} Start here.`, messages: welcome, pin: true, deferred: true },
        { key: 'rules', name: 'rules', type: 'text', access: 'public-read', topic: 'House rules. Read before posting.', messages: rules, pin: true, deferred: true },
        { key: 'how-to-search', name: 'how-to-search', type: 'text', access: 'public-read', topic: 'Find any answer in seconds: search filters, tags, and where everything lives.', messages: howToSearch, pin: true, deferred: true },
        { key: 'announcements', name: 'announcements', type: 'announcement', access: 'public-read', topic: 'News from the Root3D partners. Click Follow to get these in your own server.', messages: guide('Official news from Root3D: new services, events, and important updates.', [partnersPost, 'Click **Follow** to send these posts to a channel in your own server.'], 'Questions about an announcement? Ask in #ask-root3d.') },
        { key: 'book-a-call', name: 'book-a-call', type: 'text', access: 'public-read', topic: 'Free 15-minute discovery call, sessions, and retainers. Zoom, Discord, or Signal. No phone numbers.', messages: bookACall, pin: true, deferred: true },
      ],
    },
    {
      name: '🏛️ ABOUT ROOT3D',
      access: 'public-read',
      channels: [
        { key: 'about-us', name: 'about-us', type: 'text', access: 'public-read', topic: 'Mission, philosophy, values, and who we work with.', messages: aboutUs },
        { key: 'meet-the-team', name: 'meet-the-team', type: 'forum', access: 'public-read', topic: 'One post per partner: background, specialties, and how to book them.', tags: team.map((t) => t.first), posts: teamPosts },
        { key: 'how-we-work', name: 'how-we-work', type: 'text', access: 'public-read', topic: 'The ten-stage engagement record and how the four partners combine.', messages: howWeWork, deferred: true },
        { key: 'services-and-pricing', name: 'services-and-pricing', type: 'text', access: 'public-read', topic: 'Services, practice areas, sessions, retainers, and fixed-fee projects.', messages: servicesAndPricing, deferred: true },
        { key: 'policies', name: 'policies', type: 'text', access: 'public-read', topic: 'Payment, cancellation, and refund policies in plain language.', messages: policies },
      ],
    },
    {
      name: '📚 KNOWLEDGE BASE',
      access: 'public-read',
      channels: [
        { key: 'kb-index', name: 'kb-index', type: 'text', access: 'public-read', topic: 'Every Knowledge Base article in one list, grouped by category.', deferred: true, pin: true },
        { key: 'knowledge-base', name: 'knowledge-base', type: 'forum', access: 'public-read', topic: 'The Compliance Vault: source-backed guides with review dates and citations. Filter by tag or search. Educational only, not legal advice.', tags: [...categories], posts: kbPosts },
        { key: 'service-areas', name: 'service-areas', type: 'forum', access: 'public-read', topic: 'Each practice area: problems we solve, deliverables, who leads it, and common questions.', posts: areaPosts },
        { key: 'faq', name: 'faq', type: 'forum', access: 'public-read', topic: 'Frequently asked questions, one post per question. Filter by tag or search.', tags: faqGroups.map((g) => g.title).slice(0, 20), posts: faqPosts },
      ],
    },
    {
      name: '🧰 TOOLS & REFERENCE',
      access: 'public-read',
      channels: [
        { key: 'calculators', name: 'calculators', type: 'text', access: 'public-read', topic: 'Total THC and VPD formulas, worked examples, and links to the calculators.', messages: calculators, deferred: true },
        { key: 'plant-troubleshooter', name: 'plant-troubleshooter', type: 'forum', access: 'public-read', topic: 'Common leaf symptoms: possible causes, what to check first, and next steps. Educational, not a diagnosis.', tags: ['Start here', 'Outcome'], posts: troublePosts },
        { key: 'sop-library', name: 'sop-library', type: 'forum', access: 'public-read', topic: 'SOP templates by business type. Replace [bracketed] placeholders with your details.', tags: ['Start here', ...businessTypes.map((b) => b.label)], posts: sopPosts },
        { key: 'regulators-by-state', name: 'regulators-by-state', type: 'text', access: 'public-read', topic: 'Regulators, official links, and seed-to-sale tracking systems by jurisdiction.', messages: regulators },
        { key: 'case-studies', name: 'case-studies', type: 'forum', access: 'public-read', topic: 'Illustrative engagements from first symptom to follow-up. Not client results.', posts: casePosts },
      ],
    },
    {
      name: '💬 COMMUNITY',
      access: 'public-chat',
      channels: [
        { key: 'introductions', name: 'introductions', type: 'text', access: 'public-chat', topic: 'Say hello: who you are, what you run, and what you are working on.', messages: guide('Introduce yourself to the community.', ['Share your name or handle, your type of operation, and your state.', 'Do not post phone numbers, license numbers, or addresses.'], 'Welcome aboard.') },
        { key: 'general', name: 'general', type: 'text', access: 'public-chat', topic: 'General conversation about cultivation, compliance, technology, and business.', messages: guide('Open conversation for everyone.', ['Keep it friendly and on topic.', 'Questions for the partners go in #ask-root3d so answers stay searchable.'], 'Rules: #rules') },
        { key: 'ask-root3d', name: 'ask-root3d', type: 'forum', access: 'public-forum', topic: 'Ask the Root3D partners a question. One post per question. Search first: your answer may already be in the Knowledge Base or FAQ.', tags: [...categories, 'Answered'], posts: [{ title: 'How to ask a good question', tags: [], messages: msgs('# How to ask a good question', bullets(['Search first (see #how-to-search). Your answer may already be here.', 'One question per post, with a clear title.', 'Pick a tag: Compliance, Cultivation, Facility, Technology, or Business.', 'Say your state and type of operation. Rules differ by state.', 'Never post phone numbers, license numbers, addresses, or confidential lab reports.']), 'A partner will answer and tag the post **Answered**. For advice on your exact situation, book a call in #book-a-call.') }] },
      ],
    },
    {
      name: '💎 INSIDER',
      access: 'insider-read',
      channels: [
        { key: 'insider-start-here', name: 'insider-start-here', type: 'text', access: 'public-read', topic: 'What Insider access includes and how to get it.', messages: insiderStart, pin: true, deferred: true },
        { key: 'regulatory-watch', name: 'regulatory-watch', type: 'text', access: 'insider-read', topic: 'Rule changes, deadlines, and what they mean for operators. Dated and sourced.', messages: guide('Regulatory changes and deadlines as they happen, with what they mean for your operation.', ['Each post: **headline**, jurisdiction, effective date, source link, and what to do.', partnersPost], 'Educational, not legal advice.') },
        { key: 'cultivation-notes', name: 'cultivation-notes', type: 'text', access: 'insider-read', topic: 'Cultivation, inputs, and facility notes from the field.', messages: guide('Field notes on cultivation, nutrients and inputs, irrigation, environment, and facility engineering.', ['Each post: **headline**, what we saw, what we changed, and how we measured it.', partnersPost], 'No client names or identifying details.') },
        { key: 'systems-and-data', name: 'systems-and-data', type: 'text', access: 'insider-read', topic: 'Seed-to-sale tracking, automation, cybersecurity, and data.', messages: guide('Tracking systems, automation, security, and data practice.', ['Each post: **headline**, the system it applies to, and step-by-step detail.', partnersPost], 'Never post credentials or API keys.') },
        { key: 'market-and-business', name: 'market-and-business', type: 'text', access: 'insider-read', topic: 'Licensing, retail, wholesale, and commercialization.', messages: guide('Licensing, retail, distribution, and commercialization.', ['Each post: **headline**, market or state, and the source.', partnersPost], 'Educational, not financial or legal advice.') },
        { key: 'insider-qa', name: 'insider-qa', type: 'forum', access: 'insider-forum', topic: 'Insiders ask the partners directly. One post per question.', tags: [...categories, 'Answered'], posts: [{ title: 'How Insider Q&A works', tags: [], messages: msgs('# Insider Q&A', bullets(['One question per post, with your state and type of operation.', 'A partner answers, usually within one business day, and tags it **Answered**.', 'For work on your exact situation, book a session in #book-a-call.'])) }] },
        { key: 'insider-lounge', name: 'insider-lounge', type: 'text', access: 'insider-chat', topic: 'Conversation for Insiders and clients.', messages: guide('Open conversation for Insiders and clients.', ['Keep Insider content inside this server.'], 'Rules: #rules') },
      ],
    },
    {
      name: '🤝 CLIENTS',
      access: 'client-chat',
      channels: [
        { key: 'client-start-here', name: 'client-start-here', type: 'text', access: 'client-chat', topic: 'How your client portal and these channels work.', messages: clientStart, pin: true, deferred: true },
        { key: 'client-support', name: 'client-support', type: 'forum', access: 'client-forum', topic: 'Open a post for a question or request. A partner replies.', tags: ['Question', 'Scheduling', 'Billing', 'Files', 'Answered'], posts: [{ title: 'How client support works', tags: [], messages: msgs('# Client support', bullets(['Open one post per request and pick a tag.', 'A partner replies and tags it **Answered**.', 'Billing: include the invoice number from your portal. We never ask for card details here.', 'Confidential files go in your portal, not here.'])) }] },
        { key: 'client-lounge', name: 'client-lounge', type: 'text', access: 'client-chat', topic: 'Conversation between Root3D clients.', messages: guide('Open conversation for clients.', ['Be mindful of confidential details about your operation.'], 'Rules: #rules') },
      ],
    },
    {
      name: '🎙️ CALL ROOMS',
      access: 'voice-public',
      channels: [
        { key: 'waiting-room', name: 'Waiting Room', type: 'voice', access: 'voice-public' },
        { key: 'discovery-room', name: 'Discovery Room', type: 'voice', access: 'voice-public', userLimit: 2 },
        { key: 'consult-1', name: 'Consult Room 1', type: 'voice', access: 'voice-client', userLimit: 8 },
        { key: 'consult-2', name: 'Consult Room 2', type: 'voice', access: 'voice-client', userLimit: 8 },
      ],
    },
    {
      name: '🔒 ROOT3D TEAM',
      access: 'team',
      channels: [
        { key: 'team-start-here', name: 'partner-guide', type: 'text', access: 'team', topic: 'How to run this server: roles, private rooms, briefings, and calls.', messages: teamStart, pin: true, deferred: true },
        { key: 'team-chat', name: 'team-chat', type: 'text', access: 'team', topic: 'Partners only.' },
        { key: 'leads-and-bookings', name: 'leads-and-bookings', type: 'text', access: 'team', topic: 'New inquiries, bookings, and who is taking each one.' },
        { key: 'content-drafts', name: 'content-drafts', type: 'text', access: 'team', topic: 'Draft Insider briefings and Knowledge Base updates for review before posting.' },
        { key: 'handbook', name: 'handbook', type: 'text', access: 'team', topic: 'The Root3D team handbook and where to find it.' },
        { key: 'mod-log', name: 'mod-log', type: 'text', access: 'team', topic: 'Discord system notices and moderation notes.' },
        { key: 'partner-room', name: 'Partner Room', type: 'voice', access: 'voice-team' },
      ],
    },
  ] as Category[],
};

/** The Knowledge Base index is built from the posts, so its links can resolve once they exist. */
export const kbIndex = categories.map((cat) => ({ heading: cat, titles: kbPosts.filter((p) => p.tags?.includes(cat)).map((p) => p.title) }));

/** Plain #channel mentions in guide text become links. Backticked search examples stay literal. */
const linkify = (m: string) => m.replace(/(^|[^`{<\w:] ?)#(ask-root3d|rules|book-a-call|how-to-search)\b/g, '$1{#$2}');
for (const ch of server.categories.flatMap((c) => c.channels)) {
  if (ch.messages) ch.messages = ch.messages.map(linkify);
  for (const p of ch.posts ?? []) p.messages = p.messages.map(linkify);
}

writeFileSync('discord/server.json', JSON.stringify({ ...server, kbIndex }, null, 2) + '\n');
const count = server.categories.flatMap((c) => c.channels).reduce((n, ch) => n + (ch.messages?.length ?? 0) + (ch.posts ?? []).reduce((m, p) => m + p.messages.length, 0), 0);
console.log(`server.json: ${server.categories.length} categories, ${server.categories.flatMap((c) => c.channels).length} channels, ${count} messages`);
