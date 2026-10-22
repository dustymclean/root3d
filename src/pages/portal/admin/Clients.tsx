import { FilePlus2, MessageSquarePlus, Receipt, Repeat } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Empty, ErrorText, Field, Loading, StatusPill } from '../../../components/ui';
import { dateOnly, dateTime, money } from '../../../lib/format';
import { db, q } from '../../../lib/supabase';
import type { ActionPlan, Agreement, Booking, ClientNote, FileRow, Invoice, Profile, Retainer, Thread } from '../../../lib/types';
import { useAsync } from '../../../lib/useAsync';
import { useAuth } from '../../../store/auth';
import { intakeQuestions } from '../ClientPages';
import { personName, useLookups } from '../lookups';
import { BookingTable, FilePanel, InvoiceTable } from '../shared';

export function Clients() {
  const look = useLookups();
  const [search, setSearch] = useState('');
  if (!look.data) return <Loading />;
  const rows = look.data.profileList.filter((p) => p.role === 'client' && `${p.full_name} ${p.email} ${p.company}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="card">
      <div className="row between">
        <h2 style={{ margin: 0 }}>Clients</h2>
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search name, email, company" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search clients" />
      </div>
      <div className="table-wrap mt">
        <table className="table">
          <thead><tr><th>Name</th><th>Company</th><th>Email</th><th>Intake</th><th>Joined</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td><Link to={`/portal/admin/clients/${p.id}`}>{p.full_name || '(no name)'}</Link></td>
                <td>{p.company}</td>
                <td>{p.email}</td>
                <td>{p.intake_completed_at ? 'Done' : '—'}</td>
                <td>{dateOnly(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>No clients match.</Empty>}
      </div>
    </div>
  );
}

type Tab = 'history' | 'files' | 'billing' | 'documents' | 'notes';

export function ClientDetail() {
  const { id = '' } = useParams();
  const look = useLookups();
  const navigate = useNavigate();
  const me = useAuth((s) => s.profile)!;
  const [tab, setTab] = useState<Tab>('history');
  const d = useAsync(async () => {
    const [profile, bookings, files, invoices, plans, agreements, retainers, notes] = await Promise.all([
      q<Profile>(db().from('profiles').select('*').eq('id', id).single()),
      q<Booking[]>(db().from('bookings').select('*').eq('client_id', id).order('starts_at', { ascending: false })),
      q<FileRow[]>(db().from('files').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      q<Invoice[]>(db().from('invoices').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      q<ActionPlan[]>(db().from('action_plans').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      q<Agreement[]>(db().from('agreements').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      q<Retainer[]>(db().from('retainers').select('*').eq('client_id', id).order('created_at', { ascending: false })),
      q<ClientNote[]>(db().from('client_notes').select('*').eq('client_id', id).order('created_at', { ascending: false })),
    ]);
    return { profile, bookings, files, invoices, plans, agreements, retainers, notes };
  }, [id]);

  if (d.loading || !d.data || !look.data) return <Loading />;
  const { profile: p } = d.data;
  const reload = () => void d.reload();

  async function startThread() {
    const t = await q<Thread>(db().from('threads').insert({ client_id: id, subject: 'Note from Root3D', consultant_slug: me.consultant_slug }).select().single());
    navigate(`/portal/messages/${t.id}`);
  }

  return (
    <div className="stack">
      <div className="card">
        <div className="row between">
          <div>
            <h2 style={{ margin: 0 }}>{p.full_name || p.email}</h2>
            <p className="muted" style={{ margin: 0 }}>{[p.company, p.license_type, p.state].filter(Boolean).join(' · ')}</p>
            <p className="small" style={{ margin: 0 }}><a href={`mailto:${p.email}`}>{p.email}</a></p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => void startThread()}><MessageSquarePlus size={16} /> Message</button>
        </div>
        {p.intake_completed_at ? (
          <details className="mt">
            <summary><strong>Intake</strong></summary>
            <dl>
              {intakeQuestions.map((qq) => p.intake[qq.key] && (
                <div key={qq.key}><dt className="muted small">{qq.label}</dt><dd style={{ margin: '0 0 0.75rem' }}>{p.intake[qq.key]}</dd></div>
              ))}
            </dl>
          </details>
        ) : <p className="muted small mt">Intake not completed yet.</p>}
      </div>

      <div className="card">
        <div className="tabs" role="tablist">
          {(['history', 'files', 'billing', 'documents', 'notes'] as Tab[]).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {tab === 'history' && (
          <div className="stack">
            <BookingTable rows={d.data.bookings} consultants={look.data.consultants} services={look.data.services} />
            <h3>Action plans</h3>
            {d.data.plans.length === 0 ? <p className="muted">None yet.</p> : (
              <ul>{d.data.plans.map((pl) => <li key={pl.id}>{pl.title} · {dateOnly(pl.created_at)} · {pl.steps.filter((s) => s.done).length}/{pl.steps.length} done {pl.booking_id && <Link to={`/portal/appointments/${pl.booking_id}`}>open</Link>}</li>)}</ul>
            )}
          </div>
        )}

        {tab === 'files' && <FilePanel clientId={id} files={d.data.files} onChange={reload} deliverable />}

        {tab === 'billing' && (
          <div className="stack">
            <InvoiceTable rows={d.data.invoices} />
            <NewInvoice clientId={id} onDone={reload} />
            <h3>Retainers</h3>
            {d.data.retainers.map((r) => (
              <p key={r.id}>{look.data!.services[r.service_id]?.name} · <StatusPill status={r.status} /> · bills day {r.billing_day}</p>
            ))}
            <NewRetainer clientId={id} agreements={d.data.agreements} onDone={reload} />
          </div>
        )}

        {tab === 'documents' && (
          <div className="stack">
            {d.data.agreements.map((a) => (
              <p key={a.id}><span className="tag">{a.kind}</span> {a.title} · <StatusPill status={a.status} />{a.signed_at && <> · signed {dateTime(a.signed_at)} by {a.signed_name}</>}</p>
            ))}
            <NewAgreement clientId={id} onDone={reload} />
          </div>
        )}

        {tab === 'notes' && <Notes clientId={id} notes={d.data.notes} onDone={reload} authorName={(aid) => personName(look.data, aid)} />}
      </div>
    </div>
  );
}

function NewInvoice({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const me = useAuth((s) => s.profile)!;
  const [f, setF] = useState({ description: '', amount: '', due_date: '', payment_url: '' });
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('invoices').insert({
      client_id: clientId, consultant_slug: me.consultant_slug, description: f.description, amount_cents: Math.round(Number(f.amount) * 100),
      due_date: f.due_date || null, payment_url: f.payment_url, status: 'open',
    });
    if (error) return setError(error.message);
    setF({ description: '', amount: '', due_date: '', payment_url: '' });
    onDone();
  }
  return (
    <form className="form card coming" onSubmit={submit}>
      <h3><Receipt size={18} /> New invoice</h3>
      <Field label="Description"><input className="input" required value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
      <div className="form-row">
        <Field label="Amount (USD)"><input className="input" type="number" min="0" step="0.01" required value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Due date"><input className="input" type="date" value={f.due_date} onChange={(e) => setF({ ...f, due_date: e.target.value })} /></Field>
      </div>
      <Field label="Payment link (optional)" hint="Paste a hosted payment link from your approved processor."><input className="input" type="url" value={f.payment_url} onChange={(e) => setF({ ...f, payment_url: e.target.value })} /></Field>
      <ErrorText error={error} />
      <div><button className="btn btn-primary btn-sm">Create invoice</button></div>
    </form>
  );
}

function NewRetainer({ clientId, agreements, onDone }: { clientId: string; agreements: Agreement[]; onDone: () => void }) {
  const look = useLookups();
  const [f, setF] = useState({ service_id: 'tier-1', billing_day: '1', agreement_id: '' });
  const [error, setError] = useState<string | null>(null);
  const signed = agreements.filter((a) => a.status === 'signed');
  async function submit(e: FormEvent) {
    e.preventDefault();
    const active = !!f.agreement_id;
    const { error } = await db().from('retainers').insert({
      client_id: clientId, service_id: f.service_id, billing_day: Number(f.billing_day), agreement_id: f.agreement_id || null,
      status: active ? 'active' : 'pending', started_at: active ? new Date().toISOString().slice(0, 10) : null,
    });
    if (error) return setError(error.message);
    onDone();
  }
  return (
    <form className="form card coming" onSubmit={submit}>
      <h3><Repeat size={18} /> Start a retainer</h3>
      <div className="form-row">
        <Field label="Plan">
          <select className="select" value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })}>
            {look.data?.serviceList.filter((s) => s.kind === 'retainer').map((s) => <option key={s.id} value={s.id}>{s.name} · {money(s.price_cents)}/mo</option>)}
          </select>
        </Field>
        <Field label="Client's billing day"><input className="input" type="number" min={1} max={28} value={f.billing_day} onChange={(e) => setF({ ...f, billing_day: e.target.value })} /></Field>
      </div>
      <Field label="Signed agreement" hint="No contract, no service: the retainer stays pending until a signed agreement is linked.">
        <select className="select" value={f.agreement_id} onChange={(e) => setF({ ...f, agreement_id: e.target.value })}>
          <option value="">None yet (pending)</option>
          {signed.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </Field>
      <ErrorText error={error} />
      <div><button className="btn btn-primary btn-sm">Create retainer</button></div>
    </form>
  );
}

const templates: Record<string, string> = {
  nda: 'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThe parties agree to keep confidential all non-public business, technical, and operational information shared in connection with consulting services, to use it only for the engagement, and to return or destroy it on request. This obligation survives for three (3) years after the engagement ends.\n\n[Edit before sending; have counsel review.]',
  contract: 'CONSULTING SERVICES AGREEMENT\n\nScope: \nFees: \nBilling date: \nResponse time: \nTerm: Month to month; either party may cancel with written notice before the next billing date.\nRoot3D provides educational and advisory services only and does not handle cannabis.\n\n[Edit before sending; have counsel review.]',
  proposal: 'PROPOSAL\n\nThe problem: \nOur approach: \nDeliverables: \nTimeline: \nInvestment: \n',
  sow: 'STATEMENT OF WORK\n\nProject: \nDeliverables: \nMilestones: \nAcceptance criteria: \nFee: \n',
};

function NewAgreement({ clientId, onDone }: { clientId: string; onDone: () => void }) {
  const [f, setF] = useState({ kind: 'contract', title: 'Consulting Services Agreement', body: templates.contract, amount: '' });
  const [error, setError] = useState<string | null>(null);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await db().from('agreements').insert({
      client_id: clientId, kind: f.kind, title: f.title, body: f.body, amount_cents: f.amount ? Math.round(Number(f.amount) * 100) : null,
    });
    if (error) return setError(error.message);
    onDone();
  }
  return (
    <form className="form card coming" onSubmit={submit}>
      <h3><FilePlus2 size={18} /> Send a document for e-signature</h3>
      <div className="form-row">
        <Field label="Type">
          <select className="select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value, body: templates[e.target.value] })}>
            <option value="proposal">Proposal</option>
            <option value="sow">Statement of work</option>
            <option value="contract">Contract</option>
            <option value="nda">NDA</option>
          </select>
        </Field>
        <Field label="Value (optional, USD)"><input className="input" type="number" min="0" step="0.01" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
      </div>
      <Field label="Title"><input className="input" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <Field label="Body"><textarea className="textarea" style={{ minHeight: 220 }} required value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      <ErrorText error={error} />
      <div><button className="btn btn-primary btn-sm">Send to client</button></div>
    </form>
  );
}

function Notes({ clientId, notes, onDone, authorName }: { clientId: string; notes: ClientNote[]; onDone: () => void; authorName: (id: string) => string }) {
  const me = useAuth((s) => s.profile)!;
  const [body, setBody] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    await db().from('client_notes').insert({ client_id: clientId, author_id: me.id, body });
    setBody('');
    onDone();
  }
  return (
    <div className="stack">
      <p className="muted small">Shared between the partners only. Clients never see these.</p>
      <form className="form" onSubmit={submit}>
        <textarea className="textarea" required value={body} onChange={(e) => setBody(e.target.value)} placeholder="What should the next consultant know?" aria-label="New note" />
        <div><button className="btn btn-primary btn-sm">Add note</button></div>
      </form>
      {notes.map((n) => (
        <div key={n.id} className="card" style={{ boxShadow: 'none' }}>
          <p style={{ whiteSpace: 'pre-wrap' }}>{n.body}</p>
          <span className="muted small">{authorName(n.author_id)} · {dateTime(n.created_at)}</span>
        </div>
      ))}
    </div>
  );
}
