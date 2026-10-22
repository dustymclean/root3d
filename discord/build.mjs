#!/usr/bin/env node
/**
 * Builds or updates the Root3D Discord server from discord/server.json. No dependencies (Node 18+).
 *
 *   DISCORD_TOKEN=<bot token> node discord/build.mjs
 *
 * Safe to run again: it reuses roles, categories, and channels that already exist (matched by name),
 * only posts into channels that are still empty, and only adds forum posts whose titles are missing.
 * It never deletes channels that have content.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const spec = JSON.parse(readFileSync(join(here, 'server.json'), 'utf8'));
const TOKEN = process.env.DISCORD_TOKEN;
const GUILD = process.env.DISCORD_GUILD_ID || '1562847014440534149';
const API = process.env.DISCORD_API || 'https://discord.com/api/v10';
if (!TOKEN) {
  console.error('Set DISCORD_TOKEN to the bot token first.');
  process.exit(1);
}

/* ------------------------------ HTTP ------------------------------ */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(method, path, body, attempt = 0) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'DiscordBot (https://r3dconsulting.com, 1.0)' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 429) {
    const j = await res.json().catch(() => ({}));
    await sleep(Math.ceil((j.retry_after ?? 1) * 1000) + 250);
    return api(method, path, body, attempt);
  }
  if (res.status >= 500 && attempt < 4) {
    await sleep(1000 * 2 ** attempt);
    return api(method, path, body, attempt + 1);
  }
  if (res.headers.get('x-ratelimit-remaining') === '0') await sleep(Number(res.headers.get('x-ratelimit-reset-after') ?? 1) * 1000 + 100);
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(`${method} ${path} → ${res.status} ${text.slice(0, 400)}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* --------------------------- permissions --------------------------- */

const P = {
  REACT: 1n << 6n, STREAM: 1n << 9n, VIEW: 1n << 10n, SEND: 1n << 11n, EMBED: 1n << 14n, ATTACH: 1n << 15n, HISTORY: 1n << 16n,
  MENTION_EVERYONE: 1n << 17n, CONNECT: 1n << 20n, SPEAK: 1n << 21n, PUBLIC_THREADS: 1n << 35n, PRIVATE_THREADS: 1n << 36n, SEND_IN_THREADS: 1n << 38n,
};
const READ = P.VIEW | P.HISTORY | P.REACT;
const TALK = P.SEND | P.SEND_IN_THREADS | P.PUBLIC_THREADS | P.ATTACH | P.EMBED | P.REACT;
const NO_TALK = P.SEND | P.SEND_IN_THREADS | P.PUBLIC_THREADS | P.PRIVATE_THREADS;
const VOICE = P.VIEW | P.CONNECT | P.SPEAK | P.STREAM;

function overwrites(access, roles) {
  const E = GUILD; // @everyone shares the server's id
  const ow = (id, allow = 0n, deny = 0n) => ({ id, type: 0, allow: String(allow), deny: String(deny) });
  switch (access) {
    case 'public-read': return [ow(E, READ, NO_TALK)];
    case 'public-chat':
    case 'public-forum': return [ow(E, READ | TALK)];
    case 'insider-read': return [ow(E, 0n, P.VIEW), ow(roles.insider, READ, NO_TALK), ow(roles.client, READ, NO_TALK)];
    case 'insider-chat':
    case 'insider-forum': return [ow(E, 0n, P.VIEW), ow(roles.insider, READ | TALK), ow(roles.client, READ | TALK)];
    case 'client-chat':
    case 'client-forum': return [ow(E, 0n, P.VIEW), ow(roles.client, READ | TALK)];
    case 'team':
    case 'voice-team': return [ow(E, 0n, P.VIEW)];
    case 'voice-public': return [ow(E, VOICE)];
    case 'voice-client': return [ow(E, P.VIEW, P.CONNECT), ow(roles.client, VOICE)];
    default: throw new Error('Unknown access ' + access);
  }
}

/* ------------------------------ build ------------------------------ */

const TYPE = { text: 0, voice: 2, category: 4, announcement: 5, forum: 15 };
const log = (...a) => console.log(...a);

async function main() {
  const me = await api('GET', '/users/@me');
  const guild = await api('GET', `/guilds/${GUILD}`);
  log(`Bot ${me.username} connected to "${guild.name}".`);

  // Server name and icon
  const icon = readFileSync(join(root, spec.icon)).toString('base64');
  await api('PATCH', `/guilds/${GUILD}`, { name: spec.name, icon: `data:image/png;base64,${icon}` }).catch((e) => log('  (name/icon not changed)', e.message));

  // Roles (created in order, so each lands just above @everyone and the first ends up highest)
  const existingRoles = await api('GET', `/guilds/${GUILD}/roles`);
  const roles = {};
  for (const r of spec.roles) {
    const found = existingRoles.find((x) => x.name === r.name);
    roles[r.key] = found?.id ?? (await api('POST', `/guilds/${GUILD}/roles`, { name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.admin ? '8' : '0' })).id;
    log(`${found ? '✓' : '+'} role ${r.name}`);
  }
  // Only partners may ping @everyone.
  const everyone = existingRoles.find((x) => x.id === GUILD);
  if (everyone && BigInt(everyone.permissions) & P.MENTION_EVERYONE) {
    await api('PATCH', `/guilds/${GUILD}/roles/${GUILD}`, { permissions: String(BigInt(everyone.permissions) & ~P.MENTION_EVERYONE) });
  }

  let channels = await api('GET', `/guilds/${GUILD}/channels`);
  const ids = {};
  const catIds = {};
  const find = (name, parent, type) => channels.find((c) => c.name === name && (parent === undefined || c.parent_id === parent) && (type === undefined || c.type === type));

  async function ensureCategory(cat) {
    let c = find(cat.name, undefined, TYPE.category);
    if (!c) {
      c = await api('POST', `/guilds/${GUILD}/channels`, { name: cat.name, type: TYPE.category, permission_overwrites: overwrites(cat.access, roles) });
      channels.push(c);
      log(`+ category ${cat.name}`);
    }
    return (catIds[cat.name] = c.id);
  }

  let community = (guild.features ?? []).includes('COMMUNITY');
  async function ensureChannel(ch, parent) {
    let type = TYPE[ch.type];
    if (!community && (type === TYPE.forum || type === TYPE.announcement)) type = TYPE.text; // fallback without Community
    // Discord lowercases text channel names; voice channels keep theirs.
    const name = ch.type === 'voice' ? ch.name : ch.name.toLowerCase();
    let c = find(name, parent);
    // Adopt the default channels a new server comes with instead of leaving duplicates.
    if (!c && ch.key === 'general') c = find('general', undefined, TYPE.text);
    if (!c && ch.key === 'waiting-room') c = find('General', undefined, TYPE.voice);
    const body = {
      name, parent_id: parent, permission_overwrites: overwrites(ch.access, roles),
      ...(ch.topic && type !== TYPE.voice ? { topic: ch.topic } : {}),
      ...(type === TYPE.voice && ch.userLimit ? { user_limit: ch.userLimit } : {}),
      ...(type === TYPE.forum
        ? { available_tags: (ch.tags ?? []).slice(0, 20).map((t) => ({ name: t.slice(0, 20), moderated: t === 'Answered' })), default_auto_archive_duration: 10080, default_sort_order: 1, default_forum_layout: 1 }
        : {}),
    };
    if (c) {
      // Keep existing forum tags (posts reference them); add any that are missing.
      if (type === TYPE.forum && c.type === TYPE.forum) {
        const have = new Set((c.available_tags ?? []).map((t) => t.name));
        body.available_tags = [...(c.available_tags ?? []), ...body.available_tags.filter((t) => !have.has(t.name))].slice(0, 20);
      }
      c = await api('PATCH', `/channels/${c.id}`, body);
      channels = channels.map((x) => (x.id === c.id ? c : x));
      log(`✓ #${name}`);
    } else {
      c = await api('POST', `/guilds/${GUILD}/channels`, { ...body, type });
      channels.push(c);
      log(`+ #${name}`);
    }
    return (ids[ch.key] = c.id);
  }

  // 1) Rules and mod-log first, then switch on Community (needed for forums and announcements).
  const all = spec.categories.flatMap((cat) => cat.channels.map((ch) => ({ cat, ch })));
  for (const key of ['rules', 'mod-log', 'introductions']) {
    const { cat, ch } = all.find((x) => x.ch.key === key);
    await ensureChannel({ ...ch, type: 'text' }, await ensureCategory(cat));
  }
  if (!community) {
    try {
      await api('PATCH', `/guilds/${GUILD}`, {
        features: [...new Set([...(guild.features ?? []), 'COMMUNITY'])],
        verification_level: Math.max(1, guild.verification_level ?? 0),
        explicit_content_filter: 2,
        rules_channel_id: ids.rules,
        public_updates_channel_id: ids['mod-log'],
        description: spec.name + ': ' + 'Hardening the Cannabis Supply Chain from Seed to Sale.',
      });
      community = true;
      log('+ Community features on (forums and announcements available)');
    } catch (e) {
      log('! Could not turn on Community. Forums and announcements will be plain text channels.', e.message);
    }
  }
  await api('PATCH', `/guilds/${GUILD}`, { system_channel_id: ids.introductions, default_message_notifications: 1 }).catch(() => {});

  // 2) Every category and channel, in order.
  for (const cat of spec.categories) {
    const parent = await ensureCategory(cat);
    for (const ch of cat.channels) await ensureChannel(ch, parent);
  }
  // Positions: categories and channels in the order listed.
  await api('PATCH', `/guilds/${GUILD}/channels`, spec.categories.map((cat, i) => ({ id: catIds[cat.name], position: i }))).catch((e) => log('  (category order unchanged)', e.message));
  for (const cat of spec.categories) {
    await api('PATCH', `/guilds/${GUILD}/channels`, cat.channels.map((ch, i) => ({ id: ids[ch.key], position: i, parent_id: catIds[cat.name] }))).catch(() => {});
  }
  // Remove the default categories if they are now empty.
  channels = await api('GET', `/guilds/${GUILD}/channels`);
  for (const name of ['Text Channels', 'Voice Channels']) {
    const c = find(name, undefined, TYPE.category);
    if (c && !channels.some((x) => x.parent_id === c.id)) {
      await api('DELETE', `/channels/${c.id}`);
      log(`- empty default category ${name}`);
    }
  }

  // 3) Content.
  const threadIds = {};
  const resolve = (text) =>
    text
      .replace(/\{#([\w-]+)\}/g, (m, k) => (ids[k] ? `<#${ids[k]}>` : m))
      .replace(/\{post:([^}]+)\}/g, (m, t) => (threadIds[t] ? `<#${threadIds[t]}>` : m));
  const send = (channelId, content) => api('POST', `/channels/${channelId}/messages`, { content: resolve(content), flags: 4, allowed_mentions: { parse: [] } });
  async function pin(channelId, messageId) {
    await api('PUT', `/channels/${channelId}/messages/pins/${messageId}`).catch(() => api('PUT', `/channels/${channelId}/pins/${messageId}`).catch(() => {}));
  }
  async function isEmpty(channelId) {
    const m = await api('GET', `/channels/${channelId}/messages?limit=1`);
    return m.length === 0;
  }
  async function postText(ch) {
    const messages = ch.key === 'kb-index' ? kbIndexMessages() : ch.messages ?? [];
    if (!messages.length || !(await isEmpty(ids[ch.key]))) return;
    let first;
    for (const m of messages) {
      const sent = await send(ids[ch.key], m);
      first ??= sent;
    }
    if (ch.pin && first) await pin(ids[ch.key], first.id);
    log(`  ✎ #${ch.name}: ${messages.length} message(s)`);
  }
  async function existingThreads(forumId) {
    const names = {};
    const active = await api('GET', `/guilds/${GUILD}/threads/active`);
    for (const t of active.threads ?? []) if (t.parent_id === forumId) names[t.name] = t.id;
    let before;
    for (;;) {
      const page = await api('GET', `/channels/${forumId}/threads/archived/public?limit=100${before ? `&before=${encodeURIComponent(before)}` : ''}`).catch(() => ({ threads: [] }));
      for (const t of page.threads ?? []) names[t.name] = t.id;
      if (!page.has_more || !page.threads?.length) break;
      before = page.threads.at(-1).thread_metadata.archive_timestamp;
    }
    return names;
  }
  async function postForum(ch) {
    const forumId = ids[ch.key];
    const forum = channels.find((c) => c.id === forumId) ?? (await api('GET', `/channels/${forumId}`));
    const isForum = forum.type === TYPE.forum;
    const tagId = Object.fromEntries((forum.available_tags ?? []).map((t) => [t.name, t.id]));
    const have = isForum ? await existingThreads(forumId) : {};
    if (!isForum && !(await isEmpty(forumId))) return;
    let added = 0;
    for (const [i, p] of (ch.posts ?? []).entries()) {
      if (have[p.title]) {
        threadIds[p.title] = have[p.title];
        continue;
      }
      if (isForum) {
        const t = await api('POST', `/channels/${forumId}/threads`, {
          name: p.title, auto_archive_duration: 10080,
          applied_tags: (p.tags ?? []).map((n) => tagId[n.slice(0, 20)]).filter(Boolean).slice(0, 5),
          message: { content: resolve(p.messages[0]), flags: 4, allowed_mentions: { parse: [] } },
        });
        threadIds[p.title] = t.id;
        for (const m of p.messages.slice(1)) await send(t.id, m);
        if (i === 0 && /^(Start here|How|Read first)/.test(p.title)) await api('PATCH', `/channels/${t.id}`, { flags: 2 }).catch(() => {});
      } else {
        // Without Community: each post becomes a headed message followed by its details in a thread.
        const head = await send(forumId, `# ${p.title}`);
        const t = await api('POST', `/channels/${forumId}/messages/${head.id}/threads`, { name: p.title, auto_archive_duration: 10080 });
        threadIds[p.title] = t.id;
        for (const m of p.messages) await send(t.id, m);
      }
      added++;
    }
    if (added) log(`  ✎ #${ch.name}: ${added} post(s)`);
  }
  function kbIndexMessages() {
    const lines = ['# Knowledge Base index', 'Every article, grouped by category. Click a title to open it. Search tips: {#how-to-search}'];
    for (const g of spec.kbIndex) lines.push(`## ${g.heading}\n${g.titles.map((t) => `- {post:${t}}`).join('\n')}`);
    lines.push('-# Educational information only. Not legal advice. Rules change often; confirm requirements with your regulator.');
    return [lines.join('\n\n')];
  }

  const ordered = all.map((x) => x.ch).filter((ch) => ch.type !== 'voice');
  for (const ch of ordered.filter((c) => !c.deferred)) (ch.posts ? await postForum(ch) : await postText(ch));
  for (const ch of ordered.filter((c) => c.deferred)) (ch.posts ? await postForum(ch) : await postText(ch));

  log('\nDone. Next: give Dusty, Danny, Joel, and Hunter the "Root3D Partner" role (Server Settings → Members), then reset the bot token in the Discord Developer Portal.');
}

main().catch((e) => {
  console.error('\nBuild stopped:', e.message);
  if (e.status === 403 || e.status === 50013) console.error('The bot needs the Administrator permission. Re-invite it with the link in discord/README.md.');
  process.exit(1);
});
