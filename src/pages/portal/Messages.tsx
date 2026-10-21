import { LifeBuoy, MessageSquarePlus, Send } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Empty, ErrorText, Field, Loading, StatusPill } from '../../components/ui';
import { dateTime } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { Message, Thread } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { personName, useLookups } from './lookups';

export function Messages() {
  const { id } = useParams();
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const look = useLookups();
  const threads = useAsync(() => q<Thread[]>(db().from('threads').select('*').order('updated_at', { ascending: false })), []);
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'message' | 'support'>('all');

  if (threads.loading || !look.data) return <Loading />;
  const list = (threads.data ?? []).filter((t) => filter === 'all' || t.kind === filter);
  const active = (threads.data ?? []).find((t) => t.id === id);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 300px) minmax(0, 1fr)', alignItems: 'start' }}>
      <div className="card">
        <div className="row between">
          <h3 style={{ margin: 0 }}>Conversations</h3>
          {!isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setComposing(true)}><MessageSquarePlus size={16} /> New</button>}
        </div>
        <div className="tabs mt" role="tablist">
          {(['all', 'message', 'support'] as const).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f === 'message' ? 'Messages' : 'Support'}</button>
          ))}
        </div>
        <div className="thread-list">
          {list.map((t) => (
            <Link key={t.id} to={`/portal/messages/${t.id}`} className={t.id === id ? 'active' : ''}>
              <div className="row between">
                <strong className="small">{t.subject}</strong>
                {t.kind === 'support' && <LifeBuoy size={14} />}
              </div>
              <div className="muted small">
                {isAdmin ? personName(look.data, t.client_id) : t.consultant_slug ? look.data!.consultants[t.consultant_slug]?.name : 'Whole team'}
                {' · '}{t.status}
              </div>
            </Link>
          ))}
          {list.length === 0 && <Empty>No conversations yet.</Empty>}
        </div>
      </div>
      <div className="card">
        {composing ? (
          <NewThread onDone={() => { setComposing(false); void threads.reload(); }} />
        ) : active ? (
          <ThreadView thread={active} onStatus={() => void threads.reload()} />
        ) : (
          <Empty>Pick a conversation, or start a new one. Every Root3D partner can see your history, so you never need to repeat yourself.</Empty>
        )}
      </div>
    </div>
  );
}

function NewThread({ onDone }: { onDone: () => void }) {
  const profile = useAuth((s) => s.profile)!;
  const look = useLookups();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: '', kind: 'message', consultant_slug: '', body: '' });
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      const t = await q<Thread>(db().from('threads').insert({ client_id: profile.id, subject: form.subject, kind: form.kind, consultant_slug: form.consultant_slug || null }).select().single());
      await q(db().from('messages').insert({ thread_id: t.id, sender_id: profile.id, body: form.body }));
      onDone();
      navigate(`/portal/messages/${t.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      <h3>New conversation</h3>
      <div className="form-row">
        <Field label="Type">
          <select className="select" value={form.kind} onChange={set('kind')}>
            <option value="message">Message a consultant</option>
            <option value="support">Support ticket</option>
          </select>
        </Field>
        <Field label="To">
          <select className="select" value={form.consultant_slug} onChange={set('consultant_slug')}>
            <option value="">Whole team</option>
            {look.data?.consultantList.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Subject"><input className="input" required value={form.subject} onChange={set('subject')} /></Field>
      <Field label="Message"><textarea className="textarea" required value={form.body} onChange={set('body')} /></Field>
      <ErrorText error={error} />
      <div className="btn-row">
        <button className="btn btn-primary"><Send size={16} /> Send</button>
        <button type="button" className="btn btn-ghost" onClick={() => onDone()}>Cancel</button>
      </div>
    </form>
  );
}

function ThreadView({ thread, onStatus }: { thread: Thread; onStatus: () => void }) {
  const profile = useAuth((s) => s.profile)!;
  const look = useLookups();
  const msgs = useAsync(() => q<Message[]>(db().from('messages').select('*').eq('thread_id', thread.id).order('created_at')), [thread.id]);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { setData } = msgs;

  useEffect(() => {
    const ch = db()
      .channel(`thread-${thread.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` }, (payload) => {
        const m = payload.new as Message;
        setData((prev) => (prev && !prev.some((x) => x.id === m.id) ? [...prev, m] : prev));
      })
      .subscribe();
    return () => void db().removeChannel(ch);
  }, [thread.id, setData]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [msgs.data]);

  const who = (id: string) => {
    if (id === profile.id) return 'You';
    const c = look.data?.consultantList.find((x) => x.profile_id === id);
    return c?.name ?? (personName(look.data, id) || 'Root3D team');
  };

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const m = await q<Message>(db().from('messages').insert({ thread_id: thread.id, sender_id: profile.id, body }).select().single());
      setData((prev) => (prev && !prev.some((x) => x.id === m.id) ? [...prev, m] : prev));
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  async function toggleStatus() {
    await db().from('threads').update({ status: thread.status === 'open' ? 'closed' : 'open' }).eq('id', thread.id);
    onStatus();
  }

  return (
    <div>
      <div className="row between" style={{ marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>{thread.subject}</h3>
          <span className="muted small">{thread.kind === 'support' ? 'Support ticket' : 'Message'} · <StatusPill status={thread.status} /></span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => void toggleStatus()}>{thread.status === 'open' ? 'Mark resolved' : 'Reopen'}</button>
      </div>
      <div className="chat">
        <div className="chat-log" ref={logRef} aria-live="polite">
          {(msgs.data ?? []).map((m) => (
            <div key={m.id} className={`bubble ${m.sender_id === profile.id ? 'mine' : ''}`}>
              {m.body}
              <small>{who(m.sender_id)} · {dateTime(m.created_at)}</small>
            </div>
          ))}
        </div>
        <form className="chat-compose" onSubmit={send}>
          <textarea className="textarea" style={{ minHeight: 48 }} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" aria-label="Message"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(e as unknown as FormEvent); } }} />
          <button className="btn btn-primary" aria-label="Send"><Send size={18} /></button>
        </form>
        <ErrorText error={error} />
      </div>
    </div>
  );
}
