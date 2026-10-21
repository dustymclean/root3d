import { Mail, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ErrorText, Field, PageHead, Success } from '../../components/ui';
import { supabase } from '../../lib/supabase';

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || 'contact@r3dconsulting.com';

export function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: params.get('topic') ?? '', message: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!supabase) {
      // No backend yet: hand off to the visitor's email app.
      const body = `${form.message}\n\n${form.name}\n${form.email}\n${form.phone}`;
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(form.topic || 'Website inquiry')}&body=${encodeURIComponent(body)}`;
      return;
    }
    setBusy(true);
    const { error } = await supabase.from('contact_requests').insert(form);
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <PageHead eyebrow="Contact" title="Tell us where you are">
          Planning, licensed, or mid-inspection: a short note is enough. A partner will reply within one business day.
        </PageHead>
        <p className="row muted"><Mail size={18} /> <a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
        {sent ? (
          <Success>Thanks, {form.name.split(' ')[0] || 'friend'}. We have your message and will be in touch shortly.</Success>
        ) : (
          <form className="card form" onSubmit={submit}>
            <div className="form-row">
              <Field label="Name"><input className="input" required value={form.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            </div>
            <div className="form-row">
              <Field label="Phone (optional)"><input className="input" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" /></Field>
              <Field label="Topic"><input className="input" value={form.topic} onChange={set('topic')} placeholder="Licensing, retainer, cultivation…" /></Field>
            </div>
            <Field label="Message"><textarea className="textarea" required maxLength={5000} value={form.message} onChange={set('message')} /></Field>
            <ErrorText error={error} />
            <div><button className="btn btn-primary" disabled={busy}><Send size={16} /> Send message</button></div>
          </form>
        )}
      </div>
    </section>
  );
}
