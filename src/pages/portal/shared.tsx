import { Download, Paperclip, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Empty, ErrorText, StatusPill } from '../../components/ui';
import { bytes, dateOnly, dateTime, money } from '../../lib/format';
import { db, q } from '../../lib/supabase';
import type { Booking, Consultant, FileRow, Invoice, Profile, Service } from '../../lib/types';
import { useAuth } from '../../store/auth';

export function BookingTable({ rows, consultants, services, profiles }: {
  rows: Booking[];
  consultants: Record<string, Consultant>;
  services: Record<string, Service>;
  profiles?: Record<string, Profile>;
}) {
  if (!rows.length) return <Empty>No appointments yet. <Link to="/book">Book one</Link>.</Empty>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>When</th>
            {profiles && <th>Client</th>}
            <th>Consultant</th>
            <th>Service</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.id}>
              <td>{dateTime(b.starts_at)}</td>
              {profiles && <td>{profiles[b.client_id]?.full_name || profiles[b.client_id]?.email || '—'}</td>}
              <td>{consultants[b.consultant_slug]?.name ?? b.consultant_slug}</td>
              <td>{services[b.service_id]?.name ?? b.service_id}</td>
              <td><StatusPill status={b.late_cancel ? 'late cancel' : b.status} /></td>
              <td><Link to={`/portal/appointments/${b.id}`}>Open</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InvoiceTable({ rows, profiles }: { rows: Invoice[]; profiles?: Record<string, Profile> }) {
  if (!rows.length) return <Empty>No invoices.</Empty>;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            {profiles && <th>Client</th>}
            <th>Description</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i.id}>
              <td>{i.number}</td>
              {profiles && <td>{profiles[i.client_id]?.full_name || profiles[i.client_id]?.email}</td>}
              <td style={{ whiteSpace: 'normal' }}>{i.description}</td>
              <td>{money(i.amount_cents)}</td>
              <td>{i.due_date ? dateOnly(i.due_date) : '—'}</td>
              <td><StatusPill status={i.status} /></td>
              <td><Link to={`/portal/invoices/${i.id}`}>View</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const safeName = (n: string) => n.replace(/[^\w.\- ]+/g, '_').slice(-120);

/** Lists files and lets the viewer upload more (to the client's private folder). */
export function FilePanel({ clientId, bookingId, files, onChange, deliverable = false }: {
  clientId: string;
  bookingId?: string;
  files: FileRow[];
  onChange: () => void;
  deliverable?: boolean;
}) {
  const me = useAuth((s) => s.profile);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(list: FileList | null) {
    if (!list?.length || !me) return;
    setBusy(true);
    setError(null);
    try {
      for (const f of Array.from(list)) {
        const path = `${clientId}/${crypto.randomUUID()}-${safeName(f.name)}`;
        const up = await db().storage.from('client-files').upload(path, f, { contentType: f.type || undefined });
        if (up.error) throw up.error;
        await q(db().from('files').insert({
          client_id: clientId, booking_id: bookingId ?? null, uploaded_by: me.id, name: f.name, path, size: f.size, mime: f.type,
          kind: deliverable ? 'deliverable' : 'upload',
        }));
      }
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  async function open(f: FileRow) {
    const { data, error } = await db().storage.from('client-files').createSignedUrl(f.path, 300);
    if (error) setError(error.message);
    else window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function remove(f: FileRow) {
    if (!confirm(`Delete ${f.name}?`)) return;
    await db().storage.from('client-files').remove([f.path]);
    await db().from('files').delete().eq('id', f.id);
    onChange();
  }

  return (
    <div>
      <div className="row between" style={{ marginBottom: '0.75rem' }}>
        <span className="muted small">Photos (including 4K), lab results, schematics, logs. Up to 50 MB each.</span>
        <button className="btn btn-ghost btn-sm" onClick={() => input.current?.click()} disabled={busy}>
          <Upload size={16} /> {busy ? 'Uploading…' : deliverable ? 'Upload deliverable' : 'Upload files'}
        </button>
        <input ref={input} type="file" multiple hidden onChange={(e) => void upload(e.target.files)} />
      </div>
      <ErrorText error={error} />
      {files.length === 0 ? (
        <Empty icon={<Paperclip size={28} />}>Nothing here yet.</Empty>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {files.map((f) => (
                <tr key={f.id}>
                  <td style={{ whiteSpace: 'normal' }}>
                    {f.name} {f.kind === 'deliverable' && <span className="tag">deliverable</span>}
                  </td>
                  <td className="muted">{bytes(f.size)}</td>
                  <td className="muted">{dateOnly(f.created_at)}</td>
                  <td>
                    <div className="row">
                      <button className="linkish" onClick={() => void open(f)} aria-label={`Download ${f.name}`}><Download size={16} /></button>
                      {(f.uploaded_by === me?.id || me?.role === 'admin') && (
                        <button className="linkish" onClick={() => void remove(f)} aria-label={`Delete ${f.name}`}><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
