import { ArrowLeft, Printer } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorText, Loading } from '../../components/ui';
import { pipeline } from '../../data/company';
import { modeLabels } from '../../lib/contact';
import { dateOnly, dateTime } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { ActionPlan, Booking, FileRow, Milestone, Project, ProjectTask } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { personName, useLookups, type Lookups } from './lookups';

const disclaimer =
  'Prepared by Root3D Consulting for the client named above. Educational and advisory guidance, not legal advice. Confirm regulatory requirements with your regulator. Root3D does not guarantee inspection, regulatory, or crop outcomes.';

function ReportShell({ back, children }: { back: string; children: ReactNode }) {
  return (
    <div className="stack">
      <div className="btn-row no-print">
        <Link className="btn btn-ghost btn-sm" to={back}><ArrowLeft size={16} /> Back</Link>
        <button className="btn btn-primary btn-sm" onClick={() => window.print()}><Printer size={16} /> Print / save PDF</button>
      </div>
      <article className="card sop-doc report">{children}</article>
    </div>
  );
}

/** Clients cannot load other profiles, so fall back to the signed-in person's own name. */
function useClientName(look: Lookups | null, id: string) {
  const me = useAuth((s) => s.profile);
  return personName(look, id) || (me && me.id === id ? me.full_name || me.email : '') || '—';
}

function Para({ text }: { text: string }) {
  return <>{text.split(/\n{2,}/).map((p, i) => <p key={i} style={{ whiteSpace: 'pre-wrap' }}>{p}</p>)}</>;
}

/** A printable record of one session: details, the written action plan, and the evidence the client uploaded. */
export function SessionReport() {
  const { id = '' } = useParams();
  const look = useLookups();
  const booking = useAsync(() => q<Booking>(db().from('bookings').select('*').eq('id', id).single()), [id]);
  const plan = useAsync(() => q<ActionPlan | null>(db().from('action_plans').select('*').eq('booking_id', id).maybeSingle()), [id]);
  const files = useAsync(() => q<FileRow[]>(db().from('files').select('*').eq('booking_id', id).order('created_at')), [id]);
  const clientName = useClientName(look.data, booking.data?.client_id ?? '');
  if (booking.loading || plan.loading || !look.data) return <Loading />;
  if (!booking.data) return <ErrorText error={booking.error ?? 'Not found'} />;
  const b = booking.data;
  const p = plan.data;
  const c = look.data.consultants[b.consultant_slug];
  const s = look.data.services[b.service_id];

  return (
    <ReportShell back={`/portal/appointments/${b.id}`}>
      <p className="eyebrow" style={{ marginBottom: 0 }}>Root3D Consulting · Session report</p>
      <h1>{p?.title || s?.name || 'Session report'}</h1>
      <table>
        <tbody>
          <tr><th>Client</th><td>{clientName}</td></tr>
          <tr><th>Consultant</th><td>{c?.name}</td></tr>
          <tr><th>Service</th><td>{s?.name}</td></tr>
          <tr><th>Date</th><td>{dateTime(b.starts_at)}</td></tr>
          <tr><th>Met on</th><td>{modeLabels[b.mode] ?? b.mode}{b.mode === 'onsite' && b.location ? ` · ${b.location}` : ''}</td></tr>
          <tr><th>Report ID</th><td>{b.id.slice(0, 8).toUpperCase()}{p ? ` · updated ${dateOnly(p.updated_at)}` : ''}</td></tr>
        </tbody>
      </table>
      {b.notes && (<><h2>What the client asked</h2><Para text={b.notes} /></>)}
      {!p ? (
        <p className="muted">The action plan for this session has not been written yet.</p>
      ) : (
        <>
          {p.problem && (<><h2>Problem</h2><Para text={p.problem} /></>)}
          {p.solution && (<><h2>Solution</h2><Para text={p.solution} /></>)}
          <h2>Action plan</h2>
          <table>
            <thead><tr><th style={{ width: '3rem' }}>#</th><th>Step</th><th style={{ width: '7rem' }}>Status</th></tr></thead>
            <tbody>
              {p.steps.map((st, i) => <tr key={i}><td>{i + 1}</td><td>{st.text}</td><td>{st.done ? 'Done' : 'Open'}</td></tr>)}
            </tbody>
          </table>
          {p.contingencies && (<><h2>If it does not work</h2><Para text={p.contingencies} /></>)}
          {p.test_results && (<><h2>Test results and evidence</h2><Para text={p.test_results} /></>)}
        </>
      )}
      {(files.data ?? []).length > 0 && (
        <>
          <h2>Documents reviewed</h2>
          <ul>{files.data!.map((f) => <li key={f.id}>{f.name} <span className="muted small">({f.kind === 'deliverable' ? 'deliverable' : 'uploaded'} {dateOnly(f.created_at)})</span></li>)}</ul>
        </>
      )}
      <h2>Sign-off</h2>
      <table>
        <tbody>
          <tr><th style={{ width: '30%' }}>Consultant</th><td>{c?.name}</td></tr>
          <tr><th>Client acknowledgment</th><td style={{ height: '2.5rem' }} /></tr>
          <tr><th>Date</th><td /></tr>
        </tbody>
      </table>
      <p className="disclaimer">{disclaimer}</p>
    </ReportShell>
  );
}

/** A printable final report for a project: the ten-stage record, milestones, and tasks. */
export function ProjectReport() {
  const { id = '' } = useParams();
  const look = useLookups();
  const project = useAsync(() => q<Project>(db().from('projects').select('*').eq('id', id).single()), [id]);
  const tasks = useAsync(() => q<ProjectTask[]>(db().from('project_tasks').select('*').eq('project_id', id).order('sort').order('created_at')), [id]);
  const miles = useAsync(() => q<Milestone[]>(db().from('milestones').select('*').eq('project_id', id).order('due_date')), [id]);
  const clientName = useClientName(look.data, project.data?.client_id ?? '');
  if (project.loading || !look.data) return <Loading />;
  if (!project.data) return <ErrorText error={project.error ?? 'Not found'} />;
  const p = project.data;
  const team = p.consultants.map((s) => look.data!.consultants[s]?.name).filter(Boolean).join(', ') || 'Root3D team';
  const statusLabel = { todo: 'To do', doing: 'In progress', review: 'In review', done: 'Done' } as const;

  return (
    <ReportShell back={`/portal/projects/${p.id}`}>
      <p className="eyebrow" style={{ marginBottom: 0 }}>Root3D Consulting · Project report</p>
      <h1>{p.title}</h1>
      <table>
        <tbody>
          <tr><th>Client</th><td>{clientName}</td></tr>
          <tr><th>Consultants</th><td>{team}</td></tr>
          <tr><th>Status</th><td>{p.status === 'on_hold' ? 'On hold' : p.status === 'done' ? 'Done' : 'Active'}</td></tr>
          <tr><th>Started</th><td>{dateOnly(p.created_at)}{p.due_date ? ` · due ${dateOnly(p.due_date)}` : ''}</td></tr>
          <tr><th>Last updated</th><td>{dateTime(p.updated_at)}</td></tr>
        </tbody>
      </table>
      {p.summary && <Para text={p.summary} />}
      <h2>Engagement record</h2>
      {pipeline.map((st, i) => (
        <section key={st.key}>
          <h3>{i + 1}. {st.title}</h3>
          {p.record?.[st.key] ? <Para text={p.record[st.key]} /> : <p className="muted small">Not recorded yet.</p>}
        </section>
      ))}
      {(miles.data ?? []).length > 0 && (
        <>
          <h2>Milestones</h2>
          <table>
            <thead><tr><th>Milestone</th><th>Deliverable</th><th>Due</th><th>Done</th></tr></thead>
            <tbody>{miles.data!.map((m) => <tr key={m.id}><td>{m.title}</td><td>{m.deliverable}</td><td>{m.due_date ? dateOnly(m.due_date) : '—'}</td><td>{m.done_at ? dateOnly(m.done_at) : '—'}</td></tr>)}</tbody>
          </table>
        </>
      )}
      {(tasks.data ?? []).length > 0 && (
        <>
          <h2>Tasks</h2>
          <table>
            <thead><tr><th>Task</th><th>Owner</th><th>Status</th></tr></thead>
            <tbody>{tasks.data!.map((t) => <tr key={t.id}><td>{t.title}</td><td>{t.assignee ? look.data!.consultants[t.assignee]?.name ?? '—' : '—'}</td><td>{statusLabel[t.status]}</td></tr>)}</tbody>
          </table>
        </>
      )}
      <p className="disclaimer">{disclaimer}</p>
    </ReportShell>
  );
}
