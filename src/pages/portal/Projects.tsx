import { ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Flag, KanbanSquare, Plus, Save, Trash2 } from 'lucide-react';
import { useState, type DragEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Empty, ErrorText, Field, Loading, StatusPill, Success } from '../../components/ui';
import { pipeline } from '../../data/company';
import { dateOnly } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { Milestone, Project, ProjectTask, TaskStatus } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { personName, useLookups } from './lookups';

const columns: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'review', label: 'Review' },
  { id: 'done', label: 'Done' },
];

export function Projects() {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const look = useLookups();
  const projects = useAsync(() => q<Project[]>(db().from('projects').select('*').order('updated_at', { ascending: false })), []);
  const tasks = useAsync(() => q<Pick<ProjectTask, 'project_id' | 'status'>[]>(db().from('project_tasks').select('project_id,status')), []);
  const [creating, setCreating] = useState(false);

  if (projects.loading || !look.data) return <Loading />;
  const progress = (id: string) => {
    const t = (tasks.data ?? []).filter((x) => x.project_id === id);
    return { done: t.filter((x) => x.status === 'done').length, total: t.length };
  };

  return (
    <div className="stack">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Projects</h2>
        {isAdmin && <button className="btn btn-primary btn-sm" onClick={() => setCreating(!creating)}><Plus size={16} /> New project</button>}
      </div>
      <p className="muted small" style={{ marginTop: 0 }}>Shared workspaces with task boards, milestones, and the full project record, from initial problem to follow-up.</p>
      {creating && <NewProject onDone={() => { setCreating(false); void projects.reload(); }} />}
      <ErrorText error={projects.error} />
      {(projects.data ?? []).length === 0 ? (
        <Empty icon={<KanbanSquare size={32} />}>
          {isAdmin ? 'No projects yet. Create one for a client to start a shared workspace.' : 'No projects yet. When we start a multi-step engagement with you, its board and milestones will appear here.'}
        </Empty>
      ) : (
        <div className="grid grid-2">
          {(projects.data ?? []).map((p) => {
            const pr = progress(p.id);
            return (
              <Link key={p.id} to={`/portal/projects/${p.id}`} className="card hover">
                <div className="row between">
                  <h3 style={{ margin: 0 }}>{p.title}</h3>
                  <StatusPill status={p.status} />
                </div>
                {isAdmin && <p className="small muted">{personName(look.data, p.client_id)}</p>}
                <p className="small muted">{p.summary}</p>
                <div className="progress" aria-label={`${pr.done} of ${pr.total} tasks done`}>
                  <span style={{ width: pr.total ? `${(pr.done / pr.total) * 100}%` : 0 }} />
                </div>
                <p className="small muted">{pr.done} of {pr.total} tasks done{p.due_date && <> · due {dateOnly(p.due_date)}</>}</p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NewProject({ onDone }: { onDone: () => void }) {
  const look = useLookups();
  const [f, setF] = useState({ client_id: '', title: '', summary: '', due_date: '', consultants: [] as string[] });
  const [error, setError] = useState<string | null>(null);
  const clients = (look.data?.profileList ?? []).filter((p) => p.role === 'client');

  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('projects').insert({ ...f, due_date: f.due_date || null });
    if (error) setError(error.message);
    else onDone();
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h3>New project</h3>
      <div className="form-row">
        <Field label="Client">
          <select className="select" required value={f.client_id} onChange={(e) => setF({ ...f, client_id: e.target.value })}>
            <option value="">Choose a client</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.full_name || c.email}{c.company && ` (${c.company})`}</option>)}
          </select>
        </Field>
        <Field label="Due date (optional)"><input className="input" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
      </div>
      <Field label="Title"><input className="input" required maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Summary"><textarea className="textarea" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></Field>
      <fieldset className="fieldset">
        <legend className="field-label">Consultants</legend>
        {look.data?.consultantList.map((c) => (
          <label key={c.slug} className="check">
            <input type="checkbox" checked={f.consultants.includes(c.slug)}
              onChange={(e) => setF({ ...f, consultants: e.target.checked ? [...f.consultants, c.slug] : f.consultants.filter((x) => x !== c.slug) })} />
            {c.name}
          </label>
        ))}
      </fieldset>
      <ErrorText error={error} />
      <div className="btn-row">
        <button className="btn btn-primary btn-sm"><Save size={16} /> Create</button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDone}>Cancel</button>
      </div>
    </form>
  );
}

export function ProjectDetail() {
  const { id = '' } = useParams();
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const look = useLookups();
  const project = useAsync(() => q<Project>(db().from('projects').select('*').eq('id', id).single()), [id]);
  const [tab, setTab] = useState<'board' | 'milestones' | 'record'>('board');

  if (project.loading || !look.data) return <Loading />;
  if (!project.data) return <ErrorText error={project.error ?? 'Not found'} />;
  const p = project.data;

  async function setStatus(status: string) {
    await db().from('projects').update({ status }).eq('id', p.id);
    void project.reload();
  }

  return (
    <div className="stack">
      <div className="row between">
        <Link to="/portal/projects" className="row small"><ArrowLeft size={16} /> All projects</Link>
        <Link to={`/portal/projects/${p.id}/report`} className="btn btn-ghost btn-sm"><FileText size={16} /> Project report</Link>
      </div>
      <div className="card">
        <div className="row between" style={{ flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0 }}>{p.title}</h2>
            <p className="muted small" style={{ margin: 0 }}>
              {isAdmin && <>{personName(look.data, p.client_id)} · </>}
              {p.consultants.map((s) => look.data!.consultants[s]?.name).filter(Boolean).join(', ') || 'Root3D team'}
              {p.due_date && <> · due {dateOnly(p.due_date)}</>}
            </p>
          </div>
          {isAdmin ? (
            <select className="select" style={{ width: 'auto' }} value={p.status} onChange={(e) => void setStatus(e.target.value)} aria-label="Project status">
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="done">Done</option>
            </select>
          ) : (
            <StatusPill status={p.status} />
          )}
        </div>
        {p.summary && <p>{p.summary}</p>}
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'board'} onClick={() => setTab('board')}>Task board</button>
          <button role="tab" aria-selected={tab === 'milestones'} onClick={() => setTab('milestones')}>Milestones</button>
          <button role="tab" aria-selected={tab === 'record'} onClick={() => setTab('record')}>Project record</button>
        </div>
      </div>
      {tab === 'board' && <Board project={p} />}
      {tab === 'milestones' && <Milestones project={p} />}
      {tab === 'record' && <RecordView project={p} onSaved={() => void project.reload()} />}
    </div>
  );
}

function Board({ project }: { project: Project }) {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const look = useLookups();
  const tasks = useAsync(() => q<ProjectTask[]>(db().from('project_tasks').select('*').eq('project_id', project.id).order('sort').order('created_at')), [project.id]);
  const [f, setF] = useState({ title: '', detail: '', assignee: '', due_date: '' });
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  async function move(t: ProjectTask, status: TaskStatus) {
    if (t.status === status) return;
    tasks.setData((prev) => prev?.map((x) => (x.id === t.id ? { ...x, status } : x)) ?? prev);
    const { error } = await db().from('project_tasks').update({ status }).eq('id', t.id);
    if (error) {
      setError(error.message);
      void tasks.reload();
    }
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('project_tasks').insert({
      project_id: project.id, title: f.title, detail: f.detail, assignee: f.assignee || null, due_date: f.due_date || null,
      sort: (tasks.data?.length ?? 0) + 1,
    });
    if (error) setError(error.message);
    else {
      setF({ title: '', detail: '', assignee: '', due_date: '' });
      void tasks.reload();
    }
  }

  function onDrop(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    setOver(null);
    const t = tasks.data?.find((x) => x.id === e.dataTransfer.getData('text/plain'));
    if (t) void move(t, status);
  }

  if (tasks.loading) return <Loading />;
  return (
    <>
      <div className="kanban">
        {columns.map((col, ci) => (
          <section key={col.id} className={`kanban-col ${over === col.id ? 'over' : ''}`} aria-label={col.label}
            onDragOver={isAdmin ? (e) => { e.preventDefault(); setOver(col.id); } : undefined}
            onDragLeave={() => setOver(null)}
            onDrop={isAdmin ? (e) => onDrop(e, col.id) : undefined}>
            <h4>{col.label} <span className="muted">{(tasks.data ?? []).filter((t) => t.status === col.id).length}</span></h4>
            {(tasks.data ?? []).filter((t) => t.status === col.id).map((t) => (
              <article key={t.id} className="kanban-card" draggable={isAdmin} onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}>
                <strong>{t.title}</strong>
                {t.detail && <p className="small muted">{t.detail}</p>}
                <div className="small muted">
                  {t.assignee ? look.data?.consultants[t.assignee]?.name : 'Unassigned'}
                  {t.due_date && <> · due {dateOnly(t.due_date)}</>}
                </div>
                {isAdmin && (
                  <div className="row" style={{ gap: 4, marginTop: 6 }}>
                    <button className="linkish" disabled={ci === 0} aria-label={`Move ${t.title} left`} onClick={() => void move(t, columns[ci - 1].id)}><ArrowLeft size={14} /></button>
                    <button className="linkish" disabled={ci === columns.length - 1} aria-label={`Move ${t.title} right`} onClick={() => void move(t, columns[ci + 1].id)}><ArrowRight size={14} /></button>
                    <button className="linkish" aria-label={`Delete ${t.title}`} style={{ marginLeft: 'auto' }}
                      onClick={() => void db().from('project_tasks').delete().eq('id', t.id).then(() => tasks.reload())}><Trash2 size={14} /></button>
                  </div>
                )}
              </article>
            ))}
          </section>
        ))}
      </div>
      {isAdmin && (
        <form className="card form" onSubmit={add}>
          <h3>Add a task</h3>
          <div className="form-row">
            <Field label="Task"><input className="input" required maxLength={300} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Assign to">
              <select className="select" value={f.assignee} onChange={(e) => setF({ ...f, assignee: e.target.value })}>
                <option value="">Unassigned</option>
                {look.data?.consultantList.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Due"><input className="input" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
          </div>
          <Field label="Details (optional)"><input className="input" value={f.detail} onChange={(e) => setF({ ...f, detail: e.target.value })} /></Field>
          <div><button className="btn btn-primary btn-sm"><Plus size={16} /> Add task</button></div>
        </form>
      )}
      <ErrorText error={error} />
    </>
  );
}

function Milestones({ project }: { project: Project }) {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const rows = useAsync(() => q<Milestone[]>(db().from('milestones').select('*').eq('project_id', project.id).order('due_date', { nullsFirst: false })), [project.id]);
  const [f, setF] = useState({ title: '', deliverable: '', due_date: '' });
  const [error, setError] = useState<string | null>(null);

  async function add(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('milestones').insert({ ...f, project_id: project.id, due_date: f.due_date || null });
    if (error) setError(error.message);
    else {
      setF({ title: '', deliverable: '', due_date: '' });
      void rows.reload();
    }
  }

  async function toggle(m: Milestone) {
    await db().from('milestones').update({ done_at: m.done_at ? null : new Date().toISOString() }).eq('id', m.id);
    void rows.reload();
  }

  if (rows.loading) return <Loading />;
  return (
    <div className="card">
      {(rows.data ?? []).length === 0 && <Empty icon={<Flag size={28} />}>No milestones yet.</Empty>}
      <ul className="milestones">
        {(rows.data ?? []).map((m) => (
          <li key={m.id} className={m.done_at ? 'done' : ''}>
            {isAdmin ? (
              <button className="linkish" onClick={() => void toggle(m)} aria-label={m.done_at ? 'Mark not done' : 'Mark done'}>
                {m.done_at ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
            ) : m.done_at ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            <div>
              <strong>{m.title}</strong>
              {m.deliverable && <div className="small muted">Deliverable: {m.deliverable}</div>}
              <div className="small muted">
                {m.due_date ? `Due ${dateOnly(m.due_date)}` : 'No due date'}
                {m.done_at && ` · completed ${dateOnly(m.done_at)}`}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <form className="form mt" onSubmit={add}>
          <div className="form-row">
            <Field label="Milestone"><input className="input" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
            <Field label="Deliverable"><input className="input" value={f.deliverable} onChange={(e) => setF({ ...f, deliverable: e.target.value })} /></Field>
            <Field label="Due"><input className="input" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
          </div>
          <div><button className="btn btn-primary btn-sm"><Plus size={16} /> Add milestone</button></div>
          <ErrorText error={error} />
        </form>
      )}
    </div>
  );
}

function RecordView({ project, onSaved }: { project: Project; onSaved: () => void }) {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const [rec, setRec] = useState<Record<string, string>>(project.record ?? {});
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('projects').update({ record: rec }).eq('id', project.id);
    if (error) setError(error.message);
    else {
      setMsg('Project record saved.');
      onSaved();
    }
  }

  if (!isAdmin) {
    const filled = pipeline.filter((s) => project.record?.[s.key]);
    return (
      <div className="card">
        {filled.length === 0 ? <Empty>Your consultants will fill in the project record as the work progresses.</Empty> : (
          <ol className="record">{filled.map((s) => <li key={s.key}><strong>{s.title}</strong><p>{project.record[s.key]}</p></li>)}</ol>
        )}
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={save}>
      <p className="muted small">Document each stage as you go. Clients see every stage that has content.</p>
      {pipeline.map((s, i) => (
        <Field key={s.key} label={`${i + 1}. ${s.title}`} hint={s.text}>
          <textarea className="textarea" value={rec[s.key] ?? ''} onChange={(e) => setRec({ ...rec, [s.key]: e.target.value })} />
        </Field>
      ))}
      <ErrorText error={error} />
      {msg && <Success>{msg}</Success>}
      <div><button className="btn btn-primary btn-sm"><Save size={16} /> Save record</button></div>
    </form>
  );
}
