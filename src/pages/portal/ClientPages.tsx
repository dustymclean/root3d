import { CreditCard, FileSignature, Printer } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Empty, ErrorText, Field, Loading, StatusPill, Success } from '../../components/ui';
import { dateOnly, dateTime, money } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { ActionPlan, Agreement, FileRow, Invoice, Retainer } from '../../lib/types';
import { useAsync } from '../../lib/useAsync';
import { useAuth } from '../../store/auth';
import { PlanView } from './Appointments';
import { personName, useLookups } from './lookups';
import { FilePanel, InvoiceTable } from './shared';

export function Files() {
  const profile = useAuth((s) => s.profile)!;
  const isAdmin = profile.role === 'admin';
  const look = useLookups();
  const files = useAsync(() => q<FileRow[]>(db().from('files').select('*').order('created_at', { ascending: false })), []);
  if (files.loading) return <Loading />;
  return (
    <div className="card">
      <h2>Files</h2>
      {isAdmin ? (
        <>
          <p className="muted">All client files. Upload deliverables from a client's page.</p>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>File</th><th>Client</th><th>Type</th><th>Added</th></tr></thead>
              <tbody>
                {(files.data ?? []).map((f) => (
                  <tr key={f.id}>
                    <td>{f.name}</td>
                    <td><Link to={`/portal/admin/clients/${f.client_id}`}>{personName(look.data, f.client_id)}</Link></td>
                    <td>{f.kind}</td>
                    <td>{dateOnly(f.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <FilePanel clientId={profile.id} files={files.data ?? []} onChange={() => void files.reload()} />
      )}
    </div>
  );
}

export function Plans() {
  const plans = useAsync(() => q<ActionPlan[]>(db().from('action_plans').select('*').order('created_at', { ascending: false })), []);
  const look = useLookups();
  if (plans.loading) return <Loading />;
  return (
    <div className="stack">
      <h2>Action plans</h2>
      {(plans.data ?? []).length === 0 && <div className="card"><Empty>Plans from your sessions will appear here.</Empty></div>}
      {(plans.data ?? []).map((p) => (
        <div className="card" key={p.id}>
          <div className="row between">
            <h3 style={{ margin: 0 }}>{p.title}</h3>
            <span className="muted small">
              {p.consultant_slug && look.data?.consultants[p.consultant_slug]?.name} · {dateOnly(p.created_at)} · {p.steps.filter((s) => s.done).length}/{p.steps.length} done
            </span>
          </div>
          {p.booking_id && <p className="small"><Link to={`/portal/appointments/${p.booking_id}`}>View session</Link></p>}
          <PlanView plan={p} onChange={() => void plans.reload()} />
        </div>
      ))}
    </div>
  );
}

export function Invoices() {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const look = useLookups();
  const inv = useAsync(() => q<Invoice[]>(db().from('invoices').select('*').order('created_at', { ascending: false })), []);
  const ret = useAsync(() => q<Retainer[]>(db().from('retainers').select('*').order('created_at', { ascending: false })), []);
  if (inv.loading || !look.data) return <Loading />;
  return (
    <div className="stack">
      <div className="card">
        <h2>Invoices & receipts</h2>
        <InvoiceTable rows={inv.data ?? []} profiles={isAdmin ? look.data.profiles : undefined} />
      </div>
      {!isAdmin && (ret.data ?? []).length > 0 && (
        <div className="card">
          <h3>Your retainers</h3>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Plan</th><th>Status</th><th>Bills on</th><th>Started</th></tr></thead>
              <tbody>
                {(ret.data ?? []).map((r) => (
                  <tr key={r.id}>
                    <td>{look.data!.services[r.service_id]?.name}</td>
                    <td><StatusPill status={r.status} /></td>
                    <td>Day {r.billing_day} each month</td>
                    <td>{r.started_at ? dateOnly(r.started_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export function InvoiceDetail() {
  const { id = '' } = useParams();
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const look = useLookups();
  const inv = useAsync(() => q<Invoice>(db().from('invoices').select('*').eq('id', id).single()), [id]);
  if (inv.loading || !look.data) return <Loading />;
  if (!inv.data) return <ErrorText error={inv.error} />;
  const i = inv.data;
  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <div className="row between">
        <div>
          <p className="eyebrow" style={{ marginBottom: 4 }}>{i.status === 'paid' ? 'Receipt' : 'Invoice'} #{i.number}</p>
          <h2 style={{ margin: 0 }}>{money(i.amount_cents)}</h2>
        </div>
        <StatusPill status={i.status} />
      </div>
      <div className="summary" style={{ position: 'static' }}>
        <dl>
          <dt>Billed to</dt><dd>{isAdmin ? personName(look.data, i.client_id) : 'You'}</dd>
          <dt>Description</dt><dd>{i.description}</dd>
          <dt>Issued</dt><dd>{dateOnly(i.created_at)}</dd>
          {i.due_date && <><dt>Due</dt><dd>{dateOnly(i.due_date)}</dd></>}
          {i.paid_at && <><dt>Paid</dt><dd>{dateTime(i.paid_at)}{i.payment_method && ` · ${i.payment_method}`}</dd></>}
          {i.refund_note && <><dt>Refund</dt><dd>{i.refund_note}</dd></>}
        </dl>
      </div>
      <p className="muted small">Root3D Consulting · r3dconsulting.com</p>
      <div className="btn-row no-print">
        {i.status === 'open' && i.payment_url && (
          <a className="btn btn-primary" href={i.payment_url} target="_blank" rel="noopener noreferrer"><CreditCard size={18} /> Pay now</a>
        )}
        {i.status === 'open' && !i.payment_url && !isAdmin && (
          <p className="muted">Online card payment for this invoice is being set up. We'll send a secure payment link shortly, or message us to pay another way.</p>
        )}
        <button className="btn btn-ghost" onClick={() => window.print()}><Printer size={18} /> Print / save PDF</button>
        {isAdmin && <Link className="btn btn-ghost" to="/portal/admin/billing">Manage in billing</Link>}
      </div>
    </div>
  );
}

export function Agreements() {
  const ag = useAsync(() => q<Agreement[]>(db().from('agreements').select('*').order('created_at', { ascending: false })), []);
  if (ag.loading) return <Loading />;
  return (
    <div className="stack">
      <h2>Proposals & agreements</h2>
      {(ag.data ?? []).length === 0 && <div className="card"><Empty>No documents yet.</Empty></div>}
      {(ag.data ?? []).map((a) => <AgreementCard key={a.id} a={a} onChange={() => void ag.reload()} />)}
    </div>
  );
}

function AgreementCard({ a, onChange }: { a: Agreement; onChange: () => void }) {
  const isAdmin = useAuth((s) => s.profile?.role === 'admin');
  const [name, setName] = useState('');
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function sign(accept: boolean) {
    const { error } = await db().rpc('sign_agreement', { p_agreement: a.id, p_name: name, p_accept: accept });
    if (error) setError(error.message);
    else onChange();
  }
  return (
    <div className="card">
      <div className="row between">
        <div>
          <span className="tag">{a.kind.toUpperCase()}</span>
          <h3 style={{ margin: '0.4rem 0 0' }}>{a.title}</h3>
        </div>
        <StatusPill status={a.status} />
      </div>
      {a.amount_cents != null && <p className="muted">Value: {money(a.amount_cents)}</p>}
      <div style={{ whiteSpace: 'pre-wrap', background: 'var(--bg-soft)', padding: '1rem', borderRadius: 8, maxHeight: 360, overflow: 'auto', margin: '1rem 0' }}>{a.body}</div>
      {a.status === 'signed' && <Success>Signed by {a.signed_name} on {dateTime(a.signed_at!)}.</Success>}
      {a.status === 'sent' && !isAdmin && (
        <form className="form" onSubmit={(e: FormEvent) => { e.preventDefault(); void sign(true); }}>
          <Field label="Type your full legal name to sign"><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <label className="check"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> I have read and agree to this document. My typed name is my electronic signature.</label>
          <ErrorText error={error} />
          <div className="btn-row">
            <button className="btn btn-primary" disabled={!agree}><FileSignature size={18} /> Sign</button>
            <button type="button" className="btn btn-ghost" onClick={() => void sign(false)} disabled={name.trim().length < 2}>Decline</button>
          </div>
        </form>
      )}
    </div>
  );
}

const intakeQuestions = [
  { key: 'operation', label: 'What kind of operation is this?', placeholder: 'Cultivation, processing, dispensary, home grow…' },
  { key: 'license_status', label: 'Where are you with licensing?', placeholder: 'Planning, applied, licensed since…' },
  { key: 'facility', label: 'Facility details', placeholder: 'Square footage, indoor/greenhouse, lighting, irrigation…' },
  { key: 'tracking', label: 'Seed-to-sale system', placeholder: 'Metrc, BioTrack, other' },
  { key: 'goals', label: 'Top goals for the next 90 days' },
  { key: 'problems', label: 'What is not working right now?' },
];

export function ProfilePage() {
  const { profile, refresh } = useAuth();
  const p = profile!;
  const [form, setForm] = useState({ full_name: p.full_name, company: p.company, license_type: p.license_type, state: p.state });
  const [intake, setIntake] = useState<Record<string, string>>(p.intake ?? {});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    const { error } = await db().from('profiles').update({ ...form, intake, intake_completed_at: p.intake_completed_at ?? new Date().toISOString() }).eq('id', p.id);
    if (error) setError(error.message);
    else {
      setSaved(true);
      void refresh();
    }
  }

  return (
    <form className="card form" onSubmit={save}>
      <h2>Profile & intake</h2>
      <div className="form-row">
        <Field label="Full name"><input className="input" value={form.full_name} onChange={set('full_name')} /></Field>
      </div>
      <div className="form-row">
        <Field label="Company"><input className="input" value={form.company} onChange={set('company')} /></Field>
        <Field label="License type"><input className="input" value={form.license_type} onChange={set('license_type')} /></Field>
        <Field label="State"><input className="input" value={form.state} onChange={set('state')} /></Field>
      </div>
      <h3 className="mt">Intake</h3>
      <p className="muted small">Answer once. Every Root3D consultant sees this before your session.</p>
      {intakeQuestions.map((qq) => (
        <Field key={qq.key} label={qq.label}>
          <textarea className="textarea" style={{ minHeight: 70 }} placeholder={qq.placeholder} value={intake[qq.key] ?? ''} onChange={(e) => setIntake({ ...intake, [qq.key]: e.target.value })} />
        </Field>
      ))}
      <ErrorText error={error} />
      {saved && <Success>Saved.</Success>}
      <div><button className="btn btn-primary">Save</button></div>
    </form>
  );
}

export { intakeQuestions };
