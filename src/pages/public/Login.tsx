import { LogIn, UserPlus } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SetupNeeded } from '../../components/Guards';
import { ErrorText, Field, Success } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';

type Mode = 'signin' | 'signup' | 'forgot';
const siteUrl = (path: string) => window.location.origin + import.meta.env.BASE_URL + path;

export function Login({ initial = 'signin' }: { initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const profile = useAuth((s) => s.profile);
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/portal';

  useEffect(() => {
    if (profile) navigate(from, { replace: true });
  }, [profile, from, navigate]);

  if (!supabase) return <SetupNeeded />;
  const sb = supabase;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const { error } = await sb.auth.signInWithPassword({ email: form.email, password: form.password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name }, emailRedirectTo: siteUrl('portal') },
        });
        if (error) throw error;
        if (!data.session) setInfo('Check your email to confirm your account, then sign in.');
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(form.email, { redirectTo: siteUrl('reset-password') });
        if (error) throw error;
        setInfo('If that email has an account, a reset link is on its way.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <p className="eyebrow">Client portal</p>
        <h1 style={{ fontSize: '2.2rem' }}>
          {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset your password'}
        </h1>
        <form className="card form" onSubmit={submit}>
          {mode === 'signup' && (
            <Field label="Full name"><input className="input" required value={form.name} onChange={set('name')} autoComplete="name" /></Field>
          )}
          <Field label="Email"><input className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
          {mode !== 'forgot' && (
            <Field label="Password" hint={mode === 'signup' ? 'At least 8 characters.' : undefined}>
              <input className="input" type="password" required minLength={mode === 'signup' ? 8 : undefined} value={form.password} onChange={set('password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
            </Field>
          )}
          <ErrorText error={error} />
          {info && <Success>{info}</Success>}
          <button className="btn btn-primary" disabled={busy}>
            {mode === 'signup' ? <UserPlus size={18} /> : <LogIn size={18} />}
            {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send reset link'}
          </button>
          <div className="row between small">
            {mode === 'signin' ? (
              <>
                <button type="button" className="linkish" onClick={() => setMode('signup')}>New here? Create an account</button>
                <button type="button" className="linkish" onClick={() => setMode('forgot')}>Forgot password?</button>
              </>
            ) : (
              <button type="button" className="linkish" onClick={() => setMode('signin')}>Already have an account? Sign in</button>
            )}
          </div>
        </form>
        <p className="muted small mt">By creating an account you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>.</p>
      </div>
    </section>
  );
}

export function ResetPassword() {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!supabase) return <SetupNeeded />;
  const sb = supabase;
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await sb.auth.updateUser({ password });
    if (error) setError(error.message);
    else setDone(true);
  }
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: '2.2rem' }}>Choose a new password</h1>
        {done ? (
          <Success>Password updated. <Link to="/portal">Go to your portal</Link>.</Success>
        ) : (
          <form className="card form" onSubmit={submit}>
            <Field label="New password"><input className="input" type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
            <ErrorText error={error} />
            <button className="btn btn-primary">Save password</button>
          </form>
        )}
      </div>
    </section>
  );
}
