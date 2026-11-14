import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const KEY = 'root3d_newsletter_suppress_until';
const DAY = 86_400_000;

export function NewsletterPopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const eligible = !/^\/(portal|admin|login|signup|reset-password)(\/|$)/.test(pathname)
    && !pathname.startsWith('/book');

  useEffect(() => {
    setOpen(false);
    if (!eligible) return;
    try { if (Number(localStorage.getItem(KEY) || 0) > Date.now()) return; } catch { /* storage disabled */ }
    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') setOpen(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [pathname, eligible]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function dismiss(days = 7) {
    setOpen(false);
    try { localStorage.setItem(KEY, String(Date.now() + DAY * days)); } catch { /* storage disabled */ }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!consent || !name.trim() || !email.trim()) return;
    if (!supabase) {
      setMessage('Newsletter signup is temporarily unavailable. Please use our contact page.');
      return;
    }
    setSaving(true);
    setMessage('');
    const { error } = await supabase.from('contact_requests').insert({
      name: name.trim().slice(0, 200),
      email: email.trim().toLowerCase().slice(0, 320),
      topic: 'newsletter-signup',
      message: 'Newsletter signup: explicit marketing email consent given using the Root3D website form.',
    });
    setSaving(false);
    if (error) {
      setMessage('We could not save your signup. Please try again.');
    } else {
      setMessage('Thank you! Your newsletter signup has been saved.');
      setName(''); setEmail(''); setConsent(false);
      try { localStorage.setItem(KEY, String(Date.now() + 365 * DAY)); } catch { /* storage disabled */ }
      window.setTimeout(() => setOpen(false), 1600);
    }
  }

  if (!open || !eligible) return null;
  return (
    <div className="root3d-nl-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <section className="root3d-nl-panel" role="dialog" aria-modal="true" aria-labelledby="root3d-nl-title">
        <button className="root3d-nl-close" type="button" onClick={() => dismiss()} aria-label="Close newsletter signup">×</button>
        <p className="root3d-nl-kicker">ROOT3D CONSULTING · INSIGHTS</p>
        <h2 id="root3d-nl-title">Sign up for our newsletter</h2>
        <p>Get practical technology, business operations, research, and consulting updates.</p>
        <form onSubmit={(e) => void submit(e)}>
          <label htmlFor="root3d-nl-name">Name</label>
          <input id="root3d-nl-name" autoComplete="name" maxLength={200} value={name} onChange={e => setName(e.target.value)} required autoFocus />
          <label htmlFor="root3d-nl-email">Email</label>
          <input id="root3d-nl-email" type="email" autoComplete="email" maxLength={320} value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="root3d-nl-consent"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />I agree to receive marketing email from Root3D Consulting. I can request removal at any time.</label>
          <button className="root3d-nl-submit" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Sign up for our newsletter'}</button>
          <p role="status" aria-live="polite">{message}</p>
          <small>See our <Link to="/privacy" onClick={() => dismiss()}>privacy policy</Link>.</small>
        </form>
      </section>
      <style>{`
        .root3d-nl-backdrop{position:fixed;inset:0;z-index:999999;display:grid;place-items:center;padding:18px;background:rgba(8,17,30,.76)}
        .root3d-nl-panel{width:min(100%,460px);max-height:90vh;overflow-y:auto;background:#fff;color:#1d2633;padding:clamp(20px,5vw,38px);border-top:5px solid #269dc9;position:relative;box-shadow:0 18px 70px #0007;border-radius:7px;font:15px/1.5 system-ui}
        .root3d-nl-panel h2{font-size:clamp(25px,5vw,34px);line-height:1.12;margin:10px 0}
        .root3d-nl-panel p{line-height:1.5}
        .root3d-nl-kicker{color:#087fae;font-size:12px;font-weight:800;letter-spacing:.13em}
        .root3d-nl-close{position:absolute;top:6px;right:12px;background:none;border:0;font-size:32px;cursor:pointer;color:#1d2633}
        .root3d-nl-panel form>label:not(.root3d-nl-consent){display:block;margin:14px 0 4px;font-weight:700}
        .root3d-nl-panel input:not([type=checkbox]){display:block;width:100%;background:white;color:#1d2633;border:1px solid #9eabb5;border-radius:5px;padding:12px;font:inherit}
        .root3d-nl-consent{display:flex;gap:9px;align-items:flex-start;font-size:12px;margin:14px 0}
        .root3d-nl-consent input{margin-top:3px}
        .root3d-nl-submit{background:#101a2a;color:white;border:0;padding:13px 16px;width:100%;border-radius:4px;font-weight:750;cursor:pointer}
        .root3d-nl-submit:disabled{opacity:.65}
      `}</style>
    </div>
  );
}
