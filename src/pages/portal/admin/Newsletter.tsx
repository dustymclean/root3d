import { useState } from 'react';
import { db, q } from '../../../lib/supabase';
import { useAsync } from '../../../lib/useAsync';

type NewsletterRow = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  handled: boolean;
  topic: string;
  message: string;
};

export function NewsletterAdmin() {
  const [search, setSearch] = useState('');
  const rows = useAsync(
    () => q<NewsletterRow[]>(db().from('contact_requests').select('id,name,email,created_at,handled,topic,message').eq('topic', 'newsletter-signup').order('created_at', { ascending: false }).limit(1000)),
    [],
  );
  const all = rows.data || [];
  const shown = all.filter(r => (r.name + ' ' + r.email).toLowerCase().includes(search.toLowerCase()));
  function exportCsv() {
    const keys: (keyof NewsletterRow)[] = ['name', 'email', 'created_at', 'handled'];
    const text = [keys.join(','), ...shown.map(r => keys.map(k => '"' + String(r[k] ?? '').replace(/"/g, '""') + '"').join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', text], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url; a.download = 'root3d-newsletter-signups.csv'; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="stack">
      <h2>Newsletter Sign Ups</h2>
      <p className="muted">Names and email addresses submitted through the website newsletter popup. Available only to signed-in Root3D admins.</p>
      <div className="card"><strong>{all.length} newsletter sign ups</strong> · {all.filter(x => !x.handled).length} new</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <label>Search <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or email" /></label>
        <button className="btn btn-ghost btn-sm" onClick={() => rows.reload()}>Refresh</button>
        <button className="btn btn-primary btn-sm" onClick={exportCsv} disabled={!shown.length}>Export CSV</button>
      </div>
      {rows.loading && <p>Loading sign ups…</p>}
      {rows.error && <p role="alert">Unable to load newsletter sign ups: {String(rows.error)}</p>}
      {!rows.loading && shown.length === 0 && <p>No sign ups found.</p>}
      {shown.map(r => (
        <div className="card" key={r.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div><strong>{r.name}</strong><div><a href={'mailto:' + r.email}>{r.email}</a></div><small className="muted">{new Date(r.created_at).toLocaleString()}</small></div>
            <button className="btn btn-ghost btn-sm" onClick={() => void db().from('contact_requests').update({ handled: !r.handled }).eq('id', r.id).then(() => rows.reload())}>
              {r.handled ? 'Mark new' : 'Mark reviewed'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
